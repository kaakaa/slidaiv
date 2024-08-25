export interface LogOutput {
    appendLine: (message: string) => void;
}

export class Logger {
    private static _instance: Logger;
    private _isDebug: boolean = false;

    private constructor(private out: (message: string) => void) {}

    static init(out: (message: string) => void): void {
        if (!Logger._instance) {
            Logger._instance = new Logger(out);
        }
    }

    static error(message: string) {
        Logger._instance.out(`[ERROR] ${message}`);
    }

    static info(message: string) {
        Logger._instance.out(`[INFO] ${message}`);
    }

    static debug(message: string) {
        if (!Logger._instance._isDebug) {
            return;
        }
        Logger._instance.out(`[DEBUG] ${message}`);
    }

    static set isDebug(debug: boolean) {
        Logger._instance._isDebug = debug;
    } 
}