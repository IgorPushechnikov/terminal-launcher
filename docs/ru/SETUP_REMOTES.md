# Настройка Remote для синхронизации репозиториев

Этот файл содержит инструкции по добавлению SourceCraft и GitVerse как дополнительных remote.

## 🔧 Быстрая настройка

### 1. Проверьте текущие remote

```bash
git remote -v
```

Если видите только `origin` (GitHub), продолжаем.

### 2. Добавьте SourceCraft

```bash
git remote add sourcecraft https://sourcecraft.dev/ipushechnikov/terminal-launcher.git
```

### 3. Добавьте GitVerse

```bash
git remote add gitverse https://gitverse.ru/ipushechnikov/terminal-launcher.git
```

### 4. Проверьте результат

```bash
git remote -v
```

Должно быть:
```
origin      https://github.com/IgorPushechnikov/terminal-launcher.git (fetch)
origin      https://github.com/IgorPushechnikov/terminal-launcher.git (push)
sourcecraft https://sourcecraft.dev/ipushechnikov/terminal-launcher.git (fetch)
sourcecraft https://sourcecraft.dev/ipushechnikov/terminal-launcher.git (push)
gitverse    https://gitverse.ru/ipushechnikov/terminal-launcher.git (fetch)
gitverse    https://gitverse.ru/ipushechnikov/terminal-launcher.git (push)
```

### 5. Тестовая синхронизация

```bash
# Windows
scripts\sync-repos.bat all

# Linux/macOS
./scripts/sync-repos.sh all
```

---

## 🔐 Если запрашивает пароль

При первом push в каждый remote система запросит учётные данные.

### GitHub
- Логин: ваш username
- Пароль: Personal Access Token (не обычный пароль!)

Создать токен: https://github.com/settings/tokens

### SourceCraft
- Логин: ваш email или username
- Пароль: пароль от аккаунта SourceCraft

### GitVerse
- Логин: ваш email или username  
- Пароль: пароль от аккаунта GitVerse

---

## 🔄 Использование SSH (рекомендуется)

Если не хотите вводить пароль каждый раз, используйте SSH:

### 1. Сгенерируйте SSH ключ (если ещё нет)

```bash
ssh-keygen -t ed25519 -C "ipush@bk.ru"
```

### 2. Добавьте публичный ключ на платформы

Скопируйте содержимое файла `~/.ssh/id_ed25519.pub` и добавьте в:
- GitHub: Settings → SSH and GPG keys
- SourceCraft: Profile → SSH Keys
- GitVerse: Profile → SSH Keys

### 3. Замените HTTPS remote на SSH

```bash
# Удаляем HTTPS
git remote remove sourcecraft
git remote remove gitverse

# Добавляем SSH
git remote add sourcecraft git@sourcecraft.dev:ipushechnikov/terminal-launcher.git
git remote add gitverse git@gitverse.ru:ipushechnikov/terminal-launcher.git
```

### 4. Тестируем

```bash
ssh -T git@sourcecraft.dev
ssh -T git@gitverse.ru
```

---

## ❓ Решение проблем

### Ошибка: "remote sourcecraft already exists"

Удалите и добавьте заново:
```bash
git remote remove sourcecraft
git remote add sourcecraft https://sourcecraft.dev/ipushechnikov/terminal-launcher.git
```

### Ошибка: "Authentication failed"

1. Проверьте логин/пароль
2. Для GitHub используйте Personal Access Token
3. Попробуйте очистить кэш credentials:
   ```bash
   git credential-cache exit
   ```

### Ошибка: "Repository not found"

1. Проверьте URL репозитория
2. Убедитесь что у вас есть доступ (для приватных репо)
3. Проверьте что репозиторий создан на платформе

---

## 📝 Полезные команды

```bash
# Показать все remote
git remote -v

# Обновить URL remote
git remote set-url sourcecraft <new-url>

# Удалить remote
git remote remove <name>

# Проверить подключение
git ls-remote sourcecraft
git ls-remote gitverse

# Push только в один remote
git push sourcecraft main
git push gitverse main

# Pull из конкретного remote
git pull sourcecraft main
git pull gitverse main
```

---

<div align="center">

**После настройки используйте `scripts/sync-repos.bat all` для синхронизации**

</div>
