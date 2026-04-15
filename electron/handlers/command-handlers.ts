// Commands and templates IPC handlers
import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import commandsDb from '../commandsDb';

export function setupCommandHandlers(ensureAppDir: () => string): void {
  
  // Получить сохраненные команды (YAML)
  ipcMain.handle('get-saved-commands', async () => {
    const appDir = ensureAppDir();
    const commandsPath = path.join(appDir, 'commands.yaml');
    
    try {
      if (fs.existsSync(commandsPath)) {
        const content = fs.readFileSync(commandsPath, 'utf8');
        return yaml.parse(content) || [];
      }
    } catch (e) {
      console.error('Failed to load commands:', e);
    }
    
    const defaults = [
      {
        name: 'Echo Test',
        text: 'echo Hello from Terminal Launcher!',
        cwd: null,
        enableLog: false
      }
    ];
    
    try {
      fs.writeFileSync(commandsPath, yaml.stringify(defaults), 'utf8');
    } catch (e) {
      console.error('Failed to save default commands:', e);
    }
    
    return defaults;
  });

  // Сохранить команды (YAML)
  ipcMain.handle('save-commands', async (event, commands) => {
    const appDir = ensureAppDir();
    const commandsPath = path.join(appDir, 'commands.yaml');
    
    try {
      fs.writeFileSync(commandsPath, yaml.stringify(commands), 'utf8');
      return true;
    } catch (e) {
      console.error('Failed to save commands:', e);
      throw e;
    }
  });

  // Загрузить вкладки
  ipcMain.handle('load-tabs', async () => {
    const appDir = ensureAppDir();
    const tabsPath = path.join(appDir, 'tabs.yaml');
    
    try {
      if (fs.existsSync(tabsPath)) {
        const content = fs.readFileSync(tabsPath, 'utf8');
        const data = yaml.parse(content);
        return data?.tabs || [];
      }
    } catch (e) {
      console.error('Failed to load tabs:', e);
    }
    
    return [];
  });

  // Сохранить вкладки
  ipcMain.handle('save-tabs', async (event, tabs) => {
    const appDir = ensureAppDir();
    const tabsPath = path.join(appDir, 'tabs.yaml');
    
    console.log('[MAIN] Сохранение вкладок:', tabs.length);
    
    try {
      const data = {
        tabs: tabs.map((t: any) => ({ id: t.id, name: t.name })),
        savedAt: new Date().toISOString(),
        count: tabs.length
      };
      fs.writeFileSync(tabsPath, yaml.stringify(data), 'utf8');
      console.log('[MAIN] Вкладки сохранены в', tabsPath);
      return true;
    } catch (e) {
      console.error('[MAIN] Failed to save tabs:', e);
      throw e;
    }
  });

  // Получить шаблоны команд
  ipcMain.handle('get-templates', async () => {
    const appDir = ensureAppDir();
    const templatesPath = path.join(appDir, 'templates.yaml');
    
    try {
      if (fs.existsSync(templatesPath)) {
        const content = fs.readFileSync(templatesPath, 'utf8');
        return yaml.parse(content) || [];
      }
    } catch (e) {
      console.error('Failed to load templates:', e);
    }
    
    const defaults = [
      { name: 'Python HTTP Server', text: 'python -m http.server 8000', description: 'Запуск простого HTTP сервера на порту 8000', category: 'Web' },
      { name: 'Node.js Dev', text: 'npm run dev', description: 'Development сервер', category: 'Web' },
      { name: 'Git Status', text: 'git status', description: 'Статус репозитория', category: 'Git' },
      { name: 'Docker Compose Up', text: 'docker-compose up -d', description: 'Запуск Docker контейнеров', category: 'DevOps' },
      { name: 'Install Dependencies', text: 'npm install', description: 'Установка зависимостей', category: 'Build' },
      { name: 'Build Project', text: 'npm run build', description: 'Сборка проекта', category: 'Build' }
    ];
    
    try {
      fs.writeFileSync(templatesPath, yaml.stringify(defaults), 'utf8');
    } catch (e) {
      console.error('Failed to save default templates:', e);
    }
    
    return defaults;
  });

  // ============================================
  // SQLite Commands Handlers (новая система)
  // ============================================

  // Получить все команды из SQLite
  ipcMain.handle('db-get-commands', async () => {
    try {
      const commands = await commandsDb.getAllCommands();
      return { success: true, commands };
    } catch (error: any) {
      console.error('[MAIN] Ошибка получения команд из БД:', error);
      return { success: false, error: error.message, commands: [] };
    }
  });

  // Добавить команду в SQLite
  ipcMain.handle('db-add-command', async (event, command) => {
    try {
      const newCommand = await commandsDb.addCommand(command);
      return { success: true, command: newCommand };
    } catch (error: any) {
      console.error('[MAIN] Ошибка добавления команды в БД:', error);
      return { success: false, error: error.message };
    }
  });

  // Обновить команду в SQLite
  ipcMain.handle('db-update-command', async (event, id, updates) => {
    try {
      const updatedCommand = await commandsDb.updateCommand(id, updates);
      return { success: true, command: updatedCommand };
    } catch (error: any) {
      console.error('[MAIN] Ошибка обновления команды в БД:', error);
      return { success: false, error: error.message };
    }
  });

  // Удалить команду из SQLite
  ipcMain.handle('db-delete-command', async (event, id) => {
    try {
      const success = await commandsDb.deleteCommand(id);
      return { success };
    } catch (error: any) {
      console.error('[MAIN] Ошибка удаления команды из БД:', error);
      return { success: false, error: error.message };
    }
  });

  // Переупорядочить команды (после drag-and-drop)
  ipcMain.handle('db-reorder-commands', async (event, reorderedIds) => {
    try {
      await commandsDb.reorderCommands(reorderedIds);
      return { success: true };
    } catch (error: any) {
      console.error('[MAIN] Ошибка переупорядочивания команд:', error);
      return { success: false, error: error.message };
    }
  });

  // Импорт команд в SQLite
  ipcMain.handle('db-import-commands', async (event, commands, mode) => {
    try {
      const count = await commandsDb.importCommands(commands, mode);
      return { success: true, count };
    } catch (error: any) {
      console.error('[MAIN] Ошибка импорта команд в БД:', error);
      return { success: false, error: error.message };
    }
  });

  // Миграция из YAML в SQLite
  ipcMain.handle('db-migrate-from-yaml', async () => {
    try {
      const appDir = ensureAppDir();
      const commandsPath = path.join(appDir, 'commands.yaml');
      
      let yamlCommands = [];
      if (fs.existsSync(commandsPath)) {
        const content = fs.readFileSync(commandsPath, 'utf8');
        yamlCommands = yaml.parse(content) || [];
      }
      
      if (yamlCommands.length === 0) {
        return { success: true, migrated: 0, message: 'Нет данных для миграции' };
      }
      
      const migrated = await commandsDb.migrateFromYaml(yamlCommands);
      
      return { 
        success: true, 
        migrated,
        message: `Мигрировано ${migrated} команд из YAML в SQLite`
      };
    } catch (error: any) {
      console.error('[MAIN] Ошибка миграции из YAML:', error);
      return { success: false, error: error.message };
    }
  });
}
