// Main process i18n - переводы для основного процесса Electron

type Language = 'ru' | 'en';

let currentLanguage: Language = 'ru';

export interface MainTranslations {
  [key: string]: {
    ru: string;
    en: string;
  };
}

const translations: MainTranslations = {
  // Startup
  'app.start': {
    ru: '=== ПРИЛОЖЕНИЕ ЗАПУЩЕНО ===',
    en: '=== APPLICATION START ==='
  },
  'app.time': {
    ru: 'Время',
    en: 'Time'
  },
  'app.second.instance': {
    ru: 'Второй экземпляр, выхожу...',
    en: 'Second instance, exiting...'
  },
  'app.checking.files': {
    ru: 'Проверка файлов инициализации...',
    en: 'Checking initialization files...'
  },
  'app.app.dir': {
    ru: 'Директория приложения',
    en: 'App directory'
  },
  'app.resources.path': {
    ru: 'Путь к ресурсам',
    en: 'Resources path'
  },
  
  // File operations
  'app.commands.copied': {
    ru: 'Commands.yaml скопирован из ресурсов',
    en: 'Commands.yaml copied from resources'
  },
  'app.commands.copy.error': {
    ru: 'Ошибка копирования commands.yaml',
    en: 'Error copying commands.yaml'
  },
  'app.commands.exists': {
    ru: 'Commands.yaml уже существует, пропускаем',
    en: 'Commands.yaml already exists, skipping'
  },
  'app.commands.not.found': {
    ru: 'Commands.yaml не найден в ресурсах',
    en: 'Commands.yaml not found in resources'
  },
  'app.tabs.copied': {
    ru: 'Tabs.yaml скопирован из ресурсов',
    en: 'Tabs.yaml copied from resources'
  },
  'app.tabs.copy.error': {
    ru: 'Ошибка копирования tabs.yaml',
    en: 'Error copying tabs.yaml'
  },
  
  // Session
  'app.window.destroyed': {
    ru: 'Окно уничтожено, пропускаю сохранение сессии',
    en: 'Window destroyed, skipping session save'
  },
  'app.tabs.saved': {
    ru: 'Вкладки сохранены в workspace',
    en: 'Tabs saved to workspace'
  },
  'app.commands.received': {
    ru: 'Получены команды для сохранения',
    en: 'Received commands for save'
  },
  
  // Terminal
  'app.terminal.created': {
    ru: 'Терминал создан',
    en: 'Terminal created'
  },
  'app.terminal.write': {
    ru: 'Запись в терминал',
    en: 'Terminal write'
  },
  'app.terminal.resize': {
    ru: 'Изменение размера терминала',
    en: 'Terminal resize'
  },
  'app.terminal.closed': {
    ru: 'Терминал закрыт',
    en: 'Terminal closed'
  },
  
  // Database
  'app.db.commands.loaded': {
    ru: 'Команды загружены из SQLite',
    en: 'Commands loaded from SQLite'
  },
  'app.db.command.added': {
    ru: 'Команда добавлена',
    en: 'Command added'
  },
  'app.db.command.updated': {
    ru: 'Команда обновлена',
    en: 'Command updated'
  },
  'app.db.command.deleted': {
    ru: 'Команда удалена',
    en: 'Command deleted'
  },
  'app.db.commands.reordered': {
    ru: 'Порядок команд изменен',
    en: 'Commands reordered'
  },
  'app.db.commands.imported': {
    ru: 'Команды импортированы',
    en: 'Commands imported'
  },
  'app.db.migration.complete': {
    ru: 'Миграция из YAML завершена',
    en: 'YAML migration complete'
  },
  
  // Language
  'app.language.synced': {
    ru: 'Язык синхронизирован',
    en: 'Language synced'
  },
  
  // Errors
  'app.error.db': {
    ru: 'Ошибка базы данных',
    en: 'Database error'
  },
  'app.error.terminal': {
    ru: 'Ошибка терминала',
    en: 'Terminal error'
  },
  'app.error.general': {
    ru: 'Ошибка',
    en: 'Error'
  }
};

export function setMainLanguage(lang: Language): void {
  currentLanguage = lang;
}

export function getMainLanguage(): Language {
  return currentLanguage;
}

export function mt(key: string): string {
  const translation = translations[key];
  if (!translation) {
    console.warn(`[i18n] Translation key not found: ${key}`);
    return key;
  }
  return translation[currentLanguage] || translation.ru;
}
