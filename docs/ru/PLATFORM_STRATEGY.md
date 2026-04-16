# 📋 Стратегия мультиплатформенной разработки

Этот документ описывает оптимальную стратегию работы с тремя платформами: GitHub, SourceCraft и GitVerse.

---

## 🎯 Архитектура репозиториев

```
┌─────────────────────────────────────────────┐
│         Ваш ПК (Локальная разработка)        │
│                                              │
│  • Разработка кода                           │
│  • Тестирование                              │
│  • Локальные сборки                          │
└──────────────┬──────────────────────────────┘
               │ git push
               ▼
┌─────────────────────────────────────────────┐
│          GitHub (Primary)                    │
│                                              │
│  • Основной репозиторий                      │
│  • Международная аудитория                   │
│  • CI/CD для macOS builds                    │
│  • Issues & PRs                              │
└──┬──────────────────────┬───────────────────┘
   │                      │
   │ Встроенное           │ GitHub Actions
   │ зеркалирование       │ workflow
   ▼                      ▼
┌──────────────┐    ┌──────────────┐
│ SourceCraft  │    │   GitVerse   │
│              │    │              │
│ • Mirror     │    │ • Mirror     │
│ • RU audience│    │ • RU audience│
│ • 2GB artifacts│  │ • 4GB releases│
│ • 1000 min   │    │ • 1000 min   │
└──────────────┘    └──────────────┘
```

---

## 📊 Сравнение платформ

### GitHub
- **Роль**: Primary repository
- **Аудитория**: Международная
- **Хранилище**: Неограниченно (публичные), 500MB артефакты
- **CI/CD**: 2000 мин/мес (бесплатно)
- **Особенности**: 
  - Единственная платформа для macOS builds
  - Лучшая интеграция с инструментами
  - Largest community

### SourceCraft
- **Роль**: Mirror + Russian audience
- **Аудитория**: Россия/СНГ
- **Хранилище**: 2GB Git, 2GB LFS, 2GB артефакты
- **CI/CD**: 1000 мин/мес, 5 параллельных задач
- **Особенности**:
  - ✅ **Встроенное зеркалирование из GitHub**
  - Яндекс Cloud инфраструктура
  - Санкционно устойчивая платформа

### GitVerse
- **Роль**: Mirror + Releases storage
- **Аудитория**: Россия/СНГ
- **Хранилище**: Неограниченно Git, 2GB LFS, 4GB релизы ⭐
- **CI/CD**: 1000 мин/мес
- **Особенности**:
  - ❓ Встроенное зеркалирование (нужно проверить)
  - **4GB для релизов** (лучше чем GitHub 500MB)
  - GigaIDE Cloud интеграция

---

## 🔄 Стратегия синхронизации

### Автоматическая синхронизация

#### SourceCraft
- **Метод**: Встроенное зеркалирование
- **Настройка**: Через UI SourceCraft
- **Частота**: Автоматически при push в GitHub
- **Действия**: Никаких (работает само)

#### GitVerse
- **Метод**: GitHub Actions workflow
- **Файл**: `.github/workflows/sync-mirrors.yml`
- **Частота**: При каждом push в main/master
- **Действия**: 
  1. Добавить секрет `GITVERSE_TOKEN` в GitHub
  2. Workflow автоматически пушит в GitVerse

### Ручная синхронизация (fallback)

Если автоматическая не работает:

```bash
# Windows
scripts\sync-repos.bat all

# Linux/macOS
./scripts/sync-repos.sh all
```

---

## 🏗️ Стратегия сборок

### macOS Builds
- **Где**: GitHub Actions
- **Почему**: Только macOS runner может собрать .dmg/.zip для Mac
- **Триггер**: Push тега версии (`v*`)
- **Результат**: GitHub Releases

### Windows Builds
- **Где**: Локально на вашем ПК
- **Почему**: Быстрее, контроль, не тратит CI/CD минуты
- **Команда**: `npm run electron:build:win`
- **Публикация**: 
  - GitVerse Releases (4GB место)
  - Yandex Disk (для больших файлов)
  - Опционально: GitHub Releases

### Linux Builds
- **Где**: Локально или SourceCraft/GitVerse CI/CD
- **Почему**: Можно собрать везде
- **Команда**: `npm run electron:build:linux`
- **Публикация**: GitVerse Releases (предпочтительно)

---

## 📝 Стратегия документации

### Мультиязычность

```
terminal-launcher/
├── README.md              # English (primary)
├── README_RU.md           # Russian
├── MULTI_REPO_SYNC.md     # English sync guide
├── docs/
│   ├── en/                # English docs
│   │   └── ...
│   └── ru/                # Russian docs
│       ├── MULTI_REPO_SETUP.md
│       ├── SETUP_REMOTES.md
│       ├── AUTO_SYNC_SETUP.md
│       └── PLATFORM_STRATEGY.md (этот файл)
```

### Правила обновления

1. **Основной язык**: English (README.md)
2. **Русская версия**: Обновляется одновременно с английской
3. **Platform-specific**: Отдельные файлы для каждой платформы
4. **Синхронизация**: Оба языка в каждом репозитории (зеркалируются)

---

## ⚙️ CI/CD Strategy

### GitHub Actions Workflows

#### 1. Build macOS Release
- **Файл**: `.github/workflows/build-release.yml`
- **Триггер**: Push тега `v*`
- **Задача**: Сборка macOS (.dmg, .zip)
- **Результат**: GitHub Releases

#### 2. Sync to GitVerse
- **Файл**: `.github/workflows/sync-mirrors.yml`
- **Триггер**: Push в main/master
- **Задача**: Синхронизация кода в GitVerse
- **Результат**: GitVerse обновлён

### SourceCraft CI/CD
- **Использование**: Тестирование, линтинг
- **Минуты**: 1000 мин/мес
- **Примеры задач**:
  - `npm test`
  - `npm run lint`
  - Проверка типов TypeScript

### GitVerse CI/CD
- **Использование**: Дополнительные проверки, деплой
- **Минуты**: 1000 мин/мес
- **Примеры задач**:
  - Сборка Linux
  - Запуск тестов
  - Деплой на staging

---

## 💾 Стратегия хранения артефактов

### GitHub Releases
- **Что хранить**: macOS builds
- **Лимит**: Unlimited (публичные репо)
- **URL**: `https://github.com/IgorPushechnikov/terminal-launcher/releases`

### GitVerse Releases
- **Что хранить**: Windows & Linux builds
- **Лимит**: 4 GB ⭐
- **URL**: `https://gitverse.ru/ipushechnikov/terminal-launcher/releases`

### SourceCraft Artifacts
- **Что хранить**: Тестовые сборки, CI outputs
- **Лимит**: 2 GB
- **Использование**: Временное хранение

### Yandex Disk (опционально)
- **Что хранить**: Большие файлы, архивы старых версий
- **Лимит**: 10 GB (бесплатно)
- **Использование**: Долгосрочный архив

---

## 🔐 Безопасность

### Секреты и токены

#### GitHub Secrets
- `GITVERSE_TOKEN`: Токен для push в GitVerse
- `GH_TOKEN`: Для создания релизов (автоматически)

#### Хранение токенов
- ✅ GitHub Secrets (encrypted)
- ✅ Environment variables
- ❌ Никогда не коммитьте токены в код!

### SSH ключи (рекомендуется)

Для более безопасной аутентификации:

```bash
# Генерация SSH ключа
ssh-keygen -t ed25519 -C "ipush@bk.ru"

# Добавление на платформы
# GitHub: Settings → SSH and GPG keys
# SourceCraft: Profile → SSH Keys
# GitVerse: Profile → SSH Keys
```

---

## 📈 Мониторинг и аналитика

### Что отслеживать

1. **GitHub**:
   - Stars, forks, watchers
   - Downloads из Releases
   - Issues и PRs

2. **SourceCraft**:
   - Звёзды
   - Скачивания
   - Использование CI/CD минут

3. **GitVerse**:
   - Звёзды
   - Скачивания из Releases
   - Использование хранилища

### Инструменты

- GitHub Insights (встроенная аналитика)
- SourceCraft Analytics (если доступно)
- GitVerse Statistics (если доступно)
- Google Analytics (для сайта/документации)

---

## 🚀 Рабочий процесс разработчика

### Ежедневная разработка

```bash
# 1. Вносим изменения
git add .
git commit -m "Feature: description"

# 2. Пушим в GitHub (primary)
git push origin main

# 3. Автоматическая синхронизация:
#    - SourceCraft: встроенное зеркалирование
#    - GitVerse: GitHub Actions workflow

# 4. Проверяем статус
#    GitHub Actions tab → Sync to GitVerse Mirror
```

### Создание релиза

```bash
# 1. Обновляем версию
npm version minor  # или patch, major

# 2. Пушим версию и тег
git push origin main
git push origin v2.1.0

# 3. GitHub Actions автоматически:
#    - Собирает macOS build
#    - Создаёт GitHub Release
#    - Синхронизирует код в GitVerse

# 4. Собираем Windows/Linux локально
npm run electron:build:win
npm run electron:build:linux

# 5. Загружаем в GitVerse Releases
#    (через web interface или API)
```

---

## 🛠️ Настройка нового окружения

### Для нового разработчика

```bash
# 1. Клонируем из GitHub
git clone https://github.com/IgorPushechnikov/terminal-launcher.git
cd terminal-launcher

# 2. Устанавливаем зависимости
npm install

# 3. Настраиваем remote (опционально)
git remote add sourcecraft https://sourcecraft.dev/ipushechnikov/terminal-launcher.git
git remote add gitverse https://gitverse.ru/ipushechnikov/terminal-launcher.git

# 4. Запускаем в режиме разработки
npm run dev
```

---

## ❓ FAQ

### Q: Почему три платформы?
**A**: 
- GitHub: международная видимость, экосистема
- SourceCraft: санкционная устойчивость, российская аудитория
- GitVerse: большое хранилище для релизов (4GB)

### Q: Что если одна платформа упадёт?
**A**: Код доступен на двух других платформах. Данные не потеряны.

### Q: Нужно ли платить за что-то?
**A**: Нет, все три платформы имеют бесплатные планы с достаточными лимитами.

### Q: Как часто синхронизируются репозитории?
**A**: 
- SourceCraft: автоматически (встроенное зеркалирование)
- GitVerse: при каждом push в GitHub (через Actions)

### Q: Можно ли использовать только одну платформу?
**A**: Да, но теряются преимущества резервирования и мультиязычной аудитории.

---

## 📚 Дополнительные ресурсы

- [Multi-Repo Setup Guide](MULTI_REPO_SETUP.md) - Подробная настройка
- [Auto Sync Setup](AUTO_SYNC_SETUP.md) - Настройка GitHub Actions
- [Setup Remotes](SETUP_REMOTES.md) - Быстрая настройка remote
- [GitHub Docs](https://docs.github.com/)
- [SourceCraft Docs](https://sourcecraft.dev/portal/docs/ru/)
- [GitVerse Docs](https://gitverse.ru/docs/)

---

<div align="center">

**Стратегия оптимизирована для надёжности и эффективности! 🚀**

Made with ❤️ for multi-platform development

</div>
