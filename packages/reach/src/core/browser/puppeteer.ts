import puppeteer, { type Browser, type Page } from 'puppeteer-core';
import { requireChromePath } from './chrome.js';
import { withTimeout } from './timeout.js';
import type { BrowserEngine, BrowserPage } from './types.js';

class PuppeteerPage implements BrowserPage {
  constructor(private readonly page: Page) {}

  async goto(url: string, options: { timeout?: number } = {}): Promise<void> {
    const timeout = options.timeout ?? 30000;
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout });
  }

  async setContent(html: string, options: { timeout?: number } = {}): Promise<void> {
    const timeout = options.timeout ?? 30000;
    await withTimeout(
      this.page.setContent(html, { waitUntil: 'domcontentloaded', timeout }),
      timeout,
      `Timed out applying page content after ${timeout}ms`
    );
  }

  async evaluate<T>(script: string): Promise<T> {
    return (await this.page.evaluate(script)) as T;
  }

  async close(): Promise<void> {
    await this.page.close();
  }
}

export class PuppeteerEngine implements BrowserEngine {
  readonly name = 'puppeteer-core';
  detail = 'system-chrome';
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    const executablePath = requireChromePath();
    this.detail = executablePath;
    this.browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  }

  async newPage(): Promise<BrowserPage> {
    if (!this.browser) {
      await this.initialize();
    }
    if (!this.browser) {
      throw new Error('Failed to launch Chrome via puppeteer-core');
    }
    const page = await this.browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    return new PuppeteerPage(page);
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
