import { AccessibilityAuditor, type AuditOptions } from "./auditor.js";
import { type CrawlOptions, type CrawlResult, SiteCrawler } from "./crawler.js";
import type { AuditResult } from "./types.js";

export interface SiteAuditOptions extends Partial<CrawlOptions> {
  timeout?: AuditOptions["timeout"];
}

export type AuditorLike = {
  audit: (url: string, options?: AuditOptions) => Promise<AuditResult>;
  close: () => Promise<void>;
};

export type AuditorFactory = () => AuditorLike | Promise<AuditorLike>;

export interface PageAuditSuccess {
  url: string;
  status: "success";
  result: AuditResult;
}

export interface PageAuditFailure {
  url: string;
  status: "error";
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

const defaultAuditorFactory: AuditorFactory = () => new AccessibilityAuditor();

const defaultCrawlerFactory = () => new SiteCrawler();

export class SiteAuditRunner {
  constructor(
    private readonly createCrawler: () => SiteCrawler = defaultCrawlerFactory,
    private readonly createAuditor: AuditorFactory = defaultAuditorFactory
  ) {}

  async run(
    startUrl: string,
    options: SiteAuditOptions = {}
  ): Promise<SiteAuditResult> {
    const crawler = this.createCrawler();
    const crawlOverrides: Partial<CrawlOptions> = {};

    if (typeof options.maxPages === "number") {
      crawlOverrides.maxPages = options.maxPages;
    }
    if (typeof options.maxDepth === "number") {
      crawlOverrides.maxDepth = options.maxDepth;
    }
    if (typeof options.delayMs === "number") {
      crawlOverrides.delayMs = options.delayMs;
    }
    if (typeof options.sameOrigin === "boolean") {
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
            status: "success",
            result: auditResult,
          });
          totalViolations += auditResult.summary.totalViolations;
          successes++;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);

          audits.push({
            url: page,
            status: "error",
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
