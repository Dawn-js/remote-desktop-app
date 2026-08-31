import type { ServerConfig, AppConfig } from '../shared/types';
export type ElectronAPI = {
    ssh: {
        createSession: (data: {
            sessionId: string;
            serverId: string;
            cols: number;
            rows: number;
        }) => Promise<{
            success: boolean;
            sessionId?: string;
            error?: string;
        }>;
        sendInput: (sessionId: string, data: string) => Promise<void>;
        resize: (sessionId: string, cols: number, rows: number) => Promise<void>;
        closeSession: (sessionId: string) => Promise<void>;
        onOutput: (callback: (data: {
            sessionId: string;
            data: string;
        }) => void) => () => void;
        onExit: (callback: (data: {
            sessionId: string;
            code: number;
            signal?: string;
        }) => void) => () => void;
        onError: (callback: (data: {
            sessionId: string;
            error: string;
        }) => void) => () => void;
    };
    local: {
        createTerminal: (data: {
            sessionId: string;
            cols: number;
            rows: number;
            shell?: string;
            cwd?: string;
        }) => Promise<{
            success: boolean;
            sessionId?: string;
            error?: string;
        }>;
        sendInput: (sessionId: string, data: string) => Promise<void>;
        resize: (sessionId: string, cols: number, rows: number) => Promise<void>;
        closeTerminal: (sessionId: string) => Promise<void>;
        onOutput: (callback: (data: {
            sessionId: string;
            data: string;
        }) => void) => () => void;
        onExit: (callback: (data: {
            sessionId: string;
            code: number;
            signal?: string;
        }) => void) => () => void;
        onError: (callback: (data: {
            sessionId: string;
            error: string;
        }) => void) => () => void;
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
//# sourceMappingURL=preload.d.ts.map