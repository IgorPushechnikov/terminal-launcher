// Type definitions for Electron IPC API
import type { Command, SessionData, AppSettings, SessionListItem, TerminalTab } from './index';

export interface ElectronAPI {
  // Terminal management
  createTerminal: (options: { name?: string; cwd?: string; enableLog?: boolean; initialCols?: number; initialRows?: number }) => Promise<{ id: number }>;
  terminalWrite: (id: number, data: string) => Promise<void>;
  terminalResize: (id: number, cols: number, rows: number) => Promise<void>;
  terminalClose: (id: number) => Promise<void>;
  renameTerminalLog: (id: number, newName: string) => Promise<{ success: boolean; error?: string }>;
  hasActiveProcess: (id: number) => Promise<boolean>;
  
  onTerminalData: (id: number, callback: (data: string) => void) => void;
  onTerminalExit: (id: number, callback: (exitCode: number) => void) => void;
  
  // Commands
  getSavedCommands: () => Promise<Command[]>;
  saveCommands: (commands: Command[]) => Promise<boolean>;
  getTemplates: () => Promise<Command[]>;
  
  // Logs
  openLogsFolder: () => Promise<void>;
  
  // Settings
  getSettings: () => Promise<{
    theme: 'dark' | 'light';
    logDirectory: string;
    autoStartLogging: boolean;
    fontSize: number;
    sidebarWidth: number;
  }>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<boolean>;
  selectLogDirectory: () => Promise<string | null>;
  selectWorkingDirectory: () => Promise<string | null>;
  
  // Tabs
  saveTabs: (tabs: Array<{ id: number; name: string }>) => Promise<boolean>;
  loadTabs: () => Promise<Array<{ id: number; name: string }>>;
  
  // Sessions
  saveSession: (data: SessionData & { includeCommands?: boolean }) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  loadSession: (filePath: string) => Promise<{ success: boolean; error?: string } & SessionData>;
  selectSessionFolder: () => Promise<string | null>;
  listSessions: (folderPath?: string) => Promise<SessionListItem[]>;
  checkSessionOnStartup: () => Promise<{
    exists: boolean;
    filePath?: string;
    name?: string;
    description?: string;
    savedAt?: string;
    tabCount?: number;
    hasCommands?: boolean;
  }>;
  exportSession: () => Promise<{ success: boolean; filePath?: string; error?: string }>;
  importSession: () => Promise<{ success: boolean; error?: string } & SessionData>;
  
  // Commands import/export (YAML)
  importCommands: (filePath: string) => Promise<{ success: boolean; commands?: Command[]; error?: string }>;
  exportCommands: (filePath: string, commands: Command[]) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  selectCommandsFile: () => Promise<string | null>;
  
  // SQLite Commands API (новая система с drag-and-drop)
  dbGetCommands: () => Promise<{ success: boolean; commands?: Command[]; error?: string }>;
  dbAddCommand: (command: Omit<Command, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; command?: Command; error?: string }>;
  dbUpdateCommand: (id: number, updates: Partial<Omit<Command, 'id' | 'created_at' | 'updated_at'>>) => Promise<{ success: boolean; command?: Command; error?: string }>;
  dbDeleteCommand: (id: number) => Promise<{ success: boolean; error?: string }>;
  dbReorderCommands: (reorderedIds: number[]) => Promise<{ success: boolean; error?: string }>;
  dbImportCommands: (commands: Command[], mode: 'replace' | 'append') => Promise<{ success: boolean; count?: number; error?: string }>;
  dbMigrateFromYaml: () => Promise<{ success: boolean; migrated?: number; message?: string; error?: string }>;
  
  // Window Control
  windowMinimize: () => Promise<void>;
  windowMaximize: () => Promise<void>;
  windowClose: () => Promise<void>;
  windowIsMaximized: () => Promise<boolean>;
  
  // Language synchronization
  syncLanguage: (language: 'ru' | 'en') => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
