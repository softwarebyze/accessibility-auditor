import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import type { AuditResult } from "../src/core/types.js";
import { MockData, MockScenarios } from "./mocks/index.js";
import {
  MockAccessibilityAuditor,
  createMockAuditor,
} from "./mocks/mock-auditor.js";

describe("AccessibilityAuditor (with mocks)", () => {
  let auditor: MockAccessibilityAuditor;

  beforeEach(() => {
    auditor = createMockAuditor();
  });

  afterEach(async () => {
    await auditor.close();
  });

  describe("audit", () => {
    it("should calculate summary correctly for simple page", async () => {
      const result = await auditor.audit("https://example.com");
      const { summary } = result;
      const expected = MockData[MockScenarios.SIMPLE_PAGE].expected;

      expect(summary.totalViolations).toBe(expected.totalViolations);
      expect(summary.criticalViolations).toBe(expected.criticalViolations);
      expect(summary.seriousViolations).toBe(expected.seriousViolations);
      expect(summary.moderateViolations).toBe(expected.moderateViolations);
      expect(summary.minorViolations).toBe(expected.minorViolations);
      expect(summary.totalPasses).toBe(expected.totalPasses);
      expect(summary.incomplete).toBe(expected.incomplete);

      // Verify total calculation
      expect(summary.totalViolations).toBe(
        summary.criticalViolations +
          summary.seriousViolations +
          summary.moderateViolations +
          summary.minorViolations
      );
    });

    it("should audit a valid page with no violations", async () => {
      const result: AuditResult = await auditor.audit("https://www.google.com");
      const expected = MockData[MockScenarios.VALID_PAGE].expected;

      expect(result).toBeDefined();
      expect(result.url).toBe("https://www.google.com");
      expect(result.timestamp).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.violations).toBeInstanceOf(Array);
      expect(result.summary.totalViolations).toBe(expected.totalViolations);
      expect(result.summary.totalPasses).toBeGreaterThan(0);
    });

    it("should process violations correctly for page with multiple issues", async () => {
      const result = await auditor.audit("https://bad-site.com");
      const expected = MockData[MockScenarios.VIOLATIONS_PAGE].expected;

      expect(result.violations).toHaveLength(expected.totalViolations);

      for (const violation of result.violations) {
        expect(violation.id).toBeDefined();
        expect(violation.description).toBeDefined();
        expect(violation.help).toBeDefined();
        expect(violation.helpUrl).toBeDefined();
        expect(violation.wcagLevel).toBeDefined();
        expect(violation.nodes).toBeInstanceOf(Array);
        expect(["critical", "serious", "moderate", "minor"]).toContain(
          violation.impact
        );
      }

      // Verify we have expected violation types
      const violationIds = result.violations.map((v) => v.id);
      expect(violationIds).toContain("html-has-lang");
      expect(violationIds).toContain("image-alt");
      expect(violationIds).toContain("color-contrast");
      expect(violationIds).toContain("label");
    });

    it("should handle different impact levels correctly", async () => {
      const result = await auditor.audit("https://bad-site.com");

      const criticalViolations = result.violations.filter(
        (v) => v.impact === "critical"
      );
      const seriousViolations = result.violations.filter(
        (v) => v.impact === "serious"
      );

      expect(criticalViolations.length).toBeGreaterThan(0);
      expect(seriousViolations.length).toBeGreaterThan(0);

      // Critical violations should include missing alt text and unlabeled form fields
      const criticalIds = criticalViolations.map((v) => v.id);
      expect(criticalIds).toContain("image-alt");
      expect(criticalIds).toContain("label");
    });

    it("should map WCAG levels correctly", async () => {
      const result = await auditor.audit("https://bad-site.com");

      for (const violation of result.violations) {
        expect([
          "WCAG 2.0 A",
          "WCAG 2.0 AA",
          "WCAG 2.1 A",
          "WCAG 2.1 AA",
          "Other",
        ]).toContain(violation.wcagLevel);
      }
    });

    it("should include rawAxeResults in output", async () => {
      const result = await auditor.audit("https://example.com");

      expect(result.rawAxeResults).toBeDefined();
      expect(result.rawAxeResults?.violations).toBeInstanceOf(Array);
      expect(result.rawAxeResults?.passes).toBeInstanceOf(Array);
      expect(result.rawAxeResults?.incomplete).toBeInstanceOf(Array);
    });

    it("should support custom mock scenarios", async () => {
      const customAuditor = new MockAccessibilityAuditor();
      const customUrl = "https://custom-test.com";

      // Set up custom scenario
      customAuditor.setupMockScenario(customUrl, MockScenarios.VIOLATIONS_PAGE);

      const result = await customAuditor.audit(customUrl);
      const expected = MockData[MockScenarios.VIOLATIONS_PAGE].expected;

      expect(result.url).toBe(customUrl);
      expect(result.summary.totalViolations).toBe(expected.totalViolations);

      await customAuditor.close();
    });
  });

  describe("error handling", () => {
    it("should handle URLs without configured mock scenarios", async () => {
      await expect(auditor.audit("https://unknown-site.com")).rejects.toThrow(
        "No mock scenario configured for URL: https://unknown-site.com"
      );
    });
  });
});
