import { AccessibilityAuditor, type AuditOptions } from '../../src/core/auditor.js';
import type { AuditResult } from '../../src/core/types.js';
import { NetworkCache } from './network-cache.js';

export interface TestAuditOptions extends AuditOptions {
  networkCache?: NetworkCache;
}

/**
 * Testable AccessibilityAuditor that can use cached HTML instead of network requests
 */
export class TestableAccessibilityAuditor {
  private readonly auditor = new AccessibilityAuditor();
  private networkCache?: NetworkCache;

  constructor(networkCache?: NetworkCache) {
    this.networkCache = networkCache;
  }

  async initialize(): Promise<void> {
    await this.auditor.initialize();
  }

  async audit(url: string, options: TestAuditOptions = {}): Promise<AuditResult> {
    const cache = options.networkCache || this.networkCache;
    if (cache?.hasCachedPage(url)) {
      const html = cache.getPage(url);
      if (!html) {
        throw new Error(`Failed to get cached content for ${url}`);
      }
      return this.auditor.audit(url, { ...options, html });
    }

    return this.auditor.audit(url, options);
  }

  async close(): Promise<void> {
    await this.auditor.close();
  }
}

/**
 * Create a testable auditor with pre-cached test pages
 */
export function createTestAuditor(): TestableAccessibilityAuditor {
  const cache = NetworkCache.createWithDefaults();
  return new TestableAccessibilityAuditor(cache);
}
