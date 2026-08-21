import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const PATH_BINS = [
  'google-chrome-stable',
  'google-chrome',
  'chromium-browser',
  'chromium',
  'brave-browser',
  'microsoft-edge',
  'chrome',
  'msedge',
  'brave',
];

const WELL_KNOWN_PATHS = [
  '/usr/local/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/snap/bin/chromium',
  '/usr/bin/microsoft-edge',
  '/usr/bin/brave-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
];

export function hasBunWebView(): boolean {
  const bun = (globalThis as { Bun?: { WebView?: unknown } }).Bun;
  return typeof bun?.WebView === 'function';
}

function which(bin: string): string | null {
  const result = spawnSync('which', [bin], { encoding: 'utf8' });
  if (result.status !== 0) return null;
  const path = result.stdout.trim().split('\n')[0];
  return path && existsSync(path) ? path : null;
}

function envChromePath(): string | null {
  const candidates = [
    process.env.REACH_CHROME_PATH,
    process.env.BUN_CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
  ];
  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) return candidate;
  }
  return null;
}

function playwrightHeadlessShell(): string | null {
  const roots = [
    join(homedir(), '.cache/ms-playwright'),
    join(homedir(), 'Library/Caches/ms-playwright'),
  ];
  if (process.env.LOCALAPPDATA) {
    roots.push(join(process.env.LOCALAPPDATA, 'ms-playwright'));
  }

  for (const root of roots) {
    if (!existsSync(root)) continue;
    let entries: string[] = [];
    try {
      entries = readdirSync(root);
    } catch {
      continue;
    }

    const preferred = entries
      .filter((name) => name.startsWith('chromium_headless_shell-') || name.startsWith('chromium-'))
      .sort()
      .reverse();

    for (const name of preferred) {
      const linux = join(root, name, 'chrome-linux', 'chrome');
      const linuxHeadless = join(root, name, 'chrome-linux', 'headless_shell');
      const mac = join(root, name, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium');
      for (const path of [linuxHeadless, linux, mac]) {
        if (existsSync(path)) return path;
      }
    }
  }

  return null;
}

export function resolveChromePath(): string | null {
  const fromEnv = envChromePath();
  if (fromEnv) return fromEnv;

  for (const bin of PATH_BINS) {
    const path = which(bin);
    if (path) return path;
  }

  for (const path of WELL_KNOWN_PATHS) {
    if (existsSync(path)) return path;
  }

  if (process.platform === 'win32') {
    const prefixes = [
      process.env.PROGRAMFILES,
      process.env['PROGRAMFILES(X86)'],
      process.env.LOCALAPPDATA,
    ].filter((value): value is string => Boolean(value));
    const windowsBins = [
      'Google\\Chrome\\Application\\chrome.exe',
      'Microsoft\\Edge\\Application\\msedge.exe',
      'BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    ];
    for (const prefix of prefixes) {
      for (const bin of windowsBins) {
        const path = join(prefix, bin);
        if (existsSync(path)) return path;
      }
    }
  }

  return playwrightHeadlessShell();
}

export function requireChromePath(): string {
  const path = resolveChromePath();
  if (path) return path;
  throw new Error(getBrowserSetupHelp());
}

export function getBrowserSetupHelp(): string {
  return [
    'Reach needs a real browser so axe-core can see the rendered page.',
    '',
    'Bun 1.4+ on macOS uses system WebKit — nothing extra to install.',
    'Bun 1.4+ on Linux/Windows, and Node/npm everywhere, use an installed Chrome, Chromium, Edge, or Brave.',
    '',
    'Install Chrome (or Chromium), then rerun. To point Reach at a specific binary:',
    '  REACH_CHROME_PATH=/path/to/chrome reach audit https://example.com',
    '',
    'Playwright browser downloads are no longer required.',
  ].join('\n');
}
