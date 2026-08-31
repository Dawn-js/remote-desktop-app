import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { SSHManager } from './ssh-manager';
import { TerminalManager } from './terminal-manager';
import { ConfigManager } from './config-manager';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;
let sshManager: SSHManager | null = null;
let terminalManager: TerminalManager | null = null;
let configManager: ConfigManager | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 12, y: 12 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  initializeManagers(mainWindow.webContents);
}

function initializeManagers(webContents: Electron.WebContents): void {
  configManager = new ConfigManager(getConfigPath());
  sshManager = new SSHManager(webContents);
  terminalManager = new TerminalManager(webContents);

  setupConfigIPCHandlers();
  setupServerIPCHandlers();
  setupAppIPCHandlers();
}

function getConfigPath(): string {
  return path.join(app.getPath('userData'), 'config.json');
}

function setupConfigIPCHandlers(): void {
  ipcMain.handle('config:get', () => {
    return configManager?.getConfig();
  });

  ipcMain.handle('config:save', (_event, config: Partial<AppConfig>) => {
    return configManager?.saveConfig(config);
  });
}

function setupServerIPCHandlers(): void {
  ipcMain.handle('server:add', async (_event, server: Omit<ServerConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    return configManager?.addServer(server);
  });

  ipcMain.handle('server:update', async (_event, id: string, updates: Partial<ServerConfig>) => {
    return configManager?.updateServer(id, updates);
  });

  ipcMain.handle('server:delete', async (_event, id: string) => {
    return configManager?.deleteServer(id);
  });

  ipcMain.handle('server:get-with-credentials', async (_event, id: string) => {
    return configManager?.getServerWithCredentials(id);
  });
}

function setupAppIPCHandlers(): void {
  ipcMain.handle('app:quit', () => {
    sshManager?.closeAllSessions();
    terminalManager?.closeAllTerminals();
    app.quit();
  });

  ipcMain.handle('app:minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.handle('app:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.handle('app:is-maximized', () => {
    return mainWindow?.isMaximized() ?? false;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});