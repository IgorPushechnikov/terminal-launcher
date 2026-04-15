<template>
  <div class="status-bar">
    <span class="status-text">{{ statusText }}</span>
    <div class="session-controls">
      <button @click="handleImportSession" class="session-btn" :title="t('statusbar.importSession')">
        <IconUpload :size="14" />
        {{ t('statusbar.import') }}
      </button>
      <button @click="handleExportSession" class="session-btn" :title="t('statusbar.exportSession')">
        <IconDownload :size="14" />
        {{ t('statusbar.export') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { IconUpload, IconDownload } from '@tabler/icons-vue'
import { useTerminalStore } from '../../store/terminalStore'
import { useLanguage } from '../../i18n'

const store = useTerminalStore()
const { t, cleanup: cleanupLanguage } = useLanguage()

const statusText = computed(() => {
  if (store.loadedSessionName) {
    return `${t('common.session')}: ${store.loadedSessionName}`
  }
  return t('common.ready')
})

const handleImportSession = async () => {
  try {
    const result = await window.electronAPI.importSession()
    if (result.success && result.tabs) {
      store.loadSessionData({
        tabs: result.tabs,
        commands: result.commands || []
      })
      store.setLoadedSessionName(result.name || t('statusbar.importedSession'))
      console.log('[StatusBar] Сессия импортирована:', result.name)
    }
  } catch (error) {
    console.error('[StatusBar] Ошибка импорта сессии:', error)
  }
}

const handleExportSession = async () => {
  try {
    const result = await window.electronAPI.exportSession()
    if (result.success) {
      console.log('[StatusBar] Сессия экспортирована:', result.filePath)
    }
  } catch (error) {
    console.error('[StatusBar] Ошибка экспорта сессии:', error)
  }
}

// Listen for language changes
onMounted(() => {
  // No need to listen for language changes - useLanguage handles it
})

onUnmounted(() => {
  cleanupLanguage()
})
</script>

<style scoped>
.status-bar {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
}

.status-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.session-controls {
  display: flex;
  gap: 0.5rem;
}

.session-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-color);
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
}

.session-btn:hover {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: white;
}
</style>
