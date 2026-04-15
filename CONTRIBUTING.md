# Contributing to Terminal Launcher

Thank you for your interest in contributing to Terminal Launcher! This document provides guidelines for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Process](#development-process)
- [Style Guide](#style-guide)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)

## Code of Conduct

Please be respectful and constructive in all interactions. We strive to create a welcoming community for everyone.

## How to Contribute

### Reporting Bugs

Before creating a bug report:

1. Check [existing issues](https://github.com/IgorPushechnikov/terminal-launcher/issues)
2. Verify the issue is reproducible on the latest version

When creating an issue, include:

- **Description**: Clear description of the problem
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Environment**: OS, app version, Node.js version

### Suggesting Enhancements

For feature requests:

- Describe the problem the feature solves
- Provide usage examples
- Explain why it's important for the project

### Pull Requests

1. Fork the repository
2. Create a branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Test your changes
5. Commit with a clear message
6. Push to your fork
7. Open a Pull Request

## Development Process

### Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/terminal-launcher.git
cd terminal-launcher

# Add upstream remote
git remote add upstream https://github.com/IgorPushechnikov/terminal-launcher.git

# Install dependencies
npm install

# Start development server
npm run dev
```

### Testing

Before submitting a PR, ensure:

- [ ] Code compiles without errors
- [ ] All existing features work
- [ ] New features are tested
- [ ] Tested on Windows (if applicable)
- [ ] Tested on macOS (if applicable)
- [ ] Tested on Linux (if applicable)

### Building

```bash
# Build for current platform
npm run electron:build

# Build for specific platform
npm run electron:build:win
npm run electron:build:mac
npm run electron:build:linux
```

## Style Guide

### Code Style

- Use **TypeScript** for all new code
- Follow [.editorconfig](.editorconfig) if present
- Use 2 spaces for indentation
- Maximum line length: 100 characters
- Use single quotes for strings

### Naming Conventions

- **Files**: kebab-case (`workspace-manager.ts`)
- **Classes**: PascalCase (`WorkspaceManager`)
- **Functions/Variables**: camelCase (`detectWorkspace()`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_TERMINALS`)
- **Vue Components**: PascalCase (`CustomTitleBar.vue`)

### Comments

- Write comments in English
- Comment complex logic
- Don't comment obvious code
- Use JSDoc for public APIs

```typescript
/**
 * Detects workspace configuration based on context
 * @param startPath - Optional starting path for search
 * @returns Workspace information object
 */
detectWorkspace(startPath?: string): WorkspaceInfo {
  // Implementation
}
```

### Vue Components

- Use Composition API with `<script setup>`
- Import types from separate files
- Use TypeScript props

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TerminalTab } from '@/types'

interface Props {
  tabs: TerminalTab[]
  activeTabId?: number
}

const props = defineProps<Props>()
</script>
```

## Commit Messages

Use conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Updating dependencies, build process, etc.

### Examples

```bash
# Good
feat(workspace): add automatic workspace detection
fix(terminal): resolve shell path issue on macOS
docs(readme): update installation instructions
refactor(commands): migrate from YAML to SQLite

# Bad
update stuff
fix bug
changes
```

## Pull Requests

### Checklist

Before submitting a PR:

- [ ] Code follows the style guide
- [ ] Commit messages are clear and informative
- [ ] No console.log() in production code
- [ ] Documentation updated (if needed)
- [ ] TypeScript types added (if needed)
- [ ] Tested on your platform

### Review Process

1. Maintainer reviews code
2. Automated checks must pass
3. Address review comments
4. Squash commits if requested
5. Merge after approval

### Branch Naming

- Features: `feature/description`
- Bug fixes: `fix/description`
- Documentation: `docs/description`
- Refactoring: `refactor/description`

Examples:
- `feature/workspace-detection`
- `fix/terminal-resize-issue`
- `docs/update-readme`

## Questions?

If you have questions:

1. Check [README.md](README.md)
2. Look at [existing issues](https://github.com/IgorPushechnikov/terminal-launcher/issues)
3. Create a new issue with `question` label

---

Thank you for your contribution! 🎉
