#!/usr/bin/env node
/**
 * Free the dev server port (DEV_SERVER_PORT from .env.development, default 4002).
 */
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function getDevPort() {
  const envPath = join(root, '.env.development');
  if (!existsSync(envPath)) return 4002;

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^DEV_SERVER_PORT=(.+)$/);
    if (m) {
      const port = Number.parseInt(m[1].trim(), 10);
      if (Number.isFinite(port) && port > 0) return port;
    }
  }
  return 4002;
}

function killPort(port) {
  if (process.platform === 'win32') {
    try {
      const out = execSync(`netstat -ano | findstr :${port}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      const pids = new Set();
      for (const line of out.split('\n')) {
        const parts = line.trim().split(/\s+/);
        const pid = parts.at(-1);
        if (pid && /^\d+$/.test(pid) && pid !== '0') pids.add(pid);
      }
      if (pids.size === 0) {
        console.log(`No process on port ${port}`);
        return;
      }
      for (const pid of pids) {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      }
      console.log(`Process on port ${port} killed`);
    } catch {
      console.log(`No process on port ${port}`);
    }
    return;
  }

  try {
    execSync(`lsof -ti :${port} | xargs kill -9`, { stdio: 'ignore' });
    console.log(`Process on port ${port} killed`);
  } catch {
    console.log(`No process on port ${port}`);
  }
}

killPort(getDevPort());
