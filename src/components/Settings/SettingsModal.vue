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
      
      <div class="form-actions">
        <button class="btn-secondary" @click="$emit('close')">{{ t('settings.cancel') }}</button>
        <button class="btn-primary" @click="handleSave">{{ t('settings.save') }}</button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import BaseModal from '../UI/BaseModal.vue'
import { useTerminalStore } from '../../store/terminalStore'
import { useLanguage } from '../../i18n'
import { IconFolderSearch } from '@tabler/icons-vue'
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
</style>
