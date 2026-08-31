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
exports.TerminalManager = void 0;
const child_process_1 = require("child_process");
const electron_1 = require("electron");
const os = __importStar(require("os"));
class TerminalManager {
    sessions = new Map();
    webContents = null;
    constructor(webContents) {
        this.webContents = webContents;
        this.setupIPCHandlers();
    }
    setupIPCHandlers() {
        electron_1.ipcMain.handle('local:create-terminal', async (_event, data) => {
            return this.createTerminal(data.sessionId, data.cols, data.rows, data.shell, data.cwd);
        });
        electron_1.ipcMain.handle('local:send-input', async (_event, sessionId, data) => {
            this.sendInput(sessionId, data);
        });
        electron_1.ipcMain.handle('local:resize', async (_event, data) => {
            this.resize(data.sessionId, data.cols, data.rows);
        });
        electron_1.ipcMain.handle('local:close-terminal', async (_event, sessionId) => {
            this.closeTerminal(sessionId);
        });
    }
    async createTerminal(sessionId, cols, rows, shell, cwd) {
        try {
            const defaultShell = this.getDefaultShell();
            const shellPath = shell || defaultShell;
            const workingDir = cwd || os.homedir();
            const pty = (0, child_process_1.spawn)(shellPath, [], {
                cwd: workingDir,
                env: {
                    ...process.env,
                    TERM: 'xterm-256color',
                    COLUMNS: String(cols),
                    LINES: String(rows),
                },
                detached: false,
            });
            if (!pty.pid) {
                return { success: false, error: 'Failed to spawn shell process' };
            }
            const session = { pty, cols, rows, pid: pty.pid };
            this.sessions.set(sessionId, session);
            pty.stdout?.on('data', (data) => {
                this.webContents?.send('local:output', { sessionId, data: data.toString('utf-8') });
            });
            pty.stderr?.on('data', (data) => {
                this.webContents?.send('local:output', { sessionId, data: data.toString('utf-8') });
            });
            pty.on('exit', (code, signal) => {
                this.webContents?.send('local:exit', { sessionId, code: code ?? 0, signal: signal ?? undefined });
                this.sessions.delete(sessionId);
            });
            pty.on('error', (err) => {
                this.webContents?.send('local:error', { sessionId, error: err.message });
                this.sessions.delete(sessionId);
            });
            return { success: true, sessionId };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    sendInput(sessionId, data) {
        const session = this.sessions.get(sessionId);
        if (session && session.pty) {
            session.pty.stdin?.write(data);
        }
    }
    resize(sessionId, cols, rows) {
        const session = this.sessions.get(sessionId);
        if (session && session.pty) {
            session.pty.resize(cols, rows);
            session.cols = cols;
            session.rows = rows;
        }
    }
    closeTerminal(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.pty?.kill('SIGTERM');
            setTimeout(() => {
                if (this.sessions.has(sessionId)) {
                    const s = this.sessions.get(sessionId);
                    s?.pty?.kill('SIGKILL');
                }
            }, 1000);
            this.sessions.delete(sessionId);
        }
    }
    getDefaultShell() {
        const platform = os.platform();
        if (platform === 'win32') {
            return process.env.COMSPEC || 'cmd.exe';
        }
        return process.env.SHELL || '/bin/bash';
    }
    closeAllTerminals() {
        for (const [sessionId, session] of this.sessions) {
            session.pty?.kill('SIGTERM');
        }
        this.sessions.clear();
    }
}
exports.TerminalManager = TerminalManager;
//# sourceMappingURL=terminal-manager.js.map