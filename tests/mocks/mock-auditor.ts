import type { AuditResult } from "../../src/core/types.js";
import { type MockScenario, getMockAxeResults } from "./index.js";

/**
 * Mock AccessibilityAuditor for testing
 * This allows tests to run without actually launching browsers or making network calls
 */
export class MockAccessibilityAuditor {
  private mockScenarios: Map<string, MockScenario> = new Map();

  /**
   * Set up which mock scenario to return for a given URL
   */
  setupMockScenario(url: string, scenario: MockScenario): void {
    this.mockScenarios.set(url, scenario);
  }

  /**
   * Mock audit method that returns pre-defined results
   */
  async audit(url: string, _options = {}): Promise<AuditResult> {
    // Check if we have a mock scenario set up for this URL
    const scenario = this.mockScenarios.get(url);

    if (!scenario) {
      throw new Error(`No mock scenario configured for URL: ${url}`);
    }

    const axeResults = getMockAxeResults(scenario);

    // Process violations similar to the real auditor
    const violations = axeResults.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact || "minor", // Default to minor if undefined
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      wcagLevel: this.mapToWCAGLevel(violation.tags),
      nodes: violation.nodes.map((node) => ({
        target: node.target,
        html: node.html,
        failureSummary: node.failureSummary,
        impact: node.impact,
      })),
    }));

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
        minorViolations: violations.filter((v) => v.impact === "minor").length,
        totalPasses: passes,
        incomplete: incomplete,
      },
      violations,
      rawAxeResults: axeResults,
    };
  }

  private mapToWCAGLevel(
    tags: string[]
  ): "WCAG 2.0 A" | "WCAG 2.0 AA" | "WCAG 2.1 A" | "WCAG 2.1 AA" | "Other" {
    if (tags.includes("wcag21aa")) return "WCAG 2.1 AA";
    if (tags.includes("wcag2aa")) return "WCAG 2.0 AA";
    if (tags.includes("wcag21a")) return "WCAG 2.1 A";
    if (tags.includes("wcag2a")) return "WCAG 2.0 A";
    return "Other";
  }

  /**
   * Mock close method
   */
  async close(): Promise<void> {
    // Nothing to clean up in mock
  }
}

/**
 * Create a mock auditor pre-configured with common test scenarios
 */
export function createMockAuditor(): MockAccessibilityAuditor {
  const auditor = new MockAccessibilityAuditor();

  // Pre-configure common test URLs
  auditor.setupMockScenario("https://example.com", "simple-page");
  auditor.setupMockScenario("https://www.google.com", "valid-page");
  auditor.setupMockScenario("https://bad-site.com", "violations-page");

  return auditor;
}
