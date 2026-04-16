<template>
  <BaseModal :opened="opened" :title="t('help.title')" @close="$emit('close')">
    <div class="help-modal">
      <!-- Search -->
      <div class="help-search">
        <IconSearch :size="18" />
        <input 
          v-model="searchQuery" 
          type="text" 
          :placeholder="t('help.searchPlaceholder')"
          class="search-input"
        />
      </div>

      <!-- Sections -->
      <div class="help-content">
        <div 
          v-for="section in filteredSections" 
          :key="section.id"
          class="help-section"
        >
          <h3 @click="toggleSection(section.id)" class="section-title">
            <IconChevronRight 
              :size="16" 
              class="section-icon"
              :class="{ expanded: expandedSections.includes(section.id) }"
            />
            <component 
              :is="iconMap[section.icon]" 
              :size="16" 
              class="section-icon" 
            />
            {{ section.title }}
          </h3>
          
          <div 
            v-show="expandedSections.includes(section.id)"
            class="section-content"
          >
            <div v-html="section.content"></div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="help-footer">
        <p>{{ t('help.footer') }}</p>
        <a href="https://github.com/yourusername/terminal-launcher/issues" target="_blank" class="help-link">
          {{ t('help.reportIssue') }} →
        </a>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, markRaw } from 'vue'
import { IconSearch, IconChevronRight, IconRocket, IconLayoutDashboard, IconList, IconFolder, IconSettings, IconKeyboard, IconArrowsExchange, IconTool } from '@tabler/icons-vue'
import BaseModal from '../UI/BaseModal.vue'
import { useLanguage } from '../../i18n'
import { helpContent } from '../../data/helpContent'

const { t, lang, cleanup: cleanupLanguage } = useLanguage()

// Маппинг иконок
const iconMap: Record<string, any> = {
  'rocket': markRaw(IconRocket),
  'tabs': markRaw(IconLayoutDashboard),
  'list': markRaw(IconList),
  'folder': markRaw(IconFolder),
  'settings': markRaw(IconSettings),
  'keyboard': markRaw(IconKeyboard),
  'arrows-exchange': markRaw(IconArrowsExchange),
  'wrench': markRaw(IconTool)
}

defineProps<{
  opened: boolean
}>()

defineEmits<{
  close: []
}>()

const searchQuery = ref('')
const expandedSections = ref<string[]>(['quickstart'])

// Filter sections based on search
const filteredSections = computed(() => {
  if (!searchQuery.value) return helpContent[lang.value]
  
  const query = searchQuery.value.toLowerCase()
  return helpContent[lang.value].filter(section => 
    section.title.toLowerCase().includes(query) ||
    section.content.toLowerCase().includes(query)
  )
})

const toggleSection = (id: string) => {
  const index = expandedSections.value.indexOf(id)
  if (index > -1) {
    expandedSections.value.splice(index, 1)
  } else {
    expandedSections.value.push(id)
  }
}

// Listen for language changes
onMounted(() => {
  // No need for event listener - useLanguage handles reactivity
})

onUnmounted(() => {
  cleanupLanguage()
})
</script>

<style scoped>
.help-modal {
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.help-search {
  position: sticky;
  top: 0;
  background: var(--bg-color);
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 10;
}

.search-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-color);
  font-size: 0.9rem;
  outline: none;
}

.search-input:focus {
  border-color: var(--brand-primary);
}

.help-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.help-section {
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
}

.section-title {
  padding: 0.75rem 1rem;
  margin: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  background: var(--bg-secondary);
  transition: background 0.2s;
}

.section-title:hover {
  background: var(--bg-hover);
}

.section-icon {
  transition: transform 0.2s;
  color: var(--text-secondary);
}

.section-icon.expanded {
  transform: rotate(90deg);
}

.section-content {
  padding: 1rem;
  line-height: 1.6;
  color: var(--text-color);
}

.section-content :deep(h4) {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
}

/* Тёмная тема — заголовки ярче основного текста */
:deep([data-theme='dark'] .section-content h4) {
  color: #ffffff;
}

.section-content :deep(ul),
.section-content :deep(ol) {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.section-content :deep(li) {
  margin: 0.25rem 0;
}

.section-content :deep(code) {
  background: var(--bg-secondary);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.85em;
}

.section-content :deep(kbd) {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  padding: 0.1rem 0.4rem;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.85em;
  box-shadow: 0 1px 0 var(--border-color);
}

.section-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.5rem 0;
}

.section-content :deep(th),
.section-content :deep(td) {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  text-align: left;
}

.section-content :deep(th) {
  background: var(--bg-secondary);
  font-weight: 600;
}

.help-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.help-link {
  color: var(--brand-primary);
  text-decoration: none;
  font-weight: 500;
}

.help-link:hover {
  text-decoration: underline;
}
</style>
