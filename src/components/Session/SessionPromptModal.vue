<template>
  <BaseModal
    :opened="!!session"
    :title="t('session.detected')"
    @close="$emit('close')"
  >
    <div v-if="session" class="session-prompt">
      <div class="notification">
        <h4>{{ session.name }}</h4>
        <p>{{ session.description || t('session.noDescription') }}</p>
      </div>
      
      <p class="info-text">
        {{ t('session.tabs') }}: {{ session.tabCount || 0 }} | 
        {{ t('session.commands') }}: {{ session.hasCommands ? t('session.yes') : t('session.no') }} | 
        {{ t('session.savedAt') }}: {{ session.savedAt ? new Date(session.savedAt).toLocaleString('ru-RU') : t('session.unknown') }}
      </p>
      
      <p class="question">{{ t('session.wantToLoad') }}</p>
      
      <div class="actions">
        <button class="btn-secondary" @click="$emit('close')">
          {{ t('session.startOver') }}
        </button>
        <button class="btn-primary" @click="$emit('load', session)">
          {{ t('session.loadSession') }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import BaseModal from '../UI/BaseModal.vue'
import { useLanguage } from '../../i18n'

const { t, cleanup: cleanupLanguage } = useLanguage()

defineProps<{
  session?: any
}>()

defineEmits<{
  close: []
  load: [session: any]
}>()

onUnmounted(() => {
  cleanupLanguage()
})
</script>

<style scoped>
.session-prompt {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification {
  padding: 1rem;
  background: rgba(107, 83, 230, 0.1);
  border-left: 4px solid var(--brand-primary);
  border-radius: 4px;
}

/* Light theme notification */
[data-theme='light'] .notification {
  background: rgba(107, 83, 230, 0.08);
}

.notification h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.notification p {
  margin: 0;
}

.info-text,
.question {
  margin: 0;
  font-size: 0.875rem;
}

.question {
  color: var(--text-dimmed);
}

.actions {
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
