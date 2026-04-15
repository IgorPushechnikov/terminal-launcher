import sqlite3 from 'sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';
import workspaceManager from './workspace-manager';

export interface CommandRecord {
  id: number;
  name: string;
  text: string;
  cwd?: string;
  icon?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

class CommandsDatabase {
  private db: sqlite3.Database | null = null;
  private dbPath: string = '';
  private initialized: boolean = false;

  constructor() {
    // Путь будет установлен при инициализации через initialize()
  }

  /**
   * Инициализация базы данных с учетом рабочего пространства
   */
  initialize(customPath?: string): void {
    if (this.initialized) return;
    
    try {
      // Определяем путь к БД
      if (customPath) {
        this.dbPath = customPath;
      } else {
        const workspace = workspaceManager.detectWorkspace();
        const paths = workspaceManager.getWorkspacePaths(workspace);
        this.dbPath = paths.commandsPath;
      }
      
      console.log('[CommandsDB] Initializing SQLite database at:', this.dbPath);
      
      // Создаем директорию если не существует
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      this.db = new sqlite3.Database(this.dbPath);
      
      // Создаём таблицу если не существует
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS commands (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          text TEXT NOT NULL,
          cwd TEXT,
          icon TEXT DEFAULT '📝',
          order_index INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `);

      // Создаём индекс для сортировки
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_commands_order ON commands(order_index)
      `);

      console.log('[CommandsDB] Database initialized successfully');
      this.initialized = true;
    } catch (error) {
      console.error('[CommandsDB] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Получить все команды, отсортированные по order_index
   */
  getAllCommands(): Promise<CommandRecord[]> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        this.initialize();
      }
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.all('SELECT * FROM commands ORDER BY order_index ASC', [], (err, rows) => {
        if (err) {
          console.error('[CommandsDB] Error getting commands:', err);
          reject(err);
        } else {
          resolve(rows as CommandRecord[]);
        }
      });
    });
  }

  /**
   * Добавить новую команду
   */
  addCommand(command: Omit<CommandRecord, 'id' | 'created_at' | 'updated_at'>): Promise<CommandRecord> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        this.initialize();
      }
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const now = new Date().toISOString();
      const db = this.db; // Сохраняем ссылку
      
      db.run(
        `INSERT INTO commands (name, text, cwd, icon, order_index, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          command.name,
          command.text,
          command.cwd || null,
          command.icon || '📝',
          command.order_index || 0,
          now,
          now
        ],
        function(err) {
          if (err) {
            console.error('[CommandsDB] Error adding command:', err);
            reject(err);
          } else {
            // Получаем добавленную команду
            db!.get('SELECT * FROM commands WHERE id = ?', [this.lastID], (err: any, row: CommandRecord) => {
              if (err) {
                reject(err);
              } else {
                resolve(row);
              }
            });
          }
        }
      );
    });
  }

  /**
   * Обновить команду
   */
  updateCommand(id: number, updates: Partial<Omit<CommandRecord, 'id' | 'created_at'>>): Promise<CommandRecord> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        this.initialize();
      }
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at');
      if (fields.length === 0) {
        this.getCommandById(id).then(resolve).catch(reject);
        return;
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => (updates as any)[field]);
      values.push(new Date().toISOString()); // updated_at
      values.push(id);

      const stmt = this.db.prepare(`
        UPDATE commands SET ${setClause}, updated_at = ? WHERE id = ?
      `);

      stmt.run(...values, (err: Error | null) => {
        if (err) {
          console.error('[CommandsDB] Error updating command:', err);
          reject(err);
        } else {
          this.getCommandById(id).then(resolve).catch(reject);
        }
      });

      stmt.finalize();
    });
  }

  /**
   * Удалить команду
   */
  deleteCommand(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        this.initialize();
      }
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run('DELETE FROM commands WHERE id = ?', [id], function(err) {
        if (err) {
          console.error('[CommandsDB] Error deleting command:', err);
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  /**
   * Получить команду по ID
   */
  getCommandById(id: number): Promise<CommandRecord> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        this.initialize();
      }
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.get('SELECT * FROM commands WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error('[CommandsDB] Error getting command by ID:', err);
          reject(err);
        } else if (!row) {
          reject(new Error(`Command with id ${id} not found`));
        } else {
          resolve(row as CommandRecord);
        }
      });
    });
  }

  /**
   * Обновить порядок команд (после drag-and-drop)
   */
  reorderCommands(reorderedIds: number[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        this.initialize();
      }
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.serialize(() => {
        this.db!.run('BEGIN TRANSACTION');
        
        let completed = 0;
        const total = reorderedIds.length;

        reorderedIds.forEach((id, index) => {
          this.db!.run(
            'UPDATE commands SET order_index = ?, updated_at = datetime(\'now\') WHERE id = ?',
            [index, id],
            (err) => {
              if (err) {
                this.db!.run('ROLLBACK');
                reject(err);
                return;
              }
              
              completed++;
              if (completed === total) {
                this.db!.run('COMMIT', (commitErr) => {
                  if (commitErr) {
                    reject(commitErr);
                  } else {
                    resolve();
                  }
                });
              }
            }
          );
        });
      });
    });
  }

  /**
   * Импорт команд из массива (заменяет или добавляет)
   */
  importCommands(commands: Array<Omit<CommandRecord, 'id' | 'created_at' | 'updated_at'>>, mode: 'replace' | 'append'): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        this.initialize();
      }
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.serialize(() => {
        this.db!.run('BEGIN TRANSACTION');

        if (mode === 'replace') {
          this.db!.run('DELETE FROM commands');
        }

        // Получаем текущий максимальный order_index
        this.db!.get('SELECT MAX(order_index) as max_order FROM commands', (err, result: any) => {
          if (err) {
            this.db!.run('ROLLBACK');
            reject(err);
            return;
          }

          let nextOrderIndex = (result?.max_order ?? -1) + 1;
          let completed = 0;
          const total = commands.length;

          if (total === 0) {
            this.db!.run('COMMIT');
            resolve(0);
            return;
          }

          const stmt = this.db!.prepare(`
            INSERT INTO commands (name, text, cwd, icon, order_index, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
          `);

          commands.forEach((cmd: Omit<CommandRecord, 'id' | 'created_at' | 'updated_at'>) => {
            stmt.run(
              cmd.name,
              cmd.text,
              cmd.cwd || null,
              cmd.icon || '📝',
              nextOrderIndex++,
              (err: Error | null) => {
                if (err) {
                  this.db!.run('ROLLBACK');
                  reject(err);
                  return;
                }

                completed++;
                if (completed === total) {
                  this.db!.run('COMMIT', (commitErr: Error | null) => {
                    if (commitErr) {
                      reject(commitErr);
                    } else {
                      resolve(total);
                    }
                  });
                }
              }
            );
          });

          stmt.finalize();
        });
      });
    });
  }

  /**
   * Экспорт всех команд в массив
   */
  exportCommands(): Promise<CommandRecord[]> {
    return this.getAllCommands();
  }

  /**
   * Миграция из YAML файла (для обратной совместимости)
   */
  migrateFromYaml(commands: any[]): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        this.initialize();
      }
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      if (commands.length === 0) {
        resolve(0);
        return;
      }

      // Проверяем, есть ли уже данные в БД
      this.db.get('SELECT COUNT(*) as count FROM commands', (err, result: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (result.count > 0) {
          console.log('[CommandsDB] Database already has data, skipping migration');
          resolve(0);
          return;
        }

        // Конвертируем формат YAML в формат БД
        const dbCommands = commands.map((cmd, index) => ({
          name: cmd.name || cmd.title || 'Без названия',
          text: cmd.text || cmd.command || '',
          cwd: cmd.cwd || cmd.directory || undefined,
          icon: cmd.icon || '📝',
          order_index: index
        }));

        this.importCommands(dbCommands, 'append').then(resolve).catch(reject);
      });
    });
  }

  /**
   * Закрыть соединение с БД
   */
  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('[CommandsDB] Error closing database:', err);
            reject(err);
          } else {
            this.db = null;
            console.log('[CommandsDB] Database closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

// Singleton instance
const commandsDb = new CommandsDatabase();

export default commandsDb;
