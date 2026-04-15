<template>
  <div 
    ref="sidebarRef"
    class="resizable-sidebar"
    :style="{ width: `${currentWidth}px` }"
  >
    <slot />
    <div 
      class="resize-handle"
      @mousedown="startResize"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps<{
  initialWidth?: number
}>()

const emit = defineEmits<{
  widthChange: [width: number]
}>()

const sidebarRef = ref<HTMLDivElement>()
const currentWidth = ref(props.initialWidth || 300)
let isResizing = false
let startX = 0
let startWidth = 0

// Следим за изменением initialWidth и обновляем текущую ширину
watch(() => props.initialWidth, (newWidth) => {
  console.log('[ResizableSidebar] initialWidth изменился:', newWidth)
  if (newWidth && !isResizing) {
    currentWidth.value = newWidth
    console.log('[ResizableSidebar] Текущая ширина установлена:', currentWidth.value)
  }
})

const startResize = (e: MouseEvent) => {
  isResizing = true
  startX = e.clientX
  startWidth = currentWidth.value
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  e.preventDefault()
}

const handleResize = (e: MouseEvent) => {
  if (!isResizing) return
  
  const diff = e.clientX - startX
  const newWidth = Math.max(200, Math.min(600, startWidth + diff))
  currentWidth.value = newWidth
  emit('widthChange', newWidth)
}

const stopResize = () => {
  isResizing = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// Cleanup: удаляем слушатели при уничтожении компонента
onUnmounted(() => {
  if (isResizing) {
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
    isResizing = false
  }
})
</script>

<style scoped>
.resizable-sidebar {
  position: relative;
  height: 100%;
  overflow-y: auto;
  background: var(--bg-color);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  background: transparent;
  transition: background 0.2s;
}

.resize-handle:hover {
  background: var(--brand-primary);
}
</style>
