import { parseHTML } from 'linkedom';

export interface CrawlOptions {
  maxPages: number;
  maxDepth: number;
  delayMs: number;
  sameOrigin: boolean;
}

export interface CrawlResult {
  pages: string[];
  errors: CrawlError[];
  skipped: number;
}

export interface CrawlError {
  url: string;
  error: string;
}

interface QueueItem {
  url: string;
  depth: number;
}

const DEFAULT_OPTIONS: CrawlOptions = {
  maxPages: 20,
  maxDepth: 2,
  delayMs: 0,
  sameOrigin: true,
};

const HTTP_PROTOCOLS = new Set(['http:', 'https:']);

export class SiteCrawler {
  constructor(private readonly fetchFn: typeof fetch = fetch) {}

  async crawl(startUrl: string, partialOptions: Partial<CrawlOptions> = {}): Promise<CrawlResult> {
    const options = { ...DEFAULT_OPTIONS, ...partialOptions };

    const normalizedStart = this.normalizeUrl(startUrl);
    if (!normalizedStart) {
      throw new Error(`Invalid start URL: ${startUrl}`);
    }

    const origin = new URL(normalizedStart).origin;

    const visited = new Set<string>();
    const pages: string[] = [];
    const errors: CrawlError[] = [];
    let skipped = 0;

    const queue: QueueItem[] = [{ url: normalizedStart, depth: 0 }];

    while (queue.length > 0 && pages.length < options.maxPages) {
      const current = queue.shift();
      if (!current) break;

      if (visited.has(current.url)) {
        continue;
      }

      visited.add(current.url);
      pages.push(current.url);

      let html: string | null = null;
      try {
        const response = await this.fetchFn(current.url);
        if (!response.ok) {
          errors.push({
            url: current.url,
            error: `HTTP ${response.status} ${response.statusText}`,
          });
        } else {
          html = await response.text();
        }
      } catch (error) {
        errors.push({
          url: current.url,
          error: error instanceof Error ? error.message : String(error),
        });
      }

      if (!html || current.depth >= options.maxDepth) {
        await this.maybeDelay(options.delayMs);
        continue;
      }

      const links = this.extractLinks(html, current.url);
      for (const link of links) {
        const normalized = this.normalizeUrl(link, current.url);
        if (!normalized) continue;

        const linkUrl = new URL(normalized);
        if (!HTTP_PROTOCOLS.has(linkUrl.protocol)) {
          skipped++;
          continue;
        }

        if (options.sameOrigin && linkUrl.origin !== origin) {
          skipped++;
          continue;
        }

        if (visited.has(normalized) || queue.some((item) => item.url === normalized)) {
          skipped++;
          continue;
        }

        queue.push({ url: normalized, depth: current.depth + 1 });
      }

      if (options.delayMs > 0 && queue.length > 0) {
        await this.maybeDelay(options.delayMs);
      }
    }

    return { pages, errors, skipped };
  }

  private extractLinks(html: string, baseUrl: string): string[] {
    try {
      const { document } = parseHTML(html);
      const anchors = document.querySelectorAll('a[href]');
      const links: string[] = [];

      for (const anchor of anchors) {
        const href = anchor.getAttribute('href');
        if (!href || href.startsWith('javascript:')) continue;
        if (href.startsWith('#')) continue;

        try {
          const resolved = new URL(href, baseUrl);
          links.push(resolved.href);
        } catch {
          // ignore invalid URLs
        }
      }

      return links;
    } catch (error) {
      console.warn(`Failed to parse HTML from ${baseUrl}:`, error);
      return [];
    }
  }

  private normalizeUrl(url: string, baseUrl?: string): string | null {
    try {
      const resolved = baseUrl ? new URL(url, baseUrl) : new URL(url);
      resolved.hash = '';
      if (resolved.pathname !== '/') {
        resolved.pathname = resolved.pathname.replace(/\/+$/, '');
        if (resolved.pathname === '') {
          resolved.pathname = '/';
        }
      }
      return resolved.href;
    } catch {
      return null;
    }
  }

  private async maybeDelay(delayMs: number): Promise<void> {
    if (delayMs <= 0) return;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}
