<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <IconAlertTriangle :size="48" class="error-icon" />
      <h3>{{ t('errors.componentError') }}</h3>
      <p>{{ errorMessage }}</p>
      <button @click="handleReset" class="retry-button">
        <IconRefresh :size="16" />
        {{ t('errors.retry') }}
      </button>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { t } from '../../i18n'
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-vue'

const error = ref<Error | null>(null)
const errorMessage = ref('')

// Перехватываем ошибки из дочерних компонентов
onErrorCaptured((err, instance, info) => {
  console.error('[ErrorBoundary] Captured error:', err)
  console.error('[ErrorBoundary] Component:', instance)
  console.error('[ErrorBoundary] Info:', info)
  
  error.value = err
  errorMessage.value = err.message || t('errors.unknownError')
  
  // Предотвращаем всплытие ошибки дальше
  return false
})

const handleReset = () => {
  error.value = null
  errorMessage.value = ''
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
  background: var(--color-bg-secondary);
  border-radius: 8px;
  border: 2px solid var(--color-error);
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  color: var(--color-error);
  margin-bottom: 1rem;
}

.error-content h3 {
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

.error-content p {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  word-break: break-word;
}

.retry-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.retry-button:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.retry-button:active {
  transform: translateY(0);
}
</style>
