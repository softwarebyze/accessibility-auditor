#!/usr/bin/env node
/**
 * Run the Reach CLI with Bun when the user invoked `bun run`, otherwise tsx/Node.
 * That keeps `npx` / `npm run` working without Bun, while `bun run dev` uses Bun.WebView.
 */
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const entry = join(dirname(fileURLToPath(import.meta.url)), '..', 'index.ts');
const args = process.argv.slice(2);
const userAgent = process.env.npm_config_user_agent ?? '';
const preferBun = Boolean(process.versions.bun) || userAgent.includes('bun/');

function run(command, commandArgs) {
  const child = spawn(command, commandArgs, {
    stdio: 'inherit',
    env: process.env,
  });
  child.on('exit', (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 1);
  });
  child.on('error', (error) => {
    console.error(error);
    process.exit(1);
  });
}

if (preferBun) {
  const bunBin = process.versions.bun ? process.execPath : 'bun';
  run(bunBin, [entry, ...args]);
} else {
  run('npx', ['tsx', entry, ...args]);
}
