# Git Quick Start Guide

## ✅ Проблема решена!

Git теперь правильно инициализирован в папке `terminal-launcher` и видит только нужные файлы.

---

## 📋 Что было сделано:

1. ❌ **Удалён** `.git` из родительской папки `C:\Dev\ExelPlugin\`
2. ✅ **Создан** новый `.git` в `C:\Dev\ExelPlugin\terminal-launcher\`
3. ✅ **Добавлены** все файлы проекта
4. ✅ **Создан** первый коммит
5. ✅ **Переименована** ветка в `main`

---

## 🎯 Текущее состояние:

```bash
Branch: main
Commit: Initial commit: Terminal Launcher v2.0.0
Files tracked: 87 files
Status: Clean (no uncommitted changes)
```

---

## 🚀 Следующие шаги для публикации на GitHub:

### **Шаг 1: Создайте репозиторий на GitHub**

1. Перейдите на https://github.com/new
2. Repository name: `terminal-launcher`
3. Description: "Multi-tab terminal emulator with workspace support"
4. **НЕ** инициализировать с README (у нас уже есть)
5. Нажмите "Create repository"

### **Шаг 2: Подключите локальный git к GitHub**

```bash
# Добавьте remote (замените YOUR_USERNAME на ваш логин GitHub)
git remote add origin https://github.com/IgorPushechnikov/terminal-launcher.git

# Проверьте подключение
git remote -v

# Отправьте код на GitHub
git push -u origin main
```

### **Шаг 3: Создайте тег для релиза**

```bash
# Создайте тег
git tag -a v2.0.0 -m "Terminal Launcher v2.0.0 - Stability Release"

# Отправьте тег на GitHub
git push origin v2.0.0
```

После этого GitHub Actions автоматически:
- ✅ Соберёт приложение для Windows, macOS, Linux
- ✅ Создаст GitHub Release с бинарниками
- ✅ Прикрепит все .exe, .dmg, .AppImage файлы

---

## 📚 Основные Git команды:

### **Ежедневная работа:**

```bash
# Посмотреть изменения
git status

# Добавить все изменения
git add .

# Сделать коммит
git commit -m "Описание изменений"

# Отправить на GitHub
git push
```

### **Полезные команды:**

```bash
# История коммитов
git log --oneline

# Последние 5 коммитов
git log --oneline -5

# Посмотреть различия
git diff

# Отменить изменения в файле
git checkout -- filename

# Создать новую ветку
git branch feature-name
git checkout feature-name

# Переключиться на ветку
git checkout main
```

---

## ⚠️ Важные моменты:

### **Что НЕ добавляется в git (.gitignore):**

- ❌ `node_modules/` - зависимости (слишком большие)
- ❌ `dist/` - собранные файлы (собираются автоматически)
- ❌ `Int_docs/` - внутренняя документация
- ❌ `Logs/` - логи приложения
- ❌ `.terminal-manager/` - пользовательские данные (кроме templates.yaml)
- ❌ `*.exe`, `*.dmg` - бинарники (собираются CI/CD)

### **Что добавляется в git:**

- ✅ Исходный код (`src/`, `electron/`)
- ✅ Конфигурация (`package.json`, `tsconfig.json`)
- ✅ Документация (`README.md`, `CHANGELOG.md`)
- ✅ Тесты (`tests/`)
- ✅ GitHub Actions (`.github/workflows/`)
- ✅ Шаблоны команд (`.terminal-manager/templates.yaml`)

---

## 🔧 Если что-то пошло не так:

### **Проблема: Git видит файлы за пределами проекта**

**Решение:**
```bash
# Проверьте где .git папка
Get-Item .git | Select-Object FullName

# Если .git не в terminal-launcher, удалите и создайте заново
Remove-Item ..\.git -Recurse -Force  # Удалить из родителя
git init                              # Создать в текущей папке
```

### **Проблема: Случайно добавили лишние файлы**

**Решение:**
```bash
# Убрать файл из staging area
git rm --cached filename

# Или убрать всю папку
git rm --cached -r foldername/

# Добавить в .gitignore
echo "foldername/" >> .gitignore

# Закоммитить изменения
git commit -m "Remove unwanted files from tracking"
```

### **Проблема: Нужно отменить последний коммит**

**Решение:**
```bash
# Отменить коммит но оставить изменения
git reset --soft HEAD~1

# Отменить коммит и удалить изменения
git reset --hard HEAD~1
```

---

## 💡 Советы:

1. **Коммитьте часто** - маленькие коммиты легче отслеживать
2. **Пишите понятные сообщения** - объясняйте ЧТО и ПОЧЕМУ changed
3. **Используйте ветки** - для новых фич создавайте отдельные ветки
4. **Проверяйте перед push** - `git status` покажет что будет отправлено
5. **Не коммитьте секреты** - API keys, passwords никогда не должны быть в git

---

## 🔗 Полезные ресурсы:

- [Git Handbook](https://guides.github.com/introduction/git-handbook/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

---

**Created:** 2026-04-16  
**Project:** Terminal Launcher v2.0.0  
**Author:** Igor Pushechnikov
