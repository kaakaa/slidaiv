import OpenAI from 'openai';

import {
    evalPromptLiteral,
    getDefaultPromptDecorateContents,
    getDefaultPromptForGenerateContents,
} from '@/client/prompts';
import { getLocaleName } from '@/utils';
import { Logger } from '@/logger';
import type { CustomCancellationToken, LLMClient } from '@/client/llmClient';
import type { Configuration } from '@/model/config';

export class OpenAIClient implements LLMClient {
    private client: OpenAI;
    private llmModel: string;
    private promptGenerate: string;
    private promptDecorate: string;
    private defaultLocale: string;

    constructor(config: Configuration, locale: string) {
        this.client = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl });
        this.llmModel = config.model;
        this.defaultLocale = locale;
        this.promptGenerate = config.promptGenerate;
        this.promptDecorate = config.promptDecorate;
    }

    async generatePageContents(token: CustomCancellationToken, prompt: string, m: string | null, locale: string | null): Promise<string | null> {
        const ac = new AbortController();
        token.onCancellationRequested(() => {
            Logger.info("User requested to cancel the task.");
            ac.abort();
        });

        const loc = getLocaleName(locale || this.defaultLocale);
        const model = m || this.llmModel;
        let sysPrompt;
        if (this.promptGenerate && this.promptGenerate.length > 0) {
            sysPrompt = evalPromptLiteral(this.promptGenerate, { locale: loc });
        } else {
            Logger.info("Default prompt is used, because custom prompt is not set.");
            sysPrompt = getDefaultPromptForGenerateContents(loc);
        }

        Logger.info(`Call OpenAI details: URL=${this.client.baseURL}, model=${model}, locale=${locale}`);
        Logger.debug(`sysPrompt=${sysPrompt}`);

        const resp = await this.client.chat.completions.create({
            model: model,
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
            model: this.llmModel,
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

    get baseURL(): string {
        return this.client.baseURL;
    }
}
