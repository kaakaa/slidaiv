import type * as vscode from 'vscode';

export class Logger {
    private static _instance: Logger;
    private _isDebug: boolean = false;

    private constructor(private out: vscode.OutputChannel) {}

    static init(out: vscode.OutputChannel): void {
        Logger._instance = new Logger(out);
    }

    static error(message: string) {
        Logger._instance.out.appendLine(`[ERROR] ${message}`);
    }

    static info(message: string) {
        Logger._instance.out.appendLine(`[INFO] ${message}`);
    }

    static debug(message: string) {
        if (!Logger._instance._isDebug) {
            return;
        }
        Logger._instance.out.appendLine(`[DEBUG] ${message}`);
    }

    static set isDebug(debug: boolean) {
        Logger._instance._isDebug = debug;
    } 
}