"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    ssh: {
        createSession: (data) => electron_1.ipcRenderer.invoke('ssh:create-session', data),
        sendInput: (sessionId, data) => electron_1.ipcRenderer.invoke('ssh:send-input', sessionId, data),
        resize: (sessionId, cols, rows) => electron_1.ipcRenderer.invoke('ssh:resize', { sessionId, cols, rows }),
        closeSession: (sessionId) => electron_1.ipcRenderer.invoke('ssh:close-session', sessionId),
        onOutput: (callback) => {
            electron_1.ipcRenderer.on('ssh:output', (_event, data) => callback(data));
            return () => electron_1.ipcRenderer.removeAllListeners('ssh:output');
        },
        onExit: (callback) => {
            electron_1.ipcRenderer.on('ssh:exit', (_event, data) => callback(data));
            return () => electron_1.ipcRenderer.removeAllListeners('ssh:exit');
        },
        onError: (callback) => {
            electron_1.ipcRenderer.on('ssh:error', (_event, data) => callback(data));
            return () => electron_1.ipcRenderer.removeAllListeners('ssh:error');
        },
    },
    local: {
        createTerminal: (data) => electron_1.ipcRenderer.invoke('local:create-terminal', data),
        sendInput: (sessionId, data) => electron_1.ipcRenderer.invoke('local:send-input', sessionId, data),
        resize: (sessionId, cols, rows) => electron_1.ipcRenderer.invoke('local:resize', { sessionId, cols, rows }),
        closeTerminal: (sessionId) => electron_1.ipcRenderer.invoke('local:close-terminal', sessionId),
        onOutput: (callback) => {
            electron_1.ipcRenderer.on('local:output', (_event, data) => callback(data));
            return () => electron_1.ipcRenderer.removeAllListeners('local:output');
        },
        onExit: (callback) => {
            electron_1.ipcRenderer.on('local:exit', (_event, data) => callback(data));
            return () => electron_1.ipcRenderer.removeAllListeners('local:exit');
        },
        onError: (callback) => {
            electron_1.ipcRenderer.on('local:error', (_event, data) => callback(data));
            return () => electron_1.ipcRenderer.removeAllListeners('local:error');
        },
    },
    config: {
        get: () => electron_1.ipcRenderer.invoke('config:get'),
        save: (config) => electron_1.ipcRenderer.invoke('config:save', config),
    },
    server: {
        add: (server) => electron_1.ipcRenderer.invoke('server:add', server),
        update: (id, updates) => electron_1.ipcRenderer.invoke('server:update', id, updates),
        delete: (id) => electron_1.ipcRenderer.invoke('server:delete', id),
        getWithCredentials: (id) => electron_1.ipcRenderer.invoke('server:get-with-credentials', id),
    },
    app: {
        quit: () => electron_1.ipcRenderer.invoke('app:quit'),
        minimize: () => electron_1.ipcRenderer.invoke('app:minimize'),
        maximize: () => electron_1.ipcRenderer.invoke('app:maximize'),
        isMaximized: () => electron_1.ipcRenderer.invoke('app:is-maximized'),
        onMenuAction: (callback) => {
            electron_1.ipcRenderer.on('menu:action', (_event, action) => callback(action));
            return () => electron_1.ipcRenderer.removeAllListeners('menu:action');
        },
    },
});
//# sourceMappingURL=preload.js.map