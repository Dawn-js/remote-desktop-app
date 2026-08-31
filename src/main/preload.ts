import { contextBridge, ipcRenderer } from 'electron';
import type { ServerConfig, AppConfig } from '../shared/types';

contextBridge.exposeInMainWorld('electronAPI', {
  ssh: {
    createSession: (data: { sessionId: string; serverId: string; cols: number; rows: number }) =>
      ipcRenderer.invoke('ssh:create-session', data),
    sendInput: (sessionId: string, data: string) =>
      ipcRenderer.invoke('ssh:send-input', sessionId, data),
    resize: (sessionId: string, cols: number, rows: number) =>
      ipcRenderer.invoke('ssh:resize', { sessionId, cols, rows }),
    closeSession: (sessionId: string) =>
      ipcRenderer.invoke('ssh:close-session', sessionId),
    onOutput: (callback: (data: { sessionId: string; data: string }) => void) => {
      ipcRenderer.on('ssh:output', (_event, data) => callback(data));
      return () => ipcRenderer.removeAllListeners('ssh:output');
    },
    onExit: (callback: (data: { sessionId: string; code: number; signal?: string }) => void) => {
      ipcRenderer.on('ssh:exit', (_event, data) => callback(data));
      return () => ipcRenderer.removeAllListeners('ssh:exit');
    },
    onError: (callback: (data: { sessionId: string; error: string }) => void) => {
      ipcRenderer.on('ssh:error', (_event, data) => callback(data));
      return () => ipcRenderer.removeAllListeners('ssh:error');
    },
  },
  local: {
    createTerminal: (data: { sessionId: string; cols: number; rows: number; shell?: string; cwd?: string }) =>
      ipcRenderer.invoke('local:create-terminal', data),
    sendInput: (sessionId: string, data: string) =>
      ipcRenderer.invoke('local:send-input', sessionId, data),
    resize: (sessionId: string, cols: number, rows: number) =>
      ipcRenderer.invoke('local:resize', { sessionId, cols, rows }),
    closeTerminal: (sessionId: string) =>
      ipcRenderer.invoke('local:close-terminal', sessionId),
    onOutput: (callback: (data: { sessionId: string; data: string }) => void) => {
      ipcRenderer.on('local:output', (_event, data) => callback(data));
      return () => ipcRenderer.removeAllListeners('local:output');
    },
    onExit: (callback: (data: { sessionId: string; code: number; signal?: string }) => void) => {
      ipcRenderer.on('local:exit', (_event, data) => callback(data));
      return () => ipcRenderer.removeAllListeners('local:exit');
    },
    onError: (callback: (data: { sessionId: string; error: string }) => void) => {
      ipcRenderer.on('local:error', (_event, data) => callback(data));
      return () => ipcRenderer.removeAllListeners('local:error');
    },
  },
  config: {
    get: () => ipcRenderer.invoke('config:get'),
    save: (config: Partial<AppConfig>) => ipcRenderer.invoke('config:save', config),
  },
  server: {
    add: (server: Omit<ServerConfig, 'id' | 'createdAt' | 'updatedAt'>) =>
      ipcRenderer.invoke('server:add', server),
    update: (id: string, updates: Partial<ServerConfig>) =>
      ipcRenderer.invoke('server:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('server:delete', id),
    getWithCredentials: (id: string) => ipcRenderer.invoke('server:get-with-credentials', id),
  },
  app: {
    quit: () => ipcRenderer.invoke('app:quit'),
    minimize: () => ipcRenderer.invoke('app:minimize'),
    maximize: () => ipcRenderer.invoke('app:maximize'),
    isMaximized: () => ipcRenderer.invoke('app:is-maximized'),
    onMenuAction: (callback: (action: string) => void) => {
      ipcRenderer.on('menu:action', (_event, action) => callback(action));
      return () => ipcRenderer.removeAllListeners('menu:action');
    },
  },
});

export type ElectronAPI = {
  ssh: {
    createSession: (data: { sessionId: string; serverId: string; cols: number; rows: number }) => Promise<{ success: boolean; sessionId?: string; error?: string }>;
    sendInput: (sessionId: string, data: string) => Promise<void>;
    resize: (sessionId: string, cols: number, rows: number) => Promise<void>;
    closeSession: (sessionId: string) => Promise<void>;
    onOutput: (callback: (data: { sessionId: string; data: string }) => void) => () => void;
    onExit: (callback: (data: { sessionId: string; code: number; signal?: string }) => void) => () => void;
    onError: (callback: (data: { sessionId: string; error: string }) => void) => () => void;
  };
  local: {
    createTerminal: (data: { sessionId: string; cols: number; rows: number; shell?: string; cwd?: string }) => Promise<{ success: boolean; sessionId?: string; error?: string }>;
    sendInput: (sessionId: string, data: string) => Promise<void>;
    resize: (sessionId: string, cols: number, rows: number) => Promise<void>;
    closeTerminal: (sessionId: string) => Promise<void>;
    onOutput: (callback: (data: { sessionId: string; data: string }) => void) => () => void;
    onExit: (callback: (data: { sessionId: string; code: number; signal?: string }) => void) => () => void;
    onError: (callback: (data: { sessionId: string; error: string }) => void) => () => void;
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