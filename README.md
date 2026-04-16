# Terminal Launcher

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.2-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)
![Vue](https://img.shields.io/badge/Vue-3.5-brightgreen.svg)
![Electron](https://img.shields.io/badge/Electron-41.2-47848F.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)

**A multi-tab terminal emulator with workspace support, session management, and cross-platform compatibility**

[Download](#-installation) • [Features](#-features) • [Documentation](#-documentation) • [Development](#-development) • [Contributing](#-contributing)

</div>

---

## 📸 Screenshots

### Main Interface

**Dark Theme:**
![Main Screen Dark](docs/screenshots/01-main-screen-dark.png)
*Multi-tab terminal workspace with command panel and active terminals*

### In-App Help

![Help Modal](docs/screenshots/02-help-modal-dark.png)
*Built-in comprehensive help system with search functionality*

### About

![About Modal](docs/screenshots/03-about-modal-dark.png)
*Application information with automatic updates check*

### Command Management

![Edit Command](docs/screenshots/04-edit-command-dark.png)
*Easy command editing with name, command text, and working directory*

### Light Theme

![Main Screen Light](docs/screenshots/05-main-screen-light.png)
*Clean light theme for comfortable work in bright environments*

## ✨ Features

- 🚀 **Multiple Tabs** - Work with multiple terminals simultaneously
- 💾 **Auto-Save Sessions** - Your state is automatically saved on close
- 📁 **Workspace Support** - Isolated settings per project (like VSCode)
- 🎨 **Dark & Light Themes** - Switch between themes with one click
- 📋 **Command Library** - Save and organize frequently used commands
- 🔍 **Terminal Search** - Quick search through terminal output
- 📊 **Logging** - Automatic logging of all terminal sessions
- 📦 **Portable Version** - No installation required, run from anywhere

## 🚀 Quick Start

### For Users

1. **Download** the latest version from [Releases](https://github.com/IgorPushechnikov/terminal-launcher/releases)
2. **Install** or extract the portable version
3. **Launch** the application
4. **Start working** - first tab is created automatically

### For Developers

```bash
# Clone the repository
git clone https://github.com/IgorPushechnikov/terminal-launcher.git
cd terminal-launcher

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run electron:build
```

## 📋 Requirements

### For Usage
- **Windows**: Windows 10 or later

### For Development
- Node.js 18+ ([download](https://nodejs.org/))
- npm
- Git

## 📥 Installation

### Windows

**Installer:**
1. Download `Terminal-Launcher-{version}-Setup.exe` from [Releases](https://github.com/IgorPushechnikov/terminal-launcher/releases)
2. Run the installer and follow the instructions

**Portable:**
1. Download `Terminal-Launcher-{version}-Portable.exe`
2. Run directly without installation
3. Data is stored in `.terminal-manager` folder next to the executable

## 📖 Documentation

### Workspace Architecture

Terminal Launcher uses an intelligent workspace system that automatically determines where to store data:

#### Workspace Structure

```
.my-project/
├── .terminal-manager/      # Terminal workspace
│   ├── commands.db         # SQLite command database
│   ├── tabs.yaml           # Current tabs
│   ├── session.yaml        # Last session (auto-saved)
│   ├── settings.json       # Application settings
│   ├── logs/               # Terminal logs (gitignored)
│   └── templates.yaml      # Command templates (can be committed)
├── src/
├── package.json
└── ...
```

#### How It Works

1. **Project Workspace**: If `.terminal-manager` exists in current directory or parent directories, it's used
2. **Portable Mode**: In portable builds, data is stored next to the executable
3. **Global Fallback**: If no workspace is found, uses system user directory

#### Git Integration

Recommended `.gitignore`:

```gitignore
.terminal-manager/logs/
.terminal-manager/session.yaml
.terminal-manager/settings.json
.terminal-manager/*.db

# Keep templates for team sharing
!.terminal-manager/templates.yaml
```

### Import/Export Sessions

#### Export Session

1. Click **"Export"** button in the status bar
2. Choose where to save the `.yaml` file
3. Session is saved with all tabs and commands

#### Import Session

1. Click **"Import"** button in the status bar
2. Select session `.yaml` file
3. Session loads and replaces current state

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+T` | New tab |
| `Ctrl+W` | Close tab |
| `Ctrl+Tab` | Next tab |
| `Ctrl+Shift+Tab` | Previous tab |
| `Ctrl+F` | Search in terminal |
| `F1` | **Open Help** |

## 📚 Documentation

For more detailed information:

- **[CHANGELOG.md](CHANGELOG.md)** - Version history and changes
- **[docs/](docs/)** - Additional documentation index
- **[tests/README.md](tests/README.md)** - Testing guide for developers
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute
- **[SECURITY.md](SECURITY.md)** - Security policy

### Internal Documentation

The `Int_docs/` folder contains detailed technical analysis, bug fix documentation, and development methodology used during project development. These files are primarily for maintainers and developers interested in the technical details.

### Configuration

Settings are stored in `.terminal-manager/settings.json` in your workspace:

```json
{
  "theme": "dark",
  "fontSize": 14,
  "fontFamily": "Consolas, monospace",
  "autoStartLogging": true,
  "sidebarWidth": 300
}
```

### Default Shell

- **Windows**: PowerShell

## 📂 Project Structure

```
terminal-launcher/
├── electron/                 # Electron main process
│   ├── main.ts              # Entry point
│   ├── preload.ts           # Preload script
│   ├── workspace-manager.ts # Workspace management
│   ├── settings-manager.ts  # Settings manager
│   └── commandsDb.ts        # Command database (SQLite)
├── src/                     # Vue 3 frontend
│   ├── components/          # Vue components
│   │   ├── Terminal/        # Terminal components
│   │   ├── Layout/          # Layout components
│   │   └── Settings/        # Settings components
│   ├── store/               # Pinia store
│   ├── styles/              # Global styles
│   └── types/               # TypeScript definitions
├── build/                   # Build resources
│   └── icons/               # Application icons
├── .terminal-manager/       # Workspace (gitignored)
│   └── templates.yaml       # Command templates (in git)
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## 🔧 npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run in development mode |
| `npm run build` | Build Vue application |
| `npm run electron:build` | Build for Windows |
| `npm run electron:build:win` | Build for Windows (explicit) |
| `npm run preview` | Preview production build |

## 🐛 Troubleshooting

### Common Issues

**Application doesn't launch after build?**
- Ensure all system dependencies are installed
- Check logs in developer console (DevTools)

**Terminal not working?**
- Verify PowerShell is available on your system
- Check if terminal emulator is properly initialized

**Permission issues?**
- Application runs without administrator rights
- Data is stored in user folder by default

### Enabling DevTools

In development mode, DevTools open automatically. For production:

```typescript
// In electron/main.ts uncomment:
mainWindow.webContents.openDevTools();
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test them
4. Commit with a clear message
5. Push to your branch
6. Open a Pull Request

### Code Guidelines

- Use TypeScript for all new code
- Follow existing code style
- Add comments for complex logic
- Test on Windows
- Update documentation when changing functionality

## ❓ FAQ

**How do I reset settings?**
Delete `.terminal-manager/settings.json` from your workspace.

**Where are terminal logs stored?**
Logs are saved in `.terminal-manager/logs/` in your workspace.

**Can I use multiple workspaces?**
Yes! Each project can have its own `.terminal-manager` with isolated settings.

**How do I export commands for my team?**
Use templates in `.terminal-manager/templates.yaml` and commit them to Git.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vue 3](https://vuejs.org/)
- [Electron](https://www.electronjs.org/)
- [Vite](https://vitejs.dev/)
- [xterm.js](https://xtermjs.org/)
- [Tabler Icons](https://tabler-icons.io/)

---

<div align="center">

**Made with ❤️ for developers**

[⬆ Back to top](#terminal-launcher)

</div>
