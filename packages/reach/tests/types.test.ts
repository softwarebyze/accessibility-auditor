import { describe, expect, it } from 'vitest';
import type {
  AuditResult,
  AuditSummary,
  Violation,
  ViolationNode,
  WCAGLevel,
} from '../src/core/types.js';

describe('Types', () => {
  it('should have correct WCAGLevel type', () => {
    const levels: WCAGLevel[] = ['WCAG 2.0 A', 'WCAG 2.0 AA', 'WCAG 2.1 A', 'WCAG 2.1 AA', 'Other'];

    expect(levels).toHaveLength(5);
  });

  it('should create valid ViolationNode', () => {
    const node: ViolationNode = {
      target: ['body', 'div'],
      html: '<div>',
      failureSummary: 'Test failure',
      impact: 'critical',
    };

    expect(node.target).toEqual(['body', 'div']);
    expect(node.html).toBe('<div>');
  });

  it('should create valid Violation', () => {
    const violation: Violation = {
      id: 'test-violation',
      impact: 'critical',
      description: 'Test violation',
      help: 'Fix this',
      helpUrl: 'https://example.com',
      wcagLevel: 'WCAG 2.1 AA',
      nodes: [],
    };

    expect(violation.impact).toBe('critical');
    expect(['critical', 'serious', 'moderate', 'minor']).toContain(violation.impact);
  });

  it('should create valid AuditSummary', () => {
    const summary: AuditSummary = {
      totalViolations: 5,
      criticalViolations: 2,
      seriousViolations: 2,
      moderateViolations: 1,
      minorViolations: 0,
      totalPasses: 15,
      incomplete: 1,
    };

    expect(summary.totalViolations).toBe(5);
    expect(summary.totalViolations).toBe(
      summary.criticalViolations +
        summary.seriousViolations +
        summary.moderateViolations +
        summary.minorViolations
    );
  });

  it('should create valid AuditResult', () => {
    const result: AuditResult = {
      url: 'https://example.com',
      timestamp: '2024-01-01T00:00:00.000Z',
      summary: {
        totalViolations: 0,
        criticalViolations: 0,
        seriousViolations: 0,
        moderateViolations: 0,
        minorViolations: 0,
        totalPasses: 10,
        incomplete: 0,
      },
      violations: [],
      manualChecks: [],
    };

    expect(result.url).toBe('https://example.com');
    expect(result.timestamp).toBeDefined();
    expect(result.summary).toBeDefined();
    expect(result.violations).toBeInstanceOf(Array);
  });
});
