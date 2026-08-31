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
export type TerminalType = 'ssh' | 'local';
export interface TerminalTab {
    id: string;
    title: string;
    type: TerminalType;
    serverId?: string;
    serverName?: string;
    isActive: boolean;
    isConnected: boolean;
    pid?: number;
}
export interface SSHSessionData {
    sessionId: string;
    serverId: string;
    cols: number;
    rows: number;
}
export interface LocalTerminalData {
    sessionId: string;
    cols: number;
    rows: number;
    shell?: string;
    cwd?: string;
}
export interface SSHOutputData {
    sessionId: string;
    data: string;
}
export interface SSHExitData {
    sessionId: string;
    code: number;
    signal?: string;
}
export interface SSHErrorData {
    sessionId: string;
    error: string;
}
export interface LocalTerminalOutputData {
    sessionId: string;
    data: string;
}
export interface LocalTerminalExitData {
    sessionId: string;
    code: number;
    signal?: string;
}
export interface LocalTerminalErrorData {
    sessionId: string;
    error: string;
}
export interface ResizeData {
    sessionId: string;
    cols: number;
    rows: number;
}
export interface IPCHandlers {
    'ssh:create-session': (data: SSHSessionData) => Promise<{
        success: boolean;
        sessionId?: string;
        error?: string;
    }>;
    'ssh:send-input': (sessionId: string, data: string) => Promise<void>;
    'ssh:resize': (data: ResizeData) => Promise<void>;
    'ssh:close-session': (sessionId: string) => Promise<void>;
    'local:create-terminal': (data: LocalTerminalData) => Promise<{
        success: boolean;
        sessionId?: string;
        error?: string;
    }>;
    'local:send-input': (sessionId: string, data: string) => Promise<void>;
    'local:resize': (data: ResizeData) => Promise<void>;
    'local:close-terminal': (sessionId: string) => Promise<void>;
    'config:get': () => Promise<AppConfig>;
    'config:save': (config: Partial<AppConfig>) => Promise<AppConfig>;
    'server:add': (server: Omit<ServerConfig, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ServerConfig>;
    'server:update': (id: string, updates: Partial<ServerConfig>) => Promise<ServerConfig | null>;
    'server:delete': (id: string) => Promise<boolean>;
    'server:get-with-credentials': (id: string) => Promise<ServerConfig | null>;
    'app:quit': () => Promise<void>;
    'app:minimize': () => Promise<void>;
    'app:maximize': () => Promise<void>;
    'app:is-maximized': () => Promise<boolean>;
}
export type ElectronAPI = {
    ssh: {
        createSession: (data: SSHSessionData) => Promise<{
            success: boolean;
            sessionId?: string;
            error?: string;
        }>;
        sendInput: (sessionId: string, data: string) => Promise<void>;
        resize: (sessionId: string, cols: number, rows: number) => Promise<void>;
        closeSession: (sessionId: string) => Promise<void>;
        onOutput: (callback: (data: SSHOutputData) => void) => () => void;
        onExit: (callback: (data: SSHExitData) => void) => () => void;
        onError: (callback: (data: SSHErrorData) => void) => () => void;
    };
    local: {
        createTerminal: (data: LocalTerminalData) => Promise<{
            success: boolean;
            sessionId?: string;
            error?: string;
        }>;
        sendInput: (sessionId: string, data: string) => Promise<void>;
        resize: (sessionId: string, cols: number, rows: number) => Promise<void>;
        closeTerminal: (sessionId: string) => Promise<void>;
        onOutput: (callback: (data: LocalTerminalOutputData) => void) => () => void;
        onExit: (callback: (data: LocalTerminalExitData) => void) => () => void;
        onError: (callback: (data: LocalTerminalErrorData) => void) => () => void;
    };
    config: {
        get: () => Promise<AppConfig>;
        save: (config: Partial<AppConfig>) => Promise<AppConfig>;
    };
    server: {
        add: (server: Omit<ServerConfig, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ServerConfig>;
        update: (id: string, updates: Partial<ServerConfig>) => Promise<ServerConfig | null>;
        delete: (id: string) => Promise<boolean>;
        getWithCredentials: (id: string) => Promise<ServerConfig | null>;
    };
    app: {
        quit: () => Promise<void>;
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
        isMaximized: () => Promise<boolean>;
        onMenuAction: (callback: (action: string) => void) => () => void;
    };
};
declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
//# sourceMappingURL=types.d.ts.map