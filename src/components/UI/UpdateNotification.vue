<template>
  <Transition name="update-slide">
    <div v-if="showUpdate" class="update-notification" :class="{ 'has-progress': downloadProgress > 0 }">
      <div class="update-content">
        <IconDownload :size="20" class="update-icon" />
        
        <div class="update-text">
          <h4>{{ title }}</h4>
          <p v-if="message">{{ message }}</p>
          
          <!-- Прогресс скачивания -->
          <div v-if="downloadProgress > 0 && downloadProgress < 100" class="progress-bar">
            <div class="progress-fill" :style="{ width: downloadProgress + '%' }"></div>
            <span class="progress-text">{{ downloadProgress }}%</span>
          </div>
        </div>
        
        <div class="update-actions">
          <button 
            v-if="canInstall" 
            @click="handleInstall" 
            class="btn-install"
          >
            {{ t('update.installAndRestart') }}
          </button>
          <button 
            v-else-if="canDownload" 
            @click="handleDownload" 
            class="btn-download"
            :disabled="isDownloading"
          >
            {{ isDownloading ? t('update.downloading') : t('update.download') }}
          </button>
          <button @click="dismiss" class="btn-dismiss">
            ✕
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { IconDownload } from '@tabler/icons-vue'
import { useLanguage } from '../../i18n'

const { t } = useLanguage()

// State
const showUpdate = ref(false)
const updateVersion = ref('')
const releaseNotes = ref('')
const downloadProgress = ref(0)
const isDownloading = ref(false)
const isDownloaded = ref(false)

// Computed
const canInstall = computed(() => isDownloaded.value)
const canDownload = computed(() => !isDownloading.value && !isDownloaded.value)
const title = computed(() => {
  if (isDownloaded.value) return t('update.readyToInstall')
  if (downloadProgress.value > 0) return t('update.downloading')
  return `${t('update.available')} ${updateVersion.value}`
})
const message = computed(() => {
  if (releaseNotes.value) return releaseNotes.value
  return ''
})

// Handlers
const handleDownload = async () => {
  try {
    isDownloading.value = true
    const result = await window.electronAPI.downloadUpdate()
    if (!result.success) {
      console.error('[UPDATE] Download failed:', result.error)
      isDownloading.value = false
    }
  } catch (error) {
    console.error('[UPDATE] Download error:', error)
    isDownloading.value = false
  }
}

const handleInstall = async () => {
  try {
    await window.electronAPI.installUpdate()
  } catch (error) {
    console.error('[UPDATE] Install error:', error)
  }
}

const dismiss = () => {
  showUpdate.value = false
}

// Event listeners
onMounted(() => {
  // Слушаем события от main process
  window.electronAPI.onUpdateAvailable((info) => {
    console.log('[UI] Update available:', info.version)
    updateVersion.value = info.version
    releaseNotes.value = typeof info.releaseNotes === 'string' ? info.releaseNotes : ''
    showUpdate.value = true
  })
  
  window.electronAPI.onUpdateNotAvailable(() => {
    console.log('[UI] No updates available')
  })
  
  window.electronAPI.onUpdateDownloadProgress((percent) => {
    console.log('[UI] Download progress:', percent + '%')
    downloadProgress.value = percent
  })
  
  window.electronAPI.onUpdateDownloaded((info) => {
    console.log('[UI] Update downloaded:', info.version)
    isDownloaded.value = true
    isDownloading.value = false
    downloadProgress.value = 100
    updateVersion.value = info.version
    releaseNotes.value = typeof info.releaseNotes === 'string' ? info.releaseNotes : ''
  })
})

onUnmounted(() => {
  // Cleanup если нужно
})
</script>

<style scoped>
.update-notification {
  position: fixed;
  top: 60px;
  right: 20px;
  z-index: 9999;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 350px;
  max-width: 450px;
  overflow: hidden;
}

.update-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
}

.update-icon {
  color: #667eea;
  flex-shrink: 0;
  margin-top: 2px;
}

.update-text {
  flex: 1;
  min-width: 0;
}

.update-text h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.update-text p {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
}

.progress-bar {
  margin-top: 8px;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
  border-radius: 3px;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  color: var(--text-primary);
  font-weight: 600;
}

.update-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-install,
.btn-download {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-install {
  background: #667eea;
  color: white;
}

.btn-install:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

.btn-download {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-download:hover:not(:disabled) {
  background: var(--bg-hover);
}

.btn-download:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-dismiss {
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
  line-height: 1;
}

.btn-dismiss:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* Animations */
.update-slide-enter-active,
.update-slide-leave-active {
  transition: all 0.3s ease;
}

.update-slide-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.update-slide-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
