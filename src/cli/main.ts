import { Command } from 'commander';
import { Client } from '@/client/openai';
const program = new Command();
program
  .option('--first')
  .option('-s, --separator <char>');

program.parse();

const options = program.opts();
const limit = options.first ? 1 : undefined;
console.log(program.args[0].split(options.separator, limit));
