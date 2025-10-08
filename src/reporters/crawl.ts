import chalk from "chalk";
import type { PageAuditRecord, SiteAuditResult } from "../core/site-audit.js";
import { report as reportSingle } from "./console.js";

type CrawlConsoleOptions = {
  verbose?: boolean;
};

function formatSuccess(
  record: Extract<PageAuditRecord, { status: "success" }>
): string {
  const { summary } = record.result;
  const icon =
    summary.totalViolations === 0 ? chalk.green("✅") : chalk.yellow("⚠️");
  const detail =
    summary.totalViolations === 0
      ? chalk.green("No violations detected")
      : chalk.yellow(
          `${summary.totalViolations} violation${
            summary.totalViolations === 1 ? "" : "s"
          }`
        );

  return `${icon} ${chalk.bold(record.url)} — ${detail}`;
}

function formatFailure(
  record: Extract<PageAuditRecord, { status: "error" }>
): string {
  return `${chalk.red("❌")} ${chalk.bold(record.url)} — ${chalk.red(
    record.error
  )}`;
}

export function reportCrawlConsole(
  result: SiteAuditResult,
  options: CrawlConsoleOptions = {}
): void {
  const { verbose = false } = options;

  console.log("");
  console.log(chalk.cyan.bold(`Crawl summary for ${result.startUrl}`));
  console.log(
    `Pages discovered: ${result.summary.totalPages} (skipped: ${result.crawl.skipped}, crawl errors: ${result.crawl.errors.length})`
  );
  console.log(
    `Audits run: ${result.summary.totalPages} (success: ${result.summary.successes}, failed: ${result.summary.failures})`
  );
  console.log(`Total violations found: ${result.summary.totalViolations}`);

  if (result.crawl.errors.length > 0) {
    console.log("");
    console.log(chalk.yellow.bold("Crawl errors:"));
    for (const error of result.crawl.errors) {
      console.log(` • ${chalk.bold(error.url)} — ${error.error}`);
    }
  }

  console.log("");
  console.log(chalk.cyan.bold("Per-page results"));

  for (const record of result.audits) {
    if (record.status === "success") {
      console.log(formatSuccess(record));
      if (verbose) {
        reportSingle(record.result, { verbose: true });
      }
    } else {
      console.log(formatFailure(record));
    }
  }
}
