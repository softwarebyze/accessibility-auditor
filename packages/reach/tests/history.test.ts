import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  clearHistory,
  generateReport,
  getAuditResult,
  loadHistory,
  saveAuditResult,
} from '../src/core/history.js';
import type { AuditResult } from '../src/core/types.js';

describe('Audit History', () => {
  const testAuditResult: AuditResult = {
    url: 'https://example.com',
    timestamp: new Date().toISOString(),
    summary: {
      totalViolations: 2,
      criticalViolations: 1,
      seriousViolations: 1,
      moderateViolations: 0,
      minorViolations: 0,
      totalPasses: 15,
      incomplete: 0,
    },
    violations: [
      {
        id: 'test-violation-1',
        impact: 'critical',
        description: 'Test violation 1',
        help: 'Test help 1',
        helpUrl: 'https://example.com/help1',
        wcagLevel: 'WCAG 2.1 AA',
        nodes: [
          {
            target: ['#test-element'],
            html: '<div id="test-element">Test</div>',
            failureSummary: 'Test failure',
            impact: 'critical',
          },
        ],
      },
    ],
    manualChecks: [],
  };

  beforeEach(async () => {
    // Clear history before each test
    await clearHistory();
  });

  afterEach(async () => {
    // Clean up after each test
    await clearHistory();
  });

  describe('saveAuditResult', () => {
    it('should save audit result to history', async () => {
      const resultId = await saveAuditResult(testAuditResult);

      expect(resultId).toBeDefined();
      expect(typeof resultId).toBe('string');
      expect(resultId.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs for different results', async () => {
      const resultId1 = await saveAuditResult(testAuditResult);

      const result2 = { ...testAuditResult, url: 'https://test2.com' };
      const resultId2 = await saveAuditResult(result2);

      expect(resultId1).not.toBe(resultId2);
    });
  });

  describe('loadHistory', () => {
    it('should load empty history initially', async () => {
      const history = await loadHistory();
      expect(history).toEqual([]);
    });

    it('should load saved audit results', async () => {
      await saveAuditResult(testAuditResult);
      const history = await loadHistory();

      expect(history).toHaveLength(1);
      expect(history[0]?.url).toBe(testAuditResult.url);
      expect(history[0]?.timestamp).toBe(testAuditResult.timestamp);
    });

    it('should load multiple audit results', async () => {
      await saveAuditResult(testAuditResult);

      const result2 = { ...testAuditResult, url: 'https://test2.com' };
      await saveAuditResult(result2);

      const history = await loadHistory();
      expect(history).toHaveLength(2);
    });
  });

  describe('getAuditResult', () => {
    it('should retrieve specific audit result', async () => {
      const resultId = await saveAuditResult(testAuditResult);
      const retrieved = await getAuditResult(resultId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.url).toBe(testAuditResult.url);
      expect(retrieved?.summary.totalViolations).toBe(testAuditResult.summary.totalViolations);
    });

    it('should return null for non-existent result', async () => {
      const result = await getAuditResult('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('clearHistory', () => {
    it('should clear all audit history', async () => {
      await saveAuditResult(testAuditResult);
      await saveAuditResult({ ...testAuditResult, url: 'https://test2.com' });

      let history = await loadHistory();
      expect(history).toHaveLength(2);

      await clearHistory();

      history = await loadHistory();
      expect(history).toEqual([]);
    });
  });

  describe('generateReport', () => {
    it('should generate report from history', async () => {
      await saveAuditResult(testAuditResult);
      await saveAuditResult({ ...testAuditResult, url: 'https://test2.com' });

      const report = await generateReport();

      expect(report).toContain('Audit History Report');
      expect(report).toContain('Total Audits: 2');
      expect(report).toContain('https://example.com');
      expect(report).toContain('https://test2.com');
    });

    it('should generate empty report for no history', async () => {
      const report = await generateReport();

      expect(report).toBe('No audit history found.');
    });

    it('should include statistics in report', async () => {
      await saveAuditResult(testAuditResult);
      await saveAuditResult({
        ...testAuditResult,
        url: 'https://test2.com',
        summary: {
          ...testAuditResult.summary,
          totalViolations: 5,
          criticalViolations: 2,
        },
      });

      const report = await generateReport();

      expect(report).toContain('Average Violations per Audit: 1.0');
      expect(report).toContain('Total Audits: 2');
      expect(report).toContain('Total Violations: 2');
    });
  });
});
