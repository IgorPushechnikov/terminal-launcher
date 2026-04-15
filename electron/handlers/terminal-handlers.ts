// Terminal management IPC handlers
import { ipcMain, BrowserWindow } from 'electron';
import pty from 'node-pty';
import fs from 'fs';
import path from 'path';
import SettingsManager from '../settings-manager';
import workspaceManager from '../workspace-manager';

interface TerminalData {
  term: any;
  logStream?: fs.WriteStream;
}

// Helper function to strip ANSI escape codes from terminal output
function stripAnsiCodes(text: string): string {
  return text.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')      // CSI sequences
             .replace(/\x1b\][^\x07]*\x07/g, '')          // OSC sequences
             .replace(/\x1b[PX^_][^\x1b]*\x1b\\/g, '')   // DCS, PM, APC sequences
             .replace(/\x1b[\[\]()#%;][0-9;?]*[0-9A-Za-z]/g, '') // Other escape sequences
             .replace(/\x08/g, '')                         // Backspace
             .replace(/\r/g, '\n');                        // Carriage return to newline
}

export function setupTerminalHandlers(
  mainWindow: BrowserWindow | null,
  terminals: Map<number, TerminalData>,
  nextTerminalIdRef: { value: number },
  ensureAppDir: () => string
): void {
  
  // Создать новый терминал
  ipcMain.handle('create-terminal', async (event, options: any = {}) => {
    const id = nextTerminalIdRef.value++;
    ensureAppDir();
    
    const shell = workspaceManager.getDefaultShell();
    const cols = options.initialCols || 80;
    const rows = options.initialRows || 24;
    
    console.log(`[main] Создаю PTY для "${options.name || 'terminal'}" с размерами: ${cols}x${rows}, shell: ${shell}`);
    
    const term = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: cols,
      rows: rows,
      cwd: options.cwd || process.env.HOME || process.env.USERPROFILE,
      env: process.env
    });

    let logStream: fs.WriteStream | null = null;
    let logBuffer = '';
    let lastLoggedLines: string[] = [];
    const MAX_LAST_LINES = 10;
    let bufferFlushTimer: NodeJS.Timeout | null = null;
    
    const processAndLogLines = (lines: string[]) => {
      if (!logStream) return;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine === '') {
          continue;
        }
        
        const isDuplicate = lastLoggedLines.includes(trimmedLine);
        
        if (!isDuplicate) {
          const timestamp = new Date().toISOString();
          const formattedEntry = `[${timestamp}] ${line}\n`;
          logStream.write(formattedEntry);
          
          lastLoggedLines.push(trimmedLine);
          if (lastLoggedLines.length > MAX_LAST_LINES) {
            lastLoggedLines.shift();
          }
        }
      }
    };
    
    const flushRemainingBuffer = () => {
      if (!logStream || !logBuffer.trim()) return;
      
      const timestamp = new Date().toISOString();
      const formattedEntry = `[${timestamp}] ${logBuffer}\n`;
      logStream.write(formattedEntry);
      
      const trimmedBuffer = logBuffer.trim();
      if (!lastLoggedLines.includes(trimmedBuffer)) {
        lastLoggedLines.push(trimmedBuffer);
        if (lastLoggedLines.length > MAX_LAST_LINES) {
          lastLoggedLines.shift();
        }
      }
      
      logBuffer = '';
      bufferFlushTimer = null;
    };
    
    if (options.enableLog && SettingsManager.get('autoStartLogging')) {
      const logFile = SettingsManager.getFullLogPath(options.name || 'terminal');
      logStream = fs.createWriteStream(logFile, { flags: 'a' });
      const header = `\n${'='.repeat(80)}\n` +
                     `[${new Date().toISOString()}] Terminal session started\n` +
                     `[Name: ${options.name || 'terminal'}]\n` +
                     `[Shell: ${process.platform === 'win32' ? 'powershell.exe' : 'bash'}]\n` +
                     `${'='.repeat(80)}\n\n`;
      logStream.write(header);
      console.log(`Лог терминала: ${logFile}`);
    }

    term.onData((data) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(`terminal-data-${id}`, data);
      }
      
      if (logStream) {
        let cleanData = stripAnsiCodes(data);
        cleanData = cleanData.replace(/\r/g, '');
        
        if (bufferFlushTimer) {
          clearTimeout(bufferFlushTimer);
        }
        
        logBuffer += cleanData;
        
        const lines = logBuffer.split('\n');
        logBuffer = lines.pop() || '';
        
        processAndLogLines(lines);
        
        if (logBuffer.trim()) {
          bufferFlushTimer = setTimeout(() => {
            flushRemainingBuffer();
          }, 500);
        }
      }
    });

    term.onExit(({ exitCode }) => {
      if (logStream) {
        if (bufferFlushTimer) {
          clearTimeout(bufferFlushTimer);
          bufferFlushTimer = null;
        }
        flushRemainingBuffer();
        
        const footer = `\n${'='.repeat(80)}\n` +
                       `[${new Date().toISOString()}] Terminal session ended\n` +
                       `[Exit code: ${exitCode}]\n` +
                       `${'='.repeat(80)}\n`;
        logStream.write(footer);
        logStream.end();
      }
      terminals.delete(id);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(`terminal-exit-${id}`, exitCode);
      }
    });

    terminals.set(id, { term, logStream: logStream || undefined });
    
    return { id };
  });

  // Записать данные в терминал
  ipcMain.handle('terminal-write', async (event, { id, data }) => {
    const terminal = terminals.get(id);
    if (terminal) {
      terminal.term.write(data);
    }
  });

  // Изменить размер терминала
  ipcMain.handle('terminal-resize', async (event, { id, cols, rows }) => {
    const terminal = terminals.get(id);
    if (terminal) {
      terminal.term.resize(cols, rows);
    }
  });

  // Переименовать лог терминала
  ipcMain.handle('rename-terminal-log', async (event, { id, newName }) => {
    const terminal = terminals.get(id);
    if (!terminal || !terminal.logStream) {
      return { success: false, error: 'Терминал или лог не найден' };
    }
    
    try {
      terminal.logStream.end();
      
      const oldPath = (terminal.logStream as any).path;
      const newPath = SettingsManager.getFullLogPath(newName);
      
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`Лог переименован: ${oldPath} -> ${newPath}`);
      }
      
      terminal.logStream = fs.createWriteStream(newPath, { flags: 'a' });
      
      return { success: true, newPath };
    } catch (error: any) {
      console.error('Ошибка переименования лога:', error);
      return { success: false, error: error.message };
    }
  });

  // Проверить наличие активного процесса
  ipcMain.handle('has-active-process', async (event, { id }) => {
    const terminal = terminals.get(id);
    if (!terminal) {
      return false;
    }

    try {
      const pid = terminal.term.pid;
      if (!pid) return false;

      return process.kill(pid, 0);
    } catch (error) {
      return false;
    }
  });

  // Закрыть терминал
  ipcMain.handle('terminal-close', async (event, { id }) => {
    const terminal = terminals.get(id);
    if (terminal) {
      // Очищаем bufferFlushTimer ПЕРЕД kill
      if ((terminal as any).bufferFlushTimer) {
        clearTimeout((terminal as any).bufferFlushTimer);
        (terminal as any).bufferFlushTimer = null;
      }
      
      try {
        terminal.term.kill();
      } catch (e) {
        console.warn(`[Terminal] Process already exited for terminal ${id}:`, e);
      }
      
      try {
        if (terminal.logStream) {
          terminal.logStream.end();
        }
      } catch (e) {
        console.warn(`[Terminal] Log stream already closed for terminal ${id}:`, e);
      }
      
      terminals.delete(id);
      console.log(`[Terminal] Cleaned up terminal ${id}, remaining: ${terminals.size}`);
    }
  });
}
