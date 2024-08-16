import fs from 'fs';

import { Command } from 'commander';
import { MultiBar, Presets } from 'cli-progress';
import { OpenAI } from 'openai';

import { parse } from "@slidev/parser";

import { loadConfig, SlidevHeader } from '@/cli/util';
import type { GeneratedSlide } from '@/cli/util';

const program = new Command();
program
  .option('-i, --input <file>', 'input yaml file path to generate slide', 'slides.yaml')
  .option('-o, --output <file>', 'output path to write markdown file')
  .option('-l, --locale <locale>', 'locale of generated slide')
  .option('-u, --apiurl <url>', 'base url of openai api')
  .option('-k, --apikey', 'api key of openai (or openai-compatible) api ')
  .option('-m, --model <model>', 'model of openai api')
  .option('-d, --debug', 'output extra debugging', false);

const options = program.parse().opts();
const config = loadConfig(fs.readFileSync(options.input, 'utf8'), options);
console.log(config);

const client = new OpenAI({ apiKey: config.service.apiKey, baseURL: config.service.baseUrl });
const pages: GeneratedSlide[] = [];

const multi = new MultiBar({}, Presets.shades_classic);
const progress = multi.create(config.slides?.length, 0);
multi.log("Generating slides...\n");

const promises = config.slides.map((slide, idx) => {
  return client.chat.completions.create({
    model: config.service.model,
    messages: [
      {"role": "system", "content": config.service.promptGenerate},
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


Promise.all(promises).then(() => {
  progress.stop();
  multi.stop();
  pages.sort((a, b) => a.index - b.index);
  parse(pages.map((p) => p.contents).join("\n"), config.service.output).then((parsed) => {
    fs.writeFileSync(config.service.output, `${SlidevHeader}\n${parsed.raw}\n`);
    console.log("Done");
  });
});
