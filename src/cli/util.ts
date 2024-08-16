import yaml from 'yaml';

import { Configuration } from '@/model/config';
import type { OptionValues } from 'commander';

import {
    getDefaultPromptDecorateContents,
    getDefaultPromptForGenerateContents
} from '@/client/prompts';

export type Merge<T> = { [K in keyof T]: T[K] };

export type Slide = {
    title: string;
    prompts: string[];
}

export type CLIOptions = {
    input: string;
    output: string;
    locale: string;
}

export type CLIConfiguration = {
    service: Merge<Configuration & CLIOptions>;
    slides: Slide[];
}

export type GeneratedSlide = {
    index: number;
    contents: string;
}

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

export function loadConfig(f: string, options: OptionValues): CLIConfiguration {
    const { input, output, locale, apiurl, apikey, model, debug } = options;
    const conf = yaml.parse(f) as CLIConfiguration;

    const loc = locale ?? conf.service.locale ?? "en";

    return {
        service: {
            apiKey: apikey ?? conf.service.apiKey ?? "dummy",
            baseUrl: apiurl ?? conf.service.baseUrl ?? "https://openai.com/v1",
            model: model ?? conf.service.model ?? "gpt-4o",
            promptGenerate: getDefaultPromptForGenerateContents(loc),
            promptDecorate: getDefaultPromptDecorateContents(),
            input: input,
            output: output ?? conf.service.output ?? "generated-slides.md",
            locale: loc,
            isDebug: debug ?? true,
        },
        slides: conf.slides,
    };
}