# 🔄 Multi-Repository Sync Guide

This project is mirrored across three platforms for redundancy and accessibility:

- **GitHub** (Primary): https://github.com/IgorPushechnikov/terminal-launcher
- **SourceCraft** (Mirror): https://sourcecraft.dev/ipushechnikov/terminal-launcher
- **GitVerse** (Mirror): https://gitverse.ru/ipushechnikov/terminal-launcher

## Quick Setup

### 1. Clone the repository

```bash
git clone https://github.com/IgorPushechnikov/terminal-launcher.git
cd terminal-launcher
```

### 2. Add mirror remotes

```bash
git remote add sourcecraft https://sourcecraft.dev/ipushechnikov/terminal-launcher.git
git remote add gitverse https://gitverse.ru/ipushechnikov/terminal-launcher.git
```

### 3. Verify remotes

```bash
git remote -v
```

Expected output:
```
origin      https://github.com/IgorPushechnikov/terminal-launcher.git (fetch)
origin      https://github.com/IgorPushechnikov/terminal-launcher.git (push)
sourcecraft https://sourcecraft.dev/ipushechnikov/terminal-launcher.git (fetch)
sourcecraft https://sourcecraft.dev/ipushechnikov/terminal-launcher.git (push)
gitverse    https://gitverse.ru/ipushechnikov/terminal-launcher.git (fetch)
gitverse    https://gitverse.ru/ipushechnikov/terminal-launcher.git (push)
```

## Usage

### Sync to all repositories

```bash
# Windows
scripts\sync-repos.bat all

# Linux/macOS
chmod +x scripts/sync-repos.sh
./scripts/sync-repos.sh all
```

### Sync to specific repository

```bash
# Only GitHub
scripts\sync-repos.bat github

# Only SourceCraft
scripts\sync-repos.bat sourcecraft

# Only GitVerse
scripts\sync-repos.bat gitverse
```

## Workflow

### Daily Development

```bash
# Make changes
git add .
git commit -m "Your changes"

# Pull latest from GitHub
git pull origin main --rebase

# Sync all mirrors
scripts\sync-repos.bat all
```

### Creating a Release

```bash
# Bump version
npm version patch  # or minor, major

# Create tag
git tag v2.0.1

# Push tag to all remotes
git push origin v2.0.1
git push sourcecraft v2.0.1
git push gitverse v2.0.1

# CI/CD will automatically build releases on each platform
```

## Documentation Languages

This project maintains documentation in two languages:

- 🇬🇧 **English**: `README.md`, `docs/en/`
- 🇷🇺 **Russian**: `README_RU.md`, `docs/ru/`

**Rule**: Always update both language versions together!

## More Information

For detailed setup instructions, troubleshooting, and advanced usage, see:

- [Detailed Setup Guide (Russian)](docs/ru/MULTI_REPO_SETUP.md)
- [Contributing Guidelines](CONTRIBUTING.md)

---

<div align="center">

**Maintained with ❤️ across multiple platforms**

</div>
