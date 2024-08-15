import { Command } from 'commander';
import fs from 'fs';
import yaml from 'yaml';

import { MultiBar, Presets } from 'cli-progress';
import { OpenAI } from 'openai';

import { parse } from "@slidev/parser";
import { getDefaultPromptDecorateContents, getDefaultPromptForGenerateContents } from '@/client/prompts';
import { Configuration } from '@/model/config';

// TODO: YAMLファイルや出力先などのハードコードを無くす

const SlidevHeader = `---
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

const program = new Command();
program
  .option('-i, --input <file>', 'input yaml file path to generate slide', 'slides.yaml')
  .option('-o, --output <file>', 'output path to write markdown file', 'generated-slides.md')
  .option('-l, --locale <locale>', 'locale of generated slide', 'en');

program.parse();

const options = program.opts();
const {input, output, locale} = options;
console.log(`input: ${input}`);
console.log(`output: ${output}`);
console.log(`locale: ${locale}`);

type Slide = {
  title: string;
  prompts: string[];
}
type config = {
  service: Configuration;
  slides: Slide[];
}
type GeneratedSlide = {
  index: number;
  contents: string;
}

const f = fs.readFileSync(input, 'utf8');
const conf = yaml.parse(f) as config;

const config = {
  apiKey: conf.service.apiKey,
  baseUrl: conf.service.baseUrl,
  model: conf.service.model,
  promptGenerate: getDefaultPromptForGenerateContents(locale),
  promptDecorate: getDefaultPromptDecorateContents(),
  isDebug: true,
};

const client = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl });
const pages: GeneratedSlide[] = [];
// const prompts = ["What your name?", "Where are you from?", "How old are you?"];

const multi = new MultiBar({}, Presets.shades_classic);
const progress = multi.create(conf.slides?.length, 0);
multi.log("Generating slides...\n");

const promises = conf.slides.map((slide, idx) => {
  return client.chat.completions.create({
    model: config.model,
    messages: [
      {"role": "system", "content": config.promptGenerate},
      {"role": "user", "content": slide.prompts.join("\n")},
    ],
  }).then((resp) => {
    progress.increment();
    const ret = resp?.choices[0]?.message?.content;
    if (ret) ( pages.push({index:idx, contents:`${ret}\n---\n`}));
  });
});


Promise.all(promises).then(() => {
  progress.stop();
  multi.stop();
  pages.sort((a, b) => a.index - b.index);
  parse(pages.map((p) => p.contents).join("\n"), output).then((parsed) => {
    fs.writeFileSync(output, `${SlidevHeader}\n${parsed.raw}\n`);
    console.log("Done");
  });
});
