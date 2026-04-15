<template>
  <div class="app-container" :data-theme="theme">
      <CustomTitleBar
        :is-maximized="isMaximized"
        :theme="theme"
        @minimize="handleMinimize"
        @maximize="handleMaximize"
        @close="handleClose"
        @toggle-theme="handleToggleTheme"
        @open-help="helpOpened = true"
      />
      
      <div class="main-content">
        <HomeView @open-settings="settingsOpened = true" />
        <StatusBar />
      </div>

      <SettingsModal 
        :opened="settingsOpened" 
        @close="settingsOpened = false" 
      />
      
      <HelpModal
        :opened="helpOpened"
        @close="helpOpened = false"
      />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue'
import { t as translate } from './i18n'
import CustomTitleBar from './components/Terminal/CustomTitleBar.vue'
import HomeView from './components/Layout/HomeView.vue'
import StatusBar from './components/Layout/StatusBar.vue'
import SettingsModal from './components/Settings/SettingsModal.vue'
import HelpModal from './components/Help/HelpModal.vue'
import { useTerminalStore } from './store/terminalStore'
import type { TerminalTab } from './types'

const settingsOpened = ref(false)
const helpOpened = ref(false)
const isMaximized = ref(false)

const store = useTerminalStore()
const theme = computed(() => store.settings.theme)

const handleMinimize = async () => {
  await window.electronAPI.windowMinimize()
}

const handleMaximize = async () => {
  await window.electronAPI.windowMaximize()
  isMaximized.value = await window.electronAPI.windowIsMaximized()
}

const handleClose = async () => {
  await window.electronAPI.windowClose()
}

const handleToggleTheme = async () => {
  const newTheme = store.settings.theme === 'dark' ? 'light' : 'dark'
  
  // CRITICAL FIX: Сначала обновляем store (Vue reactivity)
  // Потом синхронизируем DOM operations в одном frame
  store.updateSettings({ theme: newTheme })
  localStorage.setItem('terminal-launcher-theme', newTheme)
  
  // Ждём пока Vue применит изменения к DOM
  await nextTick()
  
  // Теперь устанавливаем transition marker и запускаем анимацию
  // Используем requestAnimationFrame для синхронизации с browser paint
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      // Устанавливаем marker ПОСЛЕ того как Vue обновил data-theme
      document.documentElement.style.setProperty('--theme-transition', 'enabled')
      resolve()
    })
  })
  
  // Убираем marker после завершения transition (200ms + buffer)
  setTimeout(() => {
    document.documentElement.style.removeProperty('--theme-transition')
  }, 250)
}

// === Helper functions ===

const loadCommandsFromSQLite = async () => {
  try {
    const migrationResult = await window.electronAPI.dbMigrateFromYaml()
    if (migrationResult.success && migrationResult.migrated && migrationResult.migrated > 0) {
      console.log('[App]', translate('logs.yamlMigrationComplete'), ':', migrationResult.message)
    }

    const result = await window.electronAPI.dbGetCommands()
    if (result.success && result.commands) {
      useTerminalStore().setCommands(result.commands)
      console.log('[App]', translate('logs.commandsLoaded'), ':', result.commands.length)
    }
  } catch (error) {
    console.error('[App]', translate('errors.loadingCommandsError'), ':', error)
  }
}

const autoLoadLastSession = async () => {
  try {
    const sessionCheck = await window.electronAPI.checkSessionOnStartup()

    if (sessionCheck.exists && sessionCheck.filePath) {
      const result = await window.electronAPI.loadSession(sessionCheck.filePath)
      if (result.success && result.tabs && result.tabs.length > 0) {
        store.loadSessionData({
          tabs: result.tabs,
          commands: result.commands || []
        }, true)
        store.setLoadedSessionName(translate('session.autoSavedSession'))
        console.log('[App]', translate('logs.sessionLoaded'), ':', sessionCheck.name)
        return true
      }
    }

    console.log('[App]', translate('logs.noSavedSession'))
    return false
  } catch (error) {
    console.error('[App]', translate('errors.sessionLoadError'), ':', error)
    return false
  }
}

// === Keyboard shortcuts (F-keys, централизованный handler) ===

const handleKeyDown = (event: KeyboardEvent) => {
  // Игнорируем если модалки открыты
  if (settingsOpened.value || helpOpened.value) return;
  
  // F1 — Open Help
  if (event.key === 'F1' && !event.shiftKey) {
    event.preventDefault()
    helpOpened.value = true
    return
  }

  // F2 — New Tab (global default)
  if (event.key === 'F2') {
    event.preventDefault()
    store.addTab()
    return
  }

  // F3 — Close Current Tab (с подтверждением если есть активный процесс)
  if (event.key === 'F3') {
    event.preventDefault()
    if (store.activeTabId !== null && store.tabs.length > 1) {
      store.closeTabWithConfirmation(store.activeTabId)
    }
    return
  }

  // F4 — Next Tab
  if (event.key === 'F4' && !event.shiftKey) {
    event.preventDefault()
    const currentIndex = store.tabs.findIndex(t => t.id === store.activeTabId)
    const nextIndex = (currentIndex + 1) % store.tabs.length
    if (store.tabs[nextIndex]) {
      store.setActiveTab(store.tabs[nextIndex].id)
    }
    return
  }

  // Shift+F4 — Previous Tab
  if (event.key === 'F4' && event.shiftKey) {
    event.preventDefault()
    const currentIndex = store.tabs.findIndex(t => t.id === store.activeTabId)
    const prevIndex = (currentIndex - 1 + store.tabs.length) % store.tabs.length
    if (store.tabs[prevIndex]) {
      store.setActiveTab(store.tabs[prevIndex].id)
    }
    return
  }

  // Ctrl+R — Rename current tab (альтернатива F2 для rename)
  if (event.ctrlKey && event.key === 'r' && store.activeTabId) {
    event.preventDefault()
    // Триггерим событие для TabBar/HomeView
    window.dispatchEvent(new CustomEvent('rename-tab', { detail: store.activeTabId }))
    return
  }

  // Escape — Close modals
  if (event.key === 'Escape') {
    event.preventDefault()
    if (helpOpened.value) {
      helpOpened.value = false
    } else if (settingsOpened.value) {
      settingsOpened.value = false
    }
    return
  }
}

// === Single onMounted (объединенный) ===

onMounted(async () => {
  // Отключаем transition при первой загрузке чтобы избежать бликов
  document.documentElement.classList.add('no-transition')
  document.documentElement.setAttribute('data-theme', store.settings.theme)
  
  // Включаем transition после первой отрисовки
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.documentElement.classList.remove('no-transition')
    }, 100)
  })

  // Keyboard shortcuts listener
  window.addEventListener('keydown', handleKeyDown)

  try {
    // Загружаем настройки из Electron
    const settings = await window.electronAPI.getSettings()
    console.log('[App]', translate('logs.loadedSettings'), ':', settings)
    if (settings.sidebarWidth) {
      store.sidebarWidth = settings.sidebarWidth
      store.settings.sidebarWidth = settings.sidebarWidth
      console.log('[App]', translate('logs.sidebarWidthSet'), ':', settings.sidebarWidth)
    }

    // Сначала пытаемся загрузить последнюю сессию
    const sessionLoaded = await autoLoadLastSession()

    if (!sessionLoaded) {
      // Если сессия не загружена, загружаем сохраненные вкладки или создаем новую
      const savedTabs = await window.electronAPI.loadTabs()
      if (savedTabs && savedTabs.length > 0) {
        const terminalWord = translate('tabs.terminal')
        const tabsWithId = savedTabs.map((tab: TerminalTab, index: number) => ({
          id: index + 1,
          name: tab.name || `${terminalWord} ${index + 1}`
        }))
        const firstTabId = tabsWithId.length > 0 ? tabsWithId[0].id : undefined
        store.setTabs(tabsWithId, firstTabId, tabsWithId.length + 1)
      } else {
        const terminalWord = translate('tabs.terminal')
        store.setTabs([{ id: 1, name: `${terminalWord} 1` }], 1, 2)
      }
    }

    // Загружаем команды из SQLite
    await loadCommandsFromSQLite()
  } catch (error) {
    console.error(translate('errors.initializationError'), ':', error)
    store.addTab()
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: calc(100vh - 36px);
  overflow: hidden;
}
</style>
