import { describe, it, expect } from 'vitest'
import { helpContent } from '../../src/data/helpContent'
import type { HelpSection } from '../../src/data/helpContent'

describe('Help Content', () => {
  describe('Structure validation', () => {
    it('должен содержать секции для обоих языков', () => {
      expect(helpContent.ru).toBeDefined()
      expect(helpContent.en).toBeDefined()
      expect(Array.isArray(helpContent.ru)).toBe(true)
      expect(Array.isArray(helpContent.en)).toBe(true)
    })

    it('должен иметь одинаковое количество секций для RU и EN', () => {
      expect(helpContent.ru.length).toBe(helpContent.en.length)
      expect(helpContent.ru.length).toBeGreaterThan(0)
    })

    it('каждая секция должна иметь обязательные поля', () => {
      helpContent.ru.forEach((section: HelpSection) => {
        expect(section.id).toBeDefined()
        expect(section.title).toBeDefined()
        expect(section.icon).toBeDefined()
        expect(section.content).toBeDefined()
        
        expect(typeof section.id).toBe('string')
        expect(typeof section.title).toBe('string')
        expect(typeof section.icon).toBe('string')
        expect(typeof section.content).toBe('string')
      })
    })

    it('IDs секций должны совпадать между языками', () => {
      const ruIds = helpContent.ru.map((s: HelpSection) => s.id)
      const enIds = helpContent.en.map((s: HelpSection) => s.id)
      
      expect(ruIds).toEqual(enIds)
    })

    it('все IDs должны быть уникальными', () => {
      const ruIds = helpContent.ru.map((s: HelpSection) => s.id)
      const uniqueIds = new Set(ruIds)
      
      expect(uniqueIds.size).toBe(ruIds.length)
    })
  })

  describe('Content validation - Russian', () => {
    it('должен содержать секцию быстрого старта', () => {
      const quickstart = helpContent.ru.find((s: HelpSection) => s.id === 'quickstart')
      
      expect(quickstart).toBeDefined()
      expect(quickstart?.title).toContain('Быстрый старт')
      expect(quickstart?.content).toBeTruthy()
    })

    it('должен содержать секцию работы с вкладками', () => {
      const tabs = helpContent.ru.find((s: HelpSection) => s.id === 'tabs')
      
      expect(tabs).toBeDefined()
      expect(tabs?.title).toContain('вкладк')
    })

    it('должен содержать секцию горячих клавиш', () => {
      const hotkeys = helpContent.ru.find((s: HelpSection) => s.id === 'shortcuts')
      
      expect(hotkeys).toBeDefined()
      expect(hotkeys?.title).toBeDefined()
    })

    it('контент должен содержать HTML разметку', () => {
      helpContent.ru.forEach((section: HelpSection) => {
        // Проверяем наличие HTML тегов
        expect(section.content).toMatch(/<[^>]+>/)
      })
    })

    it('контент должен содержать списки или заголовки', () => {
      helpContent.ru.forEach((section: HelpSection) => {
        const hasList = section.content.includes('<ul>') || section.content.includes('<ol>')
        const hasHeading = section.content.includes('<h4>') || section.content.includes('<h3>')
        const hasParagraph = section.content.includes('<p>')
        
        // Хотя бы один из элементов должен присутствовать
        expect(hasList || hasHeading || hasParagraph).toBe(true)
      })
    })
  })

  describe('Content validation - English', () => {
    it('должен содержать секцию quick start', () => {
      const quickstart = helpContent.en.find((s: HelpSection) => s.id === 'quickstart')
      
      expect(quickstart).toBeDefined()
      expect(quickstart?.title).toBeDefined()
    })

    it('должен содержать секцию tabs', () => {
      const tabs = helpContent.en.find((s: HelpSection) => s.id === 'tabs')
      
      expect(tabs).toBeDefined()
      expect(tabs?.title).toBeDefined()
    })

    it('контент должен быть на английском языке', () => {
      // Проверяем несколько секций на наличие английских слов
      const sampleSections = helpContent.en.slice(0, 3)
      
      sampleSections.forEach((section: HelpSection) => {
        // Английский текст обычно содержит распространенные слова
        const hasEnglishWords = /the|and|or|is|are|to|for/i.test(section.content)
        expect(hasEnglishWords).toBe(true)
      })
    })
  })

  describe('Icons validation', () => {
    it('все иконки должны иметь допустимые имена', () => {
      helpContent.ru.forEach((section: HelpSection) => {
        expect(section.icon).toBeTruthy()
        expect(section.icon.length).toBeGreaterThan(0)
        // Иконки не должны содержать пробелов
        expect(section.icon).not.toMatch(/\s/)
      })
    })

    it('иконки должны совпадать между языками для одинаковых секций', () => {
      helpContent.ru.forEach((ruSection: HelpSection) => {
        const enSection = helpContent.en.find((s: HelpSection) => s.id === ruSection.id)
        
        expect(enSection).toBeDefined()
        expect(enSection?.icon).toBe(ruSection.icon)
      })
    })
  })

  describe('Content quality', () => {
    it('секции не должны быть пустыми', () => {
      helpContent.ru.forEach((section: HelpSection) => {
        expect(section.title.trim().length).toBeGreaterThan(0)
        expect(section.content.trim().length).toBeGreaterThan(0)
      })
      
      helpContent.en.forEach((section: HelpSection) => {
        expect(section.title.trim().length).toBeGreaterThan(0)
        expect(section.content.trim().length).toBeGreaterThan(0)
      })
    })

    it('контент должен иметь разумную длину', () => {
      helpContent.ru.forEach((section: HelpSection) => {
        // Минимум 50 символов для содержательного контента
        expect(section.content.length).toBeGreaterThan(50)
      })
    })

    it('должен содержать keyboard shortcuts в русском контенте', () => {
      const hasKbdTags = helpContent.ru.some((section: HelpSection) => 
        section.content.includes('<kbd>')
      )
      
      expect(hasKbdTags).toBe(true)
    })

    it('должен содержать code examples', () => {
      const hasCodeTags = helpContent.ru.some((section: HelpSection) => 
        section.content.includes('<code>')
      )
      
      expect(hasCodeTags).toBe(true)
    })
  })

  describe('Specific sections', () => {
    it('секция troubleshooting должна содержать решения проблем', () => {
      const troubleshooting = helpContent.ru.find((s: HelpSection) => 
        s.id === 'troubleshooting' || s.title.toLowerCase().includes('проблем')
      )
      
      if (troubleshooting) {
        expect(troubleshooting.content.length).toBeGreaterThan(100)
      }
    })

    it('должен содержать информацию о настройках', () => {
      const settings = helpContent.ru.find((s: HelpSection) => 
        s.id === 'settings' || s.title.toLowerCase().includes('настройк')
      )
      
      if (settings) {
        expect(settings.content).toBeTruthy()
      }
    })
  })

  describe('Cross-language consistency', () => {
    it('структура контента должна быть похожей между языками', () => {
      helpContent.ru.forEach((ruSection: HelpSection, index: number) => {
        const enSection = helpContent.en[index]
        
        // Оба должны иметь контент схожей длины (±50%)
        const lengthRatio = ruSection.content.length / enSection.content.length
        expect(lengthRatio).toBeGreaterThan(0.5)
        expect(lengthRatio).toBeLessThan(2.0)
      })
    })

    it('количество заголовков должно совпадать', () => {
      helpContent.ru.forEach((ruSection: HelpSection) => {
        const enSection = helpContent.en.find((s: HelpSection) => s.id === ruSection.id)
        
        const ruHeadings = (ruSection.content.match(/<h[3-4]>/g) || []).length
        const enHeadings = (enSection?.content.match(/<h[3-4]>/g) || []).length
        
        expect(ruHeadings).toBe(enHeadings)
      })
    })
  })
})
