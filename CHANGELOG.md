# Changelog

All notable changes to Terminal Launcher will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-04-15

### 🎉 Major Release - Stability & Bug Fixes

This release focuses on fixing critical bugs and improving application stability, particularly around application shutdown and user experience.

### 🔴 Critical Bug Fixes

#### Fixed - Application Shutdown Issues
- **Fixed Alt+F4 not working** - Application now closes properly when user presses Alt+F4
  - Added explicit `mainWindow.close()` call in webContents `before-input-event` handler
  - Filtered to only respond on `keyUp` event to prevent double-triggering
  - Shutdown time: <3 seconds (was hanging indefinitely)
  
- **Fixed infinite loop in before-quit handler** - Eliminated recursive calls that caused stack overflow
  - Disabled problematic `before-quit` handler that was calling `app.quit()` recursively
  - Moved session save logic to `window-all-closed` event for cleaner flow
  - Changed from `app.quit()` to `app.exit(0)` for immediate termination after cleanup
  
- **Fixed application hang on close** - Resolved race condition between dual save mechanisms
  - Removed conflicting `saveSessionStateSync()` from window 'close' event
  - Consolidated session saving to single location in `window-all-closed`
  - Added 2-second timeout to prevent indefinite hangs if renderer is unresponsive

#### Fixed - Platform-Specific Issues
- **Fixed PTY processes blocking exit on Windows** - Implemented platform-aware process termination
  - Windows: Use `term.kill()` without signal parameter (Windows doesn't support Unix signals)
  - Unix/Linux/macOS: Use `term.kill('SIGKILL')` for force kill
  - Prevents "Signals not supported on windows" error
  - Ensures all terminal processes are properly terminated before exit

### 🟡 Visual Bug Fixes

#### Fixed - Theme Toggle Artifacts
- **Fixed white flash around terminal during theme toggle** 
  - Root cause: CSS transitions applying to padding area of terminal container
  - Solution: Disabled transitions on `.terminal-container` and `.xterm` elements
  - Result: Instant theme change without visual artifacts
  
- **Fixed white flash in left panel (search field and command cards)**
  - Added `transition: none !important` to `.search-input`
  - Removed `background-color` transition from `.command-card`
  - Kept `transform` transition for hover effects
  - Result: Clean theme transitions throughout the UI

### 🧪 Testing Improvements

#### Unit Tests
- **84 unit tests passing** (6 test files)
  - terminalStore.test.ts: 7 tests (tab management, commands)
  - terminalStore.advanced.test.ts: 16 tests (edge cases, multiple operations)
  - i18n.test.ts: 17 tests (translations, language switching, templates)
  - useToast.test.ts: 6 tests (notifications)
  - types.test.ts: 15 tests (interface validation)
  - helpContent.test.ts: 23 tests (help structure, cross-language validation)
  
#### E2E Tests
- **6 E2E tests passing** (Playwright + Chromium)
  - Application loads correctly
  - Default tabs present
  - Add tab functionality works
  - Language toggle (RU ↔ EN) works
  - Command add/remove works
  - Tab deletion works

### 📚 Documentation

#### New Documentation
- **FIX_ALT_F4_COMPLETE.md** - Comprehensive documentation of Alt+F4 fix with FSB analysis
- **TESTING_CHECKLIST.md** - Complete testing checklist with manual and automated test scenarios
- **RELEASE_READINESS_REPORT.md** - Full release readiness report with metrics and recommendations
- **QUICK_TEST_SUMMARY.md** - Quick reference summary of test results

#### Updated Documentation
- **tests/README.md** - Updated with current test status and coverage information
- **FSB_POST_FIX_COMPLETE_ANALYSIS.md** - Post-fix analysis using FSB methodology
- **FSB_AI_HUMAN_COLLABORATION.md** - Extended FSB methodology with AI-human collaboration patterns

### 🔧 Technical Improvements

#### Architecture Changes
- **Refactored shutdown sequence** for reliability and predictability
  ```
  Before: window.close → saveSessionStateSync() [HANGS] → before-quit → app.quit() [LOOP]
  After:  Alt+F4 → mainWindow.close() → window-all-closed → cleanup → app.exit(0)
  ```
  
- **Added defensive programming patterns**
  - Timeout protection on async operations (`Promise.race()`)
  - Platform detection for native module compatibility
  - Graceful degradation (continue on error instead of crash)
  
- **Improved error handling**
  - Try-catch blocks around all critical operations
  - Comprehensive logging for debugging
  - Error recovery strategies (skip save if renderer destroyed)

#### Performance
- **Startup time**: ~300ms (excellent)
- **Shutdown time**: <3 seconds (reliable)
- **Theme toggle**: Instant (no flash)
- **Memory**: No leaks detected, clean resource cleanup

### 🌍 Localization
- ✅ Russian (RU) - Complete
- ✅ English (EN) - Complete
- Dynamic language switching working correctly
- Language preference persisted across sessions

### 📦 Build System
- Electron 41.2.0
- Vue 3.5.32
- Vite 6.4.2
- node-pty 1.1.0 (native module, unpacked from asar)
- sqlite3 6.0.1 (native module, unpacked from asar)

### 🎯 Compatibility
- ✅ Windows 10/11 (x64) - Tested and verified
- ⚠️ macOS - Not tested in this release
- ⚠️ Linux - Not tested in this release

### 🐛 Known Issues
- Session save may be skipped if renderer is destroyed too quickly (<2s timeout)
  - Impact: Low - session will be saved on next proper close
  - Workaround: Close via menu instead of Alt+F4 for guaranteed save
  
- GPU process warnings in E2E tests (headless mode)
  - Impact: None - cosmetic only, doesn't affect functionality

### 🔜 Future Enhancements (Backlog)
- Code coverage reporting (target: >70%)
- Performance benchmarks documentation
- User manual / Quick Start guide
- Integration tests for complex scenarios
- Load testing (50+ tabs stress test)
- Accessibility audit (WCAG compliance)
- Security scan (dependency audit)

### 👥 Contributors
- Development and bug fixes using FSB (Function-Connection-Block) methodology
- AI-assisted development with iterative post-fix analysis

---

## [1.x.x] - Previous Versions

*Note: Previous version history not documented in CHANGELOG format.*

---

## Version Numbering

This project uses [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

**Example:** 2.0.0 = MAJOR.MINOR.PATCH

---

## Release Process

1. Update CHANGELOG.md with all changes
2. Run full test suite: `npm test && npm run test:e2e`
3. Verify no regressions manually
4. Create git tag: `git tag v2.0.0`
5. Build production binaries: `npm run electron:build:win`
6. Create GitHub Release with binaries
7. Publish to distribution channels

---

For more detailed technical documentation, see:
- [Int_docs/](./Int_docs/) - Internal documentation
- [tests/README.md](./tests/README.md) - Testing guide
- [README.md](./README.md) - Project overview
