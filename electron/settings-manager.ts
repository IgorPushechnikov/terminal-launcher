import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import yaml from 'yaml';
import workspaceManager from './workspace-manager';

class SettingsManager {
  private settingsPath: string;
  private tabsPath: string;
  private defaultSettings: any;
  private settings: any;
  private workspaceInitialized: boolean = false;

  constructor() {
    // Инициализация будет выполнена через initialize()
    this.settingsPath = '';
    this.tabsPath = '';
    this.defaultSettings = {};
    this.settings = {};
  }

  /**
   * Инициализировать менеджер с учетом рабочего пространства
   * Должен вызываться после app.whenReady()
   */
  initialize() {
    if (this.workspaceInitialized) {
      return;
    }

    const workspace = workspaceManager.detectWorkspace();
    const paths = workspaceManager.getWorkspacePaths(workspace);

    this.settingsPath = paths.settingsPath;
    this.tabsPath = paths.tabsPath;
    
    // Кроссплатформенные дефолтные настройки
    this.defaultSettings = {
      theme: 'dark',
      logDirectory: paths.logsPath,
      autoStartLogging: true,
      fontSize: 14,
      fontFamily: workspaceManager.getDefaultFontFamily(),
      defaultSessionPath: '', // Пусто = использовать workspace
      sidebarWidth: 300,
      workspaceType: workspace.type // 'project' | 'global' | 'portable'
    };
    
    this.settings = this.loadSettings();
    this.workspaceInitialized = true;
    
    console.log(`[Settings] Initialized with ${workspace.type} workspace at ${workspace.path}`);
  }

  loadSettings() {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const data = fs.readFileSync(this.settingsPath, 'utf-8');
        const loaded = JSON.parse(data);
        return { ...this.defaultSettings, ...loaded };
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    }
    return { ...this.defaultSettings };
  }

  saveSettings() {
    try {
      const dir = path.dirname(this.settingsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2), 'utf-8');
      return true;
    } catch (error: any) {
      console.error('Ошибка сохранения настроек:', error.message);
      
      // User-friendly error messages
      if (error.code === 'ENOSPC') {
        console.error('[Settings] Disk full! Please free up space.');
      } else if (error.code === 'EACCES') {
        console.error('[Settings] Permission denied. Try running as administrator.');
      } else if (error.code === 'EPERM') {
        console.error('[Settings] Operation not permitted. Check file permissions.');
      } else {
        console.error('[Settings] Unexpected error:', error.code || error.message);
      }
      
      return false;
    }
  }

  get(key: string) {
    return this.settings[key];
  }

  set(key: string, value: any) {
    this.settings[key] = value;
    this.saveSettings();
  }

  getAll() {
    return { ...this.settings };
  }

  update(updates: any) {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
  }

  getLogDirectory() {
    // Если путь пустой, используем дефолтную директорию логов из workspace
    if (!this.settings.logDirectory || this.settings.logDirectory.trim() === '') {
      this.settings.logDirectory = this.defaultSettings.logDirectory;
      this.saveSettings();
    }
    
    if (!fs.existsSync(this.settings.logDirectory)) {
      fs.mkdirSync(this.settings.logDirectory, { recursive: true });
    }
    return this.settings.logDirectory;
  }

  generateLogFileName(terminalName: string) {
    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const safeName = workspaceManager.sanitizeFilename(terminalName || 'terminal');
    return `${safeName}_${dateStr}.log`;
  }

  getFullLogPath(terminalName: string) {
    const logDir = this.getLogDirectory();
    const fileName = this.generateLogFileName(terminalName);
    return path.join(logDir, fileName);
  }

  saveTabs(tabs: Array<{ name: string }>) {
    try {
      console.log('[Settings] Сохранение вкладок:', tabs.length);
      const tabsData = tabs.map(tab => ({ name: tab.name }));
      
      const yamlContent = yaml.stringify({
        tabs: tabsData,
        savedAt: new Date().toISOString(),
        count: tabsData.length
      });
      
      console.log('[Settings] YAML content:', yamlContent.substring(0, 100));
      
      fs.writeFileSync(this.tabsPath, yamlContent, 'utf-8');
      console.log(`[Settings] Вкладки сохранены в ${this.tabsPath}`);
      return true;
    } catch (error: any) {
      console.error('[Settings] Ошибка сохранения вкладок:', error.message);
      console.error('[Settings] Stack:', error.stack);
      return false;
    }
  }

  loadTabs() {
    try {
      if (fs.existsSync(this.tabsPath)) {
        const content = fs.readFileSync(this.tabsPath, 'utf-8');
        const data = yaml.parse(content);
        console.log(`Вкладки загружены из ${this.tabsPath} (${data?.tabs?.length || 0} вкладок)`);
        return data?.tabs || [];
      }
    } catch (error) {
      console.error('Ошибка загрузки вкладок:', error);
    }
    return [];
  }

  getSessionPath(): string {
    // Если указана custom path, используем её
    if (this.settings.defaultSessionPath && fs.existsSync(this.settings.defaultSessionPath)) {
      return this.settings.defaultSessionPath;
    }
    // Иначе используем текущее рабочее пространство
    const workspace = workspaceManager.detectWorkspace();
    const paths = workspaceManager.getWorkspacePaths(workspace);
    return path.dirname(paths.sessionPath);
  }

  setSessionPath(sessionPath: string): boolean {
    try {
      // Проверяем что папка существует
      if (sessionPath && !fs.existsSync(sessionPath)) {
        console.error('[Settings] Папка сессий не существует:', sessionPath);
        return false;
      }
      
      this.settings.defaultSessionPath = sessionPath;
      this.saveSettings();
      console.log('[Settings] Путь к сессиям обновлён:', sessionPath || '(AppData)');
      return true;
    } catch (error) {
      console.error('[Settings] Ошибка сохранения пути сессий:', error);
      return false;
    }
  }
}

export default new SettingsManager();
