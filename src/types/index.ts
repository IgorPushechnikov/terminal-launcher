// Interfaces for Terminal Launcher types

// Command interface
export interface Command {
  id: number;
  name: string;
  text: string;
  cwd?: string;
  icon?: string;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

// Session data interface
export interface SessionData {
  tabs: TerminalTab[];
  commands?: Command[];
  name?: string;
  description?: string;
  savedAt?: string;
  filePath?: string;
}

// Tab interface (уже есть в store, но продублируем для типов)
export interface TerminalTab {
  id: number;
  name: string;
  termId?: number;
  cwd?: string;
  [key: string]: any; // Для совместимости с xterm addons
}

// Settings interface
export interface AppSettings {
  theme: 'dark' | 'light';
  logDirectory: string;
  autoStartLogging: boolean;
  fontSize: number;
  sidebarWidth: number;
}

// Session list item
export interface SessionListItem {
  name: string;
  description: string;
  savedAt: string;
  filePath: string;
  tabCount: number;
  hasCommands: boolean;
}
