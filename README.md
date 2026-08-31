# 远程桌面 SSH 客户端

一款基于 Electron、React、TypeScript 和 Tailwind CSS 构建的现代化跨平台 SSH 客户端。通过美观的标签页界面管理本地及远程 Linux 系统，并内置文件传输功能。

![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Windows%20%7C%20macOS-lightgrey)
![Stack](https://img.shields.io/badge/stack-Electron%20%2B%20React%20%2B%20TypeScript-green)

---

## 功能特性

### 核心功能
- **多服务器管理**：将本地与云端 Linux 服务器按组分类管理
- **标签页式终端界面**：在单个窗口中同时管理多个 SSH 会话和本地终端
- **内置终端模拟器**：基于 xterm.js，支持完整的 256 色显示
- **SFTP 文件传输**：双面板文件浏览器，支持拖拽上传/下载
- **会话持久化**：应用重启后自动恢复会话，保留终端回滚历史
- **分屏支持**：在标签页内进行水平/垂直终端分屏

### 用户体验
- **精美深色主题**：灵感来自 Termius 和 WindTerm
- **连接状态指示灯**：绿色 LED 实时显示连接/断开状态
- **键盘快捷键**：Ctrl+T 新建标签，Ctrl+W 关闭标签，Ctrl+N 新建连接
- **凭据管理**：通过系统密钥链安全存储密码和 SSH 密钥
- **自动重连**：支持保活机制，应对不稳定网络

### 技术栈
- **Electron + React + TypeScript**：现代桌面应用开发栈
- **Tailwind CSS**：实用优先的样式框架，搭配定制终端配色方案
- **Zustand**：轻量级状态管理库
- **ssh2**：完整 SSH 协议支持（密码、密钥、代理认证）
- **node-pty**：原生伪终端，用于本地 Shell
- **xterm.js**：业界标准的终端模拟器

---

## 截图展示

> 即将推出 —— 应用正积极开发中

---

## 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Python 3.11+（用于 node-pty 原生模块编译）

### 开发模式

```bash
# 克隆仓库
git clone https://github.com/Dawn-js/remote-desktop-app.git
cd remote-desktop-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

执行后将会启动：
- Vite 开发服务器，地址为 `http://localhost:5173`
- Electron 主进程，支持热重载

### 构建打包

```bash
# 生产环境构建
npm run build

# 打包当前平台应用
npm run package
```

输出目录为 `dist-electron/`。

### 运行测试

```bash
npm run typecheck
npm run lint
```

---

## 项目结构

```
remote-desktop-app/
├── src/
│   ├── main/                    # Electron 主进程
│   │   ├── index.ts            # 应用入口，窗口创建
│   │   ├── preload.ts          # 上下文桥接，IPC 暴露
│   │   ├── ssh-manager.ts      # SSH 会话管理（ssh2）
│   │   ├── terminal-manager.ts # 本地终端管理（node-pty）
│   │   └── config-manager.ts   # 配置与凭据存储（keytar）
│   ├── renderer/               # React 前端
│   │   ├── src/
│   │   │   ├── App.tsx         # 主布局、侧边栏、标签页
│   │   │   ├── components/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── TabBar.tsx
│   │   │   │   ├── Terminal.tsx
│   │   │   │   └── ConnectionModal.tsx
│   │   │   ├── store/
│   │   │   │   └── useAppStore.ts
│   │   │   ├── hooks/
│   │   │   │   └── useKeyboardShortcuts.ts
│   │   │   └── index.css       # Tailwind + 终端主题
│   │   └── index.html
│   └── shared/                 # 主/渲染进程共享类型
│       └── types.ts
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── electron-builder.json
```

---

## 配置说明

### 服务器分组
服务器按组分类：`本地`、`云端`、`生产`、`开发`。你可以在应用设置中自定义这些分组。

### 主题
应用使用深色终端主题，配色灵感来自 VS Code：
- 背景色：`#1e1e1e`
- 前景色：`#d4d4d4`
- 选中高亮：`#264f78`

字体：Fira Code、JetBrains Mono 或系统等宽字体后备。

---

## 键盘快捷键

| 快捷键 | 操作 |
|--------|------|
| `Ctrl+T` | 新建本地终端标签 |
| `Ctrl+W` | 关闭当前标签 |
| `Ctrl+N` | 新建 SSH 连接 |

---

## 开发路线图

- [x] 项目脚手架（Electron + React + TypeScript）
- [x] 深色主题 UI（Tailwind CSS）
- [x] 本地终端支持（node-pty）
- [x] SSH 连接管理器
- [x] xterm.js 终端模拟器
- [x] 带侧边栏的标签页界面
- [x] 新服务器连接弹窗
- [x] 键盘快捷键
- [ ] SFTP 文件传输面板
- [ ] 分屏支持
- [ ] 终端配色方案/主题
- [ ] 端口转发（SSH 隧道）
- [ ] 批量命令执行
- [ ] 系统监控仪表盘
- [ ] 插件系统

---

## 参与贡献

欢迎贡献！请随时提交 Pull Request。

---

## 许可证

MIT 许可证 —— 欢迎将此项目作为自己 SSH 客户端的起点。

---

## 致谢

- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
- [xterm.js](https://xtermjs.org/)
- [ssh2](https://github.com/mscdex/ssh2)
- [node-pty](https://github.com/microsoft/node-pty)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)
