# Настройка мультирепозиторной синхронизации

Этот документ описывает, как настроить и использовать систему синхронизации между GitHub, SourceCraft и GitVerse.

## 📋 Предварительные требования

1. **Git** установлен и настроен
2. **Доступ к трём репозиториям**:
   - GitHub (primary)
   - SourceCraft (mirror)
   - GitVerse (mirror)
3. **SSH ключи** или токены доступа для всех платформ

---

## 🔧 Первоначальная настройка

### Шаг 1: Клонирование основного репозитория

```bash
# Клонируем из GitHub (основной remote)
git clone https://github.com/IgorPushechnikov/terminal-launcher.git
cd terminal-launcher
```

### Шаг 2: Добавление дополнительных remote

```bash
# Добавляем SourceCraft
git remote add sourcecraft https://sourcecraft.dev/ipushechnikov/terminal-launcher.git

# Добавляем GitVerse
git remote add gitverse https://gitverse.ru/ipushechnikov/terminal-launcher.git
```

### Шаг 3: Проверка remote

```bash
git remote -v
```

Ожидаемый результат:
```
origin      https://github.com/IgorPushechnikov/terminal-launcher.git (fetch)
origin      https://github.com/IgorPushechnikov/terminal-launcher.git (push)
sourcecraft https://sourcecraft.dev/ipushechnikov/terminal-launcher.git (fetch)
sourcecraft https://sourcecraft.dev/ipushechnikov/terminal-launcher.git (push)
gitverse    https://gitverse.ru/ipushechnikov/terminal-launcher.git (fetch)
gitverse    https://gitverse.ru/ipushechnikov/terminal-launcher.git (push)
```

### Шаг 4: Тестовая синхронизация

```bash
# Windows
scripts\sync-repos.bat all

# Linux/macOS
chmod +x scripts/sync-repos.sh
./scripts/sync-repos.sh all
```

---

## 🚀 Использование

### Синхронизация со всеми репозиториями

```bash
# Windows
scripts\sync-repos.bat all

# Linux/macOS
./scripts/sync-repos.sh all
```

### Синхронизация с конкретным репозиторием

```bash
# Только GitHub
scripts\sync-repos.bat github

# Только SourceCraft
scripts\sync-repos.bat sourcecraft

# Только GitVerse
scripts\sync-repos.bat gitverse
```

### Ручная синхронизация через Git

```bash
# Push во все remote
git push origin main
git push sourcecraft main
git push gitverse main

# Или одной командой (если настроен remote.pushDefault)
git config remote.pushDefault origin
git push --all
```

---

## 🔄 Рабочий процесс

### Ежедневная разработка

```bash
# 1. Вносим изменения
git add .
git commit -m "Description of changes"

# 2. Получаем последние изменения из GitHub
git pull origin main --rebase

# 3. Синхронизируем все репозитории
scripts\sync-repos.bat all
```

### Создание релиза

```bash
# 1. Обновляем версию в package.json
npm version patch  # или minor, major

# 2. Создаём тег
git tag v2.0.1

# 3. Пушим тег во все репозитории
git push origin v2.0.1
git push sourcecraft v2.0.1
git push gitverse v2.0.1

# 4. Запускаем CI/CD на каждой платформе
# (автоматически при push тега)
```

---

## 🌐 Мультиязычная документация

### Структура документации

```
terminal-launcher/
├── README.md              # English (primary)
├── README_RU.md           # Russian
├── CHANGELOG.md           # English
├── CHANGELOG_RU.md        # Russian
├── docs/
│   ├── en/                # English documentation
│   │   ├── user-guide.md
│   │   ├── developer-guide.md
│   │   └── faq.md
│   └── ru/                # Russian documentation
│       ├── user-guide.md
│       ├── developer-guide.md
│       └── faq.md
```

### Правила ведения документации

1. **Основной язык**: English (README.md)
2. **Русская версия**: Всегда обновляется вместе с английской
3. **Platform-specific файлы**:
   - `.github/` - для GitHub Actions
   - `.sourcecraft/` - для SourceCraft CI/CD
   - `.gitverse/` - для GitVerse CI/CD

### Обновление документации

При изменении `README.md`:

```bash
# 1. Обновляем английскую версию
# ... редактируем README.md ...

# 2. Переводим на русский
# ... редактируем README_RU.md ...

# 3. Коммитим оба файла
git add README.md README_RU.md
git commit -m "Update documentation (EN+RU)"

# 4. Синхронизируем
scripts\sync-repos.bat all
```

---

## ⚙️ Автоматизация через Git Hooks

### Post-commit hook для автоматической синхронизации

Создайте файл `.git/hooks/post-commit`:

```bash
#!/bin/bash
# Автоматическая синхронизация после каждого коммита

echo "🔄 Автоматическая синхронизация..."
./scripts/sync-repos.sh all
```

Сделайте его исполняемым:

```bash
chmod +x .git/hooks/post-commit
```

⚠️ **Внимание**: Это может замедлить коммиты. Используйте с осторожностью!

---

## 🛡️ Безопасность

### Использование SSH вместо HTTPS

```bash
# Удаляем HTTPS remote
git remote remove sourcecraft
git remote remove gitverse

# Добавляем SSH remote
git remote add sourcecraft git@sourcecraft.dev:ipushechnikov/terminal-launcher.git
git remote add gitverse git@gitverse.ru:ipushechnikov/terminal-launcher.git
```

### Использование токенов доступа

Для GitHub:
```bash
git remote set-url origin https://YOUR_TOKEN@github.com/IgorPushechnikov/terminal-launcher.git
```

Для SourceCraft/GitVerse:
```bash
# Аналогично, замените YOUR_TOKEN на токен платформы
```

---

## 🐛 Решение проблем

### Проблема: Конфликты при синхронизации

**Решение:**
```bash
# 1. Отменяем последний merge
git merge --abort

# 2. Получаем последние изменения
git pull origin main --rebase

# 3. Разрешаем конфликты вручную
# ... редактируем файлы ...

# 4. Продолжаем rebase
git rebase --continue

# 5. Синхронизируем снова
scripts\sync-repos.bat all
```

### Проблема: Нет доступа к одному из репозиториев

**Решение:**
```bash
# Проверяем доступ
git ls-remote sourcecraft
git ls-remote gitverse

# Если ошибка аутентификации, обновляем credentials
git credential-cache exit
# Повторяем операцию - запросит логин/пароль заново
```

### Проблема: Разные истории коммитов

**Решение:**
```bash
# Принудительная синхронизация (ОСТОРОЖНО!)
git push sourcecraft main --force
git push gitverse main --force
```

⚠️ **Внимание**: `--force` перезаписывает историю! Используйте только если уверены.

---

## 📊 Мониторинг синхронизации

### Проверка статуса всех remote

```bash
# Скрипт для проверки
for remote in origin sourcecraft gitverse; do
    echo "=== $remote ==="
    git remote show $remote | grep "HEAD branch"
done
```

### Сравнение коммитов

```bash
# Показать разницу между remote
git log origin/main..sourcecraft/main
git log origin/main..gitverse/main
```

---

## 🎯 Рекомендации

### ✅ Делайте

1. **Всегда работайте через GitHub** (primary)
2. **Синхронизируйте перед каждым push**
3. **Используйте теги для релизов**
4. **Храните документацию на обоих языках**
5. **Тестируйте скрипты синхронизации регулярно**

### ❌ Не делайте

1. **Не пушьте напрямую в SourceCraft/GitVerse** без синхронизации
2. **Не изменяйте историю коммитов** после публикации
3. **Не забывайте обновлять русскую документацию**
4. **Не храните секреты в коде** (используйте env variables)

---

## 📚 Дополнительные ресурсы

- [GitHub Docs: Working with remotes](https://docs.github.com/en/get-started/getting-started-with-git/managing-remote-repositories)
- [Git Book: Distributed Git](https://git-scm.com/book/en/v2/Distributed-Git-Distributed-Workflows)
- [SourceCraft Documentation](https://sourcecraft.dev/portal/docs/ru/)
- [GitVerse Documentation](https://gitverse.ru/docs/)

---

<div align="center">

**Made with ❤️ for multi-platform development**

</div>
