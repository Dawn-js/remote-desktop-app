import { Client, ConnectConfig } from 'ssh2';
import { ipcMain, WebContents } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { ServerConfig } from '../shared/types';

interface SSHSession {
  client: Client;
  stream: any;
  serverId: string;
  cols: number;
  rows: number;
}

export class SSHManager {
  private sessions: Map<string, SSHSession> = new Map();
  private webContents: WebContents | null = null;

  constructor(webContents: WebContents) {
    this.webContents = webContents;
    this.setupIPCHandlers();
  }

  private setupIPCHandlers(): void {
    ipcMain.handle('ssh:create-session', async (_event, data: { sessionId: string; serverId: string; cols: number; rows: number }) => {
      return this.createSession(data.sessionId, data.serverId, data.cols, data.rows);
    });

    ipcMain.handle('ssh:send-input', async (_event, sessionId: string, data: string) => {
      this.sendInput(sessionId, data);
    });

    ipcMain.handle('ssh:resize', async (_event, data: { sessionId: string; cols: number; rows: number }) => {
      this.resize(data.sessionId, data.cols, data.rows);
    });

    ipcMain.handle('ssh:close-session', async (_event, sessionId: string) => {
      this.closeSession(sessionId);
    });
  }

  private async createSession(sessionId: string, serverId: string, cols: number, rows: number): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      const server = await this.getServerWithCredentials(serverId);
      if (!server) {
        return { success: false, error: 'Server not found' };
      }

      const client = new Client();
      const config: ConnectConfig = {
        host: server.host,
        port: server.port,
        username: server.username,
        keepaliveInterval: server.keepAliveInterval || 10000,
        keepaliveCountMax: 3,
        readyTimeout: 20000,
      };

      if (server.authMethod === 'password') {
        config.password = server.password;
      } else if (server.authMethod === 'key') {
        config.privateKey = require('fs').readFileSync(server.privateKeyPath!, 'utf-8');
        if (server.passphrase) {
          config.passphrase = server.passphrase;
        }
      } else if (server.authMethod === 'agent') {
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

            const session: SSHSession = { client, stream, serverId, cols, rows };
            this.sessions.set(sessionId, session);

            stream.on('data', (data: Buffer) => {
              this.webContents?.send('ssh:output', { sessionId, data: data.toString('utf-8') });
            });

            stream.on('close', () => {
              this.webContents?.send('ssh:exit', { sessionId, code: 0 });
              this.sessions.delete(sessionId);
              client.end();
            });

            stream.on('error', (err: Error) => {
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

            client.on('error', (err: Error) => {
              this.webContents?.send('ssh:error', { sessionId, error: err.message });
              this.sessions.delete(sessionId);
            });

            resolve({ success: true, sessionId });
          });
        });

        client.on('error', (err: Error) => {
          resolve({ success: false, error: err.message });
        });

        client.connect(config);
      });
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private sendInput(sessionId: string, data: string): void {
    const session = this.sessions.get(sessionId);
    if (session && session.stream) {
      session.stream.write(data);
    }
  }

  private resize(sessionId: string, cols: number, rows: number): void {
    const session = this.sessions.get(sessionId);
    if (session && session.stream) {
      session.stream.setWindow(rows, cols, 0, 0);
      session.cols = cols;
      session.rows = rows;
    }
  }

  private closeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.stream?.end();
      session.client?.end();
      this.sessions.delete(sessionId);
    }
  }

  private async getServerWithCredentials(serverId: string): Promise<ServerConfig | null> {
    const { ConfigManager } = await import('./config-manager');
    const configManager = new ConfigManager(this.getConfigPath());
    return configManager.getServerWithCredentials(serverId);
  }

  private getConfigPath(): string {
    const { app } = require('electron');
    const path = require('path');
    return path.join(app.getPath('userData'), 'config.json');
  }

  closeAllSessions(): void {
    for (const [sessionId, session] of this.sessions) {
      session.stream?.end();
      session.client?.end();
    }
    this.sessions.clear();
  }
}