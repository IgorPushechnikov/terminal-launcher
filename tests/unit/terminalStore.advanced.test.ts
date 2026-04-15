import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTerminalStore } from '../../src/store/terminalStore'

describe('Terminal Store - Advanced', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Edge cases - tabs management', () => {
    it('должен корректно обрабатывать удаление несуществующей вкладки', () => {
      const store = useTerminalStore()
      
      store.addTab()
      const initialCount = store.tabs.length
      
      // Пытаемся удалить несуществующую вкладку
      store.removeTab(999)
      
      expect(store.tabs.length).toBe(initialCount)
    })

    it('должен устанавливать активную вкладку при удалении текущей', () => {
      const store = useTerminalStore()
      
      store.addTab()
      store.addTab()
      store.addTab()
      
      // Устанавливаем вторую вкладку активной
      const secondTabId = store.tabs[1].id
      store.setActiveTab(secondTabId)
      expect(store.activeTabId).toBe(secondTabId)
      
      // Удаляем активную вкладку
      store.removeTab(secondTabId)
      
      // Активная вкладка должна переключиться на другую
      expect(store.activeTabId).not.toBe(secondTabId)
      expect(store.activeTabId).not.toBeNull()
    })

    it('должен переименовывать только существующую вкладку', () => {
      const store = useTerminalStore()
      
      store.addTab()
      const tabId = store.tabs[0].id
      
      // Переименовываем существующую
      store.renameTab(tabId, 'New Name')
      expect(store.tabs[0].name).toBe('New Name')
      
      // Пытаемся переименовать несуществующую
      store.renameTab(999, 'Invalid')
      expect(store.tabs[0].name).toBe('New Name') // Не должно измениться
    })

    it('должен обрабатывать пустое имя при переименовании', () => {
      const store = useTerminalStore()
      
      store.addTab()
      const tabId = store.tabs[0].id
      const originalName = store.tabs[0].name
      
      store.renameTab(tabId, '')
      
      // Store может разрешить пустое имя, проверяем что вкладка существует
      expect(store.tabs.find((t: any) => t.id === tabId)).toBeDefined()
    })
  })

  describe('Multiple tabs operations', () => {
    it('должен корректно работать с множеством вкладок', () => {
      const store = useTerminalStore()
      
      // Добавляем 10 вкладок
      for (let i = 0; i < 10; i++) {
        store.addTab()
      }
      
      expect(store.tabs.length).toBe(10)
      
      // Проверяем что все IDs уникальны
      const ids = store.tabs.map(t => t.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(10)
    })

    it('должен правильно переключаться между множеством вкладок', () => {
      const store = useTerminalStore()
      
      store.addTab()
      store.addTab()
      store.addTab()
      
      const tabIds = store.tabs.map(t => t.id)
      
      // Переключаемся по кругу
      tabIds.forEach(id => {
        store.setActiveTab(id)
        expect(store.activeTabId).toBe(id)
      })
    })

    it('должен удалять вкладки в правильном порядке', () => {
      const store = useTerminalStore()
      
      store.addTab()
      store.addTab()
      store.addTab()
      
      const firstTabId = store.tabs[0].id
      const lastTabId = store.tabs[2].id
      
      // Удаляем первую
      store.removeTab(firstTabId)
      expect(store.tabs.length).toBe(2)
      expect(store.tabs.find((t: any) => t.id === firstTabId)).toBeUndefined()
      
      // Удаляем последнюю
      store.removeTab(lastTabId)
      expect(store.tabs.length).toBe(1)
    })
  })

  describe('Commands management', () => {
    it('должен очищать все команды', () => {
      const store = useTerminalStore()
      
      store.setCommands([
        { id: 1, name: 'Cmd1', text: 'echo 1' },
        { id: 2, name: 'Cmd2', text: 'echo 2' }
      ])
      
      expect(store.commands.length).toBe(2)
      
      // Очищаем команды
      store.setCommands([])
      expect(store.commands.length).toBe(0)
    })

    it('должен заменять существующие команды новыми', () => {
      const store = useTerminalStore()
      
      store.setCommands([
        { id: 1, name: 'Old Cmd', text: 'old' }
      ])
      
      expect(store.commands[0].name).toBe('Old Cmd')
      
      // Заменяем новыми
      store.setCommands([
        { id: 2, name: 'New Cmd', text: 'new' }
      ])
      
      expect(store.commands.length).toBe(1)
      expect(store.commands[0].name).toBe('New Cmd')
    })

    it('должен сохранять порядок команд', () => {
      const store = useTerminalStore()
      
      const commands = [
        { id: 1, name: 'First', text: 'cmd1' },
        { id: 2, name: 'Second', text: 'cmd2' },
        { id: 3, name: 'Third', text: 'cmd3' }
      ]
      
      store.setCommands(commands)
      
      expect(store.commands[0].name).toBe('First')
      expect(store.commands[1].name).toBe('Second')
      expect(store.commands[2].name).toBe('Third')
    })
  })

  describe('Session data loading', () => {
    it('должен корректно загружать сессию с пустыми вкладками', () => {
      const store = useTerminalStore()
      
      store.loadSessionData({
        tabs: [],
        commands: []
      })
      
      expect(store.tabs.length).toBe(0)
      expect(store.commands.length).toBe(0)
    })

    it('должен загружать сессию только с командами', () => {
      const store = useTerminalStore()
      
      store.loadSessionData({
        tabs: [],
        commands: [
          { id: 1, name: 'Build', text: 'npm run build' }
        ]
      })
      
      expect(store.tabs.length).toBe(0)
      expect(store.commands.length).toBe(1)
    })

    it('должен загружать сессию с force=true для перезаписи данных', () => {
      const store = useTerminalStore()
      
      // Добавляем начальные данные
      store.addTab()
      store.setCommands([{ id: 1, name: 'Old', text: 'old' }])
      
      expect(store.tabs.length).toBe(1)
      expect(store.commands.length).toBe(1)
      
      // Загружаем новую сессию с force=true
      store.loadSessionData({
        tabs: [
          { id: 10, name: 'New Tab 1' },
          { id: 11, name: 'New Tab 2' }
        ],
        commands: [
          { id: 100, name: 'New Command', text: 'new' }
        ]
      }, true) // force=true
      
      expect(store.tabs.length).toBe(2)
      expect(store.commands.length).toBe(1)
      expect(store.tabs[0].name).toBe('New Tab 1')
      expect(store.commands[0].name).toBe('New Command')
    })

    it('должен обрабатывать session data без commands', () => {
      const store = useTerminalStore()
      
      store.loadSessionData({
        tabs: [{ id: 1, name: 'Tab 1' }]
      })
      
      expect(store.tabs.length).toBe(1)
      // Commands должны остаться пустыми или неизменными
      expect(Array.isArray(store.commands)).toBe(true)
    })
  })

  describe('State consistency', () => {
    it('должен поддерживать консистентность после множественных операций', () => {
      const store = useTerminalStore()
      
      // Добавляем вкладки
      store.addTab()
      store.addTab()
      store.addTab()
      
      const tab1Id = store.tabs[0].id
      const tab2Id = store.tabs[1].id
      
      // Переключаемся
      store.setActiveTab(tab1Id)
      
      // Удаляем
      store.removeTab(tab2Id)
      
      // Переименовываем
      store.renameTab(tab1Id, 'Renamed')
      
      // Проверяем консистентность
      expect(store.tabs.length).toBe(2)
      expect(store.activeTabId).toBe(tab1Id)
      expect(store.tabs.find((t: any) => t.id === tab1Id)?.name).toBe('Renamed')
      expect(store.tabs.find((t: any) => t.id === tab2Id)).toBeUndefined()
    })

    it('не должен ломаться при быстром переключении вкладок', () => {
      const store = useTerminalStore()
      
      store.addTab()
      store.addTab()
      
      const tab1Id = store.tabs[0].id
      const tab2Id = store.tabs[1].id
      
      // Быстрое переключение
      store.setActiveTab(tab1Id)
      store.setActiveTab(tab2Id)
      store.setActiveTab(tab1Id)
      store.setActiveTab(tab2Id)
      
      expect(store.activeTabId).toBe(tab2Id)
      expect(store.tabs.length).toBe(2)
    })
  })
})
