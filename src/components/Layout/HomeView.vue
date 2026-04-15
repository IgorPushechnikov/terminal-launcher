<template>
  <div class="home-view">
    <ResizableSidebar
      :initial-width="sidebarWidth"
      @width-change="store.setSidebarWidth"
    >
      <CommandPanel />
    </ResizableSidebar>
    
    <div class="main-area">
      <TabBar 
        @rename-tab="handleRenameRequest"
        @open-settings="$emit('openSettings')"
      />
      <TerminalView />
    </div>
    
    <!-- Rename Modal -->
    <BaseModal
      :opened="renameModalOpened"
      :title="t('tabs.renameTab')"
      @close="renameModalOpened = false"
    >
      <form @submit.prevent="handleRename">
        <input
          v-model="newName"
          class="rename-input"
          :placeholder="t('tabs.newTabName')"
          autofocus
        />
        <button type="submit" class="rename-btn">
          {{ t('tabs.renameTab') }}
        </button>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import TabBar from '../Terminal/Tabs/TabBar.vue'
import TerminalView from '../Terminal/TerminalView.vue'
import CommandPanel from '../Commands/CommandPanel.vue'
import ResizableSidebar from './ResizableSidebar.vue'
import BaseModal from '../UI/BaseModal.vue'
import { useTerminalStore } from '../../store/terminalStore'
import { useLanguage } from '../../i18n'
import type { TerminalTab } from '../../types'

const { t, cleanup: cleanupLanguage } = useLanguage()

const store = useTerminalStore()
const sidebarWidth = computed(() => store.sidebarWidth)

const renameModalOpened = ref(false)
const tabToRename = ref<number | null>(null)
const newName = ref('')

const handleRenameRequest = (tabId: number, currentName: string) => {
  tabToRename.value = tabId
  newName.value = currentName
  renameModalOpened.value = true
}

const handleRename = () => {
  if (tabToRename.value !== null && newName.value.trim()) {
    store.renameTab(tabToRename.value, newName.value.trim())
    renameModalOpened.value = false
    newName.value = ''
    tabToRename.value = null
  }
}

// Слушаем custom event для переименования (из App.vue Ctrl+R)
onMounted(() => {
  const handleRenameEvent = (e: Event) => {
    const customEvent = e as CustomEvent
    const tabId = customEvent.detail
    const tab = store.tabs.find((t: TerminalTab) => t.id === tabId)
    if (tab) {
      handleRenameRequest(tab.id, tab.name)
    }
  }
  
  window.addEventListener('rename-tab', handleRenameEvent)
  
  // Cleanup
  return () => {
    window.removeEventListener('rename-tab', handleRenameEvent)
    cleanupLanguage()
  }
})

onUnmounted(() => {
  cleanupLanguage()
})
</script>

<style scoped>
.home-view {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.rename-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-color);
  font-size: 14px;
  outline: none;
}

.rename-input:focus {
  border-color: var(--brand-primary);
}

.rename-btn {
  width: 100%;
  margin-top: 1rem;
  padding: 0.5rem;
  background: var(--brand-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.rename-btn:hover {
  background: var(--brand-hover);
}
</style>
