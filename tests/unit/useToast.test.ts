import { describe, it, expect, vi, beforeEach } from 'vitest'

// Мокаем vue-toastification перед импортом useToast
const mockSuccess = vi.fn()
const mockError = vi.fn()
const mockInfo = vi.fn()
const mockWarning = vi.fn()

vi.mock('vue-toastification', () => ({
  useToast: vi.fn(() => ({
    success: mockSuccess,
    error: mockError,
    info: mockInfo,
    warning: mockWarning
  })),
  POSITION: {
    TOP_RIGHT: 'top-right'
  }
}))

import { useToast } from '../../src/composables/useToast'

describe('useToast composable', () => {
  let toastInstance: ReturnType<typeof useToast>

  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    vi.clearAllMocks()
    toastInstance = useToast()
  })

  describe('success()', () => {
    it('должен вызывать toast.success с сообщением', () => {
      const message = 'Операция выполнена успешно'
      toastInstance.success(message)
      
      expect(mockSuccess).toHaveBeenCalledWith(
        message,
        expect.objectContaining({
          position: 'top-right',
          timeout: 3000
        })
      )
    })

    it('должен поддерживать кастомные опции', () => {
      const message = 'Custom toast'
      toastInstance.success(message, { timeout: 5000 })
      
      expect(mockSuccess).toHaveBeenCalledWith(
        message,
        expect.objectContaining({
          timeout: 5000
        })
      )
    })
  })

  describe('error()', () => {
    it('должен вызывать toast.error с увеличенным таймаутом', () => {
      const message = 'Произошла ошибка'
      toastInstance.error(message)
      
      expect(mockError).toHaveBeenCalledWith(
        message,
        expect.objectContaining({
          timeout: 5000 // Увеличенный таймаут для ошибок
        })
      )
    })
  })

  describe('info()', () => {
    it('должен вызывать toast.info с стандартными настройками', () => {
      const message = 'Информация'
      toastInstance.info(message)
      
      expect(mockInfo).toHaveBeenCalledWith(
        message,
        expect.objectContaining({
          timeout: 3000
        })
      )
    })
  })

  describe('warning()', () => {
    it('должен вызывать toast.warning со средним таймаутом', () => {
      const message = 'Предупреждение'
      toastInstance.warning(message)
      
      expect(mockWarning).toHaveBeenCalledWith(
        message,
        expect.objectContaining({
          timeout: 4000 // Средний таймаут для предупреждений
        })
      )
    })
  })

  describe('default options', () => {
    it('должен использовать правильные настройки по умолчанию', () => {
      toastInstance.info('Test')
      
      expect(mockInfo).toHaveBeenCalledWith(
        'Test',
        expect.objectContaining({
          position: 'top-right',
          closeOnClick: true,
          pauseOnFocusLoss: true,
          pauseOnHover: true,
          draggable: true,
          hideProgressBar: false,
          maxToasts: 5,
          newestOnTop: true
        })
      )
    })
  })
})
