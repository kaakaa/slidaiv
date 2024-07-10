import { CustomCancellationToken } from "@/tasks";

export interface LLMClient {
    generatePageContents(token: CustomCancellationToken, prompt: string, locale: string | null): Promise<string | null>;
    decorateContents(token: CustomCancellationToken, prompt: string): Promise<string | null>;
}

export class UnconfiguredClient implements LLMClient {
    private static _instance: UnconfiguredClient;
    private constructor() { }

    static get instance(): UnconfiguredClient {
        if (!UnconfiguredClient._instance) {
            UnconfiguredClient._instance = new UnconfiguredClient();
        }
        return UnconfiguredClient._instance;
    }

    generatePageContents(token: CustomCancellationToken, prompt: string, locale: string | null): Promise<string | null> {
        throw new Error("Client have not been configured yet.");
    }
    decorateContents(token: CustomCancellationToken, prompt: string): Promise<string | null> {
        throw new Error("Client have not been configured yet.");
    }

}
