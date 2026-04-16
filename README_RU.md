# Terminal Launcher

<div align="center">

![Версия](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Лицензия](https://img.shields.io/badge/license-MIT-green.svg)
![Платформа](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![Vue](https://img.shields.io/badge/Vue-3.5-brightgreen.svg)
![Electron](https://img.shields.io/badge/Electron-41.2-47848F.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)

**Многооконный терминальный эмулятор с поддержкой рабочих пространств, управлением сессиями и кроссплатформенностью**

[Скачать](#-установка) • [Возможности](#-возможности) • [Документация](#-документация) • [Разработка](#-разработка) • [Участие](#-участие-в-проекте)

</div>

---

## 📸 Скриншоты

> *Добавьте скриншоты приложения здесь*

## ✨ Возможности

- 🚀 **Множество вкладок** - Работайте с несколькими терминалами одновременно
- 💾 **Автосохранение сессий** - Ваше состояние автоматически сохраняется при закрытии
- 📁 **Поддержка рабочих пространств** - Изолированные настройки для каждого проекта (как в VSCode)
- 🎨 **Тёмная и светлая темы** - Переключение между темами одним кликом
- 📋 **Библиотека команд** - Сохраняйте и организуйте часто используемые команды
- 🔍 **Поиск по терминалу** - Быстрый поиск по выводу терминала
- 📊 **Логирование** - Автоматическое логирование всех сессий терминала
- 🌍 **Кроссплатформенность** - Работает на Windows, macOS и Linux
- 📦 **Портативная версия** - Не требует установки, запускается с USB
- 🔄 **Импорт/Экспорт сессий** - Делитесь конфигурациями с командой

## 🚀 Быстрый старт

### Для пользователей

1. **Скачайте** последнюю версию из [Releases](https://github.com/IgorPushechnikov/terminal-launcher/releases)
2. **Установите** или распакуйте портативную версию
3. **Запустите** приложение
4. **Начните работу** - первая вкладка создаётся автоматически

### Для разработчиков

```bash
# Клонируйте репозиторий
git clone https://github.com/IgorPushechnikov/terminal-launcher.git
cd terminal-launcher

# Установите зависимости
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для вашей платформы
npm run electron:build
```

## 📖 Документация

Подробная документация доступна в следующих разделах:

- **[Руководство пользователя](docs/ru/user-guide.md)** - Как использовать все функции
- **[Руководство разработчика](docs/ru/developer-guide.md)** - Архитектура и разработка
- **[FAQ](docs/ru/faq.md)** - Часто задаваемые вопросы
- **[Changelog](CHANGELOG_RU.md)** - История изменений

## 🏗️ Архитектура

Приложение построено на современном стеке технологий:

- **Frontend**: Vue 3 + TypeScript + Vite
- **Desktop**: Electron 41.2
- **State Management**: Pinia
- **Terminal**: node-pty (нативные pty процессы)
- **Database**: SQLite (через better-sqlite3)
- **UI Components**: Radix Vue + Tailwind CSS

### Структура проекта

```
terminal-launcher/
├── src/
│   ├── main.ts              # Главный процесс Electron
│   ├── preload.ts           # Preload скрипт
│   ├── renderer/            # Рендерер процесс (Vue app)
│   │   ├── App.vue
│   │   ├── components/      # Vue компоненты
│   │   ├── stores/          # Pinia stores
│   │   └── services/        # Бизнес-логика
│   └── electron/            # Модули Electron
│       ├── handlers/        # IPC обработчики
│       └── utils/           # Утилиты
├── docs/
│   ├── en/                  # English documentation
│   └── ru/                  # Russian documentation
├── public/                  # Статические файлы
└── build/                   # Конфигурации сборки
```

## 🌐 Мультиязычность

Этот проект поддерживает несколько языков:

- 🇬🇧 **English** - [README.md](README.md)
- 🇷🇺 **Русский** - [README_RU.md](README_RU.md) (этот файл)

Документация также доступна на обоих языках в папке `docs/`.

## 🤝 Участие в проекте

Мы приветствуем вклад в развитие проекта! Пожалуйста, прочитайте:

- [Contributing Guide](CONTRIBUTING_RU.md) - Как внести свой вклад
- [Code of Conduct](CODE_OF_CONDUCT_RU.md) - Кодекс поведения

### Процесс внесения изменений

1. Форкните репозиторий
2. Создайте ветку для вашей функции (`git checkout -b feature/amazing-feature`)
3. Внесите изменения
4. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
5. Отправьте в ветку (`git push origin feature/amazing-feature`)
6. Откройте Pull Request

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. См. файл [LICENSE](LICENSE) для деталей.

## 👨‍💻 Автор

**Igor Pushechnikov**

- GitHub: [@IgorPushechnikov](https://github.com/IgorPushechnikov)
- Email: ipush@bk.ru
- VK: [vk.com/ipushechnikov](https://vk.com/ipushechnikov)
- Telegram: [@ipushechnikov](https://t.me/ipushechnikov)

## 🙏 Благодарности

- [Electron](https://www.electronjs.org/) - Кроссплатформенная desktop платформа
- [Vue.js](https://vuejs.org/) - Прогрессивный JavaScript фреймворк
- [node-pty](https://github.com/microsoft/node-pty) - Нативные pty процессы
- [Vite](https://vitejs.dev/) - Быстрый инструмент сборки

---

<div align="center">

**⭐ Если вам нравится этот проект, поставьте звезду!**

Made with ❤️ in Russia

</div>
