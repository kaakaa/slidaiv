import yaml from 'yaml';
import type { OptionValues } from 'commander';

import type { Configuration } from '@/model/config';
import {
    getDefaultPromptDecorateContents,
    getDefaultPromptForGenerateContents
} from '@/client/prompts';

export type Merge<T> = { [K in keyof T]: T[K] };

export type SlideInput = {
    title: string;
    prompts: string[];
};

export type CLIOptions = {
    input: string;
    output: string;
    locale: string;
};

export type CLISettings = {
    context: Merge<Configuration & CLIOptions>;
    slides: SlideInput[];
};

export type GeneratedSlide = {
    index: number;
    contents: string;
};

export const SlidevHeader = `---
theme: seriph
highlighter: shiki
background: https://source.unsplash.com/collection/94734566/1920x1080
class: text-center
info: |
  ## 2024mmdd_web-diff
  Presentation slides for 2024mmdd_web-diff.
transition: slide-left
title: 2024mmdd_web-diff
mdc: true
githubPages:
  ogp: true
addons:
  - slidev-addon-rabbit
rabbit:
  slideNum: true
---
`;

export function loadConfig(f: string, options: OptionValues): CLISettings {
    const { input, output, locale, apiurl, apikey, model, debug } = options;
    const settings = yaml.parse(f) as CLISettings;

    const loc = locale ?? settings.context.locale ?? "en";

    return {
        context: {
            apiKey: apikey ?? settings.context.apiKey ?? "dummy",
            baseUrl: apiurl ?? settings.context.baseUrl ?? "https://openai.com/v1",
            model: model ?? settings.context.model ?? "gpt-4o",
            promptGenerate: getDefaultPromptForGenerateContents(loc),
            promptDecorate: getDefaultPromptDecorateContents(),
            input: input,
            output: output ?? settings.context.output ?? "generated-slides.md",
            locale: loc,
            isDebug: debug ?? true,
        },
        slides: settings.slides,
    };
}