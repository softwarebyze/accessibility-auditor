import { AccessibilityAuditor, type AuditOptions } from './auditor.js';
import { type CrawlOptions, type CrawlResult, SiteCrawler } from './crawler.js';
import type { AuditResult, Violation } from './types.js';

export interface SiteAuditOptions extends Partial<CrawlOptions> {
  timeout?: AuditOptions['timeout'];
}

export type AuditorLike = {
  audit: (url: string, options?: AuditOptions) => Promise<AuditResult>;
  close: () => Promise<void>;
};

export type AuditorFactory = () => AuditorLike | Promise<AuditorLike>;

export interface PageAuditSuccess {
  url: string;
  status: 'success';
  result: AuditResult;
}

export interface PageAuditFailure {
  url: string;
  status: 'error';
  error: string;
}

export type PageAuditRecord = PageAuditSuccess | PageAuditFailure;

export interface SiteAuditSummary {
  totalPages: number;
  successes: number;
  failures: number;
  totalViolations: number;
}

export interface SiteAuditResult {
  startUrl: string;
  crawl: CrawlResult;
  audits: PageAuditRecord[];
  summary: SiteAuditSummary;
}

export interface ViolationPageBreakdown {
  url: string;
  occurrences: number;
}

export interface ViolationOverviewEntry {
  id: string;
  description: string;
  impact: Violation['impact'];
  helpUrl: string;
  wcagLevel: Violation['wcagLevel'];
  totalOccurrences: number;
  pages: ViolationPageBreakdown[];
}

export function aggregateViolations(audits: PageAuditRecord[]): ViolationOverviewEntry[] {
  const map = new Map<
    string,
    {
      meta: Omit<ViolationOverviewEntry, 'totalOccurrences' | 'pages'>;
      totalOccurrences: number;
      perPage: Map<string, number>;
    }
  >();

  for (const record of audits) {
    if (record.status !== 'success') continue;

    for (const violation of record.result.violations) {
      const occurrences = Math.max(violation.nodes.length, 1);

      let entry = map.get(violation.id);
      if (!entry) {
        entry = {
          meta: {
            id: violation.id,
            description: violation.description,
            impact: violation.impact,
            helpUrl: violation.helpUrl,
            wcagLevel: violation.wcagLevel,
          },
          totalOccurrences: 0,
          perPage: new Map<string, number>(),
        };
        map.set(violation.id, entry);
      }

      entry.totalOccurrences += occurrences;
      entry.perPage.set(record.url, (entry.perPage.get(record.url) ?? 0) + occurrences);
    }
  }

  const overview: ViolationOverviewEntry[] = [];

  for (const entry of map.values()) {
    const pages: ViolationPageBreakdown[] = Array.from(entry.perPage.entries())
      .map(([url, occurrences]) => ({ url, occurrences }))
      .sort((a, b) => b.occurrences - a.occurrences || a.url.localeCompare(b.url));

    overview.push({
      ...entry.meta,
      totalOccurrences: entry.totalOccurrences,
      pages,
    });
  }

  overview.sort((a, b) => {
    if (b.totalOccurrences !== a.totalOccurrences) {
      return b.totalOccurrences - a.totalOccurrences;
    }
    if (b.pages.length !== a.pages.length) {
      return b.pages.length - a.pages.length;
    }
    return a.id.localeCompare(b.id);
  });

  return overview;
}

const defaultAuditorFactory: AuditorFactory = () => new AccessibilityAuditor();

const defaultCrawlerFactory = () => new SiteCrawler();

export class SiteAuditRunner {
  constructor(
    private readonly createCrawler: () => SiteCrawler = defaultCrawlerFactory,
    private readonly createAuditor: AuditorFactory = defaultAuditorFactory
  ) {}

  async run(startUrl: string, options: SiteAuditOptions = {}): Promise<SiteAuditResult> {
    const crawler = this.createCrawler();
    const crawlOverrides: Partial<CrawlOptions> = {};

    if (typeof options.maxPages === 'number') {
      crawlOverrides.maxPages = options.maxPages;
    }
    if (typeof options.maxDepth === 'number') {
      crawlOverrides.maxDepth = options.maxDepth;
    }
    if (typeof options.delayMs === 'number') {
      crawlOverrides.delayMs = options.delayMs;
    }
    if (typeof options.sameOrigin === 'boolean') {
      crawlOverrides.sameOrigin = options.sameOrigin;
    }

    const crawlResult = await crawler.crawl(startUrl, crawlOverrides);
    const auditor = await this.createAuditor();

    const audits: PageAuditRecord[] = [];
    let totalViolations = 0;
    let successes = 0;
    let failures = 0;

    try {
      for (const page of crawlResult.pages) {
        try {
          const auditResult = await auditor.audit(page, {
            timeout: options.timeout,
          });

          audits.push({
            url: page,
            status: 'success',
            result: auditResult,
          });
          totalViolations += auditResult.summary.totalViolations;
          successes++;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);

          audits.push({
            url: page,
            status: 'error',
            error: message,
          });
          failures++;
        }
      }
    } finally {
      await auditor.close();
    }

    const summary: SiteAuditSummary = {
      totalPages: crawlResult.pages.length,
      successes,
      failures,
      totalViolations,
    };

    let normalizedStart = crawlResult.pages.at(0);
    if (!normalizedStart) {
      try {
        normalizedStart = new URL(startUrl).href;
      } catch {
        normalizedStart = startUrl;
      }
    }

    return {
      startUrl: normalizedStart,
      crawl: crawlResult,
      audits,
      summary,
    };
  }
}
