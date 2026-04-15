// Help content for Terminal Launcher (bilingual)

export interface HelpSection {
  id: string
  title: string
  icon: string  // Tabler icon name
  content: string
}

export const helpContent: {
  ru: HelpSection[]
  en: HelpSection[]
} = {
  ru: [
    {
      id: 'quickstart',
      title: 'Быстрый старт',
      icon: 'rocket',
      content: `
        <h4>Создание первой вкладки</h4>
        <p>При запуске приложения автоматически создается первая вкладка с терминалом. Вы можете начать работу немедленно.</p>
        
        <h4>Запуск команд</h4>
        <ul>
          <li>Введите команду в терминал и нажмите <kbd>Enter</kbd></li>
          <li>Используйте панель команд слева для быстрого доступа к сохраненным командам</li>
          <li>Перетащите команду из панели в терминал для выполнения</li>
        </ul>
        
        <h4>Сохранение сессии</h4>
        <p>Сессия автоматически сохраняется при закрытии приложения. Для ручного сохранения:</p>
        <ul>
          <li>Нажмите кнопку <strong>"Экспорт"</strong> в нижней панели</li>
          <li>Выберите место для сохранения файла <code>.yaml</code></li>
        </ul>
      `
    },
    {
      id: 'tabs',
      title: 'Работа с вкладками',
      icon: 'tabs',
      content: `
        <h4>Создание вкладки</h4>
        <p>Нажмите кнопку <strong>"+"</strong> на панели вкладок или используйте <kbd>F2</kbd></p>
        
        <h4>Закрытие вкладки</h4>
        <p>Нажмите <strong>"×"</strong> на вкладке или используйте <kbd>F3</kbd></p>
        
        <h4>Переименование вкладки</h4>
        <p>Дважды кликните по названию вкладки и введите новое имя</p>
        
        <h4>Навигация между вкладками</h4>
        <ul>
          <li><kbd>F4</kbd> - следующая вкладка</li>
          <li><kbd>Shift+F4</kbd> - предыдущая вкладка</li>
          <li>Клик мышью по вкладке</li>
        </ul>
      `
    },
    {
      id: 'commands',
      title: 'Библиотека команд',
      icon: 'list',
      content: `
        <h4>Добавление команды</h4>
        <ol>
          <li>Откройте панель команд (слева)</li>
          <li>Нажмите кнопку "Добавить команду"</li>
          <li>Заполните название и текст команды</li>
          <li>Сохраните</li>
        </ol>
        
        <h4>Сортировка команд</h4>
        <p>Перетаскивайте команды мышью для изменения порядка (drag & drop)</p>
        
        <h4>Выполнение команды</h4>
        <ul>
          <li>Кликните по команде - она скопируется в буфер обмена</li>
          <li>Или перетащите команду прямо в терминал</li>
        </ul>
        
        <h4>Импорт/экспорт команд</h4>
        <p>Используйте кнопки импорта/экспорта для обмена командами с коллегами</p>
      `
    },
    {
      id: 'workspaces',
      title: 'Рабочие пространства',
      icon: 'folder',
      content: `
        <h4>Что такое workspace?</h4>
        <p>Рабочее пространство - это изолированная папка с настройками, командами и логами для конкретного проекта.</p>
        
        <h4>Где хранятся данные?</h4>
        <ul>
          <li><strong>Project mode:</strong> <code>.terminal-manager/</code> в папке проекта</li>
          <li><strong>Portable mode:</strong> Рядом с исполняемым файлом</li>
          <li><strong>Global mode:</strong> В системной папке пользователя</li>
        </ul>
        
        <h4>Git интеграция</h4>
        <p>Рекомендуется добавить в <code>.gitignore</code>:</p>
        <pre><code>.terminal-manager/logs/
.terminal-manager/session.yaml
.terminal-manager/settings.json
.terminal-manager/*.db

# Оставляем шаблоны
!.terminal-manager/templates.yaml</code></pre>
      `
    },
    {
      id: 'settings',
      title: 'Настройки',
      icon: 'settings',
      content: `
        <h4>Темы оформления</h4>
        <p>Нажмите кнопку переключения темы в TitleBar для переключения между темной и светлой темами</p>
        
        <h4>Размер шрифта</h4>
        <p>Откройте настройки и измените размер шрифта терминала</p>
        
        <h4>Папка для логов</h4>
        <p>По умолчанию логи сохраняются в <code>.terminal-manager/logs/</code>. Вы можете изменить это в настройках.</p>
        
        <h4>Язык интерфейса</h4>
        <p>Нажмите кнопку <strong>RU/EN</strong> в TitleBar для переключения языка</p>
      `
    },
    {
      id: 'shortcuts',
      title: 'Горячие клавиши',
      icon: 'keyboard',
      content: `
        <table>
          <tr><th>Клавиша</th><th>Действие</th></tr>
          <tr><td><kbd>F1</kbd></td><td>Открыть справку</td></tr>
          <tr><td><kbd>F2</kbd></td><td>Новая вкладка</td></tr>
          <tr><td><kbd>F3</kbd></td><td>Закрыть вкладку (с подтверждением)</td></tr>
          <tr><td><kbd>F4</kbd></td><td>Следующая вкладка</td></tr>
          <tr><td><kbd>Shift+F4</kbd></td><td>Предыдущая вкладка</td></tr>
          <tr><td><kbd>Ctrl+Shift+I</kbd></td><td>DevTools</td></tr>
          <tr><td><kbd>Escape</kbd></td><td>Закрыть модальные окна</td></tr>
        </table>
        
        <p><strong>Примечание:</strong> Используются F-клавиши вместо Ctrl+ комбинаций, чтобы избежать конфликтов с терминалом.</p>
      `
    },
    {
      id: 'import-export',
      title: 'Импорт/Экспорт',
      icon: 'arrows-exchange',
      content: `
        <h4>Экспорт сессии</h4>
        <ol>
          <li>Нажмите кнопку <strong>"Экспорт"</strong> в StatusBar</li>
          <li>Выберите место сохранения</li>
          <li>Файл <code>.yaml</code> будет создан со всеми вкладками и командами</li>
        </ol>
        
        <h4>Импорт сессии</h4>
        <ol>
          <li>Нажмите кнопку <strong>"Импорт"</strong> в StatusBar</li>
          <li>Выберите файл сессии <code>.yaml</code></li>
          <li>Сессия загрузится и заменит текущую</li>
        </ol>
        
        <h4>Обмен с командой</h4>
        <p>Используйте <code>.terminal-manager/templates.yaml</code> для хранения общих команд и коммитьте их в Git</p>
      `
    },
    {
      id: 'troubleshooting',
      title: 'Устранение проблем',
      icon: 'wrench',
      content: `
        <h4>Приложение не запускается</h4>
        <ul>
          <li>Проверьте, установлен ли Node.js</li>
          <li>Удалите папку <code>node_modules</code> и выполните <code>npm install</code></li>
        </ul>
        
        <h4>Терминал не работает</h4>
        <ul>
          <li>Windows: убедитесь что PowerShell доступен</li>
          <li>macOS/Linux: проверьте наличие Bash или Zsh</li>
        </ul>
        
        <h4>Где найти логи?</h4>
        <p>Логи терминалов: <code>.terminal-manager/logs/</code></p>
        <p>Логи приложения: откройте DevTools (<kbd>Ctrl+Shift+I</kbd>)</p>
        
        <h4>Как сообщить о баге?</h4>
        <p>Создайте issue на GitHub с описанием проблемы и шагами воспроизведения</p>
      `
    }
  ],
  
  en: [
    {
      id: 'quickstart',
      title: 'Quick Start',
      icon: 'rocket',
      content: `
        <h4>Creating First Tab</h4>
        <p>When you launch the application, the first tab with terminal is created automatically. You can start working immediately.</p>
        
        <h4>Running Commands</h4>
        <ul>
          <li>Type command in terminal and press <kbd>Enter</kbd></li>
          <li>Use command panel on the left for quick access to saved commands</li>
          <li>Drag and drop command from panel to terminal to execute</li>
        </ul>
        
        <h4>Saving Session</h4>
        <p>Session is automatically saved when you close the application. For manual save:</p>
        <ul>
          <li>Click <strong>"Export"</strong> button in status bar</li>
          <li>Choose location to save <code>.yaml</code> file</li>
        </ul>
      `
    },
    {
      id: 'tabs',
      title: 'Working with Tabs',
      icon: 'tabs',
      content: `
        <h4>Create Tab</h4>
        <p>Click <strong>"+"</strong> button on tab bar or use <kbd>F2</kbd></p>
        
        <h4>Close Tab</h4>
        <p>Click <strong>"×"</strong> on tab or use <kbd>F3</kbd></p>
        
        <h4>Rename Tab</h4>
        <p>Double-click on tab name and enter new name</p>
        
        <h4>Navigate Between Tabs</h4>
        <ul>
          <li><kbd>F4</kbd> - next tab</li>
          <li><kbd>Shift+F4</kbd> - previous tab</li>
          <li>Click on tab with mouse</li>
        </ul>
      `
    },
    {
      id: 'commands',
      title: 'Command Library',
      icon: 'list',
      content: `
        <h4>Add Command</h4>
        <ol>
          <li>Open command panel (left side)</li>
          <li>Click "Add Command" button</li>
          <li>Fill in command name and text</li>
          <li>Save</li>
        </ol>
        
        <h4>Sort Commands</h4>
        <p>Drag and drop commands with mouse to reorder</p>
        
        <h4>Execute Command</h4>
        <ul>
          <li>Click on command - it copies to clipboard</li>
          <li>Or drag command directly to terminal</li>
        </ul>
        
        <h4>Import/Export Commands</h4>
        <p>Use import/export buttons to share commands with colleagues</p>
      `
    },
    {
      id: 'workspaces',
      title: 'Workspaces',
      icon: 'folder',
      content: `
        <h4>What is a workspace?</h4>
        <p>Workspace is an isolated folder with settings, commands, and logs for a specific project.</p>
        
        <h4>Where is data stored?</h4>
        <ul>
          <li><strong>Project mode:</strong> <code>.terminal-manager/</code> in project folder</li>
          <li><strong>Portable mode:</strong> Next to executable file</li>
          <li><strong>Global mode:</strong> In system user directory</li>
        </ul>
        
        <h4>Git Integration</h4>
        <p>Recommended to add to <code>.gitignore</code>:</p>
        <pre><code>.terminal-manager/logs/
.terminal-manager/session.yaml
.terminal-manager/settings.json
.terminal-manager/*.db

# Keep templates
!.terminal-manager/templates.yaml</code></pre>
      `
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings',
      content: `
        <h4>Themes</h4>
        <p>Click theme toggle button in TitleBar to switch between dark and light themes</p>
        
        <h4>Font Size</h4>
        <p>Open settings and change terminal font size</p>
        
        <h4>Log Directory</h4>
        <p>By default logs are saved to <code>.terminal-manager/logs/</code>. You can change this in settings.</p>
        
        <h4>Interface Language</h4>
        <p>Click <strong>RU/EN</strong> button in TitleBar to switch language</p>
      `
    },
    {
      id: 'shortcuts',
      title: 'Keyboard Shortcuts',
      icon: 'keyboard',
      content: `
        <table>
          <tr><th>Shortcut</th><th>Action</th></tr>
          <tr><td><kbd>F1</kbd></td><td>Open help</td></tr>
          <tr><td><kbd>F2</kbd></td><td>New tab</td></tr>
          <tr><td><kbd>F3</kbd></td><td>Close tab (with confirmation)</td></tr>
          <tr><td><kbd>F4</kbd></td><td>Next tab</td></tr>
          <tr><td><kbd>Shift+F4</kbd></td><td>Previous tab</td></tr>
          <tr><td><kbd>Ctrl+Shift+I</kbd></td><td>DevTools</td></tr>
          <tr><td><kbd>Escape</kbd></td><td>Close modals</td></tr>
        </table>
        
        <p><strong>Note:</strong> F-keys are used instead of Ctrl+ combinations to avoid conflicts with the terminal.</p>
      `
    },
    {
      id: 'import-export',
      title: 'Import/Export',
      icon: 'arrows-exchange',
      content: `
        <h4>Export Session</h4>
        <ol>
          <li>Click <strong>"Export"</strong> button in StatusBar</li>
          <li>Choose save location</li>
          <li><code>.yaml</code> file will be created with all tabs and commands</li>
        </ol>
        
        <h4>Import Session</h4>
        <ol>
          <li>Click <strong>"Import"</strong> button in StatusBar</li>
          <li>Select session <code>.yaml</code> file</li>
          <li>Session loads and replaces current state</li>
        </ol>
        
        <h4>Share with Team</h4>
        <p>Use <code>.terminal-manager/templates.yaml</code> to store shared commands and commit them to Git</p>
      `
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: 'wrench',
      content: `
        <h4>Application doesn't launch</h4>
        <ul>
          <li>Check if Node.js is installed</li>
          <li>Delete <code>node_modules</code> folder and run <code>npm install</code></li>
        </ul>
        
        <h4>Terminal not working</h4>
        <ul>
          <li>Windows: ensure PowerShell is available</li>
          <li>macOS/Linux: check if Bash or Zsh is installed</li>
        </ul>
        
        <h4>Where to find logs?</h4>
        <p>Terminal logs: <code>.terminal-manager/logs/</code></p>
        <p>Application logs: open DevTools (<kbd>Ctrl+Shift+I</kbd>)</p>
        
        <h4>How to report a bug?</h4>
        <p>Create an issue on GitHub with problem description and reproduction steps</p>
      `
    }
  ]
}
