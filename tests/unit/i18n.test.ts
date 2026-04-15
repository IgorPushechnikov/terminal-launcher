import { describe, it, expect, beforeEach } from 'vitest'
import { 
  t, 
  setLanguage, 
  getLanguage, 
  tTemplate,
  useLanguage,
  translations 
} from '../../src/i18n'

describe('i18n', () => {
  beforeEach(() => {
    // Сбрасываем язык на русский перед каждым тестом
    setLanguage('ru')
    localStorage.clear()
  })

  describe('t()', () => {
    it('должен возвращать перевод для существующего ключа (ru)', () => {
      setLanguage('ru')
      expect(t('common.ready')).toBe('Готов')
      expect(t('tabs.newTab')).toBe('Новая вкладка')
    })

    it('должен возвращать перевод для существующего ключа (en)', () => {
      setLanguage('en')
      expect(t('common.ready')).toBe('Ready')
      expect(t('tabs.newTab')).toBe('New tab')
    })

    it('должен возвращать ключ если перевод не найден', () => {
      const result = t('non.existent.key')
      expect(result).toBe('non.existent.key')
    })

    it('должен использовать fallback на русский если нет перевода для текущего языка', () => {
      // Добавляем временный ключ только с русским переводом
      const originalTranslations = { ...translations }
      ;(translations as any)['test.fallback'] = { ru: 'Русский текст' }
      
      setLanguage('en')
      expect(t('test.fallback')).toBe('Русский текст')
      
      // Восстанавливаем оригинальные переводы
      Object.keys(translations).forEach(key => {
        if (!(key in originalTranslations)) {
          delete (translations as any)[key]
        }
      })
    })
  })

  describe('tTemplate()', () => {
    it('должен заменять плейсхолдеры в строке', () => {
      const result = tTemplate('common.toggleLang', 'English')
      expect(result).toBe('Переключить на English')
    })

    it('должен поддерживать несколько плейсхолдеров', () => {
      const result = tTemplate('errors.fileReadError', 'file.txt')
      expect(result).toBe('Ошибка чтения файла: file.txt')
    })

    it('должен работать без аргументов', () => {
      const result = tTemplate('common.ready')
      expect(result).toBe('Готов')
    })
  })

  describe('setLanguage() / getLanguage()', () => {
    it('должен сохранять язык в localStorage', () => {
      setLanguage('en')
      expect(localStorage.getItem('terminal-launcher-language')).toBe('en')
      expect(getLanguage()).toBe('en')
    })

    it('должен загружать сохраненный язык из localStorage', () => {
      localStorage.setItem('terminal-launcher-language', 'en')
      expect(getLanguage()).toBe('en')
    })

    it('должен использовать русский по умолчанию если язык не сохранен', () => {
      localStorage.clear()
      expect(getLanguage()).toBe('ru')
    })

    it('должен генерировать событие language-changed при смене языка', () => {
      let eventFired = false
      let eventDetail = null
      
      const handler = (e: CustomEvent) => {
        eventFired = true
        eventDetail = e.detail
      }
      
      window.addEventListener('language-changed', handler as EventListener)
      setLanguage('en')
      
      expect(eventFired).toBe(true)
      expect(eventDetail).toEqual({ language: 'en' })
      
      window.removeEventListener('language-changed', handler as EventListener)
    })
  })

  describe('useLanguage()', () => {
    it('должен возвращать реактивный объект с языком', () => {
      const { lang, t: translate } = useLanguage()
      
      expect(lang.value).toBe('ru')
      expect(translate('common.ready')).toBe('Готов')
    })

    it('должен обновляться при смене языка', () => {
      const { lang, t: translate } = useLanguage()
      
      setLanguage('en')
      
      expect(lang.value).toBe('en')
      expect(translate('common.ready')).toBe('Ready')
    })

    it('должен поддерживать шаблоны с аргументами', () => {
      const { t: translate } = useLanguage()
      
      const result = translate('common.toggleLang', 'English')
      expect(result).toBe('Переключить на English')
    })

    it('должен очищать слушатель событий при вызове cleanup', () => {
      const { cleanup } = useLanguage()
      
      // Проверяем что cleanup функция существует и не выбрасывает ошибок
      expect(cleanup).toBeDefined()
      expect(() => cleanup()).not.toThrow()
    })
  })

  describe('translations structure', () => {
    it('должен содержать обязательные секции переводов', () => {
      expect(translations['common.ready']).toBeDefined()
      expect(translations['tabs.newTab']).toBeDefined()
      expect(translations['commands.title']).toBeDefined()
      expect(translations['settings.title']).toBeDefined()
      expect(translations['help.title']).toBeDefined()
    })

    it('каждый перевод должен иметь ru и en версии', () => {
      Object.entries(translations).forEach(([key, value]) => {
        expect(value.ru).toBeDefined()
        expect(value.en).toBeDefined()
        expect(typeof value.ru).toBe('string')
        expect(typeof value.en).toBe('string')
      })
    })
  })
})
