// Session management IPC handlers
import { ipcMain, BrowserWindow, dialog } from 'electron';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import SettingsManager from '../settings-manager';
import workspaceManager from '../workspace-manager';

export function setupSessionHandlers(mainWindow: BrowserWindow | null): void {
  
  // Проверить наличие файла сессии при запуске
  ipcMain.handle('check-session-on-startup', async () => {
    try {
      const workspace = workspaceManager.detectWorkspace();
      const paths = workspaceManager.getWorkspacePaths(workspace);
      const sessionFile = paths.sessionPath;
      
      if (fs.existsSync(sessionFile)) {
        const content = fs.readFileSync(sessionFile, 'utf8');
        const data = yaml.parse(content);
        
        return {
          exists: true,
          filePath: sessionFile,
          name: data.name || 'Session',
          description: data.description || '',
          savedAt: data.savedAt || '',
          tabCount: (data.tabs || []).length,
          hasCommands: !!(data.commands && data.commands.length > 0)
        };
      }
      
      return { exists: false };
    } catch (error: any) {
      console.error('[MAIN] Ошибка проверки сессии:', error);
      return { exists: false };
    }
  });

  // Сохранить сессию в файл
  ipcMain.handle('save-session', async (event, { filePath, name, description, tabs, commands, includeCommands }) => {
    try {
      const sessionData: any = {
        name: name || 'Session',
        description: description || '',
        savedAt: new Date().toISOString(),
        tabs: tabs || []
      };
      
      if (includeCommands && commands) {
        sessionData.commands = commands;
      }
      
      const sessionPath = filePath || path.join(SettingsManager.getSessionPath(), 'terminal-session.yaml');
      
      const dir = path.dirname(sessionPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(sessionPath, yaml.stringify(sessionData), 'utf8');
      console.log('[MAIN] Сессия сохранена:', sessionPath);
      
      return { success: true, filePath: sessionPath };
    } catch (error: any) {
      console.error('[MAIN] Ошибка сохранения сессии:', error.message);
      
      // User-friendly error messages
      let userMessage = error.message;
      if (error.code === 'ENOSPC') {
        userMessage = 'Disk full! Please free up space and try again.';
      } else if (error.code === 'EACCES') {
        userMessage = 'Permission denied. Try running as administrator or choose a different location.';
      } else if (error.code === 'EPERM') {
        userMessage = 'Operation not permitted. Check file permissions.';
      } else if (error.code === 'ENOENT') {
        userMessage = 'Directory does not exist. Please choose a valid location.';
      }
      
      return { success: false, error: userMessage };
    }
  });

  // Загрузить сессию из файла
  ipcMain.handle('load-session', async (event, filePath) => {
    try {
      if (!fs.existsSync(filePath)) {
        return { success: false, error: 'Файл сессии не найден' };
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      const sessionData = yaml.parse(content);
      
      // Validation структуры сессии
      if (!sessionData || typeof sessionData !== 'object') {
        throw new Error('Invalid session format: not an object');
      }
      
      if (!sessionData.tabs || !Array.isArray(sessionData.tabs)) {
        throw new Error('Invalid session format: missing or invalid tabs array');
      }
      
      // Validate each tab
      sessionData.tabs.forEach((tab: any, idx: number) => {
        if (!tab.id || typeof tab.id !== 'number') {
          throw new Error(`Invalid tab at index ${idx}: missing or invalid id`);
        }
        if (!tab.name || typeof tab.name !== 'string') {
          throw new Error(`Invalid tab at index ${idx}: missing or invalid name`);
        }
      });
      
      // Validate commands if present
      if (sessionData.commands && !Array.isArray(sessionData.commands)) {
        throw new Error('Invalid session format: commands must be an array');
      }
      
      console.log('[MAIN] Сессия загружена и валидирована:', filePath);
      
      return {
        success: true,
        tabs: sessionData.tabs || [],
        commands: sessionData.commands || [],
        name: sessionData.name || '',
        description: sessionData.description || ''
      };
    } catch (error: any) {
      console.error('[MAIN] Ошибка загрузки сессии:', error.message);
      return { success: false, error: `Failed to load session: ${error.message}` };
    }
  });

  // Экспортировать сессию в файл (с диалогом)
  ipcMain.handle('export-session', async () => {
    if (!mainWindow) return { success: false, error: 'Окно не найдено' };
    
    try {
      const tabs = await mainWindow.webContents.executeJavaScript('window.__getTabsState__()', true);
      const commands = await mainWindow.webContents.executeJavaScript('window.__getCommandsState__()', true);
      
      if (!tabs || tabs.length === 0) {
        return { success: false, error: 'Нет активных вкладок для экспорта' };
      }
      
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Экспорт сессии',
        defaultPath: `session-${new Date().toISOString().slice(0, 10)}.yaml`,
        filters: [
          { name: 'YAML Files', extensions: ['yaml', 'yml'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Отменено пользователем' };
      }
      
      const sessionData = {
        name: 'Exported Session',
        description: 'Экспортированная сессия',
        savedAt: new Date().toISOString(),
        tabs: tabs,
        commands: commands || [],
        includeCommands: true
      };
      
      fs.writeFileSync(result.filePath, yaml.stringify(sessionData), 'utf8');
      console.log('[MAIN] Сессия экспортирована:', result.filePath);
      
      return { success: true, filePath: result.filePath };
    } catch (error: any) {
      console.error('[MAIN] Ошибка экспорта сессии:', error);
      return { success: false, error: error.message };
    }
  });

  // Импортировать сессию из файла (с диалогом)
  ipcMain.handle('import-session', async () => {
    if (!mainWindow) return { success: false, error: 'Окно не найдено' };
    
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Импорт сессии',
        properties: ['openFile'],
        filters: [
          { name: 'YAML Files', extensions: ['yaml', 'yml'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: 'Отменено пользователем' };
      }
      
      const filePath = result.filePaths[0];
      
      if (!fs.existsSync(filePath)) {
        return { success: false, error: 'Файл не найден' };
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      const sessionData = yaml.parse(content);
      
      console.log('[MAIN] Сессия импортирована:', filePath);
      
      return {
        success: true,
        tabs: sessionData.tabs || [],
        commands: sessionData.commands || [],
        name: sessionData.name || 'Imported Session',
        description: sessionData.description || '',
        filePath: filePath
      };
    } catch (error: any) {
      console.error('[MAIN] Ошибка импорта сессии:', error);
      return { success: false, error: error.message };
    }
  });

  // Выбрать папку для сессий
  ipcMain.handle('select-session-folder', async () => {
    if (!mainWindow) return null;
    
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Выберите папку для сохранения сессий'
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      const selectedPath = result.filePaths[0];
      SettingsManager.setSessionPath(selectedPath);
      return selectedPath;
    }
    
    return null;
  });

  // Список всех сессий в папке
  ipcMain.handle('list-sessions', async (event, folderPath) => {
    try {
      const targetPath = folderPath || SettingsManager.getSessionPath();
      
      if (!fs.existsSync(targetPath)) {
        return [];
      }
      
      const files = fs.readdirSync(targetPath);
      const sessions = [];
      
      for (const file of files) {
        if (file.endsWith('-session.yaml') || file === 'terminal-session.yaml') {
          try {
            const filePath = path.join(targetPath, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const data = yaml.parse(content);
            
            sessions.push({
              name: data.name || file,
              description: data.description || '',
              savedAt: data.savedAt || '',
              filePath: filePath,
              tabCount: (data.tabs || []).length,
              hasCommands: !!(data.commands && data.commands.length > 0)
            });
          } catch (e) {
            console.error(`[MAIN] Ошибка чтения сессии ${file}:`, e);
          }
        }
      }
      
      sessions.sort((a, b) => {
        if (!a.savedAt) return 1;
        if (!b.savedAt) return -1;
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      });
      
      return sessions;
    } catch (error: any) {
      console.error('[MAIN] Ошибка списка сессий:', error);
      return [];
    }
  });

  // Импорт команд из файла
  ipcMain.handle('import-commands', async (event, filePath) => {
    try {
      if (!fs.existsSync(filePath)) {
        return { success: false, error: 'Файл не найден' };
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      const commands = yaml.parse(content);
      
      if (!Array.isArray(commands)) {
        return { success: false, error: 'Неверный формат файла' };
      }
      
      console.log('[MAIN] Команды импортированы:', filePath, `(${commands.length} команд)`);
      
      return { success: true, commands };
    } catch (error: any) {
      console.error('[MAIN] Ошибка импорта команд:', error);
      return { success: false, error: error.message };
    }
  });

  // Выбрать файл с командами (диалог)
  ipcMain.handle('select-commands-file', async () => {
    if (!mainWindow) return null;
    
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'YAML Files', extensions: ['yaml', 'yml'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      title: 'Выберите файл с командами'
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    
    return null;
  });

  // Экспортировать команды в файл
  ipcMain.handle('export-commands', async (event, { filePath, commands }) => {
    try {
      let targetPath = filePath;
      if (!targetPath && mainWindow) {
        const result = await dialog.showSaveDialog(mainWindow, {
          title: 'Экспорт команд',
          defaultPath: 'commands.yaml',
          filters: [
            { name: 'YAML Files', extensions: ['yaml', 'yml'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });
        
        if (result.canceled || !result.filePath) {
          return { success: false, error: 'Отменено пользователем' };
        }
        
        targetPath = result.filePath;
      }
      
      if (!targetPath) {
        return { success: false, error: 'Путь не указан' };
      }
      
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(targetPath, yaml.stringify(commands), 'utf8');
      console.log('[MAIN] Команды экспортированы:', targetPath);
      
      return { success: true, filePath: targetPath };
    } catch (error: any) {
      console.error('[MAIN] Ошибка экспорта команд:', error);
      return { success: false, error: error.message };
    }
  });
}
