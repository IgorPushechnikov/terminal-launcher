<template>
  <div class="custom-titlebar">
    <div class="titlebar-left">
      <IconTerminal2 class="titlebar-icon" :size="18" />
      <span class="titlebar-title">Terminal Launcher</span>
    </div>
    <div class="titlebar-drag-region"></div>
    <div class="titlebar-controls">
      <!-- Language Toggle -->
      <button
        class="titlebar-button language-toggle"
        @click="toggleLanguage"
        :title="t('common.toggleLang', currentLang === 'ru' ? t('common.english') : t('common.russian'))"
      >
        <span class="language-text">{{ currentLang.toUpperCase() }}</span>
      </button>
      <!-- Theme Toggle -->
      <button 
        class="titlebar-button theme-toggle" 
        @click="$emit('toggleTheme')"
        :title="theme === 'dark' ? t('titlebar.lightTheme') : t('titlebar.darkTheme')"
      >
        <IconSun v-if="theme === 'dark'" :size="16" />
        <IconMoon v-else :size="16" />
      </button>
      <!-- Help Button -->
      <button 
        class="titlebar-button help-button" 
        @click="$emit('openHelp')"
        :title="t('titlebar.help')"
      >
        <IconQuestionMark :size="16" />
      </button>
      <!-- Window Controls -->
      <button 
        class="titlebar-button" 
        @click="$emit('minimize')"
        :title="t('titlebar.minimize')"
      >
        <IconMinus :size="16" />
      </button>
      <button 
        class="titlebar-button" 
        @click="$emit('maximize')"
        :title="isMaximized ? t('titlebar.restore') : t('titlebar.maximize')"
      >
        <svg v-if="isMaximized" class="restore-icon" width="11" height="11" viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg">
          <rect class="restore-back" x="3" y="1" width="6" height="6" />
          <rect class="restore-front" x="1" y="3" width="6" height="6" />
        </svg>
        <IconSquare v-else :size="14" />
      </button>
      <button 
        class="titlebar-button close-button" 
        @click="$emit('close')"
        :title="t('titlebar.close')"
      >
        <IconX :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { IconTerminal2, IconMinus, IconSquare, IconX, IconSun, IconMoon, IconQuestionMark } from '@tabler/icons-vue'
import { getLanguage, setLanguage, useLanguage, type Language } from '../../i18n'

const { t, cleanup: cleanupLanguage } = useLanguage()

const props = defineProps<{
  isMaximized?: boolean
  theme?: 'dark' | 'light'
}>()

defineEmits<{
  minimize: []
  maximize: []
  close: []
  toggleTheme: []
  openHelp: []
}>()

// Language state
const currentLang = ref<Language>(getLanguage())

const toggleLanguage = () => {
  const newLang: Language = currentLang.value === 'ru' ? 'en' : 'ru'
  setLanguage(newLang)
  currentLang.value = newLang
}

onMounted(() => {
  currentLang.value = getLanguage()
})

onUnmounted(() => {
  cleanupLanguage()
})
</script>

<style scoped>
@import './CustomTitleBar.css';
</style>
