// Адаптер для FitAddon чтобы работал в Electron
(function() {
  // Загружаем оригинальный модуль
  var originalModule = null;
  
  try {
    // Пытаемся выполнить оригинальный код
    var script = document.createElement('script');
    script.src = 'addon-fit.js';
    document.head.appendChild(script);
  } catch (e) {
    console.error('Failed to load addon-fit.js:', e);
  }
  
  // Ждём загрузки
  setTimeout(function() {
    if (window.FitAddon) {
      // UMD обёрка экспортирует модуль как { FitAddon: class }
      // Нам нужен сам класс
      if (typeof window.FitAddon.FitAddon === 'function') {
        window.FitAddonClass = window.FitAddon.FitAddon;
        console.log('✅ FitAddon.FitAddon найден');
      } else if (typeof window.FitAddon.default === 'function') {
        window.FitAddonClass = window.FitAddon.default;
        console.log('✅ FitAddon.default найден');
      } else {
        console.error('❌ FitAddon класс не найден');
        console.log('window.FitAddon:', window.FitAddon);
        console.log('Keys:', Object.keys(window.FitAddon));
      }
    } else {
      console.error('❌ window.FitAddon не определён');
    }
  }, 100);
})();
