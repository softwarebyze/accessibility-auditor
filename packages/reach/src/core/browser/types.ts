export interface BrowserPage {
  goto(url: string, options?: { timeout?: number }): Promise<void>;
  setContent(html: string, options?: { timeout?: number }): Promise<void>;
  evaluate<T>(script: string): Promise<T>;
  close(): Promise<void>;
}

export interface BrowserEngine {
  readonly name: string;
  readonly detail: string;
  initialize(): Promise<void>;
  newPage(): Promise<BrowserPage>;
  close(): Promise<void>;
}

export type EngineKind = 'webview' | 'puppeteer';
