import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTerminalStore } from '../../src/store/terminalStore'
import type { Command } from '../../src/types'

describe('Terminal Store', () => {
  beforeEach(() => {
    // Создаем новый Pinia инстанс для каждого теста
    setActivePinia(createPinia())
  })

  it('должен инициализироваться с пустым списком вкладок', () => {
    const store = useTerminalStore()
    expect(store.tabs).toEqual([])
    expect(store.activeTabId).toBeNull()
  })

  it('должен добавлять новую вкладку', () => {
    const store = useTerminalStore()
    const initialCount = store.tabs.length
    
    store.addTab()
    
    expect(store.tabs.length).toBe(initialCount + 1)
    // Имя вкладки зависит от локализации, проверяем что оно не пустое
    expect(store.tabs[store.tabs.length - 1].name).toBeTruthy()
    expect(typeof store.tabs[store.tabs.length - 1].name).toBe('string')
  })

  it('должен устанавливать активную вкладку', () => {
    const store = useTerminalStore()
    
    store.addTab()
    store.addTab()
    
    const firstTabId = store.tabs[0].id
    store.setActiveTab(firstTabId)
    
    expect(store.activeTabId).toBe(firstTabId)
  })

  it('должен удалять вкладку', () => {
    const store = useTerminalStore()
    
    store.addTab()
    store.addTab()
    const initialCount = store.tabs.length
    
    const tabIdToDelete = store.tabs[0].id
    store.removeTab(tabIdToDelete)
    
    expect(store.tabs.length).toBe(initialCount - 1)
    expect(store.tabs.find((t: any) => t.id === tabIdToDelete)).toBeUndefined()
  })

  it('должен переименовывать вкладку', () => {
    const store = useTerminalStore()
    
    store.addTab()
    const tabId = store.tabs[0].id
    
    store.renameTab(tabId, 'New Name')
    
    const renamedTab = store.tabs.find((t: any) => t.id === tabId)
    expect(renamedTab?.name).toBe('New Name')
  })

  it('должен загружать данные сессии', () => {
    const store = useTerminalStore()
    
    const sessionData = {
      tabs: [
        { id: 1, name: 'Tab 1' },
        { id: 2, name: 'Tab 2' }
      ],
      commands: []
    }
    
    store.loadSessionData(sessionData)
    
    expect(store.tabs.length).toBe(2)
    expect(store.tabs[0].name).toBe('Tab 1')
    expect(store.tabs[1].name).toBe('Tab 2')
  })

  it('должен сохранять и восстанавливать команды', () => {
    const store = useTerminalStore()
    
    const mockCommands: Command[] = [
      { id: 1, name: 'Command 1', text: 'echo test' },
      { id: 2, name: 'Command 2', text: 'ls -la' }
    ]
    
    store.setCommands(mockCommands)
    
    expect(store.commands.length).toBe(2)
    expect(store.commands[0].name).toBe('Command 1')
    expect(store.commands[1].text).toBe('ls -la')
  })
})
