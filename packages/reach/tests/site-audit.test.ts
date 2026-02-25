import { describe, expect, it } from 'bun:test';
import { SiteCrawler } from '../src/core/crawler.js';
import {
  type PageAuditRecord,
  SiteAuditRunner,
  aggregateViolations,
} from '../src/core/site-audit.js';
import { type MockResponse, createMockFetch } from './helpers/mock-fetch.js';
import { MockAccessibilityAuditor } from './mocks/mock-auditor.js';

function createRunner(responses: Record<string, MockResponse>, auditor: MockAccessibilityAuditor) {
  const crawlerFactory = () => new SiteCrawler(createMockFetch(responses));
  const auditorFactory = () => auditor;
  return new SiteAuditRunner(crawlerFactory, auditorFactory);
}

describe('SiteAuditRunner', () => {
  it('should crawl and audit discovered pages', async () => {
    const responses: Record<string, MockResponse> = {
      'https://example.com/': {
        status: 200,
        statusText: 'OK',
        body: `
          <html>
            <body>
              <a href="/about">About</a>
              <a href="/contact">Contact</a>
            </body>
          </html>
        `,
      },
      'https://example.com/about': {
        status: 200,
        statusText: 'OK',
        body: '<html><body>About</body></html>',
      },
      'https://example.com/contact': {
        status: 200,
        statusText: 'OK',
        body: '<html><body>Contact</body></html>',
      },
    };

    const auditor = new MockAccessibilityAuditor();
    auditor.setupMockScenario('https://example.com/', 'simple-page');
    auditor.setupMockScenario('https://example.com/about', 'valid-page');
    auditor.setupMockScenario('https://example.com/contact', 'violations-page');

    const runner = createRunner(responses, auditor);
    const result = await runner.run('https://example.com', {
      maxDepth: 1,
      maxPages: 10,
    });

    expect(result.crawl.pages).toEqual([
      'https://example.com/',
      'https://example.com/about',
      'https://example.com/contact',
    ]);
    expect(result.summary.totalPages).toBe(3);
    expect(result.summary.successes).toBe(3);
    expect(result.summary.failures).toBe(0);
    expect(result.summary.totalViolations).toBeGreaterThanOrEqual(0);
  });

  it('should capture audit failures without stopping the run', async () => {
    const responses: Record<string, MockResponse> = {
      'https://example.com/': {
        status: 200,
        statusText: 'OK',
        body: `
          <html>
            <body>
              <a href="/missing">Missing</a>
            </body>
          </html>
        `,
      },
      'https://example.com/missing': {
        status: 200,
        statusText: 'OK',
        body: '<html><body>Missing</body></html>',
      },
    };

    const auditor = new MockAccessibilityAuditor();
    auditor.setupMockScenario('https://example.com/', 'simple-page');
    // Intentionally omit scenario for /missing to trigger failure

    const runner = createRunner(responses, auditor);
    const result = await runner.run('https://example.com');

    expect(result.summary.totalPages).toBe(2);
    expect(result.summary.successes).toBe(1);
    expect(result.summary.failures).toBe(1);
    expect(result.audits).toHaveLength(2);

    const failure = result.audits.find((item) => item.status === 'error');
    expect(failure).toBeDefined();
    expect(failure?.url).toBe('https://example.com/missing');
  });
});

describe('aggregateViolations', () => {
  it('should summarize occurrences per page and totals', () => {
    const audits: PageAuditRecord[] = [
      {
        url: 'https://example.com/',
        status: 'success',
        result: {
          url: 'https://example.com/',
          timestamp: new Date().toISOString(),
          summary: {
            totalViolations: 2,
            criticalViolations: 1,
            seriousViolations: 1,
            moderateViolations: 0,
            minorViolations: 0,
            totalPasses: 10,
            incomplete: 0,
          },
          violations: [
            {
              id: 'color-contrast',
              impact: 'serious',
              description: 'Elements must have sufficient color contrast',
              help: 'Adjust colors to meet contrast requirements',
              helpUrl: 'https://dequeuniversity.com/rules/axe/color-contrast',
              wcagLevel: 'WCAG 2.1 AA',
              nodes: [
                {
                  target: ['.header'],
                  html: '<div class="header">Header</div>',
                  failureSummary: 'Insufficient contrast',
                  impact: 'serious',
                },
                {
                  target: ['.footer'],
                  html: '<div class="footer">Footer</div>',
                  failureSummary: 'Insufficient contrast',
                  impact: 'serious',
                },
              ],
            },
            {
              id: 'image-alt',
              impact: 'moderate',
              description: 'Images must have alternate text',
              help: 'Provide descriptive alt text for meaningful images',
              helpUrl: 'https://dequeuniversity.com/rules/axe/image-alt',
              wcagLevel: 'WCAG 2.1 A',
              nodes: [
                {
                  target: ['img.hero'],
                  html: '<img class="hero">',
                  failureSummary: 'Missing alt attribute',
                  impact: 'moderate',
                },
              ],
            },
          ],
        },
      },
      {
        url: 'https://example.com/about',
        status: 'success',
        result: {
          url: 'https://example.com/about',
          timestamp: new Date().toISOString(),
          summary: {
            totalViolations: 1,
            criticalViolations: 0,
            seriousViolations: 1,
            moderateViolations: 0,
            minorViolations: 0,
            totalPasses: 12,
            incomplete: 0,
          },
          violations: [
            {
              id: 'color-contrast',
              impact: 'serious',
              description: 'Elements must have sufficient color contrast',
              help: 'Adjust colors to meet contrast requirements',
              helpUrl: 'https://dequeuniversity.com/rules/axe/color-contrast',
              wcagLevel: 'WCAG 2.1 AA',
              nodes: [
                {
                  target: ['.cta'],
                  html: '<a class="cta">Call to action</a>',
                  failureSummary: 'Insufficient contrast',
                  impact: 'serious',
                },
              ],
            },
          ],
        },
      },
      {
        url: 'https://example.com/contact',
        status: 'error',
        error: 'Network failure',
      },
    ];

    const overview = aggregateViolations(audits);

    expect(overview).toHaveLength(2);

    const first = overview[0];
    const second = overview[1];

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    if (!first || !second) {
      throw new Error('Expected violation summaries');
    }

    expect(first.id).toBe('color-contrast');
    expect(first.totalOccurrences).toBe(3);
    expect(first.pages).toEqual([
      {
        url: 'https://example.com/',
        occurrences: 2,
      },
      {
        url: 'https://example.com/about',
        occurrences: 1,
      },
    ]);

    expect(second.id).toBe('image-alt');
    expect(second.totalOccurrences).toBe(1);
    expect(second.pages).toEqual([
      {
        url: 'https://example.com/',
        occurrences: 1,
      },
    ]);
  });
});
