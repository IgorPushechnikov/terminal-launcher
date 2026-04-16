# SourceCraft CI/CD - Простое руководство

SourceCraft использует свою систему CI/CD, которая отличается от GitHub Actions. Вот простое объяснение.

---

## 🎯 Основная концепция

### Терминология SourceCraft:

| GitHub Actions | SourceCraft CI/CD | Описание |
|----------------|-------------------|----------|
| Workflow | Workflow | Рабочий процесс |
| Job | Task | Задание |
| Step | Cube | "Кубик" - шаг выполнения |
| Runner | Worker | Воркер (облачный или self-hosted) |
| Action | Image | Docker образ для выполнения |

---

## 📁 Структура конфигурации

Файл: `.sourcecraft/ci.yaml`

```yaml
on:                    # Триггеры
  push:               # При push
    - workflows: [build-and-test]
      filter:
        branches: ["main"]

workflows:            # Рабочие процессы
  build-and-test:     # Имя workflow
    tasks:            # Список заданий
      - name: install-deps
        cubes:        # Кубики (шаги)
          - name: node-setup
            image: node:25-alpine
            script:
              - npm ci
```

---

## 🔧 Как это работает

### 1. **Триггеры (on)**
Определяют когда запускать CI/CD:

```yaml
on:
  push:                           # При push в репозиторий
    - workflows: [my-workflow]
      filter:
        branches: ["main"]        # Только ветка main
        paths: ["src/**"]         # Только изменения в src/
  
  pull_request:                   # При создании PR
    - workflows: [test-pr]
      filter:
        target_branches: ["main"]
  
  schedule:                       # По расписанию
    - workflows: [nightly-build]
      cron: "0 2 * * *"          # Каждый день в 2:00
```

### 2. **Workflows (Рабочие процессы)**
Логические группы заданий:

```yaml
workflows:
  build-and-test:          # Имя workflow
    tasks:
      - install-deps       # Задание 1
      - lint               # Задание 2
      - build              # Задание 3
      - test               # Задание 4
  
  deploy:                  # Другой workflow
    tasks:
      - build-release
      - upload-artifacts
```

### 3. **Tasks (Задания)**
Конкретные задачи внутри workflow:

```yaml
tasks:
  - name: install-deps
    cubes:
      - name: setup-node
        image: node:25-alpine
        script:
          - npm ci
```

### 4. **Cubes (Кубики)**
Отдельные шаги выполнения (как Steps в GitHub Actions):

```yaml
cubes:
  - name: build-app
    image: node:25-alpine    # Docker образ
    script:                  # Команды для выполнения
      - npm run build
      - echo "Build complete!"
    artifacts:               # Артефакты для сохранения
      paths:
        - dist/
```

---

## 💡 Примеры

### Пример 1: Простая сборка Node.js

```yaml
on:
  push:
    - workflows: build
      filter:
        branches: ["main"]

workflows:
  build:
    tasks:
      - name: build-project
        cubes:
          - name: node-build
            image: node:25-alpine
            script:
              - npm ci
              - npm run build
```

### Пример 2: Несколько заданий с зависимостями

```yaml
workflows:
  ci-pipeline:
    tasks:
      - name: install
        cubes:
          - name: deps
            image: node:25-alpine
            script:
              - npm ci
      
      - name: lint
        needs: [install]     # Запустить после install
        cubes:
          - name: eslint
            image: node:25-alpine
            script:
              - npm run lint
      
      - name: test
        needs: [install]     # Запустить после install
        cubes:
          - name: jest
            image: node:25-alpine
            script:
              - npm test
```

### Пример 3: Сохранение артефактов

```yaml
workflows:
  build-release:
    tasks:
      - name: build
        cubes:
          - name: electron-build
            image: node:25-alpine
            script:
              - npm run electron:build
            artifacts:
              paths:
                - dist/*.exe
                - dist/*.dmg
                - dist/*.AppImage
```

---

## 🚀 Готовая конфигурация для Terminal Launcher

Файл `.sourcecraft/ci.yaml` уже создан в репозитории!

### Что он делает:

1. **При push в main/develop**:
   - Устанавливает зависимости
   - Запускает линтинг
   - Проверяет типы TypeScript
   - Собирает приложение

2. **При pull request в main**:
   - Запускает те же проверки

3. **Артефакты**:
   - Сохраняет `node_modules` (для кэширования)
   - Сохраняет папки `dist/` и `out/`

---

## ⚙️ Настройка в SourceCraft UI

### Шаг 1: Включите CI/CD для репозитория

1. Откройте репозиторий на SourceCraft
2. Перейдите в **Settings** → **CI/CD**
3. Нажмите **Enable CI/CD**
4. SourceCraft автоматически обнаружит файл `.sourcecraft/ci.yaml`

### Шаг 2: Проверьте конфигурацию

1. Перейдите в вкладку **CI/CD** репозитория
2. Вы должны видеть ваши workflows
3. Нажмите на workflow чтобы увидеть детали

### Шаг 3: Запустите вручную (опционально)

1. Вкладка **CI/CD** → **Runs**
2. Кнопка **Run workflow**
3. Выберите workflow и нажмите **Run**

---

## 🔍 Мониторинг

### Просмотр логов выполнения:

1. Откройте репозиторий
2. Вкладка **CI/CD** → **Runs**
3. Кликните на конкретный запуск
4. Смотрите логи каждого cube

### Статусы:

- ✅ **Success** - Успешно выполнено
- ❌ **Failed** - Ошибка выполнения
- 🔄 **Running** - Выполняется
- ⏸️ **Pending** - Ожидает запуска

---

## 🆚 Сравнение с GitHub Actions

### GitHub Actions:
```yaml
name: Build
on: push
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
```

### SourceCraft CI/CD:
```yaml
on:
  push:
    - workflows: build
workflows:
  build:
    tasks:
      - name: build
        cubes:
          - name: node-build
            image: node:25-alpine
            script:
              - npm ci
              - npm run build
```

### Ключевые отличия:

| Аспект | GitHub Actions | SourceCraft |
|--------|----------------|-------------|
| Конфигурация | `.github/workflows/*.yml` | `.sourcecraft/ci.yaml` |
| Единица выполнения | Step | Cube |
| Образы | actions/* или docker:// | image: docker-image |
| Артефакты | actions/upload-artifact | artifacts.paths |
| Зависимости | needs: [job] | needs: [task] |

---

## ❓ Частые вопросы

### Q: Почему так сложно?
**A:** SourceCraft моложе GitHub и их система менее зрелая. Но она работает!

### Q: Можно ли использовать готовые "кубики"?
**A:** Да, через `image:` можно использовать любой Docker образ.

### Q: Как кэшировать node_modules?
**A:** Через artifacts:
```yaml
artifacts:
  paths:
    - node_modules
```

### Q: Сколько минут CI/CD доступно?
**A:** 1000 минут/мес на бесплатном плане.

### Q: Можно ли запустить несколько workflows параллельно?
**A:** Да, все workflows запускаются параллельно.

---

## 💡 Советы

### 1. Начинайте просто
Не пытайтесь сразу сделать сложную конфигурацию. Начните с одного workflow и одного task.

### 2. Используйте Alpine образы
```yaml
image: node:25-alpine  # Меньше, быстрее
```
вместо
```yaml
image: node:25  # Больше, медленнее
```

### 3. Сохраняйте артефакты
Если нужно передать файлы между tasks:
```yaml
artifacts:
  paths:
    - node_modules
```

### 4. Локальное тестирование
Протестируйте команды локально перед добавлением в CI/CD:
```bash
docker run -it node:25-alpine sh
# Внутри контейнера тестируйте команды
```

### 5. Используйте переменные окружения
```yaml
env:
  NODE_ENV: production
  CI: true
```

---

## 🐛 Решение проблем

### Проблема: Workflow не запускается

**Решение:**
1. Проверьте что файл `.sourcecraft/ci.yaml` существует
2. Проверьте синтаксис YAML
3. Убедитесь что CI/CD включён в настройках репозитория

### Проблема: Ошибка "image not found"

**Решение:**
Проверьте имя Docker образа:
```yaml
image: node:25-alpine  # Правильно
image: nodejs:25       # Неправильно
```

### Проблема: Превышен лимит времени

**Решение:**
Увеличьте максимальное время выполнения cube:
```yaml
workflows:
  my-workflow:
    settings:
      max_cube_duration: 10m  # 10 минут вместо 5
```

### Проблема: Артефакты не сохраняются

**Решение:**
Проверьте пути:
```yaml
artifacts:
  paths:
    - dist/      # Убедитесь что папка существует
```

---

## 📚 Дополнительные ресурсы

- [SourceCraft CI/CD Reference](https://sourcecraft.dev/portal/docs/ru/sourcecraft/ci-cd-ref/)
- [Events and Triggers](https://sourcecraft.dev/portal/docs/ru/sourcecraft/ci-cd-ref/on/)
- [Workflows](https://sourcecraft.dev/portal/docs/ru/sourcecraft/ci-cd-ref/workflows/)
- [Cubes](https://sourcecraft.dev/portal/docs/ru/sourcecraft/ci-cd-ref/cubes/)

---

<div align="center">

**SourceCraft CI/CD настроен! Теперь код автоматически проверяется при каждом push! 🚀**

</div>
