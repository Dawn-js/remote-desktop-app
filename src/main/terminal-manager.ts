import { spawn } from 'child_process';
import { ipcMain, WebContents } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import * as os from 'os';
import * as path from 'path';

interface LocalTerminalSession {
  pty: any;
  cols: number;
  rows: number;
  pid: number;
}

export class TerminalManager {
  private sessions: Map<string, LocalTerminalSession> = new Map();
  private webContents: WebContents | null = null;

  constructor(webContents: WebContents) {
    this.webContents = webContents;
    this.setupIPCHandlers();
  }

  private setupIPCHandlers(): void {
    ipcMain.handle('local:create-terminal', async (_event, data: { sessionId: string; cols: number; rows: number; shell?: string; cwd?: string }) => {
      return this.createTerminal(data.sessionId, data.cols, data.rows, data.shell, data.cwd);
    });

    ipcMain.handle('local:send-input', async (_event, sessionId: string, data: string) => {
      this.sendInput(sessionId, data);
    });

    ipcMain.handle('local:resize', async (_event, data: { sessionId: string; cols: number; rows: number }) => {
      this.resize(data.sessionId, data.cols, data.rows);
    });

    ipcMain.handle('local:close-terminal', async (_event, sessionId: string) => {
      this.closeTerminal(sessionId);
    });
  }

  private async createTerminal(
    sessionId: string,
    cols: number,
    rows: number,
    shell?: string,
    cwd?: string
  ): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      const defaultShell = this.getDefaultShell();
      const shellPath = shell || defaultShell;
      const workingDir = cwd || os.homedir();

      const pty = spawn(shellPath, [], {
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

      const session: LocalTerminalSession = { pty, cols, rows, pid: pty.pid };
      this.sessions.set(sessionId, session);

      pty.stdout?.on('data', (data: Buffer) => {
        this.webContents?.send('local:output', { sessionId, data: data.toString('utf-8') });
      });

      pty.stderr?.on('data', (data: Buffer) => {
        this.webContents?.send('local:output', { sessionId, data: data.toString('utf-8') });
      });

      pty.on('exit', (code: number | null, signal: string | null) => {
        this.webContents?.send('local:exit', { sessionId, code: code ?? 0, signal: signal ?? undefined });
        this.sessions.delete(sessionId);
      });

      pty.on('error', (err: Error) => {
        this.webContents?.send('local:error', { sessionId, error: err.message });
        this.sessions.delete(sessionId);
      });

      return { success: true, sessionId };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private sendInput(sessionId: string, data: string): void {
    const session = this.sessions.get(sessionId);
    if (session && session.pty) {
      session.pty.stdin?.write(data);
    }
  }

  private resize(sessionId: string, cols: number, rows: number): void {
    const session = this.sessions.get(sessionId);
    if (session && session.pty) {
      session.pty.resize(cols, rows);
      session.cols = cols;
      session.rows = rows;
    }
  }

  private closeTerminal(sessionId: string): void {
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

  private getDefaultShell(): string {
    const platform = os.platform();
    if (platform === 'win32') {
      return process.env.COMSPEC || 'cmd.exe';
    }
    return process.env.SHELL || '/bin/bash';
  }

  closeAllTerminals(): void {
    for (const [sessionId, session] of this.sessions) {
      session.pty?.kill('SIGTERM');
    }
    this.sessions.clear();
  }
}