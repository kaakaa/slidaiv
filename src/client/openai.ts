import OpenAI from 'openai';
import { getGenerateContentsPrompt } from './prompts';
import { getLocaleName } from '../utils';

export class Client implements LLMClient  {
    private client: OpenAI;
    private defaultLocale: string;

    constructor(apiKey:string, baseURL:string|null, locale: string) {
        baseURL = baseURL || 'https://api.openai.com/v1';
        this.client = new OpenAI({apiKey, baseURL});
        this.defaultLocale = locale;
    }

    async generatePageContents(prompt: string, model:string, locale: string | null): Promise<string | null> {
        const loc = getLocaleName(locale || this.defaultLocale);
        const sysPrompt = getGenerateContentsPrompt(loc);
        const resp = await this.client.chat.completions.create({
            model: model,
		    messages: [{
			    "content": prompt,
		    	"role": "user",
            }, {
                "content": sysPrompt,
                "role": "system",
            }],
        });
        console.log(sysPrompt);
        return resp.choices[0].message.content;
    }
}

