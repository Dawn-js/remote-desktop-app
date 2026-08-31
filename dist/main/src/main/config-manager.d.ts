export interface ServerConfig {
    id: string;
    name: string;
    group: string;
    host: string;
    port: number;
    username: string;
    authMethod: 'password' | 'key' | 'agent';
    password?: string;
    privateKeyPath?: string;
    passphrase?: string;
    keepAlive?: boolean;
    keepAliveInterval?: number;
    description?: string;
    createdAt: number;
    updatedAt: number;
}
export interface AppConfig {
    servers: ServerConfig[];
    groups: string[];
    settings: {
        theme: 'dark' | 'light' | 'system';
        fontSize: number;
        fontFamily: string;
        cursorStyle: 'block' | 'underline' | 'bar';
        scrollback: number;
        bellSound: boolean;
        confirmClose: boolean;
        autoReconnect: boolean;
        startupBehavior: 'new-tab' | 'restore' | 'none';
    };
}
export declare class ConfigManager {
    private configPath;
    private config;
    constructor(configPath: string);
    private loadConfig;
    private saveConfigToFile;
    getConfig(): AppConfig;
    saveConfig(config: Partial<AppConfig>): AppConfig;
    addServer(server: Omit<ServerConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServerConfig>;
    updateServer(id: string, updates: Partial<ServerConfig>): Promise<ServerConfig | null>;
    deleteServer(id: string): Promise<boolean>;
    getServerWithCredentials(id: string): Promise<ServerConfig | null>;
    addGroup(group: string): void;
    removeGroup(group: string): void;
}
//# sourceMappingURL=config-manager.d.ts.map