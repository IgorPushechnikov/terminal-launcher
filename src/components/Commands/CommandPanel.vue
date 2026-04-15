<template>
  <div class="command-panel">
    <div class="panel-header">
      <h3>{{ t('commands.title') }}</h3>
      <button class="add-btn" @click="showAddModal = true" :title="t('commands.addCommand')">+</button>
    </div>
    
    <!-- Поиск -->
    <div class="search-wrapper">
      <input 
        v-model="searchQuery" 
        class="search-input" 
        :placeholder="t('commands.searchPlaceholder')" 
      />
      <button 
        v-if="searchQuery" 
        class="clear-search-btn" 
        @click="searchQuery = ''"
        :title="t('commands.clearSearch')"
      >
        <IconX :size="14" />
      </button>
    </div>
    
    <!-- Список команд -->
    <draggable 
      v-model="commandsList" 
      item-key="id"
      class="commands-list"
      handle=".drag-handle"
      @end="onDragEnd"
    >
      <template #item="{ element: cmd }">
        <div 
          class="command-card"
          @click="executeCommand(cmd)"
          @contextmenu.prevent="openContextMenu($event, cmd)"
        >
          <div class="command-header">
            <div class="command-title">
              <IconGripVertical :size="16" class="drag-handle" :title="t('commands.dragToReorder')" />
              <IconTerminal :size="16" class="command-icon" />
              <h4>{{ cmd.name }}</h4>
            </div>
            <div class="command-actions">
              <button class="icon-btn" @click.stop="editCommand(cmd)" :title="t('commands.edit')">
                <IconPencil :size="14" />
              </button>
              <button class="icon-btn" @click.stop="deleteCommand(cmd.id)" :title="t('commands.delete')">
                <IconTrash :size="14" />
              </button>
            </div>
          </div>
          <code class="command-text">{{ cmd.text }}</code>
          <div v-if="cmd.cwd" class="command-cwd">
            <IconFolder :size="12" />
            {{ cmd.cwd }}
          </div>
        </div>
      </template>
    </draggable>
    
    <div v-if="filteredCommands.length === 0" class="empty-state">
      <p>{{ t('commands.noCommands') }}</p>
      <button class="add-first-btn" @click="showAddModal = true">{{ t('commands.addFirstCommand') }}</button>
    </div>
    
    <!-- Контекстное меню -->
    <div 
      v-if="contextMenuOpened"
      class="context-menu"
      :style="{ left: `${contextMenuPosition.x}px`, top: `${contextMenuPosition.y}px` }"
      @click.self="contextMenuOpened = false"
    >
      <div class="menu-item" @click="selectedCommand && editCommand(selectedCommand)">{{ t('commands.edit') }}</div>
      <div class="menu-item danger" @click="selectedCommand?.id && deleteCommand(selectedCommand.id)">{{ t('commands.delete') }}</div>
    </div>
    
    <!-- Модальное окно добавления/редактирования -->
    <BaseModal
      :opened="showAddModal"
      :title="editingCommand ? t('commands.editCommand') : t('commands.newCommand')"
      @close="closeModal"
    >
      <form @submit.prevent="saveCommand">
        <div class="form-group">
          <label>{{ t('commands.nameLabel') }}</label>
          <input v-model="form.name" class="form-input" :placeholder="t('commands.namePlaceholder')" required />
        </div>
        <div class="form-group">
          <label>{{ t('commands.commandLabel') }}</label>
          <textarea v-model="form.text" class="form-textarea" :placeholder="t('commands.commandPlaceholder')" required></textarea>
        </div>
        <div class="form-group">
          <label>{{ t('commands.cwdLabel') }}</label>
          <div class="cwd-input-group">
            <input v-model="form.cwd" class="form-input" :placeholder="t('commands.cwdPlaceholder')" />
            <button type="button" class="select-dir-btn" @click="selectDirectory" :title="t('commands.selectDirectory')">
              <IconFolderSearch :size="16" />
            </button>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="closeModal">{{ t('commands.cancel') }}</button>
          <button type="submit" class="save-btn">{{ editingCommand ? t('commands.save') : t('commands.add') }}</button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import draggable from 'vuedraggable'
import BaseModal from '../UI/BaseModal.vue'
import { useTerminalStore } from '../../store/terminalStore'
import { IconPencil, IconTrash, IconFolder, IconTerminal, IconX, IconFolderSearch, IconGripVertical } from '@tabler/icons-vue'
import { useLanguage } from '../../i18n'
import { useToast } from '../../composables/useToast'
import type { Command, TerminalTab } from '../../types'
import { createThrottledIpc } from '../../utils/ipcHelper'

const { t, cleanup: cleanupLanguage } = useLanguage()
const toast = useToast()

const store = useTerminalStore()

const searchQuery = ref('')
const showAddModal = ref(false)
const editingCommand = ref<Command | null>(null)
const selectedCommand = ref<Command | null>(null)
const contextMenuOpened = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })

const form = ref({
  name: '',
  text: '',
  cwd: ''
})

const filteredCommands = computed(() => {
  if (!searchQuery.value) return store.commands
  const query = searchQuery.value.toLowerCase()
  return store.commands.filter((cmd: any) => 
    cmd.name.toLowerCase().includes(query) || 
    cmd.text.toLowerCase().includes(query)
  )
})

// Computed property for draggable (must be writable)
const commandsList = computed({
  get: () => filteredCommands.value,
  set: (value) => {
    // Обновляем порядок в store
    store.setCommands(value)
  }
})

// Rate limiter для выполнения команд (не чаще чем раз в 500ms)
let lastCommandTime = 0
const COMMAND_COOLDOWN = 500 // ms

const executeCommand = async (cmd: Command) => {
  // Rate limiting: проверяем cooldown
  const now = Date.now()
  const timeSinceLastCommand = now - lastCommandTime
  
  if (timeSinceLastCommand < COMMAND_COOLDOWN) {
    const waitTime = COMMAND_COOLDOWN - timeSinceLastCommand
    console.warn(`[CommandPanel] Rate limited, please wait ${waitTime}ms before executing another command`)
    toast.warning('Please wait before executing another command')
    return
  }
  
  lastCommandTime = now
  const activeTab = store.tabs.find((t: TerminalTab) => t.id === store.activeTabId)
  
  if (!activeTab) {
    console.error('[CommandPanel] No active tab')
    toast.error(t('errors.noActiveTab'))
    return
  }
  
  if (!activeTab.termId) {
    console.warn('[CommandPanel] Terminal not initialized for tab', activeTab.id)
    toast.warning(t('errors.terminalLoading'))
    setTimeout(() => {
      const retryTab = store.tabs.find((t: TerminalTab) => t.id === store.activeTabId)
      if (retryTab && retryTab.termId) {
        executeCommand(cmd)
      } else {
        toast.error(t('errors.terminalInitError'))
      }
    }, 500)
    return
  }
  
  let command = cmd.text
  
  // Если указана рабочая директория, сначала cd в неё
  if (cmd.cwd) {
    const normalizedCwd = cmd.cwd.replace(/\\/g, '/')
    // Экранируем shell metacharacters для безопасности
    const safeCwd = normalizedCwd.replace(/(["$`\\])/g, '\\$1')
    command = `cd "${safeCwd}"; ${cmd.text}`
  }
  
  // Отправляем команду в терминал
  try {
    await window.electronAPI.terminalWrite(activeTab.termId, command + '\r')
  } catch (error) {
    console.error('[CommandPanel] Error sending command:', error)
    toast.error(t('errors.sendError'))
  }
}

const editCommand = (cmd: Command) => {
  editingCommand.value = cmd
  form.value = {
    name: cmd.name,
    text: cmd.text,
    cwd: cmd.cwd || ''
  }
  showAddModal.value = true
  contextMenuOpened.value = false
}

const deleteCommand = async (id?: number) => {
  if (!id) return
  if (window.confirm(t('errors.deleteConfirm'))) {
    try {
      await window.electronAPI.dbDeleteCommand(id)
      const result = await window.electronAPI.dbGetCommands()
      if (result.success && result.commands) {
        store.setCommands(result.commands)
        toast.success(t('success.commandDeleted'))
      }
    } catch (error) {
      console.error(t('errors.deletingCommand'), error)
      toast.error(t('errors.deletingCommandError'))
    }
  }
  contextMenuOpened.value = false
}

const saveCommand = async () => {
  try {
    if (editingCommand.value) {
      // Обновление существующей команды
      await window.electronAPI.dbUpdateCommand(editingCommand.value.id, {
        name: form.value.name,
        text: form.value.text,
        cwd: form.value.cwd
      })
    } else {
      // Добавление новой команды
      await window.electronAPI.dbAddCommand({
        name: form.value.name,
        text: form.value.text,
        cwd: form.value.cwd
      })
    }
    
    // Перезагружаем команды
    const result = await window.electronAPI.dbGetCommands()
    if (result.success && result.commands) {
      store.setCommands(result.commands)
    }
    
    closeModal()
  } catch (error) {
    console.error(t('errors.savingCommand'), error)
    toast.error(t('errors.savingCommand'))
  }
}

const selectDirectory = async () => {
  const result = await window.electronAPI.selectWorkingDirectory()
  if (result) {
    form.value.cwd = result
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingCommand.value = null
  form.value = { name: '', text: '', cwd: '' }
}

// Обработчик окончания перетаскивания
const onDragEnd = async () => {
  try {
    // Получаем новый порядок ID команд
    const reorderedIds = commandsList.value.map((cmd: Command) => cmd.id)
    
    // Отправляем в базу данных
    const result = await window.electronAPI.dbReorderCommands(reorderedIds)
    
    if (result.success) {
      toast.success(t('success.commandsReordered'))
    } else {
      toast.error(t('errors.reorderError'))
    }
  } catch (error) {
    console.error('Error reordering commands:', error)
    toast.error(t('errors.reorderError'))
  }
}

const openContextMenu = (e: MouseEvent, cmd: Command) => {
  selectedCommand.value = cmd
  contextMenuPosition.value = { x: e.clientX, y: e.clientY }
  contextMenuOpened.value = true
}

onMounted(async () => {
  // Загружаем команды из базы данных
  try {
    const result = await window.electronAPI.dbGetCommands()
    if (result.success && result.commands) {
      store.setCommands(result.commands)
    }
  } catch (error) {
    console.error(t('errors.loadingCommands'), error)
    toast.error(t('errors.loadingCommands'))
  }
})

onUnmounted(() => {
  cleanupLanguage()
})
</script>

<style scoped>
.command-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 48px;
  padding: 0 0.5rem;
  border-bottom: none;
  background: var(--bg-secondary);
}

.panel-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}

.add-btn {
  min-width: 36px;
  padding: 0.5rem;
  background: transparent;
  border: 1px dashed var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  color: var(--text-secondary);
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn:hover {
  background: var(--bg-hover);
  color: var(--brand-primary);
}

/* Dark theme hover */
[data-theme='dark'] .add-btn:hover {
  color: var(--brand-light);
}

/* Light theme hover - shadow for better visibility */
[data-theme='light'] .add-btn:hover {
  color: var(--brand-dark);
  background: rgba(107, 83, 230, 0.08);
  filter: drop-shadow(0 0 4px rgba(107, 83, 230, 0.5));
}

.search-wrapper {
  position: relative;
  margin: 0.5rem 1rem;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  padding-right: 2rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-color);
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
  /* CRITICAL FIX: No transition on background to prevent flash */
  transition: none !important;
}

.search-input:focus {
  border-color: var(--brand-primary);
}

.clear-search-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 50%;
  transition: background-color 0.15s, color 0.15s;
}

.clear-search-btn:hover {
  background: var(--bg-hover);
  color: var(--brand-primary);
}

.commands-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.command-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.75rem;
  cursor: pointer;
  /* CRITICAL FIX: No transition on background to prevent flash */
  /* Keep transform transition for hover effect */
  transition: transform 0.15s ease;
  background-color: var(--bg-secondary);
}

/* Light theme - lighter background with subtle brand border and shadow */
[data-theme='light'] .command-card {
  background: #f8f9fa;
  border: 1px solid rgba(107, 83, 230, 0.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
}

/* Default hover (dark theme) */
.command-card:hover {
  border-color: var(--brand-primary);
  transform: translateX(2px);
}

/* Light theme hover - combine shadow with border */
[data-theme='light'] .command-card:hover {
  border-color: var(--brand-primary);
  transform: translateX(2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.06);
}

.command-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.command-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.command-icon {
  color: var(--brand-primary);
  flex-shrink: 0;
}

.command-header h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
}

.command-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--brand-primary);
  opacity: 0.7;
  transition: opacity 0.2s, color 0.2s;
}

.icon-btn:hover {
  opacity: 1;
  color: var(--brand-hover);
}

/* Style for folder icon in command cwd */
.command-cwd svg {
  color: var(--brand-primary);
  flex-shrink: 0;
}

.command-text {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
  word-break: break-all;
}

.command-cwd {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.add-first-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: var(--brand-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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
  font-size: 13px;
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

.form-group {
  margin-bottom: 1rem;
  box-sizing: border-box;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 13px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-color);
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--brand-primary);
}

.form-textarea {
  width: 100%;
  min-height: 80px;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-color);
  font-size: 13px;
  font-family: monospace;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
}

.cwd-input-group {
  display: flex;
  gap: 0.5rem;
}

.cwd-input-group .form-input {
  flex: 1;
}

.select-dir-btn {
  padding: 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.select-dir-btn:hover {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: white;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-color);
  cursor: pointer;
}

.cancel-btn:hover {
  background: var(--bg-secondary);
}

.save-btn {
  padding: 0.5rem 1rem;
  background: var(--brand-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn:hover {
  background: var(--brand-hover);
}

/* Drag and Drop styles */
.drag-handle {
  cursor: grab;
  color: var(--text-muted);
  transition: color 0.15s ease;
  margin-right: 0.25rem;
}

.drag-handle:hover {
  color: var(--brand-primary);
}

.drag-handle:active {
  cursor: grabbing;
}

.command-card.sortable-ghost {
  opacity: 0.4;
  background: var(--bg-hover);
}

.command-card.sortable-drag {
  opacity: 0.8;
  background: var(--bg-secondary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform: rotate(2deg);
}
</style>
