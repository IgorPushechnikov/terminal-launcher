# Иконки приложения

Для сборки приложения необходимы следующие файлы иконок:

## Windows
- `build/icons/icon.ico` - ICO файл (256x256 или больше)

## macOS
- `build/icons/icon.icns` - ICNS файл
- Или набор PNG: icon_16x16.png, icon_32x32.png, icon_128x128.png, icon_256x256.png, icon_512x512.png

## Linux
- `build/icons/icon.png` - PNG файл (512x512 рекомендуется)

## Создание иконок

### Из PNG в ICO (Windows)
Используйте онлайн конвертер или ImageMagick:
```bash
convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

### Из PNG в ICNS (macOS)
```bash
mkdir icon.iconset
sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png
sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png
iconutil -c icns icon.iconset -o icon.icns
```

### Для Linux
Просто используйте PNG 512x512 или больше.

## Временное решение

Пока иконки не добавлены, electron-builder будет использовать иконки по умолчанию.
