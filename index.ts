#!/usr/bin/env bun

import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import { AccessibilityAuditor } from "./src/core/auditor.js";
import {
  clearHistory,
  generateReport,
  saveAuditResult,
} from "./src/core/history.js";
import { report as consoleReport } from "./src/reporters/console.js";
import { report as jsonReport, saveToFile } from "./src/reporters/json.js";

const program = new Command();

program
  .name("a11y-audit")
  .description("A lightweight accessibility testing tool")
  .version("1.0.0");

program
  .command("audit")
  .description("Audit a website for accessibility issues")
  .argument("<url>", "URL to audit")
  .option("-o, --output <format>", "Output format (console, json)", "console")
  .option("-f, --file <filename>", "Save results to file")
  .option("-t, --timeout <ms>", "Timeout in milliseconds", "30000")
  .option("-v, --verbose", "Show detailed coverage report")
  .action(async (url: string, options) => {
    const spinner = ora("Initializing accessibility audit...").start();

    try {
      const auditor = new AccessibilityAuditor();

      spinner.text = "Loading page and running accessibility tests...";
      const result = await auditor.audit(url, {
        timeout: Number.parseInt(options.timeout),
      });

      spinner.succeed("Audit completed!");

      // Output results
      if (options.output === "json") {
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
      spinner.fail("Audit failed");
      console.error(
        chalk.red("Error:"),
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });

program
  .command("quick")
  .description("Quick audit with minimal output")
  .argument("<url>", "URL to audit")
  .action(async (url: string) => {
    const spinner = ora("Running quick accessibility check...").start();

    try {
      const auditor = new AccessibilityAuditor();
      const result = await auditor.audit(url);

      if (result.summary.totalViolations === 0) {
        spinner.succeed(chalk.green(`✅ ${url} - No violations found`));
      } else {
        spinner.warn(
          chalk.yellow(
            `⚠️  ${url} - ${result.summary.totalViolations} violations found`
          )
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
      spinner.fail("Quick check failed");
      console.error(
        chalk.red("Error:"),
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });

program
  .command("history")
  .description("View audit history and statistics")
  .option("-l, --limit <number>", "Limit number of entries to show", "10")
  .option("-c, --clear", "Clear audit history")
  .action(async (options) => {
    try {
      if (options.clear) {
        await clearHistory();
        console.log(chalk.green("✅ Audit history cleared"));
        return;
      }

      const report = await generateReport();
      console.log(report);
    } catch (error) {
      console.error(
        chalk.red("Error:"),
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error(
    chalk.red("Unhandled Rejection at:"),
    promise,
    chalk.red("reason:"),
    reason
  );
  process.exit(1);
});

program.parse();
