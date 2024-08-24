import type { Configuration } from "@/model/config";
import { OpenAIClient } from "@/client/openai";

export interface LLMClient {
    generatePageContents(token: CustomCancellationToken, prompt: string, model: string | null, locale: string | null): Promise<string | null>;
    decorateContents(token: CustomCancellationToken, prompt: string): Promise<string | null>;
}

export interface CustomCancellationToken {
    onCancellationRequested(listener: () => void): any;
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

    generatePageContents(token: CustomCancellationToken, prompt: string, model: string | null, locale: string | null): Promise<string | null> {
        throw new Error("Client have not been configured yet.");
    }
    decorateContents(token: CustomCancellationToken, prompt: string): Promise<string | null> {
        throw new Error("Client have not been configured yet.");
    }

}

export class LLMClientFactory {
    static create(config: Configuration, locale: string): LLMClient {
        switch (config.service) {
            case 'openai':
                return new OpenAIClient(config, locale);
            case 'azure-ai-inference':
            default:
                return UnconfiguredClient.instance;
        }
    }
}