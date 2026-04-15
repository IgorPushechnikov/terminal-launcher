// Window control IPC handlers
import { ipcMain, BrowserWindow } from 'electron';

export function setupWindowHandlers(mainWindow: BrowserWindow | null): void {
  // CRITICAL FIX: Handle Alt+F4 at webContents level
  // This ensures Alt+F4 triggers window close properly
  if (mainWindow) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      // Check for Alt+F4 key combination
      if (input.key === 'F4' && input.alt && input.type === 'keyUp') {
        console.log('[MAIN] Alt+F4 detected, closing window...');
        // Explicitly close the window to trigger our cleanup handlers
        // This will fire 'close' and 'window-all-closed' events
        mainWindow.close();
      }
    });
  }

  // Минимизировать окно
  ipcMain.handle('window-minimize', () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  // Максимизировать/восстановить окно
  ipcMain.handle('window-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  // Закрыть окно
  ipcMain.handle('window-close', () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });

  // Проверить состояние максимизации
  ipcMain.handle('window-is-maximized', () => {
    return mainWindow ? mainWindow.isMaximized() : false;
  });
}
