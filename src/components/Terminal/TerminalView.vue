<template>
  <div class="terminals-wrapper">
    <div 
      v-for="tab in store.tabs" 
      :key="tab.id"
      ref="containerRefs"
      :data-tab-id="tab.id"
      class="terminal-container"
      :style="{ display: tab.id === store.activeTabId ? 'block' : 'none' }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { SearchAddon } from '@xterm/addon-search'
import { useTerminalStore } from '../../store/terminalStore'
import type { TerminalTab } from '../../types'

interface TerminalCache {
  terminal: Terminal
  fitAddon: FitAddon
  searchAddon: SearchAddon
  termId: number
  contextMenuHandler?: (e: MouseEvent) => Promise<void>
  keydownHandler?: (e: KeyboardEvent) => void
}

const store = useTerminalStore()

// Массив ссылок на контейнеры (по индексу вкладок)
const containerRefs = ref<HTMLDivElement[]>([])
const terminalCache = ref<Map<number, TerminalCache>>(new Map())
const resizeObservers = ref<Map<number, ResizeObserver>>(new Map())

// Получаем контейнер для конкретной вкладки
const getContainerForTab = (tabId: number): HTMLDivElement | undefined => {
  const index = store.tabs.findIndex((t: TerminalTab) => t.id === tabId)
  return containerRefs.value[index]
}

// Инициализация терминала для вкладки
const initTerminal = async (tabId: number) => {
  const container = getContainerForTab(tabId)
  if (!container || terminalCache.value.has(tabId)) {
    return
  }
  
  // Находим вкладку для получения имени
  const tab = store.tabs.find((t: TerminalTab) => t.id === tabId)
  const tabName = tab ? tab.name : `Терминал ${tabId}`
  
  // Создаем новый PTY процесс с включенным логированием
  const result = await window.electronAPI.createTerminal({
    enableLog: store.settings.autoStartLogging,
    name: tabName
  })
  const termId = result.id
  
  // Создаем xterm экземпляр
  const terminal = new Terminal({
    convertEol: true,
    cursorBlink: true,
    fontSize: store.settings.fontSize,
    fontFamily: 'Consolas, "Courier New", monospace',
    theme: {
      background: store.settings.theme === 'dark' ? '#1e1e1e' : '#ffffff',
      foreground: store.settings.theme === 'dark' ? '#e8e8e8' : '#212529',
      cursor: '#6B53E6'
    }
  })
  
  const fitAddon = new FitAddon()
  const searchAddon = new SearchAddon()
  terminal.loadAddon(fitAddon)
  terminal.loadAddon(searchAddon)
  
  // Открываем терминал в ЕГО СОБСТВЕННОМ контейнере
  terminal.open(container)
  fitAddon.fit()
  
  // Сохраняем термId
  store.updateTabTermId(tabId, termId)
  
  // Подписываемся на данные от процесса
  window.electronAPI.onTerminalData(termId, (data: string) => {
    terminal.write(data)
  })
  
  // Подписываемся на событие завершения PTY процесса
  window.electronAPI.onTerminalExit(termId, (exitCode: number) => {
    console.log(`[TerminalView] PTY process exited for tab ${tabId} with code ${exitCode}`)
    
    // Отмечаем терминал как мёртвый в store
    store.markTerminalAsDead(tabId, exitCode)
    
    // Показываем уведомление пользователю
    const message = exitCode === 0 
      ? `Terminal "${tabName}" closed normally`
      : `Terminal "${tabName}" crashed (exit code: ${exitCode})`
    
    // Можно добавить toast notification здесь если есть toast система
    console.warn(`[TerminalView] ${message}`)
    
    // Опционально: можно автоматически закрыть вкладку или показать UI что терминал мёртв
    // setTimeout(() => {
    //   store.removeTab(tabId)
    // }, 3000)
  })
  
  // Отправляем ввод пользователя
  terminal.onData((data: string) => {
    window.electronAPI.terminalWrite(termId, data)
  })
  
  // Горячие клавиши - перехватываем на уровне контейнера с capture=true
  const keydownHandler = (e: KeyboardEvent) => {
    // Ctrl+C - копировать или отправить сигнал прерывания
    if (e.ctrlKey && e.key === 'c') {
      const selection = terminal.getSelection()
      if (selection) {
        e.preventDefault()
        e.stopPropagation()
        navigator.clipboard.writeText(selection)
        return
      }
      // Если нет выделения - пропускаем (отправится в терминал как обычно)
      return
    }
    
    // Ctrl+V - вставить
    if (e.ctrlKey && e.key === 'v') {
      e.preventDefault()
      e.stopPropagation()
      navigator.clipboard.readText().then(text => {
        if (text) {
          window.electronAPI.terminalWrite(termId, text)
        }
      }).catch(err => {
        console.error('Не удалось прочитать буфер обмена:', err)
      })
      return
    }
    
    // Ctrl+A - выделить всё
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault()
      e.stopPropagation()
      terminal.selectAll()
      return
    }
  }
  
  // Используем capture: true чтобы перехватить событие ДО xterm
  container.addEventListener('keydown', keydownHandler, { capture: true })
  
  // Контекстное меню (правый клик)
  const contextMenuHandler = async (e: MouseEvent) => {
    e.preventDefault()
    const selection = terminal.getSelection()
    
    if (selection) {
      // Если есть выделение - копируем
      await navigator.clipboard.writeText(selection)
    } else {
      // Если нет выделения - вставляем из буфера обмена
      try {
        const text = await navigator.clipboard.readText()
        if (text) {
          window.electronAPI.terminalWrite(termId, text)
        }
      } catch (err) {
        console.error('Не удалось прочитать буфер обмена:', err)
      }
    }
  }
  container.addEventListener('contextmenu', contextMenuHandler)
  
  // Кэшируем
  terminalCache.value.set(tabId, { 
    terminal, 
    fitAddon, 
    searchAddon, 
    termId,
    contextMenuHandler,
    keydownHandler
  })
  
  // Добавляем ResizeObserver для этого контейнера с throttling
  let rafId: number | null = null;
    
  const resizeObserver = new ResizeObserver(() => {
    const cached = terminalCache.value.get(tabId);
    if (!cached || tabId !== store.activeTabId) return;
      
    // Throttle через requestAnimationFrame
    if (rafId) return;
      
    rafId = requestAnimationFrame(() => {
      cached.fitAddon.fit();
      window.electronAPI.terminalResize(cached.termId, cached.terminal.cols, cached.terminal.rows);
      rafId = null;
    });
  });
  resizeObserver.observe(container);
  resizeObservers.value.set(tabId, resizeObserver);
}

// Очистка терминала при закрытии вкладки
const disposeTerminal = async (tabId: number) => {
  const cached = terminalCache.value.get(tabId)
  if (cached) {
    // Удаляем обработчики событий
    const container = getContainerForTab(tabId)
    if (container && cached.contextMenuHandler) {
      container.removeEventListener('contextmenu', cached.contextMenuHandler)
    }
    if (container && cached.keydownHandler) {
      container.removeEventListener('keydown', cached.keydownHandler, { capture: true })
    }

    cached.terminal.dispose()
    terminalCache.value.delete(tabId)

    // Убиваем PTY процесс в main process
    try {
      await window.electronAPI.terminalClose(cached.termId)
      console.log(`[TerminalView] PTY процесс убит для терминала ${cached.termId}`)
    } catch (error) {
      console.error(`[TerminalView] Ошибка закрытия PTY процесса ${cached.termId}:`, error)
    }
  }

  // Удаляем ResizeObserver и очищаем pending RAF
  const observer = resizeObservers.value.get(tabId)
  if (observer) {
    observer.disconnect()
    resizeObservers.value.delete(tabId)
  }
}

// При изменении активной вкладки - просто делаем fit для видимого терминала
watch(
  () => store.activeTabId,
  async (newId) => {
    if (!newId) return
    
    await nextTick()
    
    const cached = terminalCache.value.get(newId)
    if (cached) {
      // Даем время на отображение контейнера
      setTimeout(() => {
        cached.fitAddon.fit()
        cached.terminal.focus()
      }, 50)
    } else {
      // Терминал еще не создан - создаем
      await initTerminal(newId)
    }
  }
)

// Обновление темы
watch(() => store.settings.theme, (newTheme) => {
  terminalCache.value.forEach(({ terminal }) => {
    terminal.options.theme = {
      background: newTheme === 'dark' ? '#1e1e1e' : '#ffffff',
      foreground: newTheme === 'dark' ? '#e0e0e0' : '#000000',
      cursor: '#6B53E6'
    }
  })
})

// Обновление размера шрифта
watch(() => store.settings.fontSize, (newSize) => {
  terminalCache.value.forEach(({ terminal, fitAddon }) => {
    terminal.options.fontSize = newSize
    fitAddon.fit()
  })
})

// Следим за добавлением новых вкладок
watch(
  () => store.tabs.length,
  (newLength, oldLength) => {
    if (newLength > oldLength) {
      // Новая вкладка добавлена - инициализируем её
      const newTab = store.tabs[store.tabs.length - 1]
      if (newTab && !terminalCache.value.has(newTab.id)) {
        initTerminal(newTab.id)
      }
    }
  }
)

// Следим за удалением вкладок
watch(
  () => store.tabs.map((t: any) => t.id),
  (newIds) => {
    const currentIds = new Set(newIds)
    terminalCache.value.forEach((_, tabId) => {
      if (!currentIds.has(tabId)) {
        disposeTerminal(tabId)
      }
    })
  }
)

onMounted(() => {
  // Инициализируем терминалы для всех существующих вкладок
  store.tabs.forEach((tab: any) => {
    if (!terminalCache.value.has(tab.id)) {
      initTerminal(tab.id)
    }
  })
})

onUnmounted(() => {
  // Очищаем все ResizeObservers
  resizeObservers.value.forEach((observer) => {
    observer.disconnect()
  })
  resizeObservers.value.clear()
  
  // Dispose всех терминалов
  terminalCache.value.forEach((_, tabId) => {
    disposeTerminal(tabId)
  })
})
</script>

<style scoped>
.terminals-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.terminal-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  padding: 8px 8px 8px 8px;
  box-sizing: border-box;
  /* CRITICAL FIX: No transition on container background to prevent white flash */
  background-color: var(--bg-color);
  transition: none !important;
}

/* Убираем все отступы у xterm */
.terminal-container .xterm {
  /* CRITICAL FIX: No transition on xterm background */
  transition: none !important;
  background-color: var(--bg-color);
}
:deep(.xterm) {
  width: 100% !important;
  height: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.xterm-viewport) {
  overflow-y: auto !important;
}
</style>
