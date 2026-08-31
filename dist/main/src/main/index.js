"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const ssh_manager_1 = require("./ssh-manager");
const terminal_manager_1 = require("./terminal-manager");
const config_manager_1 = require("./config-manager");
const isDev = process.env.NODE_ENV === 'development';
let mainWindow = null;
let sshManager = null;
let terminalManager = null;
let configManager = null;
function getConfigPath() {
    return path.join(electron_1.app.getPath('userData'), 'config.json');
}
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
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
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url);
        return { action: 'deny' };
    });
    initializeManagers(mainWindow.webContents);
}
function initializeManagers(webContents) {
    configManager = new config_manager_1.ConfigManager(getConfigPath());
    sshManager = new ssh_manager_1.SSHManager(webContents);
    terminalManager = new terminal_manager_1.TerminalManager(webContents);
    setupConfigIPCHandlers();
    setupServerIPCHandlers();
    setupAppIPCHandlers();
}
function setupConfigIPCHandlers() {
    electron_1.ipcMain.handle('config:get', () => {
        return configManager?.getConfig();
    });
    electron_1.ipcMain.handle('config:save', (_event, config) => {
        return configManager?.saveConfig(config);
    });
}
function setupServerIPCHandlers() {
    electron_1.ipcMain.handle('server:add', async (_event, server) => {
        return configManager?.addServer(server);
    });
    electron_1.ipcMain.handle('server:update', async (_event, id, updates) => {
        return configManager?.updateServer(id, updates);
    });
    electron_1.ipcMain.handle('server:delete', async (_event, id) => {
        return configManager?.deleteServer(id);
    });
    electron_1.ipcMain.handle('server:get-with-credentials', async (_event, id) => {
        return configManager?.getServerWithCredentials(id);
    });
}
function setupAppIPCHandlers() {
    electron_1.ipcMain.handle('app:quit', () => {
        sshManager?.closeAllSessions();
        terminalManager?.closeAllTerminals();
        electron_1.app.quit();
    });
    electron_1.ipcMain.handle('app:minimize', () => {
        mainWindow?.minimize();
    });
    electron_1.ipcMain.handle('app:maximize', () => {
        if (mainWindow?.isMaximized()) {
            mainWindow.unmaximize();
        }
        else {
            mainWindow?.maximize();
        }
    });
    electron_1.ipcMain.handle('app:is-maximized', () => {
        return mainWindow?.isMaximized() ?? false;
    });
}
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
//# sourceMappingURL=index.js.map