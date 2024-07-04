import OpenAI from 'openai';
import { getGenerateContentsPrompt } from './prompts';

export class Client implements LLMClient  {
    private client: OpenAI;
    private locale: string;

    constructor(apiKey:string, baseURL:string|null, locale: string) {
        baseURL = baseURL || 'https://api.openai.com/v1';
        this.client = new OpenAI({apiKey, baseURL});
        this.locale = locale;
    }

    async generatePageContents(prompt: string, model:string): Promise<string | null> {
        const sysPrompt = getGenerateContentsPrompt(this.locale);
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
        return resp.choices[0].message.content;
    }
}

