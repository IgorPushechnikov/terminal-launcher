import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export interface WorkspaceInfo {
  path: string;              // Путь к .terminal-manager
  type: 'project' | 'global' | 'portable';
  isWritable: boolean;
}

export interface WorkspaceData {
  commandsPath: string;      // Путь к БД команд
  logsPath: string;          // Путь к логам
  settingsPath: string;      // Путь к настройкам
  sessionPath: string;       // Путь к сессиям
  tabsPath: string;          // Путь к вкладкам
}

class WorkspaceManager {
  private currentWorkspace: WorkspaceInfo | null = null;
  private workspaceCache: Map<string, WorkspaceInfo> = new Map();

  /**
   * Определить рабочее пространство
   * Приоритет: CLI arg > env var > cwd > parent dirs > portable > global
   */
  detectWorkspace(startPath?: string): WorkspaceInfo {
    // Проверяем кэш
    const cacheKey = startPath || 'default';
    if (this.workspaceCache.has(cacheKey)) {
      return this.workspaceCache.get(cacheKey)!;
    }

    let workspace: WorkspaceInfo;

    // 1. Проверяем CLI аргумент --workspace=path
    const cliWorkspace = this.getWorkspaceFromCLI();
    if (cliWorkspace) {
      workspace = cliWorkspace;
    }
    // 2. Проверяем переменную окружения TERMINAL_WORKSPACE
    else if (process.env.TERMINAL_WORKSPACE) {
      workspace = this.validateWorkspace(process.env.TERMINAL_WORKSPACE);
    }
    // 3. Ищем в текущей директории и выше (как git)
    else {
      const searchPath = startPath || process.cwd();
      workspace = this.findWorkspaceInTree(searchPath);
    }

    // Кэшируем результат
    this.workspaceCache.set(cacheKey, workspace);
    this.currentWorkspace = workspace;

    console.log(`[Workspace] Detected: ${workspace.type} at ${workspace.path}`);
    return workspace;
  }

  /**
   * Получить пути к файлам рабочего пространства
   */
  getWorkspacePaths(workspace?: WorkspaceInfo): WorkspaceData {
    const ws = workspace || this.currentWorkspace || this.detectWorkspace();
    
    return {
      commandsPath: path.join(ws.path, 'commands.db'),
      logsPath: path.join(ws.path, 'logs'),
      settingsPath: path.join(ws.path, 'settings.json'),
      sessionPath: path.join(ws.path, 'session.yaml'),
      tabsPath: path.join(ws.path, 'tabs.yaml')
    };
  }

  /**
   * Создать новое рабочее пространство
   */
  createWorkspace(targetPath: string): WorkspaceInfo {
    const workspacePath = path.join(targetPath, '.terminal-manager');
    
    // Создаем директорию
    if (!fs.existsSync(workspacePath)) {
      fs.mkdirSync(workspacePath, { recursive: true });
    }

    // Создаем подпапку для логов
    const logsPath = path.join(workspacePath, 'logs');
    if (!fs.existsSync(logsPath)) {
      fs.mkdirSync(logsPath, { recursive: true });
    }

    // Создаем workspace.json с метаданными
    const metadataPath = path.join(workspacePath, 'workspace.json');
    if (!fs.existsSync(metadataPath)) {
      const metadata = {
        name: path.basename(targetPath),
        created: new Date().toISOString(),
        lastOpened: new Date().toISOString(),
        version: '1.0.0'
      };
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
    }

    const workspace: WorkspaceInfo = {
      path: workspacePath,
      type: 'project',
      isWritable: true
    };

    // Очищаем кэш
    this.workspaceCache.clear();

    console.log(`[Workspace] Created at ${workspacePath}`);
    return workspace;
  }

  /**
   * Проверить является ли режим портативным
   */
  isPortableMode(): boolean {
    // Windows: проверяем наличие .portable файла рядом с exe
    if (process.platform === 'win32') {
      const exeDir = path.dirname(app.getPath('exe'));
      return fs.existsSync(path.join(exeDir, '.portable'));
    }

    // macOS: проверяем запущены ли из Applications
    if (process.platform === 'darwin') {
      const appPath = app.getPath('exe');
      // Если не в /Applications/, считаем portable
      return !appPath.includes('/Applications/');
    }

    // Linux: AppImage всегда portable, или проверяем переменную окружения
    if (process.platform === 'linux') {
      return !!process.env.APPIMAGE || !!process.env.TERMINAL_LAUNCHER_PORTABLE;
    }

    return false;
  }

  /**
   * Получить путь к глобальной папке настроек (fallback)
   */
  getGlobalPath(): string {
    return app.getPath('userData');
  }

  /**
   * Получить shell для текущей платформы
   */
  getDefaultShell(): string {
    if (process.platform === 'win32') {
      return 'powershell.exe';
    }
    
    if (process.platform === 'darwin') {
      // macOS: предпочитать zsh (default с Catalina)
      if (fs.existsSync('/bin/zsh')) {
        return '/bin/zsh';
      }
      return '/bin/bash';
    }
    
    // Linux
    return '/bin/bash';
  }

  /**
   * Получить дефолтный шрифт для платформы
   */
  getDefaultFontFamily(): string {
    if (process.platform === 'win32') {
      return 'Consolas, "Courier New", monospace';
    }
    
    if (process.platform === 'darwin') {
      return 'Menlo, Monaco, "Courier New", monospace';
    }
    
    // Linux
    return '"DejaVu Sans Mono", "Liberation Mono", monospace';
  }

  /**
   * Санитизация имени файла (кроссплатформенная)
   */
  sanitizeFilename(name: string): string {
    const safeName = (name || 'terminal').trim().substring(0, 50);
    
    if (process.platform === 'win32') {
      // Windows: больше запрещенных символов
      return safeName.replace(/[<>:"/\\|?*]/g, '_');
    } else {
      // Linux/macOS: только / и null byte запрещены
      return safeName.replace(/\//g, '_').replace(/\0/g, '');
    }
  }

  // Private methods

  private getWorkspaceFromCLI(): WorkspaceInfo | null {
    const args = process.argv;
    const workspaceIndex = args.indexOf('--workspace');
    
    if (workspaceIndex !== -1 && args[workspaceIndex + 1]) {
      return this.validateWorkspace(args[workspaceIndex + 1]);
    }

    // Поддержка --workspace=path
    for (const arg of args) {
      if (arg.startsWith('--workspace=')) {
        const wsPath = arg.substring('--workspace='.length);
        return this.validateWorkspace(wsPath);
      }
    }

    return null;
  }

  private validateWorkspace(wsPath: string): WorkspaceInfo {
    const normalizedPath = path.normalize(wsPath);
    
    if (!fs.existsSync(normalizedPath)) {
      console.warn(`[Workspace] Path does not exist: ${normalizedPath}, creating...`);
      fs.mkdirSync(normalizedPath, { recursive: true });
    }

    // Проверяем есть ли .terminal-manager внутри
    const terminalManagerPath = path.join(normalizedPath, '.terminal-manager');
    
    if (fs.existsSync(terminalManagerPath)) {
      return {
        path: terminalManagerPath,
        type: 'project',
        isWritable: this.isPathWritable(terminalManagerPath)
      };
    }

    // Если передан прямой путь к .terminal-manager
    if (path.basename(normalizedPath) === '.terminal-manager') {
      return {
        path: normalizedPath,
        type: 'project',
        isWritable: this.isPathWritable(normalizedPath)
      };
    }

    // Создаем .terminal-manager
    return this.createWorkspace(normalizedPath);
  }

  private findWorkspaceInTree(startPath: string): WorkspaceInfo {
    let currentDir = startPath;
    const root = path.parse(currentDir).root;
    let depth = 0;
    const maxDepth = 10; // Ограничиваем глубину поиска

    // Ищем вверх по дереву (как git)
    while (currentDir !== root && depth < maxDepth) {
      const candidate = path.join(currentDir, '.terminal-manager');
      
      if (fs.existsSync(candidate)) {
        return {
          path: candidate,
          type: 'project',
          isWritable: this.isPathWritable(candidate)
        };
      }

      currentDir = path.dirname(currentDir);
      depth++;
    }

    // Не нашли в дереве, проверяем portable режим
    if (this.isPortableMode()) {
      const exeDir = path.dirname(app.getPath('exe'));
      const portablePath = path.join(exeDir, '.terminal-manager');
      
      if (!fs.existsSync(portablePath)) {
        fs.mkdirSync(portablePath, { recursive: true });
      }

      return {
        path: portablePath,
        type: 'portable',
        isWritable: this.isPathWritable(portablePath)
      };
    }

    // Fallback на глобальную папку
    const globalPath = this.getGlobalPath();
    
    if (!fs.existsSync(globalPath)) {
      fs.mkdirSync(globalPath, { recursive: true });
    }

    return {
      path: globalPath,
      type: 'global',
      isWritable: this.isPathWritable(globalPath)
    };
  }

  private isPathWritable(testPath: string): boolean {
    try {
      const testFile = path.join(testPath, '.write-test');
      fs.writeFileSync(testFile, '', 'utf-8');
      fs.unlinkSync(testFile);
      return true;
    } catch (error) {
      console.warn(`[Workspace] Path is not writable: ${testPath}`, error);
      return false;
    }
  }
}

export default new WorkspaceManager();
