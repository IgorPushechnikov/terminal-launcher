import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import pty from 'node-pty';
import fs from 'fs';
import yaml from 'yaml';
import SettingsManager from './settings-manager';
import commandsDb from './commandsDb';
import workspaceManager from './workspace-manager';
import { setMainLanguage, mt } from './mainI18n';
import {
  setupWindowHandlers,
  setupTerminalHandlers,
  setupCommandHandlers,
  setupSessionHandlers,
  setupSettingsHandlers
} from './handlers';

// Установка кодировки UTF-8 для консоли Windows
// ВАЖНО: chcp влияет только на новые процессы, поэтому для текущего процесса
// рекомендуется запускать через: chcp 65001 && npm run dev
if (process.platform === 'win32') {
  try {
    const { execSync } = require('child_process');
    // Пытаемся установить UTF-8 кодировку
    execSync('chcp 65001 > nul 2>&1', { stdio: 'ignore' });
  } catch (e) {
    // Игнорируем ошибки
  }
}

// Логирование времени запуска
const startTime = Date.now();
console.log('[MAIN]', mt('app.start'));
console.log('[MAIN]', mt('app.time') + ':', new Date().toISOString());

// Защита от двойного запуска
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  console.log('[MAIN] Второй экземпляр, выхожу...');
  app.exit(0);
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

let mainWindow: BrowserWindow | null = null;
const terminals = new Map<number, { term: any; logStream?: fs.WriteStream }>();
let nextTerminalId = 1;
let windowCreated = false; // Флаг для защиты от двойного создания

function getAppDir() {
  // В production используем папку рядом с exe
  // В development используем userData (AppData)
  if (process.env.NODE_ENV === 'development') {
    return app.getPath('userData');
  }
  const exePath = app.getPath('exe');
  return path.join(path.dirname(exePath), '.terminal-manager');
}

function ensureAppDir() {
  const dir = getAppDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

// Инициализация файлов при первом запуске (production)
function initializeDefaultFiles() {
  if (process.env.NODE_ENV === 'development') {
    return; // В dev режиме не нужно
  }
  
  const appDir = ensureAppDir();
  
  console.log('[MAIN] Проверка файлов инициализации...');
  console.log('[MAIN] App dir:', appDir);
  
  // Пути к файлам внутри asar архива
  const asarPath = path.join(path.dirname(app.getPath('exe')), 'resources', 'app.asar.unpacked');
  const resourcesPath = fs.existsSync(asarPath) ? asarPath : path.dirname(app.getPath('exe'));
  
  console.log('[MAIN] Resources path:', resourcesPath);
  
  // Копируем commands.yaml если он существует в ресурсах и отсутствует в appDir
  const sourceCommands = path.join(resourcesPath, '.terminal-manager', 'commands.yaml');
  const targetCommands = path.join(appDir, 'commands.yaml');
  
  if (fs.existsSync(sourceCommands) && !fs.existsSync(targetCommands)) {
    try {
      fs.copyFileSync(sourceCommands, targetCommands);
      console.log('[MAIN] Commands.yaml скопирован из ресурсов');
    } catch (e) {
      console.error('[MAIN] Ошибка копирования commands.yaml:', e);
    }
  } else if (fs.existsSync(sourceCommands)) {
    console.log('[MAIN] Commands.yaml уже существует, пропускаем');
  } else {
    console.log('[MAIN] Commands.yaml не найден в ресурсах');
  }
  
  // Копируем tabs.yaml если он существует в ресурсах и отсутствует в appDir
  const sourceTabs = path.join(resourcesPath, '.terminal-manager', 'tabs.yaml');
  const targetTabs = path.join(appDir, 'tabs.yaml');
  
  if (fs.existsSync(sourceTabs) && !fs.existsSync(targetTabs)) {
    try {
      fs.copyFileSync(sourceTabs, targetTabs);
      console.log('[MAIN] Tabs.yaml скопирован из ресурсов');
    } catch (e) {
      console.error('[MAIN] Ошибка копирования tabs.yaml:', e);
    }
  }
}

// Async функция сохранения состояния сессии (используется в before-quit)
async function saveSessionState(): Promise<void> {
  try {
    if (!mainWindow || mainWindow.isDestroyed()) {
      console.log('[MAIN] Окно уничтожено, пропускаю сохранение сессии');
      return;
    }

    console.log('[MAIN] Starting session save...');

    // Получаем состояние вкладок и команд
    const [tabs, commandsResult] = await Promise.all([
      mainWindow.webContents.executeJavaScript('window.__getTabsState__()', true),
      mainWindow.webContents.executeJavaScript('window.__getCommandsState__()', true)
    ]);

    if (!tabs || tabs.length === 0) {
      console.log('[MAIN] No tabs to save');
      return;
    }

    const commands = commandsResult?.commands || [];
    console.log(`[MAIN] Saving ${tabs.length} tabs, ${commands.length} commands`);

    // Определяем workspace для сохранения
    const workspace = workspaceManager.detectWorkspace();
    const paths = workspaceManager.getWorkspacePaths(workspace);

    // Сохраняем вкладки в tabs.yaml workspace
    fs.writeFileSync(paths.tabsPath, yaml.stringify({
      tabs: tabs.map((t: any) => ({ id: t.id, name: t.name })),
      savedAt: new Date().toISOString(),
      count: tabs.length
    }), 'utf8');
    console.log('[MAIN] Вкладки сохранены в workspace:', tabs.length);

    // Автосохраняем сессию в session.yaml workspace
    const sessionData = {
      name: 'Auto-saved Session',
      description: 'Автоматически сохранённая сессия при закрытии',
      savedAt: new Date().toISOString(),
      tabs: tabs,
      commands: commands,
      includeCommands: true
    };

    fs.writeFileSync(paths.sessionPath, yaml.stringify(sessionData), 'utf8');
    console.log('[MAIN] Сессия автосохранена в workspace:', `(вкладок: ${tabs.length}, команд: ${commands.length})`);
    console.log('[MAIN] Session saved successfully');

  } catch (error: any) {
    console.error('[MAIN] Error saving session:', error.message);
    throw error; // Re-throw to be caught by before-quit handler
  }
}

// Функция сохранения состояния сессии (legacy, используется в close)
function saveSessionStateSync(): void {
  try {
    if (!mainWindow || mainWindow.isDestroyed()) {
      console.log('[MAIN] Окно уничтожено, пропускаю сохранение сессии');
      return;
    }

    // Синхронно получаем состояние вкладок и команд через executeJavaScript
    // executeJavaScript возвращает Promise, но мы используем его синхронно в close контексте
    const tabsPromise = mainWindow.webContents.executeJavaScript('window.__getTabsState__()', true);
    const commandsPromise = mainWindow.webContents.executeJavaScript('window.__getCommandsState__()', true);

    // Ждём результаты (в close контексте окно ещё живо)
    Promise.all([tabsPromise, commandsPromise]).then(([tabs, commands]) => {
      if (tabs && tabs.length > 0) {
        // Определяем workspace для сохранения
        const workspace = workspaceManager.detectWorkspace();
        const paths = workspaceManager.getWorkspacePaths(workspace);

        // Сохраняем вкладки в tabs.yaml workspace
        fs.writeFileSync(paths.tabsPath, yaml.stringify({
          tabs: tabs.map((t: any) => ({ id: t.id, name: t.name })),
          savedAt: new Date().toISOString(),
          count: tabs.length
        }), 'utf8');
        console.log('[MAIN] Вкладки сохранены в workspace:', tabs.length);

        console.log('[MAIN] Получены команды для сохранения:', commands ? commands.length : 0);

        // Автосохраняем сессию в session.yaml workspace
        const sessionData = {
          name: 'Auto-saved Session',
          description: 'Автоматически сохранённая сессия при закрытии',
          savedAt: new Date().toISOString(),
          tabs: tabs,
          commands: commands || [],
          includeCommands: true
        };

        fs.writeFileSync(paths.sessionPath, yaml.stringify(sessionData), 'utf8');
        console.log('[MAIN] Сессия автосохранена в workspace:', `(вкладок: ${tabs.length}, команд: ${commands ? commands.length : 0})`);
      }
    }).catch((error: any) => {
      console.error('[MAIN] Ошибка автосохранения:', error.message);
    });
  } catch (error: any) {
    console.error('[MAIN] Ошибка сохранения сессии:', error.message);
  }
}

// CRITICAL: Флаг для предотвращения бесконечной рекурсии в before-quit
let isSavingBeforeQuit = false;
let quitAlreadyInitiated = false; // Никогда не сбрасывается!

// DISABLED: before-quit handler causes infinite loop with app.quit()
// Session saving moved to window-all-closed instead
/*
app.on('before-quit', async (event) => {
  // Если quit УЖЕ был инициирован - позволяем выйти без повторного сохранения
  if (quitAlreadyInitiated) {
    console.log('[MAIN] Quit already initiated, allowing to continue');
    return; // Не вызываем preventDefault
  }
  
  if (isSavingBeforeQuit) {
    console.log('[MAIN] Save in progress, allowing quit');
    return;
  }

  console.log('[MAIN] before-quit: saving session state...');
  event.preventDefault(); // Останавливаем quit для сохранения
  isSavingBeforeQuit = true;

  try {
    // CRITICAL FIX: Window may already be destroyed at this point!
    // Only save if window is still alive and responsive
    if (mainWindow && !mainWindow.isDestroyed()) {
      // Short timeout (3 seconds) to avoid hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Save timed out')), 3000)
      );
      
      await Promise.race([saveSessionState(), timeoutPromise]);
      console.log('[MAIN] Session saved successfully');
    } else {
      console.log('[MAIN] Window already destroyed, skipping session save');
    }
  } catch (error: any) {
    console.error('[MAIN] Failed to save session:', error.message);
    // Continue quitting even if save failed
  } finally {
    // CRITICAL: Mark quit as initiated BEFORE calling app.quit()
    // This prevents infinite loop when app.quit() triggers before-quit again
    quitAlreadyInitiated = true;
    isSavingBeforeQuit = false;
    
    console.log('[MAIN] Re-initiating quit after save');
    // Use app.quit() - it will call before-quit again but quitAlreadyInitiated prevents re-entry
    app.quit();
  }
});
*/

function createWindow() {
  const windowStartTime = Date.now();
  console.log('[MAIN] Начинаю создание BrowserWindow...');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // Отключаем стандартную рамку окна для кастомного TitleBar
    icon: path.join(__dirname, '../build/icons/icon.ico'), // Иконка для Windows
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#1e1e1e'
  });

  console.log('[MAIN] BrowserWindow создан за', Date.now() - windowStartTime, 'мс');

  // В режиме разработки загружаем с dev server
  if (process.env.NODE_ENV === 'development') {
    console.log('[MAIN] Загружаю URL:', 'http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools(); // Включаем для отладки черного экрана
  } else {
    const htmlPath = path.join(__dirname, '../dist/index.html');
    console.log('[MAIN] Загружаю файл:', htmlPath);
    mainWindow.loadFile(htmlPath);
  }
  
  console.log('[MAIN] Окно создано, общее время запуска:', Date.now() - startTime, 'мс');

  console.log('[MAIN] Окно создано успешно');

  // REMOVED: window.close handler - it conflicts with before-quit!
  // The close event fires when renderer is already shutting down
  // executeJavaScript hangs because renderer context is gone
  // Only use before-quit for session saving (it has proper timeout)
  mainWindow.on('closed', () => {
    windowCreated = false;
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  const readyTime = Date.now();
  console.log('[MAIN] app.whenReady() сработало через', readyTime - startTime, 'мс');
  
  // В dev режиме с HMR может быть несколько вызовов whenReady
  if (mainWindow) {
    console.log('[MAIN] Окно уже существует, пропускаем');
    return;
  }
  
  if (windowCreated) {
    console.log('[MAIN] Флаг окна уже установлен, пропускаем');
    return;
  }
  
  console.log('[MAIN] Создаю окно...');
  windowCreated = true;
  
  // 1. Определяем рабочее пространство
  const workspace = workspaceManager.detectWorkspace();
  console.log(`[MAIN] Workspace detected: ${workspace.type} at ${workspace.path}`);
  
  // 2. Инициализируем SettingsManager с учетом workspace
  SettingsManager.initialize();
  
  // 3. Инициализируем базу данных команд
  try {
    const paths = workspaceManager.getWorkspacePaths(workspace);
    commandsDb.initialize(paths.commandsPath);
    console.log('[MAIN] Commands DB initialized at:', paths.commandsPath);
  } catch (error: any) {
    console.error('[MAIN] Failed to initialize Commands DB:', error);
  }
  
  // 4. Создаём окно
  createWindow();
  
  // 5. Регистрируем IPC handlers (после создания окна!)
  setupWindowHandlers(mainWindow);
  setupTerminalHandlers(mainWindow, terminals, { value: nextTerminalId }, ensureAppDir);
  setupCommandHandlers(ensureAppDir);
  setupSessionHandlers(mainWindow);
  setupSettingsHandlers(mainWindow);
  
  // 6. Инициализируем файлы по умолчанию асинхронно (production)
  setImmediate(() => {
    initializeDefaultFiles();
  });
  
  // 7. Регистрируем IPC handlers для автообновления (всегда, даже в dev)
  // Это позволяет тестировать UI без ошибок
  ipcMain.handle('check-for-updates', async () => {
    if (!app.isPackaged) {
      console.log('[UPDATE] Dev mode - updates disabled');
      return { success: false, error: 'Updates are disabled in development mode' };
    }
    
    try {
      console.log('[UPDATE] Manual check triggered');
      await autoUpdater.checkForUpdates();
      return { success: true };
    } catch (error: any) {
      console.error('[UPDATE] Check failed:', error.message);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('download-update', async () => {
    if (!app.isPackaged) {
      return { success: false, error: 'Updates are disabled in development mode' };
    }
    
    try {
      console.log('[UPDATE] Download triggered');
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error: any) {
      console.error('[UPDATE] Download failed:', error.message);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('install-update', () => {
    if (!app.isPackaged) {
      return { success: false };
    }
    
    console.log('[UPDATE] Install triggered - will install on quit');
    autoUpdater.quitAndInstall();
    return { success: true };
  });
  
  // Get app info
  ipcMain.handle('get-app-info', () => {
    return {
      version: app.getVersion(),
      electronVersion: process.versions.electron
    };
  });
  
  // 8. Настраиваем автообновление (только в production)
  if (!app.isPackaged) {
    console.log('[MAIN] Dev mode - autoUpdater disabled');
    return;
  }
  
  console.log('[MAIN] Setting up auto-updater...');
  console.log('[MAIN] Current version:', app.getVersion());
  console.log('[MAIN] GitHub repo: IgorPushechnikov/terminal-launcher');
  
  // Настройка для GitHub API
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  
  // Логирование всех событий
  autoUpdater.on('checking-for-update', () => {
    console.log('[UPDATE] Checking for updates...');
    if (mainWindow) {
      mainWindow.webContents.send('update-checking', true);
    }
  });
  
  autoUpdater.on('update-available', (info) => {
    console.log('[UPDATE] ✅ Update available:', info.version);
    console.log('[UPDATE] Release date:', info.releaseDate);
    if (mainWindow) {
      mainWindow.webContents.send('update-available', {
        version: info.version,
        releaseNotes: info.releaseNotes,
        releaseDate: info.releaseDate
      });
    }
  });
  
  autoUpdater.on('update-not-available', (info) => {
    console.log('[UPDATE] ⏹️ No updates available');
    console.log('[UPDATE] Current version:', app.getVersion());
    if (mainWindow) {
      mainWindow.webContents.send('update-not-available', true);
    }
  });
  
  // Логирование всех ошибок для отладки
  autoUpdater.on('error', (err) => {
    console.error('[UPDATE] ❌ Error:', err.message);
    console.error('[UPDATE] Stack:', err.stack);
    if (mainWindow) {
      mainWindow.webContents.send('update-error', err.message);
    }
  });
  
  autoUpdater.on('download-progress', (progressObj) => {
    const percent = Math.round(progressObj.percent);
    console.log(`[UPDATE] Downloading: ${percent}%`);
    if (mainWindow) {
      mainWindow.webContents.send('update-download-progress', percent);
    }
  });
  
  autoUpdater.on('update-downloaded', (info) => {
    console.log('[UPDATE] Update downloaded:', info.version);
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded', {
        version: info.version,
        releaseNotes: info.releaseNotes
      });
    }
  });
  
  // Автоматическая проверка при запуске (через 5 секунд)
  setTimeout(() => {
    console.log('[UPDATE] Auto-checking for updates...');
    autoUpdater.checkForUpdates().catch(err => {
      console.error('[UPDATE] Auto-check failed:', err.message);
    });
  }, 5000);
});

app.on('window-all-closed', async () => {
  console.log('[MAIN] window-all-closed triggered');
  
  // CRITICAL FIX: Force kill all PTY processes immediately
  // PTY processes can block app exit if not properly terminated
  terminals.forEach((data, id) => {
    try {
      // Try multiple methods to ensure process is killed
      if (data.term && typeof data.term.kill === 'function') {
        // On Windows, use signal 9 or no signal parameter
        if (process.platform === 'win32') {
          data.term.kill(); // No signal parameter on Windows
        } else {
          data.term.kill('SIGKILL'); // Unix systems
        }
        console.log(`[MAIN] Terminal ${id} kill signal sent`);
      } else if (data.term && typeof data.term.destroy === 'function') {
        data.term.destroy();
        console.log(`[MAIN] Terminal ${id} destroyed`);
      }

      if (data.logStream) {
        data.logStream.end();
        console.log(`[MAIN] Terminal ${id} log stream closed`);
      }

      console.log(`Терминал ${id} закрыт`);
    } catch (e: any) {
      console.error(`Ошибка закрытия терминала ${id}:`, e.message);
    }
  });
  terminals.clear();

  // Закрываем SQLite соединение
  try {
    commandsDb.close().catch((err: any) => {
      console.error('[MAIN] Ошибка закрытия БД:', err)
    })
    console.log('[MAIN] SQLite соединение закрыто')
  } catch (e: any) {
    console.error('[MAIN] Ошибка закрытия БД:', e.message)
  }

  // CRITICAL FIX: Save session BEFORE quitting
  // This avoids the before-quit infinite loop issue
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      console.log('[MAIN] Saving session state before quit...');
      
      // CRITICAL: Add timeout to prevent hanging if renderer is unresponsive
      const savePromise = saveSessionState();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Save timed out after 2 seconds')), 2000)
      );
      
      await Promise.race([savePromise, timeoutPromise]);
      console.log('[MAIN] Session saved successfully');
    } else {
      console.log('[MAIN] Window already destroyed, skipping session save');
    }
  } catch (error: any) {
    console.error('[MAIN] Failed to save session:', error.message);
    // Continue quitting even if save failed
  }

  // CORRECT FIX: Use app.exit() for immediate termination
  // app.quit() can hang if there are pending operations
  // Since we've already cleaned up everything, use exit()
  if (process.platform !== 'darwin') {
    console.log('[MAIN] All windows closed, exiting application...')
    app.exit(0) // Immediate exit, no more events
  }
});

// ============================================
// Language Synchronization
// ============================================

// Синхронизация языка из renderer в main process
ipcMain.on('sync-language', (event, language: 'ru' | 'en') => {
  setMainLanguage(language);
  console.log('[MAIN]', mt('app.language.synced') + ':', language);
});
