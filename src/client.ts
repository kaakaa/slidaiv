import OpenAI from 'openai';

export class Client {
    client: OpenAI;
    constructor(apiKey:string, baseURL:string|null) {
        baseURL = baseURL || 'https://api.openai.com/v1';
        this.client = new OpenAI({apiKey, baseURL});
    }
    async generatePageContents(prompt: string): Promise<string | null> {
        const resp = await this.client.chat.completions.create({
            model: 'mock-llm',
		    messages: [{
			    "content":"This is a test.",
		    	"role": "user",
	    	}],
        });
        return resp.choices[0].message.content;
    }
}

