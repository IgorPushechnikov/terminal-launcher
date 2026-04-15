// Глобальная настройка для тестов
import { config } from '@vue/test-utils'

// Мокаем electronAPI для всех тестов
;(global.window as any).electronAPI = {
  getSavedCommands: () => Promise.resolve([]),
  saveCommands: () => Promise.resolve(true),
  dbGetCommands: () => Promise.resolve({ success: true, commands: [] }),
  dbAddCommand: () => Promise.resolve({ success: true }),
  dbUpdateCommand: () => Promise.resolve({ success: true }),
  dbDeleteCommand: () => Promise.resolve({ success: true }),
  dbReorderCommands: () => Promise.resolve({ success: true }),
  getTemplates: () => Promise.resolve([]),
  createTerminal: () => Promise.resolve({ id: 1 }),
  terminalWrite: () => Promise.resolve(),
  terminalResize: () => Promise.resolve(),
  terminalClose: () => Promise.resolve(),
  hasActiveProcess: () => Promise.resolve(false),
  renameTerminalLog: () => Promise.resolve({ success: true }),
  loadTabs: () => Promise.resolve([]),
  saveTabs: () => Promise.resolve(true),
  getSettings: () => Promise.resolve({
    theme: 'dark',
    logDirectory: '',
    autoStartLogging: false,
    fontSize: 14,
    sidebarWidth: 300
  }),
  updateSettings: () => Promise.resolve(true),
  selectLogDirectory: () => Promise.resolve(null),
  selectWorkingDirectory: () => Promise.resolve(null),
  saveSession: () => Promise.resolve({ success: true }),
  loadSession: () => Promise.resolve({ success: true, tabs: [], commands: [] }),
  exportSession: () => Promise.resolve({ success: true }),
  importSession: () => Promise.resolve({ success: true }),
  checkSessionOnStartup: () => Promise.resolve({ exists: false }),
  listSessions: () => Promise.resolve([]),
  selectSessionFolder: () => Promise.resolve(null),
  importCommands: () => Promise.resolve({ success: true, commands: [] }),
  exportCommands: () => Promise.resolve({ success: true }),
  selectCommandsFile: () => Promise.resolve(null),
  dbImportCommands: () => Promise.resolve({ success: true, count: 0 }),
  dbMigrateFromYaml: () => Promise.resolve({ success: true, migrated: 0 }),
  windowMinimize: () => Promise.resolve(),
  windowMaximize: () => Promise.resolve(),
  windowClose: () => Promise.resolve(),
  windowIsMaximized: () => Promise.resolve(false),
  syncLanguage: () => {}
} as any

// Отключаем предупреждения Vue в тестах
config.global.stubs = {
  transition: false,
  'transition-group': false
}
