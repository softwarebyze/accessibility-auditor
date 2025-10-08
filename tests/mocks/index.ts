import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AxeResults } from "../../src/core/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Mock scenarios available for testing
 */
export const MockScenarios = {
  VALID_PAGE: "valid-page",
  VIOLATIONS_PAGE: "violations-page",
  SIMPLE_PAGE: "simple-page",
} as const;

export type MockScenario = (typeof MockScenarios)[keyof typeof MockScenarios];

/**
 * Load mock HTML content for a given scenario
 */
export function getMockHTML(scenario: MockScenario): string {
  const htmlPath = join(__dirname, "html", `${scenario}.html`);
  return readFileSync(htmlPath, "utf-8");
}

/**
 * Load mock axe-core results for a given scenario
 */
export function getMockAxeResults(scenario: MockScenario): AxeResults {
  const resultsPath = join(__dirname, "axe-results", `${scenario}.json`);
  const content = readFileSync(resultsPath, "utf-8");
  return JSON.parse(content) as AxeResults;
}

/**
 * Create a mock URL for a given scenario (for testing URL validation)
 */
export function getMockURL(scenario: MockScenario): string {
  return `https://mock-test-site.com/${scenario}.html`;
}

/**
 * Get expected results for a scenario - useful for assertions
 */
export function getExpectedResults(scenario: MockScenario) {
  const axeResults = getMockAxeResults(scenario);

  const violations = axeResults.violations;
  const criticalCount = violations.filter(
    (v) => v.impact === "critical"
  ).length;
  const seriousCount = violations.filter((v) => v.impact === "serious").length;
  const moderateCount = violations.filter(
    (v) => v.impact === "moderate"
  ).length;
  const minorCount = violations.filter((v) => v.impact === "minor").length;

  return {
    url: getMockURL(scenario),
    totalViolations: violations.length,
    criticalViolations: criticalCount,
    seriousViolations: seriousCount,
    moderateViolations: moderateCount,
    minorViolations: minorCount,
    totalPasses: axeResults.passes.length,
    incomplete: axeResults.incomplete.length,
    violations: violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      tags: v.tags,
      nodeCount: v.nodes.length,
    })),
  };
}

/**
 * Mock data for quick access in tests
 */
export const MockData = {
  [MockScenarios.VALID_PAGE]: {
    html: () => getMockHTML(MockScenarios.VALID_PAGE),
    axeResults: () => getMockAxeResults(MockScenarios.VALID_PAGE),
    url: getMockURL(MockScenarios.VALID_PAGE),
    expected: getExpectedResults(MockScenarios.VALID_PAGE),
  },
  [MockScenarios.VIOLATIONS_PAGE]: {
    html: () => getMockHTML(MockScenarios.VIOLATIONS_PAGE),
    axeResults: () => getMockAxeResults(MockScenarios.VIOLATIONS_PAGE),
    url: getMockURL(MockScenarios.VIOLATIONS_PAGE),
    expected: getExpectedResults(MockScenarios.VIOLATIONS_PAGE),
  },
  [MockScenarios.SIMPLE_PAGE]: {
    html: () => getMockHTML(MockScenarios.SIMPLE_PAGE),
    axeResults: () => getMockAxeResults(MockScenarios.SIMPLE_PAGE),
    url: getMockURL(MockScenarios.SIMPLE_PAGE),
    expected: getExpectedResults(MockScenarios.SIMPLE_PAGE),
  },
};

// Re-export mock auditor utilities for convenience
export { createMockAuditor, MockAccessibilityAuditor } from "./mock-auditor.js";
