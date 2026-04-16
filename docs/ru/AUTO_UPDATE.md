# Auto-Update System / Система Автообновления

## Overview / Обзор

Terminal Launcher теперь поддерживает автоматические обновления через GitHub Releases. Приложение проверяет наличие новых версий и предлагает пользователю скачать и установить их.

---

## How It Works / Как Это Работает

### 1. Автоматическая проверка (Automatic Check)
- При запуске приложения (через 5 секунд после старта)
- Проверяет GitHub Releases на наличие новой версии
- Сравнивает с текущей версией из package.json

### 2. Уведомление пользователя (User Notification)
- Если обновление доступно - появляется уведомление в правом верхнем углу
- Показывает номер версии и примечания к релизу
- Пользователь может скачать обновление

### 3. Скачивание (Download)
- Пользователь нажимает "Скачать" / "Download"
- Показывается прогресс скачивания
- Файл сохраняется во временную директорию

### 4. Установка (Installation)
- После скачивания кнопка меняется на "Установить и перезапустить"
- При нажатии приложение закрывается и устанавливает обновление
- После установки приложение перезапускается автоматически

---

## Technical Details / Технические Детали

### Dependencies / Зависимости
```json
{
  "electron-updater": "^6.x.x"
}
```

### Configuration / Конфигурация

**package.json:**
```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "IgorPushechnikov",
      "repo": "terminal-launcher",
      "releaseType": "release"
    }
  }
}
```

### Main Process / Основной Процесс

Файл: `electron/main.ts`

- Инициализация `autoUpdater`
- Обработчики событий (events):
  - `checking-for-update` - Проверка обновлений
  - `update-available` - Обновление доступно
  - `update-not-available` - Обновлений нет
  - `download-progress` - Прогресс скачивания
  - `update-downloaded` - Скачивание завершено
  - `error` - Ошибка

IPC Handlers:
- `check-for-updates` - Ручная проверка
- `download-update` - Скачать обновление
- `install-update` - Установить и перезапустить

### Renderer Process / Процесс Отрисовки

Файл: `src/components/UI/UpdateNotification.vue`

Компонент уведомлений:
- Отображает информацию об обновлении
- Показывает прогресс скачивания
- Кнопки действий (скачать, установить, закрыть)

### Type Definitions / Определения Типов

Файл: `src/types/electron.d.ts`

Добавлены методы для работы с обновлениями:
```typescript
checkForUpdates(): Promise<{ success: boolean; error?: string }>
downloadUpdate(): Promise<{ success: boolean; error?: string }>
installUpdate(): Promise<{ success: boolean }>
onUpdateAvailable(callback): void
onUpdateDownloadProgress(callback): void
// ... и другие
```

---

## User Flow / Поток Пользователя

```
┌─────────────────────┐
│  App запускается    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Через 5 сек:        │
│ Проверка обновлений │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
  Есть       Нет
обновление  обновлений
     │           │
     ▼           ▼
┌──────────┐  ┌──────────────┐
│Показать  │  │Ничего не     │
│уведомле- │  │показывать    │
│ние       │  └──────────────┘
└────┬─────┘
     │
     ▼
┌──────────────┐
│Пользователь  │
│нажимает      │
│"Скачать"     │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│Скачивание    │
│(показан      │
│прогресс)     │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│Кнопка меняется│
│на            │
│"Установить"  │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│Пользователь  │
│нажимает      │
│"Установить"  │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│App закрыва-  │
│ется, устанав-│
│ливает об-    │
│новление,     │
│перезапускает-│
│ся            │
└──────────────┘
```

---

## Creating Releases / Создание Релизов

### Step 1: Update Version / Обновить Версию

```bash
# В package.json изменить версию
{
  "version": "2.0.1"  # было "2.0.0"
}
```

### Step 2: Build for All Platforms / Собрать Все Платформы

```bash
npm run electron:build:win
npm run electron:build:mac
npm run electron:build:linux
```

Или все сразу:
```bash
npm run electron:build:all
```

### Step 3: Create Git Tag / Создать Тег

```bash
git add .
git commit -m "Release v2.0.1 - Bug fixes and improvements"
git tag -a v2.0.1 -m "Terminal Launcher v2.0.1

Key changes:
- Fixed terminal resize issues
- Improved auto-save reliability
- Added auto-update system
- Updated dependencies"
git push origin main --tags
```

### Step 4: Upload to GitHub / Загрузить на GitHub

GitHub Actions автоматически создаст Release и загрузит артефакты.

Или вручную:
1. Перейти в https://github.com/IgorPushechnikov/terminal-launcher/releases
2. Нажать "Draft a new release"
3. Выбрать тег v2.0.1
4. Загрузить файлы:
   - Terminal-Launcher-2.0.1-Setup.exe
   - Terminal-Launcher-2.0.1-Portable.exe
   - Terminal-Launcher-2.0.1.dmg (macOS)
   - Terminal-Launcher-2.0.1.AppImage (Linux)
5. Добавить описание релиза
6. Нажать "Publish release"

---

## Testing / Тестирование

### Local Testing / Локальное Тестирование

В режиме разработки автообновление отключено:
```typescript
if (!app.isPackaged) {
  console.log('[MAIN] Dev mode - autoUpdater disabled');
  return;
}
```

Для тестирования нужно собрать production версию:
```bash
npm run electron:build:win
```

Затем запустить собранный .exe файл.

### Force Update Check / Принудительная Проверка

Можно добавить кнопку в UI для ручной проверки:
```typescript
const checkUpdates = async () => {
  const result = await window.electronAPI.checkForUpdates()
  console.log('Check result:', result)
}
```

---

## Troubleshooting / Решение Проблем

### Problem: Update Not Detected / Обновление Не Обнаружено

**Possible Causes:**
1. GitHub Release не опубликован (draft)
2. Неправильный тег (должен быть формата vX.Y.Z)
3. Нет файлов релиза (.exe, .dmg, etc.)

**Solution:**
- Проверить что Release опубликован (не draft)
- Проверить формат тега
- Убедиться что файлы загружены

### Problem: Download Fails / Скачивание Не Работает

**Possible Causes:**
1. Нет доступа к интернету
2. Firewall блокирует
3. GitHub API недоступен

**Solution:**
- Проверить подключение к интернету
- Проверить настройки firewall
- Попробовать позже

### Problem: Install Fails / Установка Не Работает

**Possible Causes:**
1. Нет прав администратора
2. Антивирус блокирует
3. Файл поврежден

**Solution:**
- Запустить от имени администратора
- Добавить в исключения антивируса
- Перекачать обновление

---

## Security / Безопасность

### Code Signing / Подпись Кода

Для повышения доверия пользователей рекомендуется подписать код:

**Windows:**
```json
{
  "build": {
    "win": {
      "certificateFile": "cert.pfx",
      "certificatePassword": "${CERT_PASSWORD}"
    }
  }
}
```

**macOS:**
```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Your Name (TEAM_ID)",
      "hardenedRuntime": true,
      "gatekeeperAssess": false
    }
  }
}
```

### Integrity Checks / Проверка Целостности

electron-updater автоматически проверяет:
- Контрольные суммы файлов
- Подписи (если есть)
- Целостность загрузки

---

## Future Improvements / Будущие Улучшения

1. **Manual Check Button** - Кнопка "Проверить обновления" в настройках
2. **Changelog Viewer** - Просмотр changelog перед скачиванием
3. **Deferred Updates** - Возможность отложить обновление
4. **Beta Channel** - Канал бета-тестирования
5. **Rollback** - Возможность откатить обновление
6. **Silent Updates** - Тихие обновления в фоновом режиме

---

## Files Modified / Измененные Файлы

- ✅ `package.json` - Добавлен electron-updater и publish config
- ✅ `electron/main.ts` - Логика автообновления
- ✅ `electron/preload.ts` - IPC bridge для обновлений
- ✅ `src/types/electron.d.ts` - TypeScript типы
- ✅ `src/components/UI/UpdateNotification.vue` - Компонент уведомлений
- ✅ `src/App.vue` - Интеграция компонента
- ✅ `src/i18n.ts` - Переводы

---

**Last Updated:** 2026-04-16  
**Version:** 2.0.0+  
**Maintained by:** Igor Pushechnikov
