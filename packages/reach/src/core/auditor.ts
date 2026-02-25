import AxeBuilder from '@axe-core/playwright';
import { type Browser, chromium } from 'playwright';
import { buildManualCheckResults } from './manual-checks.js';
import type {
  AuditResult,
  AxeNode,
  AxeResults,
  AxeViolation,
  Violation,
  WCAGLevel,
} from './types.js';

export class AccessibilityAuditor {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  async audit(url: string, _options: AuditOptions = {}): Promise<AuditResult> {
    if (!this.browser) {
      await this.initialize();
    }

    const context = await this.browser?.newContext();
    if (!context) throw new Error('Failed to create browser context');
    const page = await context.newPage();

    try {
      // Navigate to the page
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      // Run axe-core analysis
      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const normalizedAxeResults = axeResults as unknown as AxeResults;

      // Process results
      const violations = this.processViolations(normalizedAxeResults.violations);
      const manualChecks = buildManualCheckResults(normalizedAxeResults);
      const passes = normalizedAxeResults.passes.length;
      const incomplete = normalizedAxeResults.incomplete.length;

      return {
        url,
        timestamp: new Date().toISOString(),
        summary: {
          totalViolations: violations.length,
          criticalViolations: violations.filter((v) => v.impact === 'critical').length,
          seriousViolations: violations.filter((v) => v.impact === 'serious').length,
          moderateViolations: violations.filter((v) => v.impact === 'moderate').length,
          minorViolations: violations.filter((v) => v.impact === 'minor').length,
          totalPasses: passes,
          incomplete: incomplete,
        },
        violations,
        rawAxeResults: normalizedAxeResults,
        manualChecks,
      };
    } finally {
      await page.close();
      await context.close();
    }
  }

  private processViolations(axeViolations: AxeViolation[]): Violation[] {
    return axeViolations.map((violation) => ({
      id: violation.id,
      impact: (violation.impact ?? 'minor') as Violation['impact'],
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
    if (tags.includes('wcag21aa')) return 'WCAG 2.1 AA';
    if (tags.includes('wcag2aa')) return 'WCAG 2.0 AA';
    if (tags.includes('wcag21a')) return 'WCAG 2.1 A';
    if (tags.includes('wcag2a')) return 'WCAG 2.0 A';
    return 'Other';
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
