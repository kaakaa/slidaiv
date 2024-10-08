import { parse } from "@slidev/parser";
import type { SourceSlideInfo } from "@slidev/types";

import { obj2frontmatter } from "@/utils";
import type { CustomCancellationToken, LLMClient } from "@/client/llmClient";

export class SlidevPage {
    private _start: number;
    private _end: number;
    private frontmatter: any;
    private prompts: string[];
    private content: string;
    private locale: string | null;
    private model: string | null;

    // constructor is private and the instance is created by factory method `init`,
    // because it isn't possible to use await in constructor
    private constructor(slide: SourceSlideInfo) {
        this._start = slide.start;
        this._end = slide.end;
        this.frontmatter = slide.frontmatter;
        this.prompts = slide.frontmatter?.slidaiv?.prompt || [];
        if (this.prompts.length === 0) {
            throw new Error('No prompt found in the slide frontmatter');
        }
        this.content = slide.content;
        this.locale = slide.frontmatter?.slidaiv?.locale || null;
        this.model = slide.frontmatter?.slidaiv?.model || null;
    }

    static async init(text: string, filename: string, pos: number) {
        const parsed = await parse(text, filename);
        const slide = parsed.slides.find((slide: SourceSlideInfo) => slide.start <= pos && pos <= slide.end );
        if (!slide) {
            throw new Error(`No slide found at line:${pos}`);
        }
        return new SlidevPage(slide);
    }

    async rewriteByLLM(token: CustomCancellationToken, client: LLMClient) {
        const prompt = this.prompts.map((prompt: string) => `- ${prompt}`).join('\n');
        this.content = await client.generatePageContents(token, prompt, this.model, this.locale) ?? '';
    }

    toString(): string {
        return `${obj2frontmatter(this.frontmatter)}\n\n${this.content}\n\n`;
    }

    get start(): number {
        return this._start;
    }

    get end(): number {
        return this._end;
    }
}