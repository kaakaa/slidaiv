import OpenAI from 'openai';

const SystemPrompt = `
You are an expert in creating Slidev format Markdown slides. Based on the user's instructions, please create a Markdown text that represents one page of a slide.
					
Please pay attention to the following points:
1. Ouptut language must be in English.
2. MUST follow the Slidev syntax.
3. Limit the slide to about 7 or less lines contents for brevity and clarity.
4. Keep the slide content concise and visually comprehensible.
5. Use bullet points or code blocks when necessary.
6. Utilize UnoCSS or other CSS expressions to create visually appealing slides. Be creative with styling, colors, and positioning to enhance the visual impact.
7. If images or icons are needed, indicate this in a comment.
8. Do NOT enclose the output in a Markdown code block. The output should be raw Slidev Markdown without any surrounding formatting.

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

