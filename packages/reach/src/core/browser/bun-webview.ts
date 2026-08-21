import { resolveChromePath } from './chrome.js';
import { withTimeout } from './timeout.js';
import type { BrowserEngine, BrowserPage } from './types.js';

type BunWebViewInstance = {
  navigate(url: string): Promise<void>;
  evaluate(expression: string): Promise<unknown>;
  close(): void;
};

type BunWebViewConstructor = new (options?: Record<string, unknown>) => BunWebViewInstance;

function getWebViewConstructor(): BunWebViewConstructor {
  const bun = (globalThis as { Bun?: { WebView?: BunWebViewConstructor } }).Bun;
  if (typeof bun?.WebView !== 'function') {
    throw new Error('Bun.WebView is not available. Reach needs Bun 1.4 or later for this engine.');
  }
  return bun.WebView;
}

function webViewOptions(): Record<string, unknown> {
  const chromePath = resolveChromePath();
  const forceWebKit =
    process.env.REACH_WEBVIEW_BACKEND === 'webkit' ||
    (process.platform === 'darwin' &&
      !chromePath &&
      process.env.REACH_WEBVIEW_BACKEND !== 'chrome');

  if (forceWebKit) {
    return { width: 1280, height: 720 };
  }

  const backend: Record<string, unknown> = {
    type: 'chrome',
    url: false,
    argv: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  };
  if (chromePath) backend.path = chromePath;

  return { width: 1280, height: 720, backend };
}

class BunWebViewPage implements BrowserPage {
  constructor(private readonly view: BunWebViewInstance) {}

  async goto(url: string, options: { timeout?: number } = {}): Promise<void> {
    const timeout = options.timeout ?? 30000;
    await withTimeout(
      this.view.navigate(url),
      timeout,
      `Timed out loading ${url} after ${timeout}ms`
    );
  }

  async setContent(html: string, options: { timeout?: number } = {}): Promise<void> {
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
    await this.goto(dataUrl, options);
  }

  async evaluate<T>(script: string): Promise<T> {
    return (await this.view.evaluate(script)) as T;
  }

  async close(): Promise<void> {
    this.view.close();
  }
}

export class BunWebViewEngine implements BrowserEngine {
  readonly name = 'bun.WebView';
  readonly detail = process.platform === 'darwin' && !resolveChromePath() ? 'webkit' : 'chrome';
  private WebView: BunWebViewConstructor | null = null;

  async initialize(): Promise<void> {
    this.WebView = getWebViewConstructor();
  }

  async newPage(): Promise<BrowserPage> {
    if (!this.WebView) {
      await this.initialize();
    }
    if (!this.WebView) {
      throw new Error('Failed to initialize Bun.WebView');
    }
    return new BunWebViewPage(new this.WebView(webViewOptions()));
  }

  async close(): Promise<void> {
    this.WebView = null;
  }
}
