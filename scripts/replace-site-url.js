#!/usr/bin/env node
/**
 * Replaces https://yourdomain.com with VITE_SITE_URL in public SEO files before build.
 * Reads from .env.production (and .env) — run `npm run env:prod` first if needed.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';
import { loadProductionEnv } from './load-env.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

loadProductionEnv(root);

const siteUrl = process.env.VITE_SITE_URL?.trim();
const placeholder = 'https://yourdomain.com';

if (!siteUrl) {
  console.log('VITE_SITE_URL not set in .env.production – using placeholder in sitemap/robots');
  process.exit(0);
}

const replacements = [
  join(root, 'public', 'sitemap.xml'),
  join(root, 'public', 'robots.txt'),
];

for (const p of replacements) {
  try {
    let content = readFileSync(p, 'utf8');
    content = content.replaceAll(placeholder, siteUrl.replace(/\/$/, ''));
    writeFileSync(p, content);
    console.log(`Updated ${basename(p)} with ${siteUrl}`);
  } catch (e) {
    console.warn(`Could not update ${p}:`, e.message);
  }
}
