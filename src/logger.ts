import type * as vscode from 'vscode';

export class Logger {
    private readonly out: vscode.OutputChannel;
    private isDebug: boolean;
    constructor(out: vscode.OutputChannel, debug: boolean) {
        this.out = out;
        this.isDebug = debug;
    }

    info(message: string) {
        this.out.appendLine(`[INFO] ${message}`);
    }
    debug(message: string) {
        if (!this.isDebug) return;
        this.out.appendLine(`[DEBUG] ${message}`);
    }
}