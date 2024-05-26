import OpenAI from 'openai';

export class Client {
    client: OpenAI;
    constructor(apiKey:string, baseURL:string|null) {
        baseURL = baseURL || 'https://api.openai.com/v1';
        this.client = new OpenAI({apiKey, baseURL});
    }
    async generatePageContents(prompt: string, model:string): Promise<string | null> {
        const resp = await this.client.chat.completions.create({
            model: model,
		    messages: [{
			    "content": prompt,
		    	"role": "user",
            }, {
                "content": "You are a helpful code assistant that can teach a junior developer how to write Slidev contents.Don't explain the code, don't generate any meta data such as frontmatter, just generate only one page, and just generate the code block itself.",
                "role": "system",
            }],
        });
        return resp.choices[0].message.content;
    }
}

