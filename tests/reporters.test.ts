import { describe, expect, it } from 'bun:test';
import type { AuditResult } from '../src/core/types.js';
import { report as consoleReport } from '../src/reporters/console.js';
import { report, saveToFile } from '../src/reporters/json.js';

const mockAuditResult: AuditResult = {
  url: 'https://example.com',
  timestamp: '2024-01-01T00:00:00.000Z',
  summary: {
    totalViolations: 2,
    criticalViolations: 1,
    seriousViolations: 1,
    moderateViolations: 0,
    minorViolations: 0,
    totalPasses: 18,
    incomplete: 0,
  },
  violations: [
    {
      id: 'color-contrast',
      impact: 'critical',
      description: 'Elements must have sufficient color contrast',
      help: 'Ensure all text elements have sufficient color contrast',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/color-contrast',
      wcagLevel: 'WCAG 2.1 AA',
      nodes: [
        {
          target: ['body'],
          html: '<body>',
          failureSummary: 'Fix any of the following:\n  Element has insufficient color contrast',
          impact: 'critical',
        },
      ],
    },
    {
      id: 'image-alt',
      impact: 'serious',
      description: 'Images must have alternate text',
      help: 'Ensure <img> elements have alternate text',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/image-alt',
      wcagLevel: 'WCAG 2.1 A',
      nodes: [
        {
          target: ['img'],
          html: '<img src="test.jpg">',
          failureSummary: 'Fix any of the following:\n  Element does not have an alt attribute',
          impact: 'serious',
        },
      ],
    },
  ],
};

describe('ConsoleReporter', () => {
  it('should generate console output', () => {
    // Capture console output
    const originalLog = console.log;
    let output = '';
    console.log = (...args: unknown[]) => {
      output += `${args.join(' ')}\n`;
    };

    consoleReport(mockAuditResult);
    console.log = originalLog;

    expect(output).toContain('Accessibility Audit Report');
    expect(output).toContain('https://example.com');
    expect(output).toContain('2 violations found');
    expect(output).toContain('Critical: 1');
    expect(output).toContain('Serious: 1');
  });
});

describe('JsonReporter', () => {
  it('should generate valid JSON', () => {
    const json = report(mockAuditResult);

    expect(() => JSON.parse(json)).not.toThrow();

    const parsed = JSON.parse(json);
    expect(parsed.url).toBe('https://example.com');
    expect(parsed.summary.totalViolations).toBe(2);
    expect(parsed.violations).toHaveLength(2);
  });

  it('should save to file', async () => {
    const testFile = '/tmp/test-audit-result.json';

    await saveToFile(mockAuditResult, testFile);

    const fs = await import('node:fs');
    const saved = JSON.parse(fs.readFileSync(testFile, 'utf8'));
    expect(saved.url).toBe('https://example.com');
    expect(saved.summary.totalViolations).toBe(2);
  });
});
