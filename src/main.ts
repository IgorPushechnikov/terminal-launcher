import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast, { POSITION, type PluginOptions } from 'vue-toastification'
import App from './App.vue'
import './styles/global.css'
import { useTerminalStore } from './store/terminalStore'

const app = createApp(App)
const pinia = createPinia()

// Настройки toast
const toastOptions: PluginOptions = {
  position: POSITION.TOP_RIGHT,
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  maxToasts: 5,
  newestOnTop: true
}

app.use(pinia)
app.use(Toast, toastOptions)
app.mount('#app')

// Глобальные функции для автосохранения при закрытии окна (вызываются из electron main process)
// Эти функции должны быть определены на window до того, как main process вызовет executeJavaScript

// Объявляем типы для глобальных функций
declare global {
  interface Window {
    __getTabsState__: () => Array<{ id: number; name: string }>
    __getCommandsState__: () => any[] | null
  }
}

// Определяем функции после монтирования app
// Используем nextTick чтобы Pinia store был готов
import { nextTick } from 'vue'

nextTick(() => {
  window.__getTabsState__ = () => {
    try {
      const store = useTerminalStore()
      // Возвращаем только сериализуемые данные
      return JSON.parse(JSON.stringify(store.tabs.map(t => ({ id: t.id, name: t.name }))))
    } catch (error) {
      console.error('[__getTabsState__] Ошибка:', error)
      return []
    }
  }

  window.__getCommandsState__ = () => {
    try {
      const store = useTerminalStore()
      // Команды хранятся в SQLite, возвращаем их из store для автосохранения сессии
      // Сериализуем чтобы избежать ошибки "could not be cloned"
      if (!store.commands || !Array.isArray(store.commands)) return null
      return JSON.parse(JSON.stringify(store.commands))
    } catch (error) {
      console.error('[__getCommandsState__] Ошибка:', error)
      return null
    }
  }

  console.log('[main] Глобальные функции автосохранения определены')
})
