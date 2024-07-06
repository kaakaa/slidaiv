interface LLMClient {
    generatePageContents(prompt: string, locale: string | null): Promise<string | null>;
    decorateContents(prompt: string): Promise<string | null>;
}