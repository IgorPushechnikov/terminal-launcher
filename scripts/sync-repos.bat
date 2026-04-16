@echo off
REM sync-repos.bat - Скрипт для синхронизации кода между GitHub, SourceCraft и GitVerse
REM 
REM Использование:
REM   sync-repos.bat [all|github|sourcecraft|gitverse]
REM
REM Требования:
REM   1. Настроить remote для каждого репозитория
REM   2. Иметь доступ на запись во все три репозитория

setlocal enabledelayedexpansion

:: Конфигурация
set GITHUB_REMOTE=origin
set SOURCECRAFT_REMOTE=sourcecraft
set GITVERSE_REMOTE=gitverse
set TARGET=%1

if "%TARGET%"=="" set TARGET=all

echo ==========================================
echo   Синхронизация репозиториев
echo ==========================================
echo.

:: Проверяем что мы в git репозитории
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Это не git репозиторий!
    exit /b 1
)

:: Получаем текущую ветку
for /f "delims=" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo [INFO] Текущая ветка: %CURRENT_BRANCH%

:: Проверяем есть ли незафиксированные изменения
git diff-index --quiet HEAD --
if errorlevel 1 (
    echo [WARNING] Есть незафиксированные изменения!
    set /p COMMIT_CHANGES="Зафиксировать изменения перед синхронизацией? (y/n): "
    
    if /i "!COMMIT_CHANGES!"=="y" (
        git add .
        git commit -m "Auto-commit before sync"
        echo [SUCCESS] Изменения зафиксированы
    ) else (
        echo [ERROR] Отмена синхронизации. Зафиксируйте изменения вручную.
        exit /b 1
    )
)

:: Получаем последние изменения из primary remote (GitHub)
echo [INFO] Получаю последние изменения из GitHub...
git pull origin %CURRENT_BRANCH% --rebase
if errorlevel 1 (
    echo [ERROR] Ошибка при получении изменений из GitHub
    exit /b 1
)

:: Синхронизация в зависимости от цели
if "%TARGET%"=="all" (
    call :sync_remote %GITHUB_REMOTE% %CURRENT_BRANCH%
    call :sync_remote %SOURCECRAFT_REMOTE% %CURRENT_BRANCH%
    call :sync_remote %GITVERSE_REMOTE% %CURRENT_BRANCH%
) else if "%TARGET%"=="github" (
    call :sync_remote %GITHUB_REMOTE% %CURRENT_BRANCH%
) else if "%TARGET%"=="sourcecraft" (
    call :sync_remote %SOURCECRAFT_REMOTE% %CURRENT_BRANCH%
) else if "%TARGET%"=="gitverse" (
    call :sync_remote %GITVERSE_REMOTE% %CURRENT_BRANCH%
) else (
    echo [ERROR] Неизвестная цель: %TARGET%
    echo Использование: sync-repos.bat [all^|github^|sourcecraft^|gitverse]
    exit /b 1
)

echo.
echo ==========================================
echo [SUCCESS] Синхронизация завершена!
echo ==========================================

exit /b 0

:: Функция синхронизации с remote
:sync_remote
set REMOTE_NAME=%1
set BRANCH=%2

echo [INFO] Синхронизация с %REMOTE_NAME%...

:: Получаем последние изменения
git fetch %REMOTE_NAME%

:: Пушим изменения
echo [INFO] Пушу изменения в %REMOTE_NAME%...
git push %REMOTE_NAME% %BRANCH%

if errorlevel 1 (
    echo [ERROR] Ошибка при синхронизации с %REMOTE_NAME%
    exit /b 1
) else (
    echo [SUCCESS] Успешно синхронизировано с %REMOTE_NAME%
)

exit /b 0
