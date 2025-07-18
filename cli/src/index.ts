#!/usr/bin/env node
import { Command } from 'commander';
import axios from 'axios';
import * as fs from 'fs';

const program = new Command();
program
  .name('clippr')
  .description('Clippr CLI for managing scrape projects')
  .version('0.1.0');

const apiUrl = process.env.CLIPPR_API_URL || 'http://localhost:3000';

program
  .command('project create')
  .requiredOption('--name <name>', 'project name')
  .action(async (opts) => {
    await axios.post(`${apiUrl}/projects`, { name: opts.name });
    console.log(`Created project ${opts.name}`);
  });

program
  .command('scrape')
  .requiredOption('--project <id>', 'project id')
  .requiredOption('--start-url <url>', 'starting URL')
  .option('--depth <n>', 'crawl depth', '1')
  .action(async (opts) => {
    await axios.post(`${apiUrl}/scrape`, opts);
    console.log('Scrape started');
  });

program
  .command('status <id>')
  .action(async (id) => {
    const { data } = await axios.get(`${apiUrl}/tasks/${id}`);
    console.log(JSON.stringify(data, null, 2));
  });

program
  .command('download <id> <dest>')
  .action(async (id, dest) => {
    const { data } = await axios.get(`${apiUrl}/tasks/${id}/download`);
    fs.writeFileSync(dest, data);
    console.log(`Saved results to ${dest}`);
  });

program.parseAsync();
