"""
Скрипт для создания .ico файла из PNG изображений
Требует: Pillow (pip install Pillow)
"""
from PIL import Image
import os

# Пути
icon_dir = os.path.join(os.path.dirname(__file__), 'build', 'icons')
png_256 = os.path.join(icon_dir, 'icon-256x256.png')
ico_output = os.path.join(icon_dir, 'icon.ico')

# Проверяем существование файла
if not os.path.exists(png_256):
    print(f"ERROR: {png_256} not found!")
    exit(1)

try:
    # Открываем изображение
    img = Image.open(png_256)
    
    # Создаем ICO с несколькими размерами
    sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    img.save(ico_output, format='ICO', sizes=sizes)
    
    # Проверяем результат
    if os.path.exists(ico_output):
        size = os.path.getsize(ico_output)
        print(f"✓ ICO file created successfully!")
        print(f"  Path: {ico_output}")
        print(f"  Size: {size} bytes ({size/1024:.1f} KB)")
        print(f"  Contains sizes: {sizes}")
    else:
        print("ERROR: ICO file was not created")
        exit(1)
        
except ImportError:
    print("ERROR: Pillow not installed!")
    print("Install with: pip install Pillow")
    exit(1)
except Exception as e:
    print(f"ERROR: {e}")
    exit(1)
