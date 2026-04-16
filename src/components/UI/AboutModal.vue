<template>
  <Transition name="modal-fade">
    <div v-if="opened" class="modal-overlay" @click.self="$emit('close')">
      <div class="about-modal">
        <button class="close-btn" @click="$emit('close')" :title="t('common.close')">
          <IconX :size="20" />
        </button>
        
        <div class="about-content">
          <!-- Logo and Title -->
          <div class="about-header">
            <div class="app-logo">
              <img src="/assets/icons/terminal-icon.svg" alt="Terminal Launcher" />
            </div>
            <h1 class="app-name">Terminal Launcher</h1>
            <p class="app-version">{{ t('about.version') }} {{ appVersion }}</p>
          </div>
          
          <!-- Description -->
          <div class="about-description">
            <p>{{ t('about.description') }}</p>
          </div>
          
          <!-- Features -->
          <div class="about-features">
            <h3>{{ t('about.features') }}</h3>
            <ul>
              <li>{{ t('about.feature1') }}</li>
              <li>{{ t('about.feature2') }}</li>
              <li>{{ t('about.feature3') }}</li>
              <li>{{ t('about.feature4') }}</li>
            </ul>
          </div>
          
          <!-- Links -->
          <div class="about-links">
            <a href="https://github.com/IgorPushechnikov/terminal-launcher" target="_blank" class="link">
              <IconBrandGithub :size="18" />
              GitHub
            </a>
            <span class="separator">•</span>
            <a href="#" @click.prevent="checkForUpdates" class="link">
              <IconRefresh :size="18" :class="{ spinning: isChecking }" />
              {{ t('about.checkUpdates') }}
            </a>
          </div>
          
          <!-- Update check result message -->
          <div v-if="checkResult" class="update-result" :class="checkResult.type">
            {{ checkResult.message }}
          </div>
          
          <!-- Copyright -->
          <div class="about-copyright">
            <p>© 2026 Igor Pushechnikov</p>
            <p class="electron-version">Electron {{ electronVersion }}</p>
          </div>
          
          <!-- Show on startup checkbox (only for first launch) -->
          <div v-if="isFirstLaunch" class="show-on-startup">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="showOnStartup" 
                @change="handleShowOnStartupChange"
              />
              <span>{{ t('about.showOnStartup') }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IconX, IconTerminal2, IconBrandGithub, IconRefresh } from '@tabler/icons-vue'
import { useLanguage } from '../../i18n'

const { t } = useLanguage()

defineProps<{
  opened: boolean
}>()

defineEmits<{
  close: []
}>()

// State
const appVersion = ref('2.0.1')
const electronVersion = ref('')
const isChecking = ref(false)
const isFirstLaunch = ref(false)
const showOnStartup = ref(true)
const checkResult = ref<{ type: string; message: string } | null>(null)

onMounted(() => {
  // Get version info
  if (window.electronAPI?.getAppInfo) {
    window.electronAPI.getAppInfo().then((info) => {
      appVersion.value = info.version
      electronVersion.value = info.electronVersion || ''
    })
  }
  
  // Check if this is first launch
  const skipAbout = localStorage.getItem('skipAboutOnStartup')
  isFirstLaunch.value = !skipAbout
  showOnStartup.value = skipAbout !== 'true'
})

const handleShowOnStartupChange = () => {
  if (!showOnStartup.value) {
    localStorage.setItem('skipAboutOnStartup', 'true')
  } else {
    localStorage.removeItem('skipAboutOnStartup')
  }
}

const checkForUpdates = async () => {
  console.log('[About] === checkForUpdates CALLED ===')
  try {
    isChecking.value = true
    checkResult.value = null
    
    console.log('[About] Manual update check triggered')
    const result = await window.electronAPI.checkForUpdates()
    
    console.log('[About] Update check result:', result)
    isChecking.value = false
    
    if (result.success) {
      // В production режиме ждём события от autoUpdater
      // Таймаут на случай если событие не придёт
      setTimeout(() => {
        if (isChecking.value === false && !checkResult.value) {
          checkResult.value = {
            type: 'info',
            message: t('settings.checkComplete')
          }
          // Скрыть через 5 секунд
          setTimeout(() => {
            checkResult.value = null
          }, 5000)
        }
      }, 5000)
    } else {
      console.log('[About] Update check failed:', result)
      
      // В dev режиме показываем специальное сообщение
      if (result.error && result.error.includes('development mode')) {
        console.log('[About] Showing dev mode message')
        checkResult.value = {
          type: 'info',
          message: t('settings.devModeNoUpdates')
        }
      } else {
        // В production режиме показываем понятное сообщение
        const errorMsg = result.error || 'Unknown error'
        // Если ошибка слишком длинная (CSP или HTML), показываем краткое сообщение
        const shortError = errorMsg.length > 200 
          ? t('errors.updateCheckFailed')
          : `${t('errors.updateCheckFailed')}: ${errorMsg}`
        
        checkResult.value = {
          type: 'error',
          message: shortError
        }
      }
      
      // Скрыть сообщение через 5 секунд
      setTimeout(() => {
        checkResult.value = null
      }, 5000)
    }
  } catch (error: any) {
    console.error('[About] Update check error:', error)
    isChecking.value = false
    checkResult.value = {
      type: 'error',
      message: `${t('errors.updateCheckFailed')}: ${error.message}`
    }
    
    setTimeout(() => {
      checkResult.value = null
    }, 5000)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.about-modal {
  background: var(--bg-color);
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border-color);
}

/* Light theme */
[data-theme='light'] .about-modal {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.about-content {
  text-align: center;
}

.about-header {
  margin-bottom: 1.5rem;
}

.app-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.app-logo img {
  width: 100px;
  height: 100px;
  filter: drop-shadow(0 8px 24px rgba(107, 83, 230, 0.3));
}

.app-name {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.app-version {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
  font-family: monospace;
}

.about-description {
  margin: 1.5rem 0;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.about-description p {
  margin: 0;
  color: var(--text-primary);
  line-height: 1.6;
}

.about-features {
  text-align: left;
  margin: 1.5rem 0;
}

.about-features h3 {
  font-size: 1rem;
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
}

.about-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.about-features li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.about-features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--brand-primary);
  font-weight: bold;
}

.about-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 1.5rem 0;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--brand-primary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.link:hover {
  color: var(--brand-light);
  transform: translateY(-1px);
}

.separator {
  color: var(--text-muted);
}

.update-result {
  margin: 1rem 0;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.update-result.info {
  background: rgba(107, 83, 230, 0.1);
  color: var(--brand-primary);
  border: 1px solid rgba(107, 83, 230, 0.3);
}

.update-result.success {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
  border: 1px solid rgba(72, 187, 120, 0.3);
}

.update-result.error {
  background: rgba(245, 101, 101, 0.1);
  color: #f56565;
  border: 1px solid rgba(245, 101, 101, 0.3);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.about-copyright {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.about-copyright p {
  margin: 0.25rem 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.electron-version {
  font-family: monospace;
  font-size: 0.75rem !important;
}

.show-on-startup {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 0.9rem;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--brand-primary);
}

.checkbox-label:hover {
  color: var(--text-primary);
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .about-modal,
.modal-fade-leave-active .about-modal {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-fade-enter-from .about-modal,
.modal-fade-leave-to .about-modal {
  transform: scale(0.95);
  opacity: 0;
}
</style>
