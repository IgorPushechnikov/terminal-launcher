#!/bin/bash
# sync-repos.sh - Скрипт для синхронизации кода между GitHub, SourceCraft и GitVerse
# 
# Использование:
#   ./sync-repos.sh [all|github|sourcecraft|gitverse]
#
# Требования:
#   1. Настроить remote для каждого репозитория
#   2. Иметь доступ на запись во все три репозитория

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Конфигурация
GITHUB_REMOTE="origin"
SOURCECRAFT_REMOTE="sourcecraft"
GITVERSE_REMOTE="gitverse"

# Функция для вывода сообщений
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка наличия remote
check_remote() {
    local remote_name=$1
    if git remote | grep -q "^${remote_name}$"; then
        return 0
    else
        return 1
    fi
}

# Добавление remote если не существует
add_remote_if_needed() {
    local name=$1
    local url=$2
    
    if ! check_remote "$name"; then
        log_info "Добавляю remote '$name': $url"
        git remote add "$name" "$url"
        log_success "Remote '$name' добавлен"
    else
        log_info "Remote '$name' уже существует"
    fi
}

# Синхронизация с одним remote
sync_to_remote() {
    local remote_name=$1
    local branch=${2:-main}
    
    log_info "Синхронизация с $remote_name..."
    
    # Получаем последние изменения
    git fetch "$remote_name"
    
    # Проверяем есть ли локальные изменения
    if git diff --quiet HEAD "$remote_name/$branch"; then
        log_success "$remote_name уже синхронизирован"
        return 0
    fi
    
    # Пушим изменения
    log_info "Пушу изменения в $remote_name..."
    git push "$remote_name" "$branch"
    
    if [ $? -eq 0 ]; then
        log_success "Успешно синхронизировано с $remote_name"
    else
        log_error "Ошибка при синхронизации с $remote_name"
        return 1
    fi
}

# Главная функция
main() {
    local target=${1:-all}
    
    echo "=========================================="
    echo "  Синхронизация репозиториев"
    echo "=========================================="
    echo ""
    
    # Проверяем что мы в git репозитории
    if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
        log_error "Это не git репозиторий!"
        exit 1
    fi
    
    # Проверяем текущую ветку
    current_branch=$(git branch --show-current)
    log_info "Текущая ветка: $current_branch"
    
    # Проверяем есть ли незафиксированные изменения
    if ! git diff-index --quiet HEAD --; then
        log_warning "Есть незафиксированные изменения!"
        read -p "Зафиксировать изменения перед синхронизацией? (y/n): " commit_changes
        
        if [ "$commit_changes" = "y" ] || [ "$commit_changes" = "Y" ]; then
            git add .
            git commit -m "Auto-commit before sync"
            log_success "Изменения зафиксированы"
        else
            log_error "Отмена синхронизации. Зафиксируйте изменения вручную."
            exit 1
        fi
    fi
    
    # Получаем последние изменения из primary remote (GitHub)
    log_info "Получаю последние изменения из GitHub..."
    git pull origin "$current_branch" --rebase
    
    case "$target" in
        all)
            log_info "Синхронизация со ВСЕМИ репозиториями..."
            sync_to_remote "$GITHUB_REMOTE" "$current_branch"
            sync_to_remote "$SOURCECRAFT_REMOTE" "$current_branch"
            sync_to_remote "$GITVERSE_REMOTE" "$current_branch"
            ;;
        github)
            sync_to_remote "$GITHUB_REMOTE" "$current_branch"
            ;;
        sourcecraft)
            sync_to_remote "$SOURCECRAFT_REMOTE" "$current_branch"
            ;;
        gitverse)
            sync_to_remote "$GITVERSE_REMOTE" "$current_branch"
            ;;
        *)
            log_error "Неизвестная цель: $target"
            echo "Использование: $0 [all|github|sourcecraft|gitverse]"
            exit 1
            ;;
    esac
    
    echo ""
    echo "=========================================="
    log_success "Синхронизация завершена!"
    echo "=========================================="
}

# Запуск
main "$@"
