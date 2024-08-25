import fs from 'fs';

import { Command } from 'commander';
import { MultiBar, Presets } from 'cli-progress';

import { parse } from "@slidev/parser";

import { Logger } from '@/logger';
import { loadConfig as loadSettings, SlidevHeader } from '@/cli/util';
import type { GeneratedSlide } from '@/cli/util';
import { OpenAIClient } from '@/client/openai';
import { LLMClientFactory, type CustomCancellationToken } from '@/client/llmClient';
import { SlidevPage } from '@/model/slidev';

Logger.init((message: string) => { console.log(message); });

// Load configs
const program = new Command();
program
  .option('-i, --input <file>', 'input yaml file path to generate slide', 'slides.yaml')
  .option('-o, --output <file>', 'output path to write markdown file')
  .option('-l, --locale <locale>', 'locale of generated slide')
  .option('-s, --service <service>', 'service to use ("openai" or "azure-ai-inference")', 'openai')
  .option('-u, --apiurl <url>', 'base url of openai api (e.g.: https://api.openai.com/v1)')
  .option('-k, --apikey <apikey>', 'api key of openai (or openai-compatible) api ')
  .option('-m, --model <model>', 'model of openai api')
  .option('-d, --debug', 'output extra debugging', false);
const options = program.parse().opts();
const settings = loadSettings(fs.readFileSync(options.input, 'utf8'), options);
Logger.debug(JSON.stringify(settings, null, 2));

class CancelHandler implements CustomCancellationToken {
  onCancellationRequested(callback: () => void): void {
    process.on('SIGINT', () => { callback(); });
  }
}

// Set up
const multi = new MultiBar({}, Presets.shades_classic);
const progress = multi.create(settings.slides?.length, 0);
const client = LLMClientFactory.create(settings.context, settings.context.locale);

multi.log("Generating slides...\n");

// Generate slides
const pages: GeneratedSlide[] = [];
const promises = settings.slides.map(async (slide, idx) => {
  const prompts = slide.prompts.map((p) => `  - ${p}`).join("\n");
  const slidevPageStr = `---
slidaiv:
  prompt:
${prompts}
---`;

  const page = await SlidevPage.init(slidevPageStr, `page${idx}.md`, 1);
  await page.rewriteByLLM(new CancelHandler(), client);
  pages.push({index:idx, contents: page.toString()});

  progress.increment();
});


// Write out generated slides
Promise.all(promises).then(() => {
  progress.stop();
  multi.stop();

  pages.sort((a, b) => a.index - b.index);

  parse(pages.map((p) => p.contents).join("\n"), settings.context.output).then((parsed) => {
    fs.writeFileSync(settings.context.output, `${SlidevHeader}\n${parsed.raw}\n`);
    Logger.info("Done");
  });
});
