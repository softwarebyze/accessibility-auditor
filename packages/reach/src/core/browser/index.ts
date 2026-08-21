import { hasBunWebView } from './chrome.js';
import type { BrowserEngine, EngineKind } from './types.js';

export {
  getBrowserSetupHelp,
  hasBunWebView,
  requireChromePath,
  resolveChromePath,
} from './chrome.js';
export type { BrowserEngine, BrowserPage, EngineKind } from './types.js';

export function requestedEngine(): EngineKind | undefined {
  const raw = process.env.REACH_ENGINE?.trim().toLowerCase();
  if (!raw) return undefined;
  if (raw === 'webview' || raw === 'bun' || raw === 'bun.webview') return 'webview';
  if (raw === 'puppeteer' || raw === 'node' || raw === 'puppeteer-core') return 'puppeteer';
  throw new Error(
    `Unknown REACH_ENGINE="${process.env.REACH_ENGINE}". Use "webview" or "puppeteer".`
  );
}

export function selectEngineKind(): EngineKind {
  const requested = requestedEngine();
  if (requested === 'webview') {
    if (!hasBunWebView()) {
      throw new Error(
        'REACH_ENGINE=webview requires Bun 1.4+ (Bun.WebView). Install Bun or omit REACH_ENGINE to use system Chrome.'
      );
    }
    return 'webview';
  }
  if (requested === 'puppeteer') return 'puppeteer';
  return hasBunWebView() ? 'webview' : 'puppeteer';
}

export async function createBrowserEngine(): Promise<BrowserEngine> {
  const kind = selectEngineKind();
  if (kind === 'webview') {
    const { BunWebViewEngine } = await import('./bun-webview.js');
    return new BunWebViewEngine();
  }
  const { PuppeteerEngine } = await import('./puppeteer.js');
  return new PuppeteerEngine();
}
