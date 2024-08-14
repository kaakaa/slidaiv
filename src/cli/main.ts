import { Command } from 'commander';
import fs from 'fs';
import yaml from 'yaml';

import { MultiBar, Presets } from 'cli-progress';
import { OpenAI } from 'openai';
import { getDefaultPromptDecorateContents, getDefaultPromptForGenerateContents } from '@/client/prompts';

// TODO: YAMLファイルのスライドの順序を保持する
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

/* TODO: Implement command line options
const program = new Command();
program
  .option('--first')
  .option('-s, --separator <char>');

program.parse();

const options = program.opts();
const limit = options.first ? 1 : undefined;
*/

type Slide = {
  title: string;
  prompts: string[];
}
type config = {
  service: Configuration;
  slides: Slide[];
}

const f = fs.readFileSync('slides.yaml', 'utf8');
const conf = yaml.parse(f) as config;

const locale = "ja";
const config = {
  apiKey: conf.service.apiKey,
  baseUrl: conf.service.baseUrl,
  model: conf.service.model,
  promptGenerate: getDefaultPromptForGenerateContents(locale),
  promptDecorate: getDefaultPromptDecorateContents(),
  isDebug: true,
};

const client = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl });
const pages: string[] = [];
// const prompts = ["What your name?", "Where are you from?", "How old are you?"];

const multi = new MultiBar({}, Presets.shades_classic);
const progress = multi.create(conf.slides?.length, 0);
multi.log("Generating slides...\n");

const promises = conf.slides.map((slide) => {
  return client.chat.completions.create({
    model: config.model,
    messages: [
      {"role": "system", "content": config.promptGenerate},
      {"role": "user", "content": slide.prompts.join("\n")},
    ],
  }).then((resp) => {
    progress.increment();
    const ret = resp?.choices[0]?.message?.content;
    if (ret) ( pages.push(`${ret}\n---\n`) );
  });
});

import { parse } from "@slidev/parser";
import { Configuration } from '@/model/config';

Promise.all(promises).then(() => {
  progress.stop();
  multi.stop();
  parse(pages.join("\n"), "test.md").then((parsed) => {
    fs.writeFileSync("slidaiv-cli-test/slides.md", `${SlidevHeader}\n${parsed.raw}\n`);
    console.log("Done");
  });
});
