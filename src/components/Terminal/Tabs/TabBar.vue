<template>
  <div class="tab-bar-container">
    <div class="tabs-list">
      <div
        v-for="tab in store.tabs"
        :key="tab.id"
        class="tab-item"
        :class="{ active: tab.id === store.activeTabId }"
        @click="store.setActiveTab(tab.id)"
        @dblclick="$emit('renameTab', tab.id, tab.name)"
        @contextmenu.prevent="openContextMenu($event, tab.id)"
      >
        <span class="tab-name">{{ tab.name }}</span>
        <button 
          class="close-btn"
          @click.stop="closeTabWithConfirmation(tab.id)"
          :title="t('tabs.closeTab')"
        >
          &times;
        </button>
      </div>

      <button class="add-tab" @click="store.addTab()" :title="t('tabs.addTab')">
        +
      </button>
    </div>

    <div class="tab-bar-actions">
      <!-- Меню с действиями -->
      <div class="actions-menu" ref="actionsMenuRef">
        <button 
          class="action-btn more-btn" 
          @click="toggleActionsMenu" 
          :title="t('tabs.actions')"
        >
          ⋮
        </button>
        
        <!-- Выпадающее меню -->
        <div 
          v-if="actionsMenuOpened"
          class="actions-dropdown"
          @click.self="actionsMenuOpened = false"
        >
          <div class="dropdown-item" @click="handleImport">
            <IconDownload :size="18" />
            {{ t('tabs.importCommands') }}
          </div>
          <div class="dropdown-item" @click="handleExport">
            <IconUpload :size="18" />
            {{ t('tabs.exportCommands') }}
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" @click="$emit('openSettings')">
            <IconSettings :size="18" />
            {{ t('tabs.settings') }}
          </div>
        </div>
      </div>
      
      <!-- Кнопка настроек (убираем, т.к. есть в меню) -->
      <!-- <button 
        class="action-btn" 
        @click="$emit('openSettings')" 
        title="Настройки"
      >
        ⚙️
      </button> -->
    </div>

    <!-- Контекстное меню -->
    <div 
      v-if="contextMenuOpened"
      class="context-menu"
      :style="{ left: `${contextMenuPosition.x}px`, top: `${contextMenuPosition.y}px` }"
      @click.self="contextMenuOpened = false"
    >
      <div class="menu-item" @click="handleRename">
        {{ t('tabs.renameTab') }}
      </div>
      <div class="menu-item danger" @click="handleClose">
        {{ t('tabs.close') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTerminalStore } from '@/store/terminalStore'
import { IconDownload, IconUpload, IconSettings } from '@tabler/icons-vue'
import { useLanguage, tTemplate } from '../../../i18n'
import { useToast } from '../../../composables/useToast'
import type { TerminalTab } from '../../../types'

const { t, cleanup: cleanupLanguage } = useLanguage()
const toast = useToast()

const emit = defineEmits<{
  renameTab: [tabId: number, currentName: string]
  openSettings: []
}>()

const store = useTerminalStore()

// Контекстное меню для вкладок
const contextMenuOpened = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const selectedTabId = ref<number | null>(null)

const openContextMenu = (e: MouseEvent, tabId: number) => {
  selectedTabId.value = tabId
  contextMenuPosition.value = { x: e.clientX, y: e.clientY }
  contextMenuOpened.value = true
}

const handleRename = () => {
  if (selectedTabId.value !== null) {
    const tab = store.tabs.find((t: TerminalTab) => t.id === selectedTabId.value)
    if (tab) {
      emit('renameTab', selectedTabId.value, tab.name)
    }
  }
  contextMenuOpened.value = false
}

const handleClose = async () => {
  if (selectedTabId.value !== null) {
    const tab = store.tabs.find((t: TerminalTab) => t.id === selectedTabId.value)
    if (tab && tab.termId) {
      // Check if terminal has an active process
      const hasActiveProcess = await window.electronAPI.hasActiveProcess(tab.termId);
      if (hasActiveProcess) {
        const confirmed = window.confirm(t('tabs.confirmCloseWithProcess'));
        if (!confirmed) {
          contextMenuOpened.value = false;
          return;
        }
      }
    }
    store.removeTab(selectedTabId.value)
  }
  contextMenuOpened.value = false
}

// Меню действий (⋮)
const actionsMenuRef = ref<HTMLDivElement>()
const actionsMenuOpened = ref(false)

const toggleActionsMenu = () => {
  actionsMenuOpened.value = !actionsMenuOpened.value
}

// Закрыть меню при клике вне его
const handleClickOutside = (e: MouseEvent) => {
  if (actionsMenuRef.value && !actionsMenuRef.value.contains(e.target as Node)) {
    actionsMenuOpened.value = false
  }
}

// Обработчики действий
const handleImport = async () => {
  actionsMenuOpened.value = false
  try {
    // 1. Выбираем файл
    const filePath = await window.electronAPI.selectCommandsFile()
    if (!filePath) return // пользователь отменил
    
    // 2. Читаем команды из файла
    const result = await window.electronAPI.importCommands(filePath)
    if (!result.success) {
      const errorMsg = result.error ?? 'Неизвестная ошибка'
      toast.error(tTemplate('errors.fileReadError', errorMsg))
      return
    }
    
    // 3. Импорт в SQLite
    const dbResult = await window.electronAPI.dbImportCommands(result.commands || [], 'append')
    if (dbResult.success) {
      // Обновляем список команд в store
      const allCommands = await window.electronAPI.dbGetCommands()
      if (allCommands.success) {
        store.commands = allCommands.commands || []
      }
      toast.success(tTemplate('success.imported', String(dbResult.count)))
    } else {
      toast.error(tTemplate('errors.importError', dbResult.error || ''))
    }
  } catch (error) {
    console.error(t('errors.importFailed'), error)
    toast.error(t('errors.importFailed'))
  }
}

const handleExport = async () => {
  actionsMenuOpened.value = false
  try {
    // 1. Получаем команды из SQLite
    const result = await window.electronAPI.dbGetCommands()
    if (!result.success) {
      toast.error(tTemplate('errors.getCommandsError', result.error || ''))
      return
    }
    
    const commands = result.commands || []
    if (commands.length === 0) {
      toast.warning(t('errors.noCommands'))
      return
    }
    
    // 2. Экспортируем в файл
    const exportResult = await window.electronAPI.exportCommands('', commands)
    if (exportResult.success) {
      toast.success(tTemplate('success.exported', String(commands.length)))
    } else if (!exportResult.error?.toLowerCase().includes('отменено')) {
      // Не показываем ошибку при отмене пользователем
      toast.error(tTemplate('errors.exportError', exportResult.error || ''))
    }
  } catch (error) {
    console.error(t('errors.exportFailed'), error)
    toast.error(t('errors.exportFailed'))
  }
}

// Function to handle closing a tab with confirmation if needed
const closeTabWithConfirmation = async (tabId: number) => {
  const tab = store.tabs.find((t: any) => t.id === tabId);
  if (tab && tab.termId) {
    // Check if terminal has an active process
    const hasActiveProcess = await window.electronAPI.hasActiveProcess(tab.termId);
    if (hasActiveProcess) {
      const confirmed = window.confirm(t('tabs.confirmCloseWithProcess'));
      if (!confirmed) {
        return;
      }
    }
  }
  store.removeTab(tabId);
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  cleanupLanguage()
})
</script>

<style scoped>
.tab-bar-container {
  width: 100%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
}

.tabs-list {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0.5rem 0.5rem 0 0.5rem;
  overflow-x: auto;
  flex: 1;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  white-space: nowrap;
}

.tab-item:hover {
  background: var(--bg-hover);
}

/* Light theme hover - subtle purple tint */
[data-theme='light'] .tab-item:hover {
  background: rgba(107, 83, 230, 0.08);
  transition: background-color 0.2s ease;
}

/* Dark theme hover */
[data-theme='dark'] .tab-item:hover {
  background: var(--bg-hover);
  transition: background-color 0.2s ease;
}

.tab-item.active {
  background: var(--bg-color);
  border-bottom: 2px solid var(--brand-primary);
}

.tab-name {
  font-size: 0.875rem;
  color: var(--text-color);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
}

.close-btn:hover {
  background: rgba(255, 0, 0, 0.2);
  color: red;
}

.add-tab {
  min-width: 36px;
  padding: 0.5rem;
  background: transparent;
  border: 1px dashed var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  color: var(--text-secondary);
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.add-tab:hover {
  background: var(--bg-hover);
  color: var(--brand-primary);
}

/* Dark theme hover */
[data-theme='dark'] .add-tab:hover {
  color: var(--brand-light);
}

/* Light theme hover - shadow for better visibility */
[data-theme='light'] .add-tab:hover {
  color: var(--brand-dark);
  background: rgba(107, 83, 230, 0.08);
  filter: drop-shadow(0 0 4px rgba(107, 83, 230, 0.5));
}

.context-menu {
  position: fixed;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 150px;
}

/* Light theme context menu */
[data-theme='light'] .context-menu {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.menu-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.menu-item:hover {
  background: var(--bg-hover);
}

.menu-item.danger {
  color: red;
}

.menu-item.danger:hover {
  background: rgba(255, 0, 0, 0.1);
}

.tab-bar-actions {
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.15s ease, color 0.15s ease, opacity 0.15s ease;
  opacity: 0.7;
  color: var(--text-secondary);
  line-height: 1;
}

.more-btn {
  position: relative;
  overflow: visible;
}

/* More button - brand color on hover */
.action-btn.more-btn:hover {
  color: var(--brand-primary);
}

/* Dark theme - colored background with brand color */
[data-theme='dark'] .action-btn.more-btn:hover {
  color: var(--text-color);
  background: rgba(139, 92, 246, 0.2);
}

/* Light theme - colored background with brand color */
[data-theme='light'] .action-btn.more-btn:hover {
  color: var(--text-color);
  background: rgba(107, 83, 230, 0.15);
}

/* Actions dropdown menu */
.actions-menu {
  position: relative;
}

.actions-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 180px;
  overflow: hidden;
}

/* Light theme dropdown */
[data-theme='light'] .actions-dropdown {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dropdown-item {
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-color);
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dropdown-item svg {
  color: var(--brand-primary);
  opacity: 0.7;
  transition: opacity 0.2s, color 0.2s;
}

.dropdown-item:hover svg {
  opacity: 1;
  color: var(--brand-hover);
}

.dropdown-item:hover {
  background: var(--bg-hover);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.25rem 0;
}
</style>
