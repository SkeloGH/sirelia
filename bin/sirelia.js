#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { init } from '../lib/cli/init.js';
import { start } from '../lib/cli/start.js';

// Get the version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

const program = new Command();

program
  .name('sirelia')
  .description('AI-powered Mermaid diagram generation and real-time visualization tool')
  .version(packageJson.version);

program
  .command('init')
  .description('Initialize Sirelia in the current project')
  .option('-f, --force', 'Force overwrite existing configuration')
  .action(async (options) => {
    try {
      await init(options);
    } catch (error) {
      console.error('Error initializing Sirelia:', error.message);
      process.exit(1);
    }
  });

program
  .command('start')
  .description('Start the Sirelia web server and bridge')
  .option('-p, --port <port>', 'Web server port', '3000')
  .option('-b, --bridge-port <port>', 'Bridge server port', '3001')
  .option('-w, --watch <file>', 'Watch specific file', '.sirelia.mdd')
  .action(async (options) => {
    try {
      await start(options);
    } catch (error) {
      console.error('Error starting Sirelia:', error.message);
      process.exit(1);
    }
  });

program.parse(); 