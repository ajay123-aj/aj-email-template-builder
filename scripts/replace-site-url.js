#!/usr/bin/env node
/**
 * Replaces https://yourdomain.com with VITE_SITE_URL in public SEO files before build.
 * Set VITE_SITE_URL in .env or: VITE_SITE_URL=https://mysite.com npm run build
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';

// Load .env if present
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^VITE_SITE_URL=(.+)$/);
    if (m) process.env.VITE_SITE_URL = m[1].trim().replace(/^["']|["']$/g, '');
  }
}
const siteUrl = process.env.VITE_SITE_URL?.trim();
const placeholder = 'https://yourdomain.com';

if (!siteUrl) {
  console.log('VITE_SITE_URL not set – using placeholder in sitemap/robots');
  process.exit(0);
}

const root = join(__dirname, '..');
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
