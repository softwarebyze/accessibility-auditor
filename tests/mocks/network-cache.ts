import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Simple network mocking - stores HTML content for testing
 * without making actual network requests
 */
export class NetworkCache {
  private cache = new Map<string, string>();

  /**
   * Set cached HTML content for a URL
   */
  setPage(url: string, html: string): void {
    this.cache.set(url, html);
  }

  /**
   * Load HTML from file and cache it for a URL
   */
  loadPageFromFile(url: string, filename: string): void {
    const htmlPath = join(__dirname, "html", filename);
    const html = readFileSync(htmlPath, "utf-8");
    this.setPage(url, html);
  }

  /**
   * Get cached HTML for a URL
   */
  getPage(url: string): string | undefined {
    return this.cache.get(url);
  }

  /**
   * Check if URL is cached
   */
  hasCachedPage(url: string): boolean {
    return this.cache.has(url);
  }

  /**
   * Clear all cached pages
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Pre-populate with common test pages
   */
  static createWithDefaults(): NetworkCache {
    const cache = new NetworkCache();

    // Load test pages
    cache.loadPageFromFile("https://example.com", "simple-page.html");
    cache.loadPageFromFile("https://www.google.com", "valid-page.html");
    cache.loadPageFromFile("https://bad-site.com", "violations-page.html");

    return cache;
  }
}
