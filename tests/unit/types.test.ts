import { describe, it, expect } from 'vitest'
import type { Command, SessionData, TerminalTab, AppSettings, SessionListItem } from '../../src/types'

describe('Types - Interfaces', () => {
  describe('Command interface', () => {
    it('должен создавать корректный объект Command с обязательными полями', () => {
      const command: Command = {
        id: 1,
        name: 'Test Command',
        text: 'echo test'
      }
      
      expect(command.id).toBe(1)
      expect(command.name).toBe('Test Command')
      expect(command.text).toBe('echo test')
    })

    it('должен поддерживать опциональные поля', () => {
      const command: Command = {
        id: 2,
        name: 'Advanced Command',
        text: 'npm run build',
        cwd: '/home/user/project',
        icon: '🚀',
        order_index: 5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      }
      
      expect(command.cwd).toBe('/home/user/project')
      expect(command.icon).toBe('🚀')
      expect(command.order_index).toBe(5)
    })

    it('должен работать без опциональных полей', () => {
      const command: Command = {
        id: 3,
        name: 'Simple Command',
        text: 'ls -la'
      }
      
      expect(command.cwd).toBeUndefined()
      expect(command.icon).toBeUndefined()
    })
  })

  describe('TerminalTab interface', () => {
    it('должен создавать корректный объект TerminalTab', () => {
      const tab: TerminalTab = {
        id: 1,
        name: 'Terminal 1'
      }
      
      expect(tab.id).toBe(1)
      expect(tab.name).toBe('Terminal 1')
    })

    it('должен поддерживать опциональные поля', () => {
      const tab: TerminalTab = {
        id: 2,
        name: 'Custom Tab',
        termId: 123,
        cwd: '/var/www'
      }
      
      expect(tab.termId).toBe(123)
      expect(tab.cwd).toBe('/var/www')
    })

    it('должен поддерживать дополнительные свойства через index signature', () => {
      const tab: TerminalTab = {
        id: 3,
        name: 'Extended Tab',
        customProp: 'value',
        anotherProp: 42
      }
      
      expect((tab as any).customProp).toBe('value')
      expect((tab as any).anotherProp).toBe(42)
    })
  })

  describe('SessionData interface', () => {
    it('должен создавать корректный объект SessionData', () => {
      const session: SessionData = {
        tabs: [
          { id: 1, name: 'Tab 1' },
          { id: 2, name: 'Tab 2' }
        ]
      }
      
      expect(session.tabs).toHaveLength(2)
      expect(session.tabs[0].name).toBe('Tab 1')
    })

    it('должен поддерживать полные данные сессии', () => {
      const session: SessionData = {
        tabs: [{ id: 1, name: 'Main' }],
        commands: [
          { id: 1, name: 'Build', text: 'npm run build' }
        ],
        name: 'My Project',
        description: 'Development session',
        savedAt: '2024-01-15T10:30:00Z',
        filePath: '/path/to/session.yaml'
      }
      
      expect(session.name).toBe('My Project')
      expect(session.description).toBe('Development session')
      expect(session.commands).toHaveLength(1)
      expect(session.filePath).toBe('/path/to/session.yaml')
    })

    it('должен работать с минимальными данными', () => {
      const session: SessionData = {
        tabs: []
      }
      
      expect(session.tabs).toEqual([])
      expect(session.commands).toBeUndefined()
      expect(session.name).toBeUndefined()
    })
  })

  describe('AppSettings interface', () => {
    it('должен создавать корректные настройки приложения', () => {
      const settings: AppSettings = {
        theme: 'dark',
        logDirectory: '/var/logs',
        autoStartLogging: true,
        fontSize: 14,
        sidebarWidth: 300
      }
      
      expect(settings.theme).toBe('dark')
      expect(settings.logDirectory).toBe('/var/logs')
      expect(settings.autoStartLogging).toBe(true)
      expect(settings.fontSize).toBe(14)
      expect(settings.sidebarWidth).toBe(300)
    })

    it('должен поддерживать светлую тему', () => {
      const settings: AppSettings = {
        theme: 'light',
        logDirectory: '',
        autoStartLogging: false,
        fontSize: 12,
        sidebarWidth: 250
      }
      
      expect(settings.theme).toBe('light')
      expect(settings.autoStartLogging).toBe(false)
    })
  })

  describe('SessionListItem interface', () => {
    it('должен создавать элемент списка сессий', () => {
      const item: SessionListItem = {
        name: 'Project Alpha',
        description: 'Main development environment',
        savedAt: '2024-01-15T10:30:00Z',
        filePath: '/sessions/alpha.yaml',
        tabCount: 5,
        hasCommands: true
      }
      
      expect(item.name).toBe('Project Alpha')
      expect(item.tabCount).toBe(5)
      expect(item.hasCommands).toBe(true)
    })

    it('должен поддерживать сессию без команд', () => {
      const item: SessionListItem = {
        name: 'Empty Session',
        description: '',
        savedAt: '2024-01-15T10:30:00Z',
        filePath: '/sessions/empty.yaml',
        tabCount: 0,
        hasCommands: false
      }
      
      expect(item.tabCount).toBe(0)
      expect(item.hasCommands).toBe(false)
    })
  })

  describe('Type compatibility', () => {
    it('Command должен быть совместим с массивом команд', () => {
      const commands: Command[] = [
        { id: 1, name: 'Cmd1', text: 'echo 1' },
        { id: 2, name: 'Cmd2', text: 'echo 2' },
        { id: 3, name: 'Cmd3', text: 'echo 3' }
      ]
      
      expect(commands).toHaveLength(3)
      expect(commands.every(cmd => cmd.id && cmd.name && cmd.text)).toBe(true)
    })

    it('TerminalTab должен быть совместим с массивом вкладок', () => {
      const tabs: TerminalTab[] = [
        { id: 1, name: 'Tab 1' },
        { id: 2, name: 'Tab 2' }
      ]
      
      expect(tabs).toHaveLength(2)
      expect(tabs.map(t => t.name)).toEqual(['Tab 1', 'Tab 2'])
    })
  })
})
