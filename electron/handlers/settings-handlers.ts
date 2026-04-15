// Settings IPC handlers
import { ipcMain, BrowserWindow, dialog, shell } from 'electron';
import SettingsManager from '../settings-manager';

export function setupSettingsHandlers(mainWindow: BrowserWindow | null): void {
  
  // Открыть папку с логами
  ipcMain.handle('open-logs-folder', async () => {
    const logDir = SettingsManager.getLogDirectory();
    shell.openPath(logDir);
  });

  // Получить настройки
  ipcMain.handle('get-settings', async () => {
    return SettingsManager.getAll();
  });

  // Обновить настройки
  ipcMain.handle('update-settings', async (event, updates) => {
    SettingsManager.update(updates);
    return SettingsManager.getAll();
  });

  // Выбрать директорию для логов
  ipcMain.handle('select-log-directory', async () => {
    if (!mainWindow) return null;
    
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Выберите папку для логов'
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      const selectedPath = result.filePaths[0];
      SettingsManager.set('logDirectory', selectedPath);
      return selectedPath;
    }
    
    return null;
  });

  // Выбрать рабочую директорию для команды
  ipcMain.handle('select-working-directory', async () => {
    if (!mainWindow) return null;
    
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Выберите рабочую директорию для команды'
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    
    return null;
  });
}
