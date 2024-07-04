interface LLMClient {
    generatePageContents(prompt: string, model: string, locale: string | null): Promise<string | null>;
}