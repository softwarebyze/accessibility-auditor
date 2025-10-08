import AxeBuilder from "@axe-core/playwright";
import { type Browser, type Page, chromium } from "playwright";
import type {
  AuditResult,
  AxeNode,
  AxeViolation,
  Violation,
  WCAGLevel,
} from "../../src/core/types.js";
import { NetworkCache } from "./network-cache.js";

export interface TestAuditOptions {
  timeout?: number;
  waitForSelector?: string;
  includePasses?: boolean;
  networkCache?: NetworkCache;
}

/**
 * Testable AccessibilityAuditor that can use cached HTML instead of network requests
 */
export class TestableAccessibilityAuditor {
  private browser: Browser | null = null;
  private networkCache?: NetworkCache;

  constructor(networkCache?: NetworkCache) {
    this.networkCache = networkCache;
  }

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  async audit(
    url: string,
    options: TestAuditOptions = {}
  ): Promise<AuditResult> {
    if (!this.browser) {
      await this.initialize();
    }

    const context = await this.browser?.newContext();
    if (!context) throw new Error("Failed to create browser context");
    const page = await context.newPage();

    try {
      // Use cached HTML if available, otherwise load from network
      const cache = options.networkCache || this.networkCache;
      if (cache?.hasCachedPage(url)) {
        const html = cache.getPage(url);
        if (html) {
          await this.setPageContent(page, html, url);
        } else {
          throw new Error(`Failed to get cached content for ${url}`);
        }
      } else {
        // Normal network request
        await page.goto(url, { waitUntil: "domcontentloaded" });
      }

      // Run axe-core analysis (same as original)
      const axeResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      // Process results (same as original)
      const violations = this.processViolations(
        axeResults.violations as AxeViolation[]
      );
      const passes = axeResults.passes.length;
      const incomplete = axeResults.incomplete.length;

      return {
        url,
        timestamp: new Date().toISOString(),
        summary: {
          totalViolations: violations.length,
          criticalViolations: violations.filter((v) => v.impact === "critical")
            .length,
          seriousViolations: violations.filter((v) => v.impact === "serious")
            .length,
          moderateViolations: violations.filter((v) => v.impact === "moderate")
            .length,
          minorViolations: violations.filter((v) => v.impact === "minor")
            .length,
          totalPasses: passes,
          incomplete: incomplete,
        },
        violations,
        rawAxeResults:
          axeResults as unknown as import("../../src/core/types.js").AxeResults,
      };
    } finally {
      await page.close();
      await context.close();
    }
  }

  /**
   * Set page content directly instead of loading from URL
   */
  private async setPageContent(
    page: Page,
    html: string,
    _baseUrl: string
  ): Promise<void> {
    // Set content for testing
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
    });
  }

  private processViolations(axeViolations: AxeViolation[]): Violation[] {
    return axeViolations.map((violation) => ({
      id: violation.id,
      impact: violation.impact || "minor",
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      wcagLevel: this.mapToWCAGLevel(violation.tags),
      nodes: violation.nodes.map((node: AxeNode) => ({
        target: node.target,
        html: node.html,
        failureSummary: node.failureSummary,
        impact: node.impact,
      })),
    }));
  }

  private mapToWCAGLevel(tags: string[]): WCAGLevel {
    if (tags.includes("wcag21aa")) return "WCAG 2.1 AA";
    if (tags.includes("wcag2aa")) return "WCAG 2.0 AA";
    if (tags.includes("wcag21a")) return "WCAG 2.1 A";
    if (tags.includes("wcag2a")) return "WCAG 2.0 A";
    return "Other";
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

/**
 * Create a testable auditor with pre-cached test pages
 */
export function createTestAuditor(): TestableAccessibilityAuditor {
  const cache = NetworkCache.createWithDefaults();
  return new TestableAccessibilityAuditor(cache);
}
