import { ExtensionContext, SecretStorage } from "vscode";

export class SecretTokenStore {
    private static _instance: SecretTokenStore;
    private readonly TOKEN_KEY = "token";

    constructor(private readonly storage: SecretStorage) { }

    static init(context: ExtensionContext): void {
        SecretTokenStore._instance = new SecretTokenStore(context.secrets);
    }

    static get instance(): SecretTokenStore {
        return SecretTokenStore._instance;
    }

    async store(token: string): Promise<void> {
        return await this.storage.store(this.TOKEN_KEY, token);
    }

    async get(): Promise<string | undefined> {
        return await this.storage.get(this.TOKEN_KEY);
    }
}
