import fs from 'fs';

import { Command } from 'commander';
import { MultiBar, Presets } from 'cli-progress';
import { OpenAI } from 'openai';

import { parse } from "@slidev/parser";

import { loadConfig as loadSettings, SlidevHeader } from '@/cli/util';
import type { GeneratedSlide } from '@/cli/util';

// Load configs
const program = new Command();
program
  .option('-i, --input <file>', 'input yaml file path to generate slide', 'slides.yaml')
  .option('-o, --output <file>', 'output path to write markdown file')
  .option('-l, --locale <locale>', 'locale of generated slide')
  .option('-u, --apiurl <url>', 'base url of openai api (e.g.: https://api.openai.com/v1)')
  .option('-k, --apikey', 'api key of openai (or openai-compatible) api ')
  .option('-m, --model <model>', 'model of openai api')
  .option('-d, --debug', 'output extra debugging', false);
const options = program.parse().opts();
const settings = loadSettings(fs.readFileSync(options.input, 'utf8'), options);
console.log(settings);

// Set up
const multi = new MultiBar({}, Presets.shades_classic);
const progress = multi.create(settings.slides?.length, 0);

const client = new OpenAI({
  apiKey: settings.context.apiKey,
  baseURL: settings.context.baseUrl
});

multi.log("Generating slides...\n");

// Generate slides
const pages: GeneratedSlide[] = [];
const promises = settings.slides.map((slide, idx) => {
  return client.chat.completions.create({
    model: settings.context.model,
    messages: [
      {"role": "system", "content": settings.context.promptGenerate},
      {"role": "user", "content": slide.prompts.join("\n")},
    ],
  }).then((resp) => {
    progress.increment();
    const ret = resp?.choices[0]?.message?.content;
    if (ret) {
       pages.push({index:idx, contents:`${ret}\n---\n`});
    }
  });
});

// Write out generated slides
Promise.all(promises).then(() => {
  progress.stop();
  multi.stop();
  pages.sort((a, b) => a.index - b.index);
  parse(pages.map((p) => p.contents).join("\n"), settings.context.output).then((parsed) => {
    fs.writeFileSync(settings.context.output, `${SlidevHeader}\n${parsed.raw}\n`);
    console.log("Done");
  });
});
