import OpenAI from 'openai';

const SystemPrompt = `
You are an expert in creating Slidev format Markdown slides. Based on the user's instructions, please create a Markdown text that represents one page of a slide.
					
Please pay attention to the following points:
1. Ouptut language must be in Japanese.
2. Follow the Slidev syntax.
3. Keep the slide content concise and visually comprehensible.
4. Use bullet points or code blocks when necessary.
5. Choose appropriate layouts and backgrounds.
6. If images or icons are needed, indicate this in a comment.
7. Do NOT enclose the output in a Markdown code block. The output should be raw Slidev Markdown without any surrounding formatting.

Based on the user's instructions, generate the Slidev format Markdown directly as raw text.

Now, please provide instructions for the slide content.
`;

export class Client implements LLMClient  {
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
                "content": SystemPrompt,
                "role": "system",
            }],
        });
        return resp.choices[0].message.content;
    }
}

