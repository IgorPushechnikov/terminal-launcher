# Настройка SourceCraft Sites

Это руководство поможет опубликовать статический сайт для Terminal Launcher на SourceCraft Sites.

---

## 🌐 Что такое SourceCraft Sites?

SourceCraft Sites - бесплатный хостинг статических сайтов с:
- ✅ Автоматическим HTTPS
- ✅ Автообновлением при push
- ✅ URL: `https://<org>.sourcecraft.site/<repo>`

---

## ⚠️ Важные требования

1. **Репозиторий должен быть ПУБЛИЧНЫМ**
2. **Организация должна быть ПУБЛИЧНОЙ**
3. Только статические файлы (HTML/CSS/JS)

---

## 🔧 Настройка шаг за шагом

### Шаг 1: Проверьте видимость репозитория

Если репозиторий приватный:
1. Откройте репозиторий на SourceCraft
2. Settings → General → Visibility
3. Измените на **Public**
4. Сохраните

Или создайте новую публичную организацию.

### Шаг 2: Создайте персональный токен (PAT)

1. Откройте https://sourcecraft.dev
2. Profile → Settings → Personal Access Tokens
3. Нажмите **Generate new token**
4. Дайте название: "Sites Deployment"
5. Скопируйте токен (покажете только один раз!)

### Шаг 3: Проверьте конфигурацию

Файл `.sourcecraft/sites.yaml` уже создан:

```yaml
site:
  root: "docs/site"    # Папка с файлами сайта
  ref: "main"          # Ветка для публикации
```

Файл сайта: `docs/site/index.html` ✅

### Шаг 4: Активируйте Sites

1. Откройте репозиторий на SourceCraft
2. Перейдите в **Settings** → **Sites** или **Static Sites**
3. Нажмите **Enable Sites** или **Activate**
4. SourceCraft автоматически обнаружит `.sourcecraft/sites.yaml`

### Шаг 5: Проверьте публикацию

Через 2-5 минут сайт будет доступен по адресу:

```
https://<ваша_организация>.sourcecraft.site/terminal-launcher
```

Например:
```
https://ipushechnikov.sourcecraft.site/terminal-launcher
```

---

## 🎨 Что включено в сайт

### Лендинг страница (`docs/site/index.html`):

- ✨ Современный дизайн с градиентом
- 📱 Адаптивная вёрстка (mobile-friendly)
- 🚀 Описание возможностей приложения
- 📥 Ссылки на скачивание
- 🔗 Ссылки на GitHub и документацию
- 🎯 Призыв к действию (CTA buttons)

### Разделы сайта:

1. **Hero section** - Главный экран с названием и описанием
2. **Features** - 6 карточек с возможностями
3. **Platforms** - Поддерживаемые платформы
4. **Footer** - Ссылки и контакты

---

## 🔄 Автообновление сайта

После активации Sites:

```bash
# Внесите изменения в docs/site/index.html
git add docs/site/index.html
git commit -m "Update landing page"
git push origin main

# → Сайт обновится автоматически через 2-5 минут!
```

---

## 🛠️ Кастомизация сайта

### Изменить дизайн

Редактируйте `docs/site/index.html`:

```html
<!-- Изменить цвета -->
<style>
    body {
        background: linear-gradient(135deg, #YOUR_COLOR_1, #YOUR_COLOR_2);
    }
</style>
```

### Добавить разделы

Добавьте новый блок в HTML:

```html
<div class="feature-card">
    <div class="feature-icon">🆕</div>
    <h3>Новая возможность</h3>
    <p>Описание новой функции</p>
</div>
```

### Использовать генератор сайтов

Если хотите использовать VitePress/Docusaurus:

```bash
# Установите генератор
npm install -D vitepress

# Создайте документацию
npx vitepress init docs

# Соберите сайт
npm run docs:build

# Скопируйте в папку site
cp -r docs/.vitepress/dist/* docs/site/

# Запушьте
git add docs/site/
git commit -m "Update site with VitePress"
git push origin main
```

---

## 📊 Структура файлов

```
terminal-launcher/
├── .sourcecraft/
│   └── sites.yaml          # Конфигурация Sites
└── docs/
    └── site/
        ├── index.html      # Главная страница
        ├── style.css       # (опционально) Стили
        └── assets/         # (опционально) Картинки, шрифты
```

---

## ❓ Решение проблем

### Проблема: Сайт не публикуется

**Причина 1:** Репозиторий приватный
**Решение:** Сделайте репозиторий публичным

**Причина 2:** Файл `.sourcecraft/sites.yaml` не найден
**Решение:** Убедитесь что файл в основной ветке (main/master)

**Причина 3:** Sites не активирован
**Решение:** Включите Sites в настройках репозитория

### Проблема: Сайт не обновляется

**Решение:**
1. Подождите 5 минут (кэширование)
2. Очистите кэш браузера (Ctrl+F5)
3. Проверьте логи в SourceCraft CI/CD

### Проблема: 404 ошибка

**Причина:** Неправильный путь в `sites.yaml`
**Решение:**
```yaml
site:
  root: "docs/site"  # Убедитесь что путь правильный
  ref: "main"        # И ветка существует
```

Проверьте что файл существует:
```bash
ls docs/site/index.html
```

### Проблема: Сайт выглядит сломанным

**Причина:** CSS/JS файлы не загружаются
**Решение:** Используйте относительные пути:

```html
<!-- Правильно -->
<link rel="stylesheet" href="style.css">

<!-- Неправильно -->
<link rel="stylesheet" href="/style.css">
```

---

## 💡 Советы

### 1. Добавьте favicon

```html
<head>
    <link rel="icon" href="favicon.ico" type="image/x-icon">
</head>
```

### 2. SEO оптимизация

```html
<head>
    <meta name="description" content="Terminal Launcher - многооконный терминал">
    <meta name="keywords" content="terminal, emulator, electron">
    <meta property="og:title" content="Terminal Launcher">
    <meta property="og:image" content="screenshot.png">
</head>
```

### 3. Аналитика

Добавьте Google Analytics или Яндекс.Метрику для отслеживания посещений.

### 4. Мультиязычность

Создайте отдельные страницы:
- `docs/site/index.html` - Russian
- `docs/site/en/index.html` - English

И добавьте переключатель языка.

---

## 🆚 Сравнение с другими платформами

| Платформа | URL | HTTPS | Auto-deploy | Limits |
|-----------|-----|-------|-------------|--------|
| **SourceCraft Sites** | `<org>.sourcecraft.site/<repo>` | ✅ Auto | ✅ Auto | Не указано |
| **GitHub Pages** | `<user>.github.io/<repo>` | ✅ Auto | ✅ Auto | 1GB, 100GB/mo |
| **GitVerse Pages** | `<user>.gitverse.ru/<repo>` | ❓ | ❓ | ❓ |

---

## 🎯 Итог

**Преимущества SourceCraft Sites:**
- ✅ Бесплатно
- ✅ Автоматический HTTPS
- ✅ Простая настройка
- ✅ Автообновление

**Недостатки:**
- ⚠️ Только публичные репозитории
- ⚠️ Молодая платформа (может быть нестабильна)

**Рекомендация:**
Используйте вместе с GitHub Pages для резервирования!

---

<div align="center">

**SourceCraft Sites настроен! Ваш сайт скоро будет доступен! 🚀**

</div>
