"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const uuid_1 = require("uuid");
const keytar_1 = __importDefault(require("keytar"));
const DEFAULT_CONFIG = {
    servers: [],
    groups: ['Local', 'Cloud', 'Production', 'Development'],
    settings: {
        theme: 'dark',
        fontSize: 14,
        fontFamily: 'Fira Code',
        cursorStyle: 'block',
        scrollback: 10000,
        bellSound: false,
        confirmClose: true,
        autoReconnect: true,
        startupBehavior: 'restore'
    }
};
class ConfigManager {
    configPath;
    config;
    constructor(configPath) {
        this.configPath = configPath;
        this.config = this.loadConfig();
    }
    loadConfig() {
        try {
            if ((0, fs_1.existsSync)(this.configPath)) {
                const data = (0, fs_1.readFileSync)(this.configPath, 'utf-8');
                const parsed = JSON.parse(data);
                return { ...DEFAULT_CONFIG, ...parsed, settings: { ...DEFAULT_CONFIG.settings, ...parsed.settings } };
            }
        }
        catch (error) {
            console.error('Failed to load config:', error);
        }
        return DEFAULT_CONFIG;
    }
    saveConfigToFile() {
        try {
            const dir = (0, path_1.dirname)(this.configPath);
            if (!(0, fs_1.existsSync)(dir)) {
                (0, fs_1.mkdirSync)(dir, { recursive: true });
            }
            (0, fs_1.writeFileSync)(this.configPath, JSON.stringify(this.config, null, 2));
        }
        catch (error) {
            console.error('Failed to save config:', error);
        }
    }
    getConfig() {
        return this.config;
    }
    saveConfig(config) {
        this.config = { ...this.config, ...config, settings: { ...this.config.settings, ...config.settings } };
        this.saveConfigToFile();
        return this.config;
    }
    async addServer(server) {
        const newServer = {
            ...server,
            id: (0, uuid_1.v4)(),
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        if (server.authMethod === 'password' && server.password) {
            await keytar_1.default.setPassword('ssh-client', newServer.id, server.password);
        }
        else if (server.authMethod === 'key' && server.passphrase) {
            await keytar_1.default.setPassword('ssh-client', `${newServer.id}-passphrase`, server.passphrase);
        }
        this.config.servers.push(newServer);
        this.saveConfigToFile();
        return newServer;
    }
    async updateServer(id, updates) {
        const index = this.config.servers.findIndex(s => s.id === id);
        if (index === -1)
            return null;
        const server = this.config.servers[index];
        if (updates.authMethod === 'password' && updates.password) {
            await keytar_1.default.setPassword('ssh-client', id, updates.password);
        }
        else if (updates.authMethod === 'key' && updates.passphrase) {
            await keytar_1.default.setPassword('ssh-client', `${id}-passphrase`, updates.passphrase);
        }
        this.config.servers[index] = {
            ...server,
            ...updates,
            updatedAt: Date.now()
        };
        this.saveConfigToFile();
        return this.config.servers[index];
    }
    async deleteServer(id) {
        const index = this.config.servers.findIndex(s => s.id === id);
        if (index === -1)
            return false;
        await keytar_1.default.deletePassword('ssh-client', id);
        await keytar_1.default.deletePassword('ssh-client', `${id}-passphrase`);
        this.config.servers.splice(index, 1);
        this.saveConfigToFile();
        return true;
    }
    async getServerWithCredentials(id) {
        const server = this.config.servers.find(s => s.id === id);
        if (!server)
            return null;
        const serverWithCreds = { ...server };
        if (server.authMethod === 'password') {
            const password = await keytar_1.default.getPassword('ssh-client', id);
            if (password)
                serverWithCreds.password = password;
        }
        else if (server.authMethod === 'key') {
            const passphrase = await keytar_1.default.getPassword('ssh-client', `${id}-passphrase`);
            if (passphrase)
                serverWithCreds.passphrase = passphrase;
        }
        return serverWithCreds;
    }
    addGroup(group) {
        if (!this.config.groups.includes(group)) {
            this.config.groups.push(group);
            this.saveConfigToFile();
        }
    }
    removeGroup(group) {
        this.config.groups = this.config.groups.filter(g => g !== group);
        this.config.servers = this.config.servers.map(s => s.group === group ? { ...s, group: 'Local' } : s);
        this.saveConfigToFile();
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config-manager.js.map