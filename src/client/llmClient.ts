interface LLMClient {
    generatePageContents(prompt: string, model: string): Promise<string | null>;
}