import { ExtensionContext, SecretStorage } from "vscode";

export class SecretTokenStore {
    private static _instance: SecretTokenStore;
    constructor(private readonly storage: SecretStorage) { }

    static init(context: ExtensionContext): void {
        SecretTokenStore._instance = new SecretTokenStore(context.secrets);
    }

    static get instance(): SecretTokenStore {
        return SecretTokenStore._instance;
    }

    async store(token: string): Promise<void> {
        if (token) {
            await this.storage.store('token', token);
        }
    }

    async get(): Promise<string | undefined> {
        return await this.storage.get('token');
    }
}
