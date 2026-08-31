"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSHManager = void 0;
const ssh2_1 = require("ssh2");
const electron_1 = require("electron");
const config_manager_1 = require("./config-manager");
class SSHManager {
    sessions = new Map();
    webContents = null;
    constructor(webContents) {
        this.webContents = webContents;
        this.setupIPCHandlers();
    }
    setupIPCHandlers() {
        electron_1.ipcMain.handle('ssh:create-session', async (_event, data) => {
            return this.createSession(data.sessionId, data.serverId, data.cols, data.rows);
        });
        electron_1.ipcMain.handle('ssh:send-input', async (_event, sessionId, data) => {
            this.sendInput(sessionId, data);
        });
        electron_1.ipcMain.handle('ssh:resize', async (_event, data) => {
            this.resize(data.sessionId, data.cols, data.rows);
        });
        electron_1.ipcMain.handle('ssh:close-session', async (_event, sessionId) => {
            this.closeSession(sessionId);
        });
    }
    async createSession(sessionId, serverId, cols, rows) {
        try {
            const server = await this.getServerWithCredentials(serverId);
            if (!server) {
                return { success: false, error: 'Server not found' };
            }
            const client = new ssh2_1.Client();
            const config = {
                host: server.host,
                port: server.port,
                username: server.username,
                keepaliveInterval: server.keepAliveInterval || 10000,
                keepaliveCountMax: 3,
                readyTimeout: 20000,
            };
            if (server.authMethod === 'password') {
                config.password = server.password;
            }
            else if (server.authMethod === 'key') {
                config.privateKey = require('fs').readFileSync(server.privateKeyPath, 'utf-8');
                if (server.passphrase) {
                    config.passphrase = server.passphrase;
                }
            }
            else if (server.authMethod === 'agent') {
                config.agent = process.env.SSH_AUTH_SOCK;
            }
            return new Promise((resolve) => {
                client.on('ready', () => {
                    client.shell({ cols, rows, term: 'xterm-256color' }, (err, stream) => {
                        if (err) {
                            client.end();
                            resolve({ success: false, error: err.message });
                            return;
                        }
                        const session = { client, stream, serverId, cols, rows };
                        this.sessions.set(sessionId, session);
                        stream.on('data', (data) => {
                            this.webContents?.send('ssh:output', { sessionId, data: data.toString('utf-8') });
                        });
                        stream.on('close', () => {
                            this.webContents?.send('ssh:exit', { sessionId, code: 0 });
                            this.sessions.delete(sessionId);
                            client.end();
                        });
                        stream.on('error', (err) => {
                            this.webContents?.send('ssh:error', { sessionId, error: err.message });
                            this.sessions.delete(sessionId);
                            client.end();
                        });
                        client.on('close', () => {
                            if (this.sessions.has(sessionId)) {
                                this.webContents?.send('ssh:exit', { sessionId, code: 0 });
                                this.sessions.delete(sessionId);
                            }
                        });
                        client.on('error', (err) => {
                            this.webContents?.send('ssh:error', { sessionId, error: err.message });
                            this.sessions.delete(sessionId);
                        });
                        resolve({ success: true, sessionId });
                    });
                });
                client.on('error', (err) => {
                    resolve({ success: false, error: err.message });
                });
                client.connect(config);
            });
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    sendInput(sessionId, data) {
        const session = this.sessions.get(sessionId);
        if (session && session.stream) {
            session.stream.write(data);
        }
    }
    resize(sessionId, cols, rows) {
        const session = this.sessions.get(sessionId);
        if (session && session.stream) {
            session.stream.setWindow(rows, cols, 0, 0);
            session.cols = cols;
            session.rows = rows;
        }
    }
    closeSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.stream?.end();
            session.client?.end();
            this.sessions.delete(sessionId);
        }
    }
    async getServerWithCredentials(serverId) {
        const configManager = new config_manager_1.ConfigManager(this.getConfigPath());
        return configManager.getServerWithCredentials(serverId);
    }
    getConfigPath() {
        const { app } = require('electron');
        const path = require('path');
        return path.join(app.getPath('userData'), 'config.json');
    }
    closeAllSessions() {
        for (const [sessionId, session] of this.sessions) {
            session.stream?.end();
            session.client?.end();
        }
        this.sessions.clear();
    }
}
exports.SSHManager = SSHManager;
//# sourceMappingURL=ssh-manager.js.map