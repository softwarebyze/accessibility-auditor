import type { SiteAuditResult } from '../core/site-audit.js';
import type { AuditResult } from '../core/types.js';

export function report(result: AuditResult): string {
  return JSON.stringify(result, null, 2);
}

export async function saveToFile(result: AuditResult, filename: string): Promise<void> {
  await Bun.write(filename, report(result));
}

export function reportCrawl(result: SiteAuditResult): string {
  return JSON.stringify(result, null, 2);
}

export async function saveCrawlToFile(result: SiteAuditResult, filename: string): Promise<void> {
  await Bun.write(filename, reportCrawl(result));
}
