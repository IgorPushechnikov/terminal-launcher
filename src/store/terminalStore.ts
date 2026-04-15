import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import { t, getLanguage, setLanguage } from '../i18n'
import type { Command } from '../types/index'

export interface TerminalTab {
  id: number
  name: string
  termId?: number
  isDead?: boolean // Флаг что PTY процесс умер
  exitCode?: number // Код выхода если процесс завершился
}

export interface Settings {
  theme: 'dark' | 'light'
  logDirectory: string
  autoStartLogging: boolean
  fontSize: number
  sidebarWidth: number
}

export const useTerminalStore = defineStore('terminal', () => {
  // State
  const tabs = ref<TerminalTab[]>([])
  const activeTabId = ref<number | null>(null)
  const nextTabId = ref(1)
  const commands = ref<Command[]>([])
  const templates = ref<Command[]>([])
  const sidebarWidth = ref(300)
  const settings = ref<Settings>({
    theme: 'dark',
    logDirectory: '',
    autoStartLogging: true,
    fontSize: 14,
    sidebarWidth: 300
  })
  const currentSessionPath = ref<string | undefined>(undefined)
  const loadedSessionName = ref<string | undefined>(undefined)

  // Actions
  const addTab = (name?: string) => {
    const id = nextTabId.value
    
    let tabName = name
    if (!tabName) {
      const terminalWord = t('tabs.terminal')
      const pattern = new RegExp(`^${terminalWord} \\d+$`)
      const terminalTabs = tabs.value.filter((tab: TerminalTab) => pattern.test(tab.name))
      const maxNum = terminalTabs.reduce((max: number, tab: TerminalTab) => {
        const match = tab.name.match(new RegExp(`${terminalWord} (\\d+)`))
        return match ? Math.max(max, parseInt(match[1])) : max
      }, 0)
      tabName = `${terminalWord} ${maxNum + 1}`
    }
    
    const newTab: TerminalTab = { id, name: tabName }
    
    tabs.value.push(newTab)
    activeTabId.value = id
    nextTabId.value = id + 1
  }

  const removeTab = (id: number) => {
    const index = tabs.value.findIndex((t: TerminalTab) => t.id === id)
    if (index !== -1) {
      tabs.value.splice(index, 1)
      
      if (activeTabId.value === id) {
        activeTabId.value = tabs.value[0]?.id || null
      }
    }
  }

  // Закрытие вкладки с проверкой активного процесса
  const closeTabWithConfirmation = async (id: number): Promise<boolean> => {
    const tab = tabs.value.find((t: TerminalTab) => t.id === id)
    if (tab && tab.termId) {
      // Проверяем наличие активного процесса
      try {
        const hasActiveProcess = await window.electronAPI.hasActiveProcess(tab.termId)
        if (hasActiveProcess) {
          // Импортируем t() здесь, чтобы избежать циклических зависимостей
          const { t } = await import('../i18n')
          const confirmed = window.confirm(t('tabs.confirmCloseWithProcess'))
          if (!confirmed) {
            return false // Пользователь отменил закрытие
          }
        }
      } catch (error) {
        console.error('Error checking active process:', error)
        // В случае ошибки продолжаем закрытие
      }
    }
    
    // Закрываем вкладку
    removeTab(id)
    return true // Вкладка закрыта
  }

  const setActiveTab = (id: number) => {
    activeTabId.value = id
  }

  const renameTab = (id: number, newName: string) => {
    const tab = tabs.value.find((t: TerminalTab) => t.id === id)
    if (tab) {
      tab.name = newName
    }
  }

  const updateTabTermId = (tabId: number, termId: number) => {
    const tab = tabs.value.find((t: TerminalTab) => t.id === tabId)
    if (tab) {
      tab.termId = termId
    }
  }

  // Отметить терминал как мёртвый (PTY процесс завершился)
  const markTerminalAsDead = (tabId: number, exitCode: number) => {
    const tab = tabs.value.find((t: TerminalTab) => t.id === tabId)
    if (tab) {
      tab.isDead = true
      tab.exitCode = exitCode
      console.log(`[Store] Terminal ${tabId} marked as dead with exit code ${exitCode}`)
    }
  }

  const setTabs = (newTabs: TerminalTab[], activeId?: number, nextId?: number) => {
    tabs.value = newTabs
    if (activeId !== undefined) activeTabId.value = activeId
    if (nextId !== undefined) nextTabId.value = nextId
  }

  const setNextTabId = (id: number) => {
    nextTabId.value = id
  }

  const setCommands = (newCommands: Command[]) => {
    commands.value = newCommands
  }

  const setTemplates = (newTemplates: Command[]) => {
    templates.value = newTemplates
  }

  const setSidebarWidth = async (width: number) => {
    sidebarWidth.value = width
    settings.value.sidebarWidth = width
    // Сохраняем в Electron settings
    try {
      await window.electronAPI.updateSettings({ sidebarWidth: width })
    } catch (error) {
      console.error('Ошибка сохранения ширины sidebar:', error)
    }
  }

  const updateSettings = (newSettings: Partial<Settings>) => {
    settings.value = { ...settings.value, ...newSettings }
  }

  // Session actions
  const loadSessionData = (session: { tabs: TerminalTab[], commands?: Command[] }, force: boolean = false) => {
    // Если вкладки уже есть и force=false, не перезаписываем их
    if (tabs.value.length > 0 && !force) {
      console.log('[Store] Вкладки уже загружены, пропускаем loadSessionData (передайте force=true для принудительной загрузки)')
      return
    }

    const newTabs = session.tabs.map((tab: TerminalTab) => ({
      ...tab,
      termId: undefined // Сбрасываем termId, они будут созданы заново
    }))

    tabs.value = newTabs
    activeTabId.value = newTabs[0]?.id || null
    nextTabId.value = Math.max(...newTabs.map(t => t.id)) + 1
    if (session.commands) commands.value = session.commands
  }

  const clearSession = () => {
    tabs.value = []
    activeTabId.value = null
    currentSessionPath.value = undefined
    loadedSessionName.value = undefined
  }

  const setCurrentSessionPath = (path: string) => {
    currentSessionPath.value = path
  }

  const setLoadedSessionName = (name: string) => {
    loadedSessionName.value = name
  }

  // Обновляет названия вкладок по умолчанию при смене языка
  const updateDefaultTabNames = () => {
    const terminalWord = t('tabs.terminal')
    
    tabs.value.forEach((tab: TerminalTab) => {
      const match = tab.name.match(/^(Терминал|Terminal) (\d+)$/)
      if (match) {
        tab.name = `${terminalWord} ${match[2]}`
      }
    })
  }

  // Слушаем событие смены языка
  let languageListenerAttached = false
  const languageHandler = () => {
    updateDefaultTabNames()
  }

  if (typeof window !== 'undefined' && !languageListenerAttached) {
    window.addEventListener('language-changed', languageHandler)
    languageListenerAttached = true
  }

  // Функция для очистки слушателя (вызывается при необходимости)
  const cleanupLanguageListener = () => {
    if (typeof window !== 'undefined' && languageListenerAttached) {
      window.removeEventListener('language-changed', languageHandler)
      languageListenerAttached = false
    }
  }

  return {
    tabs,
    activeTabId,
    nextTabId,
    commands,
    templates,
    sidebarWidth,
    settings,
    currentSessionPath,
    loadedSessionName,
    addTab,
    removeTab,
    closeTabWithConfirmation,
    setActiveTab,
    renameTab,
    updateTabTermId,
    markTerminalAsDead,
    setTabs,
    setNextTabId,
    setCommands,
    setTemplates,
    setSidebarWidth,
    updateSettings,
    loadSessionData,
    clearSession,
    setCurrentSessionPath,
    setLoadedSessionName,
    cleanupLanguageListener
  }
})
