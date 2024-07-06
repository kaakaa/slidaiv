import OpenAI from 'openai';
import { getDecorateContentsPrompt, getGenerateContentsPrompt } from './prompts';
import { getLocaleName } from '../utils';

export class Client implements LLMClient  {
    private client: OpenAI;
    private llmModel: string;
    private defaultLocale: string;

    constructor(apiKey:string, baseURL:string|null, llmModel: string, locale: string) {
        baseURL = baseURL || 'https://api.openai.com/v1';
        this.client = new OpenAI({apiKey, baseURL});
        this.llmModel = llmModel;
        this.defaultLocale = locale;
    }

    async generatePageContents(prompt: string, locale: string | null): Promise<string | null> {
        const loc = getLocaleName(locale || this.defaultLocale);
        const sysPrompt = getGenerateContentsPrompt(loc);
        const resp = await this.client.chat.completions.create({
            model: this.llmModel,
		    messages: [{
			    "content": prompt,
		    	"role": "user",
            }, {
                "content": sysPrompt,
                "role": "system",
            }],
        });
        return resp.choices[0].message.content;
    }

    async decorateContents(prompt: string): Promise<string | null> {
        const sysPrompt = getDecorateContentsPrompt();
        const resp = await this.client.chat.completions.create({
            model: this.llmModel,
            messages: [{
                "content": prompt,
                "role": "user",
            }, {
                "content": sysPrompt,
                "role": "system"
            }],
        });
        return resp.choices[0].message.content;
    }
}

