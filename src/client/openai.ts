import OpenAI from 'openai';
import { getDecorateContentsPrompt, getGenerateContentsPrompt } from '@/client/prompts';
import { getLocaleName } from '@/utils';
import { CustomCancellationToken } from '@/tasks';
import { LLMClient } from '@/client/llmClient';

export class Client implements LLMClient {
    private client: OpenAI;
    private _llmModel: string;
    private defaultLocale: string;

    constructor(apiKey: string, baseURL: string | null, llmModel: string, locale: string) {
        baseURL = baseURL || 'https://api.openai.com/v1';
        this.client = new OpenAI({ apiKey, baseURL });
        this._llmModel = llmModel;
        this.defaultLocale = locale;
    }

    async generatePageContents(token: CustomCancellationToken, prompt: string, locale: string | null): Promise<string | null> {
        const ac = new AbortController();
        token.onCancellationRequested(() => {
            ac.abort();
        });

        const loc = getLocaleName(locale || this.defaultLocale);
        const sysPrompt = getGenerateContentsPrompt(loc);
        const resp = await this.client.chat.completions.create({
            model: this._llmModel,
            messages: [{
                "content": prompt,
                "role": "user",
            }, {
                "content": sysPrompt,
                "role": "system",
            }],
        }, {
            signal: ac.signal,
        });
        return resp.choices[0].message.content;
    }

    async decorateContents(token: CustomCancellationToken, prompt: string): Promise<string | null> {
        const ac = new AbortController();
        token.onCancellationRequested(() => {
            ac.abort();
        });

        const sysPrompt = getDecorateContentsPrompt();
        const resp = await this.client.chat.completions.create({
            model: this._llmModel,
            messages: [{
                "content": prompt,
                "role": "user",
            }, {
                "content": sysPrompt,
                "role": "system"
            }],
        }, {
            signal: ac.signal,
        });
        return resp.choices[0].message.content;
    }

    get llmModel(): string {
        return this._llmModel;
    }

    get baseURL(): string {
        return this.client.baseURL;
    }
}
