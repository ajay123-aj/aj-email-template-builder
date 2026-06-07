import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Load KEY=value pairs from env files into process.env (does not override existing vars).
 */
export function loadEnvFiles(root, filenames) {
  for (const name of filenames) {
    const path = join(root, name);
    if (!existsSync(path)) continue;

    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;

      const key = trimmed.slice(0, eq).trim();
      if (!key || process.env[key] !== undefined) continue;

      let value = trimmed.slice(eq + 1).trim();
      value = value.replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  }
}

/** Load env for production build scripts (Vite-style precedence). */
export function loadProductionEnv(root) {
  loadEnvFiles(root, ['.env', '.env.production', '.env.local', '.env.production.local']);
}
