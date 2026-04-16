# Настройка статических сайтов (Pages)

Это руководство описывает, как настроить и использовать статические сайты на GitHub, SourceCraft и GitVerse.

---

## 🎯 Зачем нужны статические сайты?

### Преимущества:
- ✅ **Доступная документация** - не нужно клонировать репозиторий
- ✅ **Профессиональный вид** - отдельный сайт для проекта
- ✅ **SEO** - поисковики индексируют сайт
- ✅ **Резервирование** - три копии документации на разных платформах
- ✅ **Мультиязычность** - English на GitHub, Russian на SourceCraft/GitVerse

---

## 📊 Сравнение Pages платформ

| Платформа | URL паттерн | Лимиты | Авто-деплой |
|-----------|-------------|--------|-------------|
| **GitHub Pages** | `username.github.io/repo` | 1GB, 100GB bandwidth | ✅ Через Actions |
| **SourceCraft Pages** | `username.sourcecraft.dev/repo` | В рамках 2GB артефактов | ❓ Нужно настроить |
| **GitVerse Pages** | `username.gitverse.ru/repo` | Не указано | ❓ Нужно настроить |

---

## 🔧 Настройка GitHub Pages

### Вариант 1: Автоматический (через workflow) ⭐ РЕКОМЕНДУЕТСЯ

Workflow `.github/workflows/deploy-docs.yml` автоматически деплоит при:
- Push в ветку `main` с изменениями в `/docs`
- Изменениях `README.md` или `README_RU.md`
- Ручном запуске через Actions tab

**Что делает:**
1. Генерирует простой HTML сайт из документации
2. Деплоит на GitHub Pages
3. Синхронизирует русскую версию в SourceCraft и GitVerse

**URL сайта**: `https://igorpushechnikov.github.io/terminal-launcher/`

### Вариант 2: Ручной (через настройки репозитория)

1. Откройте **Settings** → **Pages**
2. Выберите источник:
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`
3. Нажмите **Save**
4. Сайт будет доступен через 1-2 минуты

### Вариант 3: С генератором документации

Если используете VitePress, Docusaurus или другой генератор:

```bash
# Установите генератор
npm install -D vitepress

# Создайте конфиг docs/.vitepress/config.js
# ...

# Соберите документацию
npm run docs:build

# Задеплойте
npx gh-pages -d docs/.vitepress/dist
```

---

## 🔧 Настройка SourceCraft Pages

### Шаг 1: Проверьте доступность функции

1. Откройте репозиторий на SourceCraft
2. Перейдите в **Settings** → **Pages** или **Static Sites**
3. Если функция есть - продолжайте, если нет - используйте только GitHub Pages

### Шаг 2: Настройте источник

1. Выберите ветку для деплоя: `gh-pages`
2. Или укажите папку: `/docs`
3. Сохраните настройки

### Шаг 3: Автоматический деплой

**Вариант A**: Через GitHub Actions (уже настроено)
- Workflow `deploy-docs.yml` автоматически пушит в SourceCraft
- Требует токен `SOURCECRAFT_TOKEN` в GitHub Secrets

**Вариант B**: Через SourceCraft CI/CD
1. Создайте файл `.sourcecraft/config.yml`:

```yaml
version: 1

pages:
  source: docs/ru
  branch: gh-pages
  auto_deploy: true
  trigger:
    - push:main
    - push:docs/**
```

2. Закоммитьте и запушьте
3. SourceCraft автоматически соберёт и задеплоит сайт

---

## 🔧 Настройка GitVerse Pages

### Шаг 1: Проверьте доступность функции

1. Откройте репозиторий на GitVerse
2. Перейдите в **Settings** → **Pages** или **Статические сайты**
3. Если функция есть - продолжайте

### Шаг 2: Настройте источник

1. Выберите ветку: `gh-pages`
2. Или папку: `/docs`
3. Сохраните

### Шаг 3: Автоматический деплой

**Вариант A**: Через GitHub Actions (уже настроено)
- Workflow `deploy-docs.yml` автоматически пушит в GitVerse
- Требует токен `GITVERSE_TOKEN` в GitHub Secrets

**Вариант B**: Через GitVerse CI/CD
1. Создайте файл `.gitverse/config.yml`:

```yaml
version: 1

pages:
  source: docs/ru
  branch: gh-pages
  auto_deploy: true
  trigger:
    - push:main
    - push:docs/**
```

2. Закоммитьте и запушьте

---

## 🌐 Структура сайта

### GitHub Pages (English)

```
https://igorpushechnikov.github.io/terminal-launcher/
├── index.html          # Главная страница (README.md)
├── docs/
│   ├── user-guide/     # Руководство пользователя
│   ├── developer-guide/# Руководство разработчика
│   └── faq/            # FAQ
└── changelog/          # История изменений
```

### SourceCraft Pages (Russian)

```
https://ipushechnikov.sourcecraft.dev/terminal-launcher/
├── index.html          # Главная страница (README_RU.md)
├── docs/
│   ├── user-guide/     # Руководство пользователя (RU)
│   ├── developer-guide/# Руководство разработчика (RU)
│   └── faq/            # FAQ (RU)
└── changelog/          # История изменений (RU)
```

### GitVerse Pages (Russian)

```
https://ipushechnikov.gitverse.ru/terminal-launcher/
├── index.html          # Главная страница (README_RU.md)
├── docs/
│   ├── user-guide/     # Руководство пользователя (RU)
│   ├── developer-guide/# Руководство разработчика (RU)
│   └── faq/            # FAQ (RU)
└── changelog/          # История изменений (RU)
```

---

## 🚀 Использование workflow deploy-docs.yml

### Автоматический деплой

При каждом push в `main` с изменениями документации:

```bash
git add docs/ru/*.md README_RU.md
git commit -m "Update documentation"
git push origin main
# → Workflow запускается автоматически
# → Через 2-3 минуты сайт обновлён
```

### Ручной деплой

1. Откройте **Actions** → **Deploy Documentation**
2. Нажмите **Run workflow**
3. Выберите ветку (обычно `main`)
4. Нажмите **Run workflow**

### Проверка статуса

1. Откройте вкладку **Actions**
2. Найдите последний запуск **Deploy Documentation**
3. Посмотрите логи каждого job:
   - ✅ Deploy to GitHub Pages
   - 🔄 Deploy to SourceCraft Pages
   - 🔄 Deploy to GitVerse Pages

---

## 🎨 Кастомизация сайта

### Добавление своего дизайна

Если хотите красивый сайт вместо простого HTML:

#### Вариант 1: VitePress (рекомендуется)

```bash
# Установка
npm install -D vitepress

# Инициализация
npx vitepress init docs

# Настройка темы
# docs/.vitepress/config.js

# Локальный просмотр
npm run docs:dev

# Сборка
npm run docs:build
```

#### Вариант 2: Docusaurus

```bash
npx create-docusaurus@latest website classic
# ... настройка ...
npm run build
```

#### Вариант 3: Простой HTML/CSS

Просто создайте красивые HTML файлы в папке `docs/`:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Terminal Launcher</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Ваш контент -->
</body>
</html>
```

---

## 🔍 SEO и аналитика

### Добавление мета-тегов

В `index.html` добавьте:

```html
<meta name="description" content="Multi-tab terminal emulator with workspace support">
<meta name="keywords" content="terminal, emulator, electron, vue, tabs">
<meta property="og:title" content="Terminal Launcher">
<meta property="og:description" content="Modern terminal emulator">
<meta property="og:image" content="https://example.com/screenshot.png">
```

### Google Analytics

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## ❓ Решение проблем

### Проблема: Сайт не обновляется

**Решение:**
1. Проверьте логи workflow в GitHub Actions
2. Убедитесь что ветка `gh-pages` существует
3. Проверьте права доступа к токенам

### Проблема: 404 ошибка на сайте

**Решение:**
1. Подождите 2-3 минуты (кэширование DNS)
2. Очистите кэш браузера
3. Проверьте что файлы действительно задеплоены:
   ```bash
   git checkout gh-pages
   ls -la
   ```

### Проблема: SourceCraft/GitVerse Pages не работает

**Решение:**
1. Проверьте доступна ли функция Pages на платформе
2. Если нет - используйте только GitHub Pages
3. Или настройте свой хостинг (Netlify, Vercel, etc.)

### Проблема: Русская документация не синхронизируется

**Решение:**
1. Проверьте что токены добавлены в GitHub Secrets
2. Проверьте логи job'ов `deploy-sourcecraft-pages` и `deploy-gitverse-pages`
3. Убедитесь что `README_RU.md` и `docs/ru/` существуют

---

## 💡 Советы

### 1. Используйте редиректы

Создайте файл `docs/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=https://igorpushechnikov.github.io/terminal-launcher/">
</head>
</html>
```

### 2. Добавьте поиск

Используйте Algolia DocSearch или Lunr.js для поиска по документации.

### 3. Мультиязычное меню

Добавьте переключатель языка на главную страницу:

```html
<div class="language-switcher">
    <a href="/en/">🇬🇧 English</a> | 
    <a href="/ru/">🇷🇺 Русский</a>
</div>
```

### 4. Бэкапы

Регулярно делайте бэкапы сайта:

```bash
git clone --branch gh-pages https://github.com/IgorPushechnikov/terminal-launcher.git site-backup
```

---

## 📚 Дополнительные ресурсы

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [VitePress Documentation](https://vitepress.dev/)
- [Docusaurus Documentation](https://docusaurus.io/)
- [SourceCraft Documentation](https://sourcecraft.dev/portal/docs/ru/)
- [GitVerse Documentation](https://gitverse.ru/docs/)

---

<div align="center">

**Статические сайты настроены! Ваша документация доступна всему миру! 🌍**

</div>
