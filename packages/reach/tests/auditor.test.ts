import { existsSync } from 'node:fs';
import { chromium } from 'playwright';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AuditResult } from '../src/core/types.js';
import type { TestableAccessibilityAuditor } from './mocks/testable-auditor.js';
import { createTestAuditor } from './mocks/testable-auditor.js';

const describeWithBrowser = existsSync(chromium.executablePath()) ? describe : describe.skip;

describeWithBrowser('AccessibilityAuditor (network cached)', () => {
  let auditor: TestableAccessibilityAuditor;

  beforeEach(() => {
    auditor = createTestAuditor();
  });

  afterEach(async () => {
    await auditor.close();
  });

  describe('audit', () => {
    it('should calculate summary correctly for cached page', async () => {
      const result = await auditor.audit('https://example.com');
      const { summary } = result;

      expect(summary.totalViolations).toBe(
        summary.criticalViolations +
          summary.seriousViolations +
          summary.moderateViolations +
          summary.minorViolations
      );
      expect(summary.totalPasses).toBeGreaterThanOrEqual(0);
      expect(summary.incomplete).toBeGreaterThanOrEqual(0);
    });

    it('should audit cached HTML page', async () => {
      const result: AuditResult = await auditor.audit('https://example.com');

      expect(result).toBeDefined();
      expect(result.url).toBe('https://example.com');
      expect(result.timestamp).toBeDefined();
      expect(result.summary.totalViolations).toBeGreaterThanOrEqual(0);
      expect(result.violations).toBeInstanceOf(Array);
    });

    // Additional violation-specific assertions can be added when needed.
  });
});
