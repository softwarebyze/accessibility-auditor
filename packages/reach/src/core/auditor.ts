import { runAxeOnPage } from './browser/axe.js';
import { type BrowserEngine, createBrowserEngine } from './browser/index.js';
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
  private engine: BrowserEngine | null = null;

  async initialize(): Promise<void> {
    this.engine = await createBrowserEngine();
    await this.engine.initialize();
  }

  async audit(url: string, options: AuditOptions = {}): Promise<AuditResult> {
    if (!this.engine) {
      await this.initialize();
    }
    if (!this.engine) {
      throw new Error('Failed to start a browser engine');
    }

    const page = await this.engine.newPage();

    try {
      const timeout = options.timeout ?? 30000;
      if (options.html) {
        await page.setContent(options.html, { timeout });
      } else {
        await page.goto(url, { timeout });
      }

      const axeResults = await runAxeOnPage(page);
      const violations = this.processViolations(axeResults.violations);
      const manualChecks = buildManualCheckResults(axeResults);
      const passes = axeResults.passes.length;
      const incomplete = axeResults.incomplete.length;

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
        rawAxeResults: axeResults,
        manualChecks,
        engine: {
          name: this.engine.name,
          detail: this.engine.detail,
        },
      };
    } finally {
      await page.close();
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
    if (this.engine) {
      await this.engine.close();
      this.engine = null;
    }
  }
}

export interface AuditOptions {
  timeout?: number;
  waitForSelector?: string;
  includePasses?: boolean;
  html?: string;
}
