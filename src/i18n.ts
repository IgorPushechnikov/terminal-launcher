// Simple i18n implementation for Terminal Launcher

export type Language = 'ru' | 'en'

export interface Translations {
  [key: string]: {
    ru: string
    en: string
  }
}

export const translations: Translations = {
  // Common
  'common.ready': {
    ru: 'Готов',
    en: 'Ready'
  },
  'common.session': {
    ru: 'Сессия',
    en: 'Session'
  },
  'common.english': {
    ru: 'Английский',
    en: 'English'
  },
  'common.russian': {
    ru: 'Русский',
    en: 'Russian'
  },
  'common.toggleLang': {
    ru: 'Переключить на {0}',
    en: 'Switch to {0}'
  },
  
  // TitleBar
  'titlebar.lightTheme': {
    ru: 'Светлая тема',
    en: 'Light theme'
  },
  'titlebar.darkTheme': {
    ru: 'Темная тема',
    en: 'Dark theme'
  },
  'titlebar.minimize': {
    ru: 'Свернуть',
    en: 'Minimize'
  },
  'titlebar.restore': {
    ru: 'Восстановить',
    en: 'Restore'
  },
  'titlebar.maximize': {
    ru: 'Развернуть',
    en: 'Maximize'
  },
  'titlebar.close': {
    ru: 'Закрыть',
    en: 'Close'
  },
  'titlebar.help': {
    ru: 'Справка (F1)',
    en: 'Help (F1)'
  },
  'titlebar.about': {
    ru: 'О программе',
    en: 'About'
  },
  
  // StatusBar
  'statusbar.import': {
    ru: 'Импорт',
    en: 'Import'
  },
  'statusbar.export': {
    ru: 'Экспорт',
    en: 'Export'
  },
  'statusbar.importSession': {
    ru: 'Импорт сессии',
    en: 'Import session'
  },
  'statusbar.exportSession': {
    ru: 'Экспорт сессии',
    en: 'Export session'
  },
  'statusbar.importedSession': {
    ru: 'Импортированная сессия',
    en: 'Imported session'
  },
  
  // TabBar actions menu
  'tabs.importCommands': {
    ru: 'Импорт команд',
    en: 'Import commands'
  },
  'tabs.exportCommands': {
    ru: 'Экспорт команд',
    en: 'Export commands'
  },
  
  // Tabs
  'tabs.newTab': {
    ru: 'Новая вкладка',
    en: 'New tab'
  },
  'tabs.newTabName': {
    ru: 'Новое имя вкладки',
    en: 'New tab name'
  },
  'tabs.terminal': {
    ru: 'Терминал',
    en: 'Terminal'
  },
  'tabs.close': {
    ru: 'Закрыть',
    en: 'Close'
  },
  'tabs.closeTab': {
    ru: 'Закрыть вкладку',
    en: 'Close tab'
  },
  'tabs.addTab': {
    ru: 'Добавить вкладку',
    en: 'Add tab'
  },
  'tabs.actions': {
    ru: 'Действия',
    en: 'Actions'
  },
  'tabs.settings': {
    ru: 'Настройки',
    en: 'Settings'
  },
  'tabs.renameTab': {
    ru: 'Переименовать вкладку',
    en: 'Rename tab'
  },
  'tabs.confirmCloseWithProcess': {
    ru: 'Вкладка содержит активный процесс. Закрыть в любом случае?',
    en: 'Tab contains an active process. Close anyway?'
  },
  
  // Commands
  'commands.title': {
    ru: 'Команды',
    en: 'Commands'
  },
  'commands.addCommand': {
    ru: 'Добавить команду',
    en: 'Add command'
  },
  'commands.newCommand': {
    ru: 'Новая команда',
    en: 'New command'
  },
  'commands.edit': {
    ru: 'Редактировать',
    en: 'Edit'
  },
  'commands.delete': {
    ru: 'Удалить',
    en: 'Delete'
  },
  'commands.clearSearch': {
    ru: 'Очистить поиск',
    en: 'Clear search'
  },
  'commands.searchPlaceholder': {
    ru: 'Поиск команд...',
    en: 'Search commands...'
  },

  // Commands (continued)
  'commands.noCommands': {
    ru: 'Нет команд',
    en: 'No commands'
  },
  'commands.addFirstCommand': {
    ru: 'Добавить первую команду',
    en: 'Add first command'
  },
  'commands.editCommand': {
    ru: 'Редактировать команду',
    en: 'Edit command'
  },
  'commands.nameLabel': {
    ru: 'Название',
    en: 'Name'
  },
  'commands.namePlaceholder': {
    ru: 'Введите название команды',
    en: 'Enter command name'
  },
  'commands.commandLabel': {
    ru: 'Команда',
    en: 'Command'
  },
  'commands.commandPlaceholder': {
    ru: 'Введите текст команды',
    en: 'Enter command text'
  },
  'commands.cwdLabel': {
    ru: 'Рабочая директория',
    en: 'Working directory'
  },
  'commands.cwdPlaceholder': {
    ru: 'Оставьте пустым для текущей',
    en: 'Leave empty for current'
  },
  'commands.selectDirectory': {
    ru: 'Выбрать директорию',
    en: 'Select directory'
  },
  'commands.save': {
    ru: 'Сохранить',
    en: 'Save'
  },
  'commands.add': {
    ru: 'Добавить',
    en: 'Add'
  },
  'commands.cancel': {
    ru: 'Отмена',
    en: 'Cancel'
  },
  'commands.dragToReorder': {
    ru: 'Перетащите для изменения порядка',
    en: 'Drag to reorder'
  },

  // Session
  'session.autoSavedSession': {
    ru: 'Автосохраненная сессия',
    en: 'Autosaved session'
  },
  'session.detected': {
    ru: 'Обнаружена сессия',
    en: 'Session detected'
  },
  'session.noDescription': {
    ru: 'Нет описания',
    en: 'No description'
  },
  'session.yes': {
    ru: 'Да',
    en: 'Yes'
  },
  'session.no': {
    ru: 'Нет',
    en: 'No'
  },
  'session.wantToLoad': {
    ru: 'Хотите загрузить?',
    en: 'Want to load?'
  },
  'session.startOver': {
    ru: 'Начать сначала',
    en: 'Start over'
  },
  'session.loadSession': {
    ru: 'Загрузить сессию',
    en: 'Load session'
  },
  'session.unknown': {
    ru: 'Неизвестно',
    en: 'Unknown'
  },
  'session.tabs': {
    ru: 'Вкладка',
    en: 'Tab'
  },
  'session.commands': {
    ru: 'Команды',
    en: 'Commands'
  },
  'session.savedAt': {
    ru: 'Сохранено',
    en: 'Saved at'
  },

  // Settings
  'settings.title': {
    ru: 'Настройки',
    en: 'Settings'
  },
  'settings.logDirectory': {
    ru: 'Директория логов',
    en: 'Log directory'
  },
  'settings.select': {
    ru: 'Выбрать',
    en: 'Select'
  },
  'settings.autoStartLogging': {
    ru: 'Автоматически начинать логирование',
    en: 'Automatically start logging'
  },
  'settings.fontSize': {
    ru: 'Размер шрифта',
    en: 'Font size'
  },
  'settings.updates': {
    ru: 'Обновления',
    en: 'Updates'
  },
  'settings.currentVersion': {
    ru: 'Текущая версия',
    en: 'Current version'
  },
  'settings.checkForUpdates': {
    ru: 'Проверить обновления',
    en: 'Check for updates'
  },
  'settings.checking': {
    ru: 'Проверка...',
    en: 'Checking...'
  },
  'settings.checkComplete': {
    ru: 'Проверка завершена. Если есть обновление, появится уведомление.',
    en: 'Check complete. If update is available, notification will appear.'
  },
  'settings.devModeNoUpdates': {
    ru: 'Обновления доступны только в production версии',
    en: 'Updates are only available in production build'
  },
  
  // About Modal
  'about.version': {
    ru: 'Версия',
    en: 'Version'
  },
  'about.description': {
    ru: 'Многовкладочный терминальный эмулятор с сохранением команд и сессий. Кроссплатформенное приложение для Windows, macOS и Linux.',
    en: 'Multi-tab terminal emulator with saved commands and sessions. Cross-platform application for Windows, macOS, and Linux.'
  },
  'about.features': {
    ru: 'Возможности:',
    en: 'Features:'
  },
  'about.feature1': {
    ru: 'Несколько вкладок терминала',
    en: 'Multiple terminal tabs'
  },
  'about.feature2': {
    ru: 'Сохранение сессий и команд',
    en: 'Session and command persistence'
  },
  'about.feature3': {
    ru: 'Темная и светлая темы',
    en: 'Dark and light themes'
  },
  'about.feature4': {
    ru: 'Автоматические обновления',
    en: 'Automatic updates'
  },
  'about.checkUpdates': {
    ru: 'Проверить обновления',
    en: 'Check for Updates'
  },
  'settings.cancel': {
    ru: 'Отмена',
    en: 'Cancel'
  },
  'settings.save': {
    ru: 'Сохранить',
    en: 'Save'
  },

  // Errors
  'errors.saveFailed': {
    ru: 'Не удалось сохранить настройки',
    en: 'Failed to save settings'
  },
  'errors.updateCheckFailed': {
    ru: 'Ошибка проверки обновлений',
    en: 'Update check failed'
  },
  'errors.componentError': {
    ru: 'Ошибка компонента',
    en: 'Component error'
  },
  'errors.retry': {
    ru: 'Повторить',
    en: 'Retry'
  },
  'errors.unknownError': {
    ru: 'Неизвестная ошибка',
    en: 'Unknown error'
  },
  'errors.deleteConfirm': {
    ru: 'Удалить команду?',
    en: 'Delete command?'
  },
  'errors.fileReadError': {
    ru: 'Ошибка чтения файла: {0}',
    en: 'File read error: {0}'
  },
  'errors.importFailed': {
    ru: 'Ошибка импорта',
    en: 'Import failed'
  },
  'errors.exportFailed': {
    ru: 'Ошибка экспорта',
    en: 'Export failed'
  },
  'errors.noCommands': {
    ru: 'Нет команд для экспорта',
    en: 'No commands to export'
  },
  'errors.importError': {
    ru: 'Ошибка импорта: {0}',
    en: 'Import error: {0}'
  },
  'errors.getCommandsError': {
    ru: 'Ошибка получения команд: {0}',
    en: 'Error getting commands: {0}'
  },
  'errors.exportError': {
    ru: 'Ошибка экспорта: {0}',
    en: 'Export error: {0}'
  },
  'errors.loadingCommandsError': {
    ru: 'Ошибка загрузки команд из SQLite',
    en: 'Error loading commands from SQLite'
  },
  'errors.savingCommand': {
    ru: 'Ошибка сохранения команды',
    en: 'Error saving command'
  },
  'errors.loadingCommands': {
    ru: 'Ошибка загрузки команд',
    en: 'Error loading commands'
  },
  'errors.reorderError': {
    ru: 'Ошибка изменения порядка команд',
    en: 'Error reordering commands'
  },
  'errors.sessionLoadError': {
    ru: 'Ошибка автозагрузки сессии',
    en: 'Session autoload error'
  },
  'errors.initializationError': {
    ru: 'Ошибка инициализации',
    en: 'Initialization error'
  },

  // Success
  'success.imported': {
    ru: 'Импортировано {0} команд',
    en: 'Imported {0} commands'
  },
  'success.exported': {
    ru: 'Экспортировано {0} команд в файл',
    en: 'Exported {0} commands to file'
  },
  'success.commandsReordered': {
    ru: 'Порядок команд обновлен',
    en: 'Commands reordered'
  },
  'success.autoSaved': {
    ru: 'Автосохраненная сессия',
    en: 'Auto-saved session'
  },
  'success.commandDeleted': {
    ru: 'Команда удалена',
    en: 'Command deleted'
  },

  // Other errors
  'errors.deletingCommand': {
    ru: 'Ошибка удаления команды:',
    en: 'Error deleting command:'
  },
  'errors.deletingCommandError': {
    ru: 'Ошибка при удалении команды',
    en: 'Error while deleting command'
  },

  // Auto-updater
  'update.available': {
    ru: 'Доступно обновление',
    en: 'Update available'
  },
  'update.readyToInstall': {
    ru: 'Обновление готово к установке',
    en: 'Update ready to install'
  },
  'update.downloading': {
    ru: 'Скачивание обновления...',
    en: 'Downloading update...'
  },
  'update.download': {
    ru: 'Скачать',
    en: 'Download'
  },
  'update.installAndRestart': {
    ru: 'Установить и перезапустить',
    en: 'Install & Restart'
  },

  // Logs
  'logs.loadedSettings': {
    ru: 'Загруженные настройки',
    en: 'Loaded settings'
  },
  'logs.sidebarWidthSet': {
    ru: 'Установлена ширина sidebar',
    en: 'Sidebar width set'
  },
  'logs.noSavedSession': {
    ru: 'Нет сохраненной сессии, создаем новую',
    en: 'No saved session, creating new'
  },
  'logs.commandsLoaded': {
    ru: 'Команды загружены из SQLite',
    en: 'Commands loaded from SQLite'
  },

  // Help
  'help.title': {
    ru: 'Справка',
    en: 'Help'
  },
  'help.searchPlaceholder': {
    ru: 'Поиск по справке...',
    en: 'Search in help...'
  },
  'help.footer': {
    ru: 'Нужна дополнительная помощь?',
    en: 'Need additional help?'
  },
  'help.reportIssue': {
    ru: 'Сообщить о проблеме',
    en: 'Report an issue'
  },
}

// Helper function for template strings with placeholders
export function tTemplate(key: string, ...args: string[]): string {
  let result = t(key)
  args.forEach((arg, index) => {
    result = result.replace(`{${index}}`, arg)
  })
  return result
}

// Current language (will be stored in settings)
let currentLanguage: Language = 'ru'

export function setLanguage(lang: Language) {
  currentLanguage = lang
  localStorage.setItem('terminal-launcher-language', lang)
  
  // Отправляем в main process для синхронизации
  if (window.electronAPI && window.electronAPI.syncLanguage) {
    window.electronAPI.syncLanguage(lang)
  }
  
  // Dispatch event to notify all components
  window.dispatchEvent(new CustomEvent('language-changed', { detail: { language: lang } }))
}

export function getLanguage(): Language {
  const saved = localStorage.getItem('terminal-launcher-language') as Language
  return saved || 'ru'
}

export function t(key: string): string {
  const translation = translations[key]
  if (!translation) {
    console.warn(`Translation key not found: ${key}`)
    return key
  }
  return translation[currentLanguage] || translation.ru
}

// Helper to create reactive language state
import { ref, computed } from 'vue'

export function useLanguage() {
  const lang = ref<Language>(getLanguage())
  
  const updateLang = () => {
    lang.value = getLanguage()
  }
  
  // Listen for language changes
  if (typeof window !== 'undefined') {
    window.addEventListener('language-changed', updateLang)
  }
  
  // Create reactive translation function
  const t = computed(() => {
    return (key: string): string => {
      const translation = translations[key]
      if (!translation) {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
      return translation[lang.value] || translation.ru
    }
  })
  
  // Helper function for templates with optional args
  const translate = (key: string, ...args: string[]) => {
    let result = t.value(key)
    args.forEach((arg, index) => {
      result = result.replace(`{${index}}`, arg)
    })
    return result
  }

  // Cleanup функция для удаления слушателя
  const cleanup = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('language-changed', updateLang)
    }
  }

  return {
    lang,
    t: translate,
    setLanguage,
    getLanguage,
    cleanup
  }
}

// Initialize language on load
currentLanguage = getLanguage()
