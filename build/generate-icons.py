#!/usr/bin/env python3
"""
Генератор иконок для Terminal Launcher
Конвертирует SVG в ICO, PNG и ICNS форматы
"""

import sys
from pathlib import Path

# Пути
PROJECT_DIR = Path(__file__).parent.parent
SVG_FILE = PROJECT_DIR / "public" / "assets" / "icons" / "terminal-icon.svg"
ICONS_DIR = PROJECT_DIR / "build" / "icons"

def check_dependencies():
    """Проверяем необходимые библиотеки"""
    try:
        import cairosvg
        print("✓ cairosvg установлен")
    except ImportError:
        print("✗ cairosvg не найден")
        print("\nУстановите: pip install cairosvg")
        return False
    
    try:
        from PIL import Image
        print("✓ Pillow установлен")
    except ImportError:
        print("✗ Pillow не найден")
        print("\nУстановите: pip install Pillow")
        return False
    
    return True

def generate_png_sizes():
    """Генерируем PNG разных размеров"""
    import cairosvg
    
    sizes = [16, 32, 48, 64, 128, 256, 512]
    
    for size in sizes:
        output = ICONS_DIR / f"icon-{size}x{size}.png"
        print(f"Генерируем {size}x{size}...")
        
        cairosvg.svg2png(
            url=str(SVG_FILE),
            write_to=str(output),
            output_width=size,
            output_height=size
        )
    
    print(f"✓ Создано {len(sizes)} PNG файлов")

def generate_ico():
    """Создаем ICO файл для Windows"""
    from PIL import Image
    
    print("\nСоздаем ICO файл...")
    
    images = []
    sizes = [16, 32, 48, 256]
    
    for size in sizes:
        png_file = ICONS_DIR / f"icon-{size}x{size}.png"
        if png_file.exists():
            img = Image.open(png_file)
            images.append(img)
    
    if images:
        ico_path = ICONS_DIR / "icon.ico"
        images[0].save(
            ico_path,
            format='ICO',
            sizes=[(img.width, img.height) for img in images],
            append_images=images[1:]
        )
        print(f"✓ Создан {ico_path}")

def generate_icns():
    """Создаем ICNS для macOS (требуется macOS)"""
    import platform
    
    if platform.system() != 'Darwin':
        print("\n⚠ Пропускаем ICNS (только для macOS)")
        return
    
    from PIL import Image
    import tempfile
    import shutil
    import subprocess
    
    print("\nСоздаем ICNS файл...")
    
    # Временная директория для iconset
    temp_dir = Path(tempfile.mkdtemp())
    iconset_dir = temp_dir / "icon.iconset"
    iconset_dir.mkdir()
    
    # Копируем PNG в iconset
    sizes = {
        'icon_16x16.png': 16,
        'icon_32x32.png': 32,
        'icon_64x64.png': 64,
        'icon_128x128.png': 128,
        'icon_256x256.png': 256,
        'icon_512x512.png': 512,
        'icon_512x512@2x.png': 512,
    }
    
    for name, size in sizes.items():
        src = ICONS_DIR / f"icon-{size}x{size}.png"
        if src.exists():
            shutil.copy(src, iconset_dir / name)
    
    # Конвертируем в ICNS
    icns_path = ICONS_DIR / "icon.icns"
    result = subprocess.run(
        ['iconutil', '-c', 'icns', str(iconset_dir), '-o', str(icns_path)]
    )
    
    # Очищаем временные файлы
    shutil.rmtree(temp_dir)
    
    if result.returncode == 0:
        print(f"✓ Создан {icns_path}")
    else:
        print("✗ Ошибка создания ICNS")

def main():
    print("=" * 60)
    print("Terminal Launcher - Icon Generator")
    print("=" * 60)
    print()
    
    # Проверяем зависимости
    if not check_dependencies():
        sys.exit(1)
    
    # Проверяем SVG файл
    if not SVG_FILE.exists():
        print(f"\n✗ SVG файл не найден: {SVG_FILE}")
        sys.exit(1)
    
    print(f"\nИспользуем: {SVG_FILE}")
    print(f"Вывод в: {ICONS_DIR}")
    print()
    
    # Создаем директорию
    ICONS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Генерируем
    generate_png_sizes()
    generate_ico()
    generate_icns()
    
    print("\n" + "=" * 60)
    print("✓ Генерация иконок завершена!")
    print("=" * 60)

if __name__ == "__main__":
    main()
