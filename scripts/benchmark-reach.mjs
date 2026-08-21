#!/usr/bin/env node
/**
 * Realistic Reach install + audit benchmark harness.
 *
 * Measures environment, dependency/browser disk cost, install time,
 * CLI usage, and in-process auditor timing/memory so Playwright and
 * bun.WebView runs can be compared on the same machine.
 *
 * Usage:
 *   node scripts/benchmark-reach.mjs --label playwright-baseline
 *   node scripts/benchmark-reach.mjs --label bun-webview --skip-playwright-install
 */

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const REACH = join(ROOT, 'packages/reach');
const ARTIFACTS = '/opt/cursor/artifacts';
const DOCS = join(ROOT, 'docs/benchmarks');

const args = parseArgs(process.argv.slice(2));
const LABEL = String(args.label || 'run');
const SKIP_PW_INSTALL = Boolean(args['skip-playwright-install']);
const ENGINE_NOTE = String(args.engine || '');
const CLI = args.cli === 'bun' ? 'bun' : 'npm';
const IN_PROCESS = args.runtime === 'bun' ? 'bun' : 'node';

mkdirSync(DOCS, { recursive: true });
mkdirSync(ARTIFACTS, { recursive: true });

const outDir = join(DOCS, LABEL);
const artifactDir = join(ARTIFACTS, `benchmark-${LABEL}`);
mkdirSync(outDir, { recursive: true });
mkdirSync(artifactDir, { recursive: true });

const logLines = [];
const results = {
  label: LABEL,
  startedAt: new Date().toISOString(),
  engineNote: ENGINE_NOTE,
  environment: {},
  disk: {},
  install: {},
  cli: [],
  inProcess: [],
  localServer: {},
};

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  logLines.push(line);
  console.log(message);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function collectDescendants(rootPid) {
  const childrenByParent = new Map();
  for (const name of readdirSync('/proc')) {
    if (!/^\d+$/.test(name)) continue;
    const pid = Number(name);
    try {
      const status = readFileSync(`/proc/${pid}/status`, 'utf8');
      const match = status.match(/^PPid:\s+(\d+)/m);
      const ppid = match ? Number(match[1]) : 0;
      if (!childrenByParent.has(ppid)) childrenByParent.set(ppid, []);
      childrenByParent.get(ppid).push(pid);
    } catch {
      // process vanished
    }
  }

  const out = [];
  const stack = [rootPid];
  const seen = new Set();
  while (stack.length) {
    const pid = stack.pop();
    if (seen.has(pid)) continue;
    seen.add(pid);
    out.push(pid);
    for (const child of childrenByParent.get(pid) || []) stack.push(child);
  }
  return out;
}

function treeRssKb(rootPid) {
  if (!rootPid) return 0;
  let total = 0;
  for (const pid of collectDescendants(rootPid)) {
    try {
      const status = readFileSync(`/proc/${pid}/status`, 'utf8');
      const match = status.match(/^VmRSS:\s+(\d+)/m);
      if (match) total += Number(match[1]);
    } catch {
      // process vanished
    }
  }
  return total;
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function run(command, commandArgs, options = {}) {
  const cwd = options.cwd || ROOT;
  const env = { ...process.env, ...(options.env || {}) };
  const started = process.hrtime.bigint();
  log(`$ ${command} ${commandArgs.join(' ')}`.trim());

  return new Promise((resolvePromise) => {
    const child = spawn(command, commandArgs, {
      cwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let peakTreeRssKb = 0;
    const sampler = setInterval(() => {
      const rss = treeRssKb(child.pid);
      if (rss > peakTreeRssKb) peakTreeRssKb = rss;
    }, 200);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
      if (options.inherit) process.stdout.write(chunk);
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
      if (options.inherit) process.stderr.write(chunk);
    });

    child.on('close', (code) => {
      clearInterval(sampler);
      const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
      resolvePromise({
        command: `${command} ${commandArgs.join(' ')}`.trim(),
        code,
        durationMs: round(durationMs),
        peakTreeRssMb: round(peakTreeRssKb / 1024),
        stdout,
        stderr,
      });
    });
  });
}

function commandOutput(command, commandArgs) {
  return new Promise((resolvePromise) => {
    const child = spawn(command, commandArgs, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('close', (code) => {
      resolvePromise({ code, stdout: stdout.trim(), stderr: stderr.trim() });
    });
    child.on('error', (error) => {
      resolvePromise({ code: 1, stdout: '', stderr: String(error) });
    });
  });
}

function shellQuote(value) {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

async function captureDisk(path) {
  const { execSync } = await import('node:child_process');
  if (!existsSync(path)) return null;
  try {
    return execSync(`du -sh ${shellQuote(path)}`, { encoding: 'utf8' }).trim().split(/\s+/)[0];
  } catch {
    return null;
  }
}

async function captureWhich(bin) {
  const { execSync } = await import('node:child_process');
  try {
    return execSync(`command -v ${bin}`, { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function saveText(name, content) {
  writeFileSync(join(outDir, name), content);
  writeFileSync(join(artifactDir, name), content);
}

function clip(text, max = 8000) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n…[truncated ${text.length - max} bytes]\n`;
}

async function collectEnvironment() {
  log('Collecting environment…');
  const node = await commandOutput('node', ['-v']);
  const npm = await commandOutput('npm', ['-v']);
  const bun = await commandOutput('bun', ['-v']);
  results.environment = {
    node: node.stdout || node.stderr,
    npm: npm.stdout || npm.stderr,
    bun: bun.code === 0 ? bun.stdout : 'not found',
    nodePath: await captureWhich('node'),
    npmPath: await captureWhich('npm'),
    bunPath: await captureWhich('bun'),
    chromePath: await captureWhich('google-chrome') || await captureWhich('google-chrome-stable'),
    platform: `${process.platform} ${process.arch}`,
    cwd: ROOT,
    cli: CLI,
    inProcessRuntime: IN_PROCESS,
  };
}

async function collectDisk() {
  log('Measuring disk usage…');
  const home = process.env.HOME || '';
  results.disk = {
    nodeModules: await captureDisk(join(ROOT, 'node_modules')),
    playwrightPackage: await captureDisk(join(ROOT, 'node_modules/playwright')),
    axePlaywrightPackage: await captureDisk(join(ROOT, 'node_modules/@axe-core/playwright')),
    axeCorePackage: await captureDisk(join(ROOT, 'node_modules/axe-core')),
    puppeteerCorePackage: await captureDisk(join(ROOT, 'node_modules/puppeteer-core')),
    playwrightBrowsers: await captureDisk(join(home, '.cache/ms-playwright')),
    bunInstall: await captureDisk(join(home, '.bun')),
  };
}

async function benchmarkPlaywrightInstall() {
  const playwrightCli = join(ROOT, 'node_modules/playwright');
  if (SKIP_PW_INSTALL || !existsSync(playwrightCli)) {
    log('Skipping Playwright install (not installed or --skip-playwright-install)');
    results.install.playwrightFreshChromium = { skipped: true };
    return;
  }

  const target = join('/tmp', `reach-pw-browsers-${LABEL}`);
  if (existsSync(target)) rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });

  log(`Fresh Playwright Chromium install into ${target}`);
  const fresh = await run(
    'npx',
    ['playwright', 'install', 'chromium'],
    { env: { PLAYWRIGHT_BROWSERS_PATH: target }, inherit: true }
  );
  results.install.playwrightFreshChromium = {
    ...fresh,
    stdout: clip(fresh.stdout, 4000),
    stderr: clip(fresh.stderr, 4000),
    browserDirSize: await captureDisk(target),
    target,
  };
  saveText('playwright-fresh-chromium-install.log', `${fresh.stdout}\n${fresh.stderr}`);

  log('Documented install command: npm run install-browsers (uses existing cache)');
  const cached = await run('npm', ['run', 'install-browsers'], { inherit: true });
  results.install.npmRunInstallBrowsers = {
    ...cached,
    stdout: clip(cached.stdout, 4000),
    stderr: clip(cached.stderr, 4000),
  };
  saveText('npm-run-install-browsers.log', `${cached.stdout}\n${cached.stderr}`);
}

function startFixtureServer() {
  const htmlDir = join(REACH, 'tests/mocks/html');
  const files = {
    '/valid': 'valid-page.html',
    '/violations': 'violations-page.html',
    '/simple': 'simple-page.html',
  };

  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      const file = files[req.url?.split('?')[0] || ''];
      if (!file) {
        res.writeHead(404, { 'content-type': 'text/plain' });
        res.end('not found');
        return;
      }
      const body = readFileSync(join(htmlDir, file));
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(body);
    });
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      resolvePromise({ server, port, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

async function benchmarkCli(baseUrl) {
  const commands = [
    {
      name: 'quick-example.com',
      args: ['run', 'dev', '--', 'quick', 'https://example.com'],
    },
    {
      name: 'audit-example.com',
      args: ['run', 'dev', '--', 'audit', 'https://example.com'],
    },
    {
      name: 'audit-example.com-json',
      args: ['run', 'dev', '--', 'audit', 'https://example.com', '--output', 'json'],
    },
    {
      name: 'audit-local-violations',
      args: ['run', 'dev', '--', 'audit', `${baseUrl}/violations`],
    },
    {
      name: 'crawl-example.com-max-3',
      args: ['run', 'dev', '--', 'crawl', 'https://example.com', '--max-pages', '3'],
    },
  ];

  for (const item of commands) {
    log(`CLI: ${item.name}`);
    const result =
      CLI === 'bun'
        ? await run('bun', ['run', 'dev', '--', ...item.args.slice(3)], { inherit: true })
        : await run('npm', item.args, { inherit: true });
    results.cli.push({
      name: item.name,
      command: result.command,
      code: result.code,
      durationMs: result.durationMs,
      peakTreeRssMb: result.peakTreeRssMb,
      stdout: clip(result.stdout, 6000),
      stderr: clip(result.stderr, 2000),
    });
    saveText(`${item.name}.log`, `${result.stdout}\n${result.stderr}`);
  }
}

async function benchmarkInProcess(baseUrl) {
  const runner = join(__dirname, 'benchmark-auditor-runner.mjs');
  const urls = [
    `${baseUrl}/valid`,
    `${baseUrl}/violations`,
    'https://example.com',
  ];

  log('In-process auditor: cold launch + warm reuse');
  const result =
    IN_PROCESS === 'bun'
      ? await run('bun', [runner, '--urls', urls.join(',')], { inherit: true })
      : await run('npx', ['tsx', runner, '--urls', urls.join(',')], { inherit: true });
  saveText('in-process-auditor.log', `${result.stdout}\n${result.stderr}`);

  let parsed = null;
  try {
    const jsonLine = result.stdout
      .split('\n')
      .reverse()
      .find((line) => line.startsWith('BENCHMARK_JSON:'));
    if (jsonLine) parsed = JSON.parse(jsonLine.slice('BENCHMARK_JSON:'.length));
  } catch (error) {
    results.inProcess.push({ error: String(error), raw: clip(result.stdout, 2000) });
  }

  results.inProcess = {
    runner: result,
    measurements: parsed,
  };
}

function toMarkdown() {
  const env = results.environment;
  const disk = results.disk;
  const lines = [
    `# Reach benchmark: ${LABEL}`,
    '',
    `Captured: ${results.startedAt}`,
    ENGINE_NOTE ? `Engine note: ${ENGINE_NOTE}` : '',
    '',
    '## Environment',
    '',
    `| Item | Value |`,
    `| --- | --- |`,
    `| Node | ${env.node} (${env.nodePath}) |`,
    `| npm | ${env.npm} (${env.npmPath}) |`,
    `| Bun | ${env.bun} (${env.bunPath || 'n/a'}) |`,
    `| Chrome | ${env.chromePath || 'not on PATH'} |`,
    `| Platform | ${env.platform} |`,
    '',
    '## Disk usage',
    '',
    `| Path | Size |`,
    `| --- | --- |`,
    `| node_modules | ${disk.nodeModules} |`,
    `| playwright package | ${disk.playwrightPackage} |`,
    `| @axe-core/playwright | ${disk.axePlaywrightPackage} |`,
    `| axe-core | ${disk.axeCorePackage} |`,
    `| puppeteer-core | ${disk.puppeteerCorePackage} |`,
    `| ~/.cache/ms-playwright | ${disk.playwrightBrowsers} |`,
    `| ~/.bun | ${disk.bunInstall} |`,
    '',
    '## Install',
    '',
  ];

  const fresh = results.install.playwrightFreshChromium;
  if (fresh?.skipped) {
    lines.push('Playwright fresh Chromium install skipped.');
  } else if (fresh) {
    lines.push(
      `Fresh \`npx playwright install chromium\` into \`${fresh.target}\`: **${fresh.durationMs} ms**, peak RSS **${fresh.peakTreeRssMb} MB**, browser dir **${fresh.browserDirSize}**, exit ${fresh.code}.`
    );
    lines.push('');
    lines.push('```');
    lines.push(clip((fresh.stdout || '') + (fresh.stderr || ''), 2500).trim());
    lines.push('```');
  }

  const cached = results.install.npmRunInstallBrowsers;
  if (cached) {
    lines.push('');
    lines.push(
      `\`npm run install-browsers\` (existing cache): **${cached.durationMs} ms**, peak RSS **${cached.peakTreeRssMb} MB**, exit ${cached.code}.`
    );
  }

  lines.push('', '## CLI usage', '');
  lines.push('| Command | Duration | Peak RSS | Exit |');
  lines.push('| --- | --- | --- | --- |');
  for (const item of results.cli) {
    lines.push(`| ${item.name} | ${item.durationMs} ms | ${item.peakTreeRssMb} MB | ${item.code} |`);
  }

  for (const item of results.cli) {
    lines.push('', `### ${item.name}`, '', '```');
    lines.push(clip(item.stdout || item.stderr || '', 3500).trim());
    lines.push('```');
  }

  const measurements = results.inProcess?.measurements;
  lines.push('', '## In-process auditor', '');
  if (measurements?.steps) {
    lines.push('| Step | Duration | Notes |');
    lines.push('| --- | --- | --- |');
    for (const step of measurements.steps) {
      lines.push(`| ${step.name} | ${step.durationMs} ms | ${step.notes || ''} |`);
    }
    lines.push('');
    lines.push(`Process RSS after close: **${measurements.finalRssMb} MB**`);
    lines.push(`Peak sampled RSS: **${results.inProcess.runner.peakTreeRssMb} MB**`);
  } else {
    lines.push('No structured in-process measurements were parsed.');
    if (results.inProcess?.runner) {
      lines.push('', '```');
      lines.push(clip(results.inProcess.runner.stdout || '', 2500));
      lines.push('```');
    }
  }

  return `${lines.filter((line) => line !== undefined).join('\n').trim()}\n`;
}

async function main() {
  log(`Starting Reach benchmark (${LABEL})`);
  await collectEnvironment();
  await collectDisk();
  await benchmarkPlaywrightInstall();

  const { server, baseUrl } = await startFixtureServer();
  results.localServer = { baseUrl };
  log(`Fixture server at ${baseUrl}`);

  try {
    await benchmarkCli(baseUrl);
    await benchmarkInProcess(baseUrl);
  } finally {
    await new Promise((resolvePromise) => server.close(resolvePromise));
  }

  results.finishedAt = new Date().toISOString();
  const json = `${JSON.stringify(results, null, 2)}\n`;
  const md = toMarkdown();
  saveText('results.json', json);
  saveText('REPORT.md', md);
  saveText('full.log', `${logLines.join('\n')}\n`);
  writeFileSync(join(DOCS, `${LABEL}.md`), md);
  writeFileSync(join(ARTIFACTS, `${LABEL}-REPORT.md`), md);

  log(`Wrote ${join(outDir, 'REPORT.md')}`);
  log(`Wrote ${join(artifactDir, 'REPORT.md')}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
