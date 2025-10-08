import AxeBuilder from "@axe-core/playwright";
import { type Browser, chromium } from "playwright";
import type { AuditResult, Violation, WCAGLevel } from "./types.js";

export class AccessibilityAuditor {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  async audit(url: string, options: AuditOptions = {}): Promise<AuditResult> {
    if (!this.browser) {
      await this.initialize();
    }

    const context = await this.browser!.newContext();
    const page = await context.newPage();

    try {
      // Navigate to the page
      await page.goto(url, { waitUntil: "networkidle" });

      // Run axe-core analysis
      const axeResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      // Process results
      const violations = this.processViolations(axeResults.violations);
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
        rawAxeResults: axeResults,
      };
    } finally {
      await page.close();
      await context.close();
    }
  }

  private processViolations(axeViolations: any[]): Violation[] {
    return axeViolations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      wcagLevel: this.mapToWCAGLevel(violation.tags),
      nodes: violation.nodes.map((node: any) => ({
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

export interface AuditOptions {
  timeout?: number;
  waitForSelector?: string;
  includePasses?: boolean;
}
