import OpenAI from 'openai';
import { 
    evalPromptLiteral,
    getDecorateContentsPrompt,
    getGenerateContentsPrompt,
} from '@/client/prompts';
import { getLocaleName } from '@/utils';
import { CustomCancellationToken } from '@/tasks';
import { LLMClient } from '@/client/llmClient';
import type { Configuration } from '@/model/config';
import { Logger } from '@/logger';

export class Client implements LLMClient {
    private client: OpenAI;
    private _llmModel: string;
    private promptGenerate: string;
    private defaultLocale: string;
    private logger: Logger;

    constructor(config: Configuration, locale: string, logger: Logger) {
        this.client = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl });
        this._llmModel = config.model;
        this.defaultLocale = locale;
        this.promptGenerate = config.promptGenerate;
        this.logger = logger;
    }

    async generatePageContents(token: CustomCancellationToken, prompt: string, locale: string | null): Promise<string | null> {
        const ac = new AbortController();
        token.onCancellationRequested(() => {
            ac.abort();
        });

        const loc = getLocaleName(locale || this.defaultLocale);
        let sysPrompt;
        if (this.promptGenerate && this.promptGenerate.length > 0) {
            sysPrompt = evalPromptLiteral(this.promptGenerate, { locale: loc });
        } else {
            this.logger.info("Default prompt is used, because custom prompt is not set.")
            sysPrompt = getGenerateContentsPrompt(loc);
        }

        this.logger.info(`Call OpenAI details: URL=${this.client.baseURL}, model=${this.llmModel}, locale=${locale}`);
        this.logger.debug(`sysPrompt=${sysPrompt}`);
        
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
        
        const ret = resp?.choices[0]?.message?.content;
        this.logger.debug(`Response from OpenAI: ${ret}`);
        return ret;
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
