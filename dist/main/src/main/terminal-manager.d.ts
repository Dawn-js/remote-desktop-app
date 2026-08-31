import { WebContents } from 'electron';
export declare class TerminalManager {
    private sessions;
    private webContents;
    constructor(webContents: WebContents);
    private setupIPCHandlers;
    private createTerminal;
    private sendInput;
    private resize;
    private closeTerminal;
    private getDefaultShell;
    closeAllTerminals(): void;
}
//# sourceMappingURL=terminal-manager.d.ts.map