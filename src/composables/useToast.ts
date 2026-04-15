import { useToast as _useToast, POSITION, type PluginOptions } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Настройки toast по умолчанию
const defaultOptions: PluginOptions = {
  position: POSITION.TOP_RIGHT,
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  transition: 'Vue-Toastification__bounce',
  maxToasts: 5,
  newestOnTop: true
}

export function useToast() {
  const toast = _useToast()

  return {
    // Успешное уведомление
    success: (message: string, options?: Partial<PluginOptions>) => {
      toast.success(message, { ...defaultOptions, ...options })
    },

    // Уведомление об ошибке
    error: (message: string, options?: Partial<PluginOptions>) => {
      toast.error(message, { ...defaultOptions, ...options, timeout: 5000 })
    },

    // Информационное уведомление
    info: (message: string, options?: Partial<PluginOptions>) => {
      toast.info(message, { ...defaultOptions, ...options })
    },

    // Предупреждение
    warning: (message: string, options?: Partial<PluginOptions>) => {
      toast.warning(message, { ...defaultOptions, ...options, timeout: 4000 })
    }
  }
}
