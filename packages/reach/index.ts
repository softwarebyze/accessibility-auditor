#!/usr/bin/env node

import { execSync, spawnSync } from 'node:child_process';
import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';
import { AccessibilityAuditor } from './src/core/auditor.js';
import { clearHistory, generateReport, saveAuditResult } from './src/core/history.js';
import { SiteAuditRunner } from './src/core/site-audit.js';
import { report as consoleReport } from './src/reporters/console.js';
import { reportCrawlConsole } from './src/reporters/crawl.js';
import {
  report as jsonReport,
  reportCrawl as jsonReportCrawl,
  saveCrawlToFile,
  saveToFile,
} from './src/reporters/json.js';

const program = new Command();

program
  .name('reach')
  .description('Check your site for accessibility—quick checks, full reports, simple history')
  .version('1.0.0');

program
  .command('audit')
  .description('Audit a website for accessibility issues')
  .argument('<url>', 'URL to audit')
  .option('-o, --output <format>', 'Output format (console, json)', 'console')
  .option('-f, --file <filename>', 'Save results to file')
  .option('-t, --timeout <ms>', 'Timeout in milliseconds', '30000')
  .option('-v, --verbose', 'Show detailed coverage report')
  .action(async (url: string, options) => {
    const spinner = ora('Initializing accessibility audit...').start();

    try {
      const auditor = new AccessibilityAuditor();

      spinner.text = 'Loading page and running accessibility tests...';
      const result = await auditor.audit(url, {
        timeout: Number.parseInt(options.timeout),
      });

      spinner.succeed('Audit completed!');

      // Output results
      if (options.output === 'json') {
        const jsonOutput = jsonReport(result);
        if (options.file) {
          await saveToFile(result, options.file);
          console.log(chalk.green(`Results saved to ${options.file}`));
        } else {
          console.log(jsonOutput);
        }
      } else {
        consoleReport(result, { verbose: options.verbose });
      }

      // Save to history
      await saveAuditResult(result);

      await auditor.close();
    } catch (error) {
      spinner.fail('Audit failed');
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('quick')
  .description('Quick audit with minimal output')
  .argument('<url>', 'URL to audit')
  .action(async (url: string) => {
    const spinner = ora('Running quick accessibility check...').start();

    try {
      const auditor = new AccessibilityAuditor();
      const result = await auditor.audit(url);

      if (result.summary.totalViolations === 0) {
        spinner.succeed(chalk.green(`✅ ${url} - No violations found`));
      } else {
        spinner.warn(
          chalk.yellow(`⚠️  ${url} - ${result.summary.totalViolations} violations found`)
        );
        console.log(
          chalk.gray(
            `   Critical: ${result.summary.criticalViolations}, Serious: ${result.summary.seriousViolations}`
          )
        );
      }

      // Save to history
      await saveAuditResult(result);

      await auditor.close();
    } catch (error) {
      spinner.fail('Quick check failed');
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('crawl')
  .description('Crawl a site and audit each discovered page')
  .argument('<url>', 'Starting URL to crawl')
  .option('--max-pages <number>', 'Maximum number of pages to audit', '20')
  .option('--max-depth <number>', 'Maximum crawl depth', '2')
  .option('--delay <ms>', 'Delay between crawl requests in milliseconds', '0')
  .option('--allow-external', 'Follow links to other domains', false)
  .option('-t, --timeout <ms>', 'Per-page audit timeout', '30000')
  .option('-o, --output <format>', 'Output format (console, json)', 'console')
  .option('-f, --file <filename>', 'Save results to file')
  .option('-v, --verbose', 'Show detailed per-page reports')
  .action(async (url: string, options) => {
    const spinner = ora('Crawling site and running accessibility audits...').start();

    try {
      const runner = new SiteAuditRunner();
      const maxPages = parseIntegerOption(options.maxPages, '--max-pages', 20);
      const maxDepth = parseIntegerOption(options.maxDepth, '--max-depth', 2);
      const delayMs = parseIntegerOption(options.delay, '--delay', 0);
      const timeout = parseIntegerOption(options.timeout, '--timeout', 30000);
      const sameOrigin = !options.allowExternal;

      const result = await runner.run(url, {
        maxPages,
        maxDepth,
        delayMs,
        sameOrigin,
        timeout,
      });

      spinner.succeed(
        `Audited ${result.summary.totalPages} page${result.summary.totalPages === 1 ? '' : 's'}`
      );

      if (options.output === 'json') {
        const output = jsonReportCrawl(result);
        if (options.file) {
          await saveCrawlToFile(result, options.file);
          console.log(chalk.green(`Results saved to ${options.file}`));
        } else {
          console.log(output);
        }
      } else {
        reportCrawlConsole(result, { verbose: options.verbose });
      }

      for (const record of result.audits) {
        if (record.status === 'success') {
          await saveAuditResult(record.result);
        }
      }
    } catch (error) {
      spinner.fail('Crawl audit failed');
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('install-browsers')
  .description('Install Playwright browsers (one-time setup)')
  .action(async () => {
    execSync(resolvePlaywrightInstallCommand(), { stdio: 'inherit', shell: true });
  });

program
  .command('history')
  .description('View audit history and statistics')
  .option('-l, --limit <number>', 'Limit number of entries to show', '10')
  .option('-c, --clear', 'Clear audit history')
  .action(async (options) => {
    try {
      if (options.clear) {
        await clearHistory();
        console.log(chalk.green('✅ Audit history cleared'));
        return;
      }

      const report = await generateReport();
      console.log(report);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

function parseIntegerOption(value: unknown, name: string, defaultValue: number): number {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid value for ${name}: ${value}`);
  }

  return parsed;
}

function resolvePlaywrightInstallCommand(): string {
  if (process.versions.bun) {
    return 'bunx playwright install';
  }

  if (commandExists('npx')) {
    return 'npx playwright install';
  }

  if (commandExists('npm')) {
    return 'npm exec playwright install';
  }

  return 'playwright install';
}

function commandExists(command: string): boolean {
  const result = spawnSync(command, ['--version'], {
    stdio: 'ignore',
  });
  return !result.error && result.status === 0;
}

program.parse();
