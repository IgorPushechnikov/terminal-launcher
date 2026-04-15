# GitHub Actions - Автоматическая сборка и релиз

## 📋 Обзор

Этот workflow автоматически собирает Terminal Launcher для всех платформ (Windows, macOS, Linux) и создаёт GitHub Release при создании тега версии.

---

## 🚀 Как использовать

### Способ 1: Автоматический (рекомендуется)

1. **Закоммитьте изменения:**
   ```bash
   git add .
   git commit -m "chore: prepare v2.0.0 release"
   ```

2. **Создайте тег:**
   ```bash
   git tag -a v2.0.0 -m "Terminal Launcher v2.0.0 - Stability Release"
   ```

3. **Отправьте в GitHub:**
   ```bash
   git push origin main --tags
   ```

4. **GitHub Actions автоматически:**
   - ✅ Соберёт приложение для Windows, macOS, Linux
   - ✅ Создаст GitHub Release с бинарниками
   - ✅ Сгенерирует release notes из CHANGELOG.md

---

### Способ 2: Ручной запуск

1. Перейдите в **Actions** → **Build & Release**
2. Нажмите **Run workflow**
3. Выберите ветку (обычно `main`)
4. Нажмите **Run workflow**

⚠️ **Примечание:** Ручной запуск только собирает артефакты, но не создаёт Release (нужен тег).

---

## 📦 Что собирается

### Windows (windows-latest)
- `Terminal-Launcher-{version}-Setup.exe` - NSIS Installer
- `Terminal-Launcher-{version}-Portable.exe` - Portable version

### macOS (macos-latest)
- `Terminal-Launcher-{version}.dmg` - DMG installer
- `Terminal-Launcher-{version}-mac.zip` - Portable zip

### Linux (ubuntu-latest)
- `Terminal-Launcher-{version}.AppImage` - AppImage
- `Terminal-Launcher-{version}.deb` - Debian package

---

## 🔧 Конфигурация

Workflow находится в: `.github/workflows/build-release.yml`

### Триггеры:
```yaml
on:
  push:
    tags:
      - 'v*'  # Любой тег начинающийся с 'v'
  workflow_dispatch:  # Ручной запуск
```

### Сборка происходит параллельно на 3 платформах:
- Windows: ~5-10 минут
- macOS: ~5-10 минут  
- Linux: ~3-5 минут

### После успешной сборки всех платформ:
- Создаётся GitHub Release
- Все бинарники прикрепляются к релизу
- Release notes генерируются автоматически

---

## 📊 Мониторинг сборки

1. Перейдите в **Actions** таб
2. Выберите последний запуск workflow
3. Смотрите прогресс каждого job:
   - 🟡 Жёлтый - выполняется
   - ✅ Зелёный - успешно
   - ❌ Красный - ошибка

---

## ⚠️ Важные моменты

### 1. Токен GitHub
Workflow использует `GITHUB_TOKEN` (автоматически предоставляется GitHub). Никаких дополнительных секретов не требуется.

### 2. Кэширование зависимостей
Используется `actions/cache` для ускорения последующих сборок через кэширование `node_modules`.

### 3. Артефакты
- Сохраняются на 30 дней
- Доступны для скачивания даже если релиз не создан
- Можно скачать вручную из вкладки Actions

### 4. Draft Release
По умолчанию релиз создаётся сразу опубликованным (`draft: false`).
Для черновика измените на `draft: true`.

---

## 🐛 Решение проблем

### Ошибка: "npm ci failed"
**Причина:** package-lock.json не синхронизирован с package.json

**Решение:**
```bash
npm install
git add package-lock.json
git commit -m "chore: update package-lock.json"
git push
```

### Ошибка: "Build failed on macOS"
**Причина:** Проблемы с нативными модулями (node-pty)

**Решение:** Проверьте логи конкретного job, обычно помогает очистка кэша:
1. Actions → Build & Release
2. Нажмите "..." → "Delete workflow runs"
3. Запустите заново

### Релиз не создался
**Причина:** Теги не были отправлены или workflow не сработал

**Проверка:**
```bash
# Проверьте локальные теги
git tag -l

# Проверьте удалённые теги
git ls-remote --tags origin

# Если тега нет на GitHub
git push origin v2.0.0
```

---

## 🔄 Обновление workflow

Если нужно изменить процесс сборки:

1. Отредактируйте `.github/workflows/build-release.yml`
2. Закоммитьте изменения
3. Следующий релиз будет использовать новую конфигурацию

---

## 📝 Пример полного процесса релиза

```bash
# 1. Обновите версию в package.json
# "version": "2.0.0"

# 2. Обновите CHANGELOG.md
# Добавьте секцию [2.0.0] с описанием изменений

# 3. Закоммитьте всё
git add .
git commit -m "chore: prepare v2.0.0 release"

# 4. Создайте тег
git tag -a v2.0.0 -m "Terminal Launcher v2.0.0 - Stability Release"

# 5. Отправьте
git push origin main --tags

# 6. Подождите 10-15 минут
# GitHub Actions соберёт все платформы и создаст Release

# 7. Проверьте результат
# https://github.com/IgorPushechnikov/terminal-launcher/releases
```

---

## 💡 Советы

1. **Тестируйте локально перед релизом:**
   ```bash
   npm run electron:build:win
   # Проверьте что .exe работает
   ```

2. **Используйте семантическое версионирование:**
   - `v2.0.0` - Major (breaking changes)
   - `v2.1.0` - Minor (new features)
   - `v2.0.1` - Patch (bug fixes)

3. **Пишите хорошие сообщения тегов:**
   ```bash
   git tag -a v2.0.0 -m "Terminal Launcher v2.0.0 - Stability Release
   
   Key changes:
   - Fixed Alt+F4 shutdown issues
   - Fixed theme flash glitches
   - Added comprehensive test suite (90 tests)
   - Improved cross-platform compatibility"
   ```

4. **Мониторьте первую сборку:**
   После push тегов следите за Actions, чтобы убедиться что всё прошло успешно.

---

## 🔗 Полезные ссылки

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [electron-builder Documentation](https://www.electron.build/)
- [Semantic Versioning](https://semver.org/)
- [softprops/action-gh-release](https://github.com/softprops/action-gh-release)

---

**Last Updated:** 2026-04-16  
**Maintained by:** Igor Pushechnikov
