<template>
  <div class="modal-overlay" :data-theme="currentTheme" v-if="opened" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTerminalStore } from '../../store/terminalStore'

const props = defineProps<{
  opened: boolean
  title?: string
}>()

defineEmits<{
  close: []
}>()

const store = useTerminalStore()
const currentTheme = computed(() => store.settings.theme)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-color);
  border-radius: 8px;
  min-width: 500px;
  max-width: 700px;
  max-height: 85vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-color);
}

.modal-body {
  padding: 1rem;
}
</style>
