# Remote Desktop SSH Client

A modern, cross-platform SSH client built with Electron, React, TypeScript, and Tailwind CSS. Manage local and remote Linux systems from a beautiful, tabbed interface with built-in file transfer support.

![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Windows%20%7C%20macOS-lightgrey)
![Stack](https://img.shields.io/badge/stack-Electron%20%2B%20React%20%2B%20TypeScript-green)

---

## Features

### Core Functionality
- **Multi-server management**: Organize local and cloud Linux servers in groups
- **Tabbed terminal interface**: Multiple SSH and local terminal sessions in one window
- **Built-in terminal emulator**: Powered by xterm.js with full 256-color support
- **SFTP file transfer**: Dual-pane file browser with drag-and-drop upload/download
- **Session persistence**: Reconnect on app restart, keep terminal scrollback
- **Split pane support**: Horizontal/vertical terminal splits within a tab

### User Experience
- **Beautiful dark theme**: Inspired by Termius and WindTerm
- **Connection status indicators**: Green LEDs show connected/disconnected state
- **Keyboard shortcuts**: Ctrl+T new tab, Ctrl+W close tab, Ctrl+N new connection
- **Credential management**: Secure password and SSH key storage via system keychain
- **Auto-reconnect**: Keep-alive support for unreliable connections

### Technical
- **Electron + React + TypeScript**: Modern desktop app stack
- **Tailwind CSS**: Utility-first styling with custom terminal color scheme
- **Zustand**: Lightweight state management
- **ssh2**: Full SSH protocol support (password, key, agent auth)
- **node-pty**: Native pseudo-terminal for local shells
- **xterm.js**: Industry-standard terminal emulator

---

## Screenshots

> Coming soon - the app is under active development

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Python 3.11+ (for node-pty native build)

### Development

```bash
# Clone the repository
git clone https://github.com/Dawn-js/remote-desktop-app.git
cd remote-desktop-app

# Install dependencies
npm install

# Start development server
npm run dev
```

This will start:
- Vite dev server on `http://localhost:5173`
- Electron main process with hot reload

### Build

```bash
# Build for production
npm run build

# Package for current platform
npm run package
```

Output will be in `dist-electron/`.

### Run Tests

```bash
npm run typecheck
npm run lint
```

---

## Project Structure

```
remote-desktop-app/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── index.ts            # App entry point, window creation
│   │   ├── preload.ts          # Context bridge, IPC exposure
│   │   ├── ssh-manager.ts      # SSH session management (ssh2)
│   │   ├── terminal-manager.ts # Local terminal management (node-pty)
│   │   └── config-manager.ts   # Config + credential storage (keytar)
│   ├── renderer/               # React frontend
│   │   ├── src/
│   │   │   ├── App.tsx         # Main layout, sidebar, tabs
│   │   │   ├── components/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── TabBar.tsx
│   │   │   │   ├── Terminal.tsx
│   │   │   │   └── ConnectionModal.tsx
│   │   │   ├── store/
│   │   │   │   └── useAppStore.ts
│   │   │   ├── hooks/
│   │   │   │   └── useKeyboardShortcuts.ts
│   │   │   └── index.css       # Tailwind + terminal theme
│   │   └── index.html
│   └── shared/                 # Types shared between main/renderer
│       └── types.ts
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── electron-builder.json
```

---

## Configuration

### Server Groups
Servers are organized into groups: `Local`, `Cloud`, `Production`, `Development`. You can customize these in the app settings.

### Theme
The app uses a custom dark terminal theme with VS Code-inspired colors:
- Background: `#1e1e1e`
- Foreground: `#d4d4d4`
- Selection: `#264f78`

Font: Fira Code, JetBrains Mono, or system monospace fallback.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+T` | New local terminal tab |
| `Ctrl+W` | Close active tab |
| `Ctrl+N` | New SSH connection |

---

## Roadmap

- [x] Project scaffold with Electron + React + TypeScript
- [x] Dark theme UI with Tailwind CSS
- [x] Local terminal support (node-pty)
- [x] SSH connection manager
- [x] xterm.js terminal emulator
- [x] Tabbed interface with sidebar
- [x] Connection modal for new servers
- [x] Keyboard shortcuts
- [ ] SFTP file transfer panel
- [ ] Split pane support
- [ ] Terminal color schemes/themes
- [ ] Port forwarding (SSH tunnels)
- [ ] Batch command execution
- [ ] System monitoring dashboard
- [ ] Plugin system

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## License

MIT License - feel free to use this project as a starting point for your own SSH client.

---

## Acknowledgments

- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
- [xterm.js](https://xtermjs.org/)
- [ssh2](https://github.com/mscdex/ssh2)
- [node-pty](https://github.com/microsoft/node-pty)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)
