#!/usr/bin/env node
/**
 * Create env files from examples when missing.
 *
 * Usage:
 *   node scripts/setup-env.js dev
 *   node scripts/setup-env.js prod
 *   node scripts/setup-env.js all
 *   node scripts/setup-env.js prod --force   (overwrite existing)
 */
import { copyFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const ENV_TARGETS = {
  dev: {
    target: '.env.development',
    example: '.env.development.example',
  },
  prod: {
    target: '.env.production',
    example: '.env.production.example',
  },
};

const args = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const force = process.argv.includes('--force');
const modes = args.length === 0 || args.includes('all') ? ['dev', 'prod'] : args;

function setup(mode) {
  const config = ENV_TARGETS[mode];
  if (!config) {
    console.error(`Unknown mode "${mode}". Use: dev, prod, or all`);
    process.exit(1);
  }

  const targetPath = join(root, config.target);
  const examplePath = join(root, config.example);

  if (!existsSync(examplePath)) {
    console.warn(`Skip ${config.target}: ${config.example} not found`);
    return;
  }

  if (existsSync(targetPath) && !force) {
    console.log(`${config.target} already exists (use --force to overwrite)`);
    return;
  }

  copyFileSync(examplePath, targetPath);
  console.log(`Created ${config.target} from ${config.example}`);
}

for (const mode of modes) {
  setup(mode);
}
