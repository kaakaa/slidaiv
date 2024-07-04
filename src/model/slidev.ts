import { parse } from "@slidev/parser";
import { SourceSlideInfo } from "@slidev/types";
import { obj2frontmatter } from "../utils";

export class SlidevPage {
    private _start: number
    private _end: number
    private frontmatter: any
    private prompts: string[]
    private locale: string | null

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
        this.locale = slide.frontmatter?.slidaiv?.locale || null;
    }

    static async init(text: string, filename: string, pos: number) {
        const parsed = await parse(text, filename);
        const slide = parsed.slides.find((slide: SourceSlideInfo) => slide.start <= pos && pos <= slide.end );
        if (!slide) {
            throw new Error(`No slide found at line:${pos}`);
        }
        return new SlidevPage(slide);
    }

    async rewriteByLLM(client: LLMClient, model: string) {
        const prompt = this.prompts.map((prompt: string) => `- ${prompt}`).join('\n');
        const content = await client.generatePageContents(prompt, model, this.locale);
        return `${obj2frontmatter(this.frontmatter)}\n\n${content}\n\n`;
    }

    get start(): number {
        return this._start;
    }

    get end(): number {
        return this._end;
    }
}