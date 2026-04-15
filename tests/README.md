# Тесты Terminal Launcher

## 📋 Структура

```
tests/
├── setup.ts              # Глобальная настройка тестов
├── unit/                 # Unit тесты
│   └── terminalStore.test.ts
└── e2e/                  # E2E тесты
    └── basic.spec.ts
```

## 🚀 Запуск тестов

### Unit тесты (Vitest)

```bash
# Запустить все unit тесты
npm test

# Запустить с UI интерфейсом
npm run test:ui

# Запустить с отчетом coverage
npm run test:coverage
```

### E2E тесты (Playwright)

```bash
# Установить браузеры (только первый раз, ~300MB)
npx playwright install

# Запустить все E2E тесты
npm run test:e2e

# Запустить с UI
npx playwright test --ui

# Открыть отчет
npx playwright show-report
```

## 📝 Написание тестов

### Unit тесты

Unit тесты проверяют отдельные функции и компоненты изолированно.

**Пример:**
```typescript
import { describe, it, expect } from 'vitest'
import { useTerminalStore } from '../../src/store/terminalStore'

describe('Terminal Store', () => {
  it('должен добавлять вкладку', () => {
    const store = useTerminalStore()
    store.addTab()
    expect(store.tabs.length).toBeGreaterThan(0)
  })
})
```

**Что тестировать:**
- ✅ Store (terminalStore.ts) - логика управления состоянием
- ✅ i18n.ts - корректность переводов
- ✅ Utility функции
- ✅ Composables

### E2E тесты

E2E тесты проверяют работу приложения целиком через браузер.

**Пример:**
```typescript
import { test, expect } from '@playwright/test'

test('кнопка добавления вкладки работает', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await page.click('.add-tab')
  
  const tabs = await page.locator('.tab-item').count()
  expect(tabs).toBeGreaterThan(0)
})
```

**Что тестировать:**
- ✅ Загрузка приложения
- ✅ Создание/удаление вкладок
- ✅ Выполнение команд
- ✅ Переключение языка
- ✅ Drag-and-drop

## 🔧 Конфигурация

### Vitest (vitest.config.ts)
- Environment: jsdom (эмуляция браузера)
- Coverage provider: v8
- Global APIs: включены

### Playwright (playwright.config.ts)
- Браузеры: Chromium (Firefox и WebKit закомментированы, можно добавить позже)
- Автостарт dev сервера
- Скриншоты при ошибках
- Trace viewer для отладки
- Увеличенные таймауты для стабильности

## 📊 Текущий статус

### Unit тесты ✅
- **84 теста** проходят успешно (6 файлов)
- Покрытие:
  - terminalStore: создание, удаление, переименование вкладок, управление командами (7 тестов)
  - terminalStore advanced: edge cases, множественные операции, консистентность (16 тестов)
  - i18n: переводы, смена языка, шаблоны, composable (17 тестов)
  - useToast: уведомления success/error/info/warning (6 тестов)
  - types: интерфейсы Command, TerminalTab, SessionData, AppSettings (15 тестов)
  - helpContent: структура справки, валидация контента, кросс-языковая проверка (23 теста)
- Запуск: `npm test`

### E2E тесты ✅
- **6 тестов** проходят успешно (Chromium)
- Проверка:
  - Загрузка приложения
  - Наличие вкладок по умолчанию
  - Добавление новой вкладки
  - Переключение языка (RU ↔ EN)
  - Добавление команд (модальное окно)
  - Удаление вкладок
- Запуск: `npm run test:e2e -- --project=chromium`

## 📊 Coverage отчет

После запуска `npm run test:coverage` откройте:
```
coverage/index.html
```

## 💡 Советы

1. **Пишите тесты для критичного функционала** - store, основные компоненты
2. **Используйте моки** для electronAPI (уже настроено в setup.ts)
3. **E2E тесты медленнее** - используйте их для интеграционных проверок
4. **Запускайте тесты часто** - ловите баги раньше
5. **Смотрите trace viewer** при падении E2E тестов для отладки

## 🐛 Отладка

### Unit тесты
```bash
# Запустить конкретный тест
npm test terminalStore.test.ts

# Watch mode (автоперезапуск при изменениях)
npm test -- --watch
```

### E2E тесты
```bash
# Запустить в headed режиме (видеть браузер)
npx playwright test --headed

# Запустить один тест
npx playwright test basic.spec.ts

# Debug mode
npx playwright test --debug
```

## 📚 Ресурсы

- [Vitest Docs](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Playwright Docs](https://playwright.dev/)
