import type * as vscode from 'vscode';

export class Logger {
    private readonly out: vscode.OutputChannel;
    private _isDebug: boolean = false;
    constructor(out: vscode.OutputChannel) {
        this.out = out;
    }

    error(message: string) {
        this.out.appendLine(`[ERROR] ${message}`);
    }

    info(message: string) {
        this.out.appendLine(`[INFO] ${message}`);
    }

    debug(message: string) {
        if (!this._isDebug) return;
        this.out.appendLine(`[DEBUG] ${message}`);
    }

    set isDebug(debug: boolean) {
        this._isDebug = debug;
    } 
}