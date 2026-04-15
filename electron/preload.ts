import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Terminal
  createTerminal: (options: any) => ipcRenderer.invoke('create-terminal', options),
  terminalWrite: (id: number, data: string) => ipcRenderer.invoke('terminal-write', { id, data }),
  terminalResize: (id: number, cols: number, rows: number) => 
    ipcRenderer.invoke('terminal-resize', { id, cols, rows }),
  terminalClose: (id: number) => ipcRenderer.invoke('terminal-close', { id }),
  renameTerminalLog: (id: number, newName: string) => 
    ipcRenderer.invoke('rename-terminal-log', { id, newName }),
  hasActiveProcess: (id: number) => ipcRenderer.invoke('has-active-process', { id }),
  
  onTerminalData: (id: number, callback: (data: string) => void) => {
    const channel = `terminal-data-${id}`;
    ipcRenderer.removeAllListeners(channel); // Удаляем старые слушатели
    ipcRenderer.on(channel, (event, data) => callback(data));
  },
  
  onTerminalExit: (id: number, callback: (exitCode: number) => void) => {
    const channel = `terminal-exit-${id}`;
    ipcRenderer.removeAllListeners(channel); // Удаляем старые слушатели
    ipcRenderer.on(channel, (event, exitCode) => callback(exitCode));
  },
  
  // Commands
  getSavedCommands: () => ipcRenderer.invoke('get-saved-commands'),
  saveCommands: (commands: any[]) => ipcRenderer.invoke('save-commands', commands),
  getTemplates: () => ipcRenderer.invoke('get-templates'),
  
  // Logs
  openLogsFolder: () => ipcRenderer.invoke('open-logs-folder'),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (updates: any) => ipcRenderer.invoke('update-settings', updates),
  selectLogDirectory: () => ipcRenderer.invoke('select-log-directory'),
  selectWorkingDirectory: () => ipcRenderer.invoke('select-working-directory'),
  
  // Tabs
  saveTabs: (tabs: Array<{ id: number; name: string }>) => 
    ipcRenderer.invoke('save-tabs', tabs),
  loadTabs: () => ipcRenderer.invoke('load-tabs'),
  
  // Sessions
  saveSession: (data: any) => ipcRenderer.invoke('save-session', data),
  loadSession: (filePath: string) => ipcRenderer.invoke('load-session', filePath),
  selectSessionFolder: () => ipcRenderer.invoke('select-session-folder'),
  listSessions: (folderPath?: string) => ipcRenderer.invoke('list-sessions', folderPath),
  checkSessionOnStartup: () => ipcRenderer.invoke('check-session-on-startup'),
  exportSession: () => ipcRenderer.invoke('export-session'),
  importSession: () => ipcRenderer.invoke('import-session'),
  
  // Commands import/export (YAML)
  importCommands: (filePath: string) => ipcRenderer.invoke('import-commands', filePath),
  exportCommands: (filePath: string, commands: any[]) => 
    ipcRenderer.invoke('export-commands', { filePath, commands }),
  selectCommandsFile: () => ipcRenderer.invoke('select-commands-file'),
  
  // SQLite Commands API (новая система с drag-and-drop)
  dbGetCommands: () => ipcRenderer.invoke('db-get-commands'),
  dbAddCommand: (command: any) => ipcRenderer.invoke('db-add-command', command),
  dbUpdateCommand: (id: number, updates: any) => ipcRenderer.invoke('db-update-command', id, updates),
  dbDeleteCommand: (id: number) => ipcRenderer.invoke('db-delete-command', id),
  dbReorderCommands: (reorderedIds: number[]) => ipcRenderer.invoke('db-reorder-commands', reorderedIds),
  dbImportCommands: (commands: any[], mode: 'replace' | 'append') => 
    ipcRenderer.invoke('db-import-commands', commands, mode),
  dbMigrateFromYaml: () => ipcRenderer.invoke('db-migrate-from-yaml'),
  
  // Window Control
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  
  // Language synchronization (one-way, no response needed)
  syncLanguage: (language: 'ru' | 'en') => ipcRenderer.send('sync-language', language)
});
