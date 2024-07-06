import { CustomCancellationToken } from "@/tasks";

export interface LLMClient {
    generatePageContents(token: CustomCancellationToken, prompt: string, locale: string | null): Promise<string | null>;
    decorateContents(token: CustomCancellationToken, prompt: string): Promise<string | null>;
}