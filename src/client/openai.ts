import OpenAI from 'openai';
import {
    evalPromptLiteral,
    getDefaultPromptDecorateContents,
    getDefaultPromptForGenerateContents,
} from '@/client/prompts';
import { getLocaleName } from '@/utils';
import { CustomCancellationToken } from '@/tasks';
import type { Configuration } from '@/model/config';
import { Logger } from '@/logger';

export class Client {
    private client: OpenAI;
    private _llmModel: string;
    private promptGenerate: string;
    private promptDecorate: string;
    private defaultLocale: string;

    constructor(config: Configuration, locale: string) {
        this.client = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl });
        this._llmModel = config.model;
        this.defaultLocale = locale;
        this.promptGenerate = config.promptGenerate;
        this.promptDecorate = config.promptDecorate;
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
            Logger.info("Default prompt is used, because custom prompt is not set.");
            sysPrompt = getDefaultPromptForGenerateContents(loc);
        }

        Logger.info(`Call OpenAI details: URL=${this.client.baseURL}, model=${this.llmModel}, locale=${locale}`);
        Logger.debug(`sysPrompt=${sysPrompt}`);

        const resp = await this.client.chat.completions.create({
            model: this._llmModel,
            messages: [
                { "role": "system", "content": sysPrompt },
                { "role": "user", "content": prompt }
            ],
        }, {
            signal: ac.signal,
        });

        const ret = resp?.choices[0]?.message?.content;
        Logger.debug(`Response from OpenAI: ${ret}`);
        return ret;
    }

    async decorateContents(token: CustomCancellationToken, prompt: string): Promise<string | null> {
        const ac = new AbortController();
        token.onCancellationRequested(() => {
            ac.abort();
        });

        Logger.info('key:' + this.client.apiKey);

        let sysPrompt;
        if (this.promptDecorate && this.promptDecorate.length > 0) {
            sysPrompt = evalPromptLiteral(this.promptDecorate, {});
        } else {
            Logger.info("Default prompt is used, because custom prompt is not set.");
            sysPrompt = getDefaultPromptDecorateContents();
        }

        Logger.info(`Call OpenAI details: URL=${this.client.baseURL}, model=${this.llmModel}`);
        Logger.debug(`sysPrompt=${sysPrompt}`);

        const resp = await this.client.chat.completions.create({
            model: this._llmModel,
            messages: [
                { "role": "system", "content": sysPrompt },
                { "role": "user", "content": prompt }
            ],
        }, {
            signal: ac.signal,
        });

        const ret = resp?.choices[0]?.message?.content;
        Logger.debug(`Response from OpenAI: ${ret}`);
        return ret;
    }

    get llmModel(): string {
        return this._llmModel;
    }

    get baseURL(): string {
        return this.client.baseURL;
    }
}
