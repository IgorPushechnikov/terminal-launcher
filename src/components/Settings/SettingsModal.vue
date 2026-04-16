<template>
  <BaseModal :opened="opened" :title="t('settings.title')" @close="$emit('close')">
    <div class="settings-form">
      <div class="form-group">
        <label>{{ t('settings.logDirectory') }}</label>
        <div class="input-with-button">
          <input type="text" v-model="formData.logDirectory" readonly />
          <button @click="selectLogDirectory" :title="t('settings.select')">
            <IconFolderSearch :size="16" />
          </button>
        </div>
      </div>
      
      <div class="form-group">
        <label>
          <input type="checkbox" v-model="formData.autoStartLogging" />
          {{ t('settings.autoStartLogging') }}
        </label>
      </div>
      
      <div class="form-group">
        <label>{{ t('settings.fontSize') }}</label>
        <input 
          type="number" 
          v-model.number="formData.fontSize"
          min="8"
          max="32"
        />
      </div>
      
      <!-- Auto-update section -->
      <div class="form-group update-section">
        <label>{{ t('settings.updates') }}</label>
        <div class="update-info">
          <span class="current-version">{{ t('settings.currentVersion') }}: {{ appVersion }}</span>
          <button 
            @click="checkForUpdates" 
            class="btn-check-updates"
            :disabled="isChecking"
          >
            <IconRefresh v-if="!isChecking" :size="16" />
            <IconLoader2 v-else :size="16" class="spinning" />
            {{ isChecking ? t('settings.checking') : t('settings.checkForUpdates') }}
          </button>
        </div>
        <p v-if="lastCheckResult" class="update-status" :class="lastCheckResult.type">
          {{ lastCheckResult.message }}
        </p>
      </div>
      
      <div class="form-actions">
        <button class="btn-secondary" @click="$emit('close')">{{ t('settings.cancel') }}</button>
        <button class="btn-primary" @click="handleSave">{{ t('settings.save') }}</button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, onMounted } from 'vue'
import BaseModal from '../UI/BaseModal.vue'
import { useTerminalStore } from '../../store/terminalStore'
import { useLanguage } from '../../i18n'
import { IconFolderSearch, IconRefresh, IconLoader2 } from '@tabler/icons-vue'
import { useToast } from '../../composables/useToast'

const { t, cleanup: cleanupLanguage } = useLanguage()
const toast = useToast()

const props = defineProps<{
  opened: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const store = useTerminalStore()

// App version
const appVersion = ref('2.0.0') // TODO: Get from package.json

// Update checking state
const isChecking = ref(false)
const lastCheckResult = ref<{ type: 'success' | 'info' | 'error'; message: string } | null>(null)

const formData = ref({
  logDirectory: store.settings.logDirectory,
  autoStartLogging: store.settings.autoStartLogging,
  fontSize: store.settings.fontSize
})

watch(() => props.opened, (newVal) => {
  if (newVal) {
    formData.value = {
      logDirectory: store.settings.logDirectory,
      autoStartLogging: store.settings.autoStartLogging,
      fontSize: store.settings.fontSize
    }
  }
})

const handleSave = async () => {
  try {
    // Создаем обычный объект для передачи через IPC
    const settingsToSave = {
      theme: store.settings.theme, // Сохраняем текущую тему из store
      logDirectory: formData.value.logDirectory,
      autoStartLogging: formData.value.autoStartLogging,
      fontSize: formData.value.fontSize
    }
    
    await window.electronAPI.updateSettings(settingsToSave)
    store.updateSettings(settingsToSave)
    toast.success(t('settings.save') + ' ✓')
    emit('close')
  } catch (error) {
    console.error('Ошибка сохранения настроек:', error)
    toast.error(t('errors.saveFailed'))
  }
}

const selectLogDirectory = async () => {
  try {
    const selectedPath = await window.electronAPI.selectLogDirectory()
    if (selectedPath) {
      formData.value.logDirectory = selectedPath
    }
  } catch (error) {
    console.error('Ошибка выбора папки:', error)
  }
}

const checkForUpdates = async () => {
  try {
    isChecking.value = true
    lastCheckResult.value = null
    
    console.log('[UI] Manual update check triggered')
    const result = await window.electronAPI.checkForUpdates()
    
    if (result.success) {
      // Ждём события от main process (update-available или update-not-available)
      // Таймаут на случай если событие не придёт
      setTimeout(() => {
        if (isChecking.value) {
          isChecking.value = false
          lastCheckResult.value = {
            type: 'info',
            message: t('settings.checkComplete')
          }
        }
      }, 5000)
    } else {
      isChecking.value = false
      
      console.log('[UI] Update check failed:', result)
      
      // В dev режиме показываем специальное сообщение
      if (result.error && result.error.includes('development mode')) {
        console.log('[UI] Showing dev mode message')
        lastCheckResult.value = {
          type: 'info',
          message: t('settings.devModeNoUpdates')
        }
      } else {
        lastCheckResult.value = {
          type: 'error',
          message: `${t('errors.updateCheckFailed')}: ${result.error || 'Unknown error'}`
        }
      }
    }
  } catch (error: any) {
    console.error('[UI] Update check error:', error)
    isChecking.value = false
    lastCheckResult.value = {
      type: 'error',
      message: `${t('errors.updateCheckFailed')}: ${error.message}`
    }
  }
}

// Подписка на события обновлений
onMounted(() => {
  // Когда обновление доступно - показываем через UpdateNotification компонент
  window.electronAPI.onUpdateAvailable((info) => {
    console.log('[Settings] Update available:', info.version)
    isChecking.value = false
    lastCheckResult.value = {
      type: 'success',
      message: `${t('update.available')}: ${info.version}`
    }
  })
  
  // Когда обновлений нет
  window.electronAPI.onUpdateNotAvailable(() => {
    console.log('[Settings] No updates available')
    isChecking.value = false
    lastCheckResult.value = {
      type: 'success',
      message: t('settings.noUpdatesAvailable')
    }
  })
})

onUnmounted(() => {
  cleanupLanguage()
})
</script>

<style scoped>
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--text-color);
}

.input-with-button {
  display: flex;
  gap: 0.5rem;
}

.input-with-button input {
  flex: 1;
}

.input-with-button button {
  padding: 0.5rem;
  white-space: nowrap;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-with-button button:hover {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: white;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: var(--brand-primary);
  color: white;
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

/* Update section styles */
.update-section {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.update-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.current-version {
  font-size: 0.9em;
  color: var(--text-secondary);
}

.btn-check-updates {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--brand-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-check-updates:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-1px);
}

.btn-check-updates:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.update-status {
  margin: 0.5rem 0 0 0;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9em;
}

.update-status.success {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
  border: 1px solid rgba(72, 187, 120, 0.3);
}

.update-status.info {
  background: rgba(66, 153, 225, 0.1);
  color: #4299e1;
  border: 1px solid rgba(66, 153, 225, 0.3);
}

.update-status.error {
  background: rgba(245, 101, 101, 0.1);
  color: #f56565;
  border: 1px solid rgba(245, 101, 101, 0.3);
}
</style>
