import { WebContents } from 'electron';
export declare class SSHManager {
    private sessions;
    private webContents;
    constructor(webContents: WebContents);
    private setupIPCHandlers;
    private createSession;
    private sendInput;
    private resize;
    private closeSession;
    private getServerWithCredentials;
    private getConfigPath;
    closeAllSessions(): void;
}
//# sourceMappingURL=ssh-manager.d.ts.map