import chalk from "chalk";
import {
  getCoverageOverview,
  getCoverageSummary,
} from "../core/axe-coverage.js";
import type {
  AuditResult,
  AuditSummary,
  ManualCheckResult,
  Violation,
} from "../core/types.js";

export interface ConsoleReporterOptions {
  verbose?: boolean;
}

export function report(
  result: AuditResult,
  options: ConsoleReporterOptions = {}
): void {
  console.log(`\n${chalk.bold.blue("🔍 Accessibility Audit Report")}`);
  console.log(chalk.gray("═".repeat(50)));

  // Header
  console.log(chalk.bold(`URL: ${result.url}`));
  console.log(
    chalk.gray(`Timestamp: ${new Date(result.timestamp).toLocaleString()}`)
  );
  console.log("");

  // Summary
  printSummary(result.summary);

  // Violations
  if (result.violations.length > 0) {
    printViolations(result.violations);
  } else {
    console.log(chalk.green.bold("✅ No accessibility violations found!"));
  }

  if (result.manualChecks.length > 0) {
    printManualChecks(result.manualChecks);
  }

  // Coverage info - full report only if verbose
  if (options.verbose) {
    printCoverageReport();
    printLegalNote();
  } else {
    printCoverageSummary();
  }
}

function printSummary(summary: AuditSummary): void {
  console.log(chalk.bold("📊 Summary:"));

  const {
    totalViolations,
    criticalViolations,
    seriousViolations,
    moderateViolations,
    minorViolations,
    totalPasses,
  } = summary;

  if (totalViolations === 0) {
    console.log(chalk.green(`  ✅ ${totalPasses} checks passed`));
  } else {
    console.log(chalk.red(`  ❌ ${totalViolations} violations found`));
    if (criticalViolations > 0)
      console.log(chalk.red(`    🔴 Critical: ${criticalViolations}`));
    if (seriousViolations > 0)
      console.log(chalk.yellow(`    🟡 Serious: ${seriousViolations}`));
    if (moderateViolations > 0)
      console.log(chalk.blue(`    🔵 Moderate: ${moderateViolations}`));
    if (minorViolations > 0)
      console.log(chalk.gray(`    ⚪ Minor: ${minorViolations}`));
  }

  console.log("");
}

function printViolations(violations: Violation[]): void {
  console.log(chalk.bold("🚨 Violations:"));
  console.log("");

  violations.forEach((violation, index) => {
    const impactColor = getImpactColor(violation.impact);
    const impactIcon = getImpactIcon(violation.impact);

    console.log(
      chalk.bold(`${index + 1}. ${impactIcon} ${violation.description}`)
    );
    console.log(
      chalk.gray(`   Impact: ${impactColor(violation.impact.toUpperCase())}`)
    );
    console.log(chalk.gray(`   WCAG Level: ${violation.wcagLevel}`));
    console.log(chalk.blue(`   Help: ${violation.helpUrl}`));

    if (violation.nodes.length > 0) {
      console.log(
        chalk.gray(`   Affected elements: ${violation.nodes.length}`)
      );
      violation.nodes.slice(0, 3).forEach((node, nodeIndex) => {
        console.log(
          chalk.gray(`     ${nodeIndex + 1}. ${node.target.join(" ")}`)
        );
      });
      if (violation.nodes.length > 3) {
        console.log(
          chalk.gray(`     ... and ${violation.nodes.length - 3} more`)
        );
      }
    }

    console.log("");
  });
}

function printManualChecks(checks: ManualCheckResult[]): void {
  console.log(chalk.bold("📝 Manual & Hybrid Checks:"));
  console.log("");

  const groups = new Map<string, ManualCheckResult[]>();

  for (const check of checks) {
    const friendlyCategory = getFriendlyCategoryName(check.category);
    if (!groups.has(friendlyCategory)) {
      groups.set(friendlyCategory, []);
    }
    groups.get(friendlyCategory)?.push(check);
  }

  for (const [category, groupChecks] of groups.entries()) {
    console.log(chalk.cyan.bold(`▶ ${category}`));

    for (const check of groupChecks) {
      const { icon, color } = getManualCheckBadge(check.status);
      console.log(color(`  ${icon} ${check.title}`));
      console.log(
        chalk.gray(
          `     • Automation: ${check.automation.toUpperCase()}${
            check.relatedRuleIds?.length
              ? ` (rules: ${check.relatedRuleIds.join(", ")})`
              : ""
          }`
        )
      );
      console.log(chalk.gray(`     • What to look for: ${check.whatToLookFor[0]}`));
      if (check.notes) {
        console.log(chalk.gray(`     • Notes: ${check.notes}`));
      }
      console.log("");
    }
  }
}

function getFriendlyCategoryName(category: ManualCheckResult["category"]): string {
  switch (category) {
    case "common":
      return "Common Checks";
    case "audiovisual":
      return "Audio / Visual Checks";
    case "forms":
      return "Form Checks";
    default:
      return category;
  }
}

function getManualCheckBadge(status: ManualCheckResult["status"]): {
  icon: string;
  color: (text: string) => string;
} {
  switch (status) {
    case "pass":
      return { icon: "✅", color: chalk.green };
    case "fail":
      return { icon: "❌", color: chalk.red };
    case "manual":
      return { icon: "📝", color: chalk.blue };
    case "needs-review":
      return { icon: "⚠️", color: chalk.yellow };
    default:
      return { icon: "⚠️", color: chalk.yellow };
  }
}

function getImpactColor(impact: string) {
  switch (impact) {
    case "critical":
      return chalk.red;
    case "serious":
      return chalk.yellow;
    case "moderate":
      return chalk.blue;
    case "minor":
      return chalk.gray;
    default:
      return chalk.white;
  }
}

function getImpactIcon(impact: string): string {
  switch (impact) {
    case "critical":
      return "🔴";
    case "serious":
      return "🟡";
    case "moderate":
      return "🔵";
    case "minor":
      return "⚪";
    default:
      return "❓";
  }
}

function printCoverageReport(): void {
  console.log(chalk.blue.bold("🔍 Coverage & Confidence Report:"));
  console.log("");

  const overview = getCoverageOverview();
  const lines = overview.split("\n");

  for (const line of lines) {
    if (!line) continue;
    if (line.includes("🔍")) {
      console.log(chalk.blue.bold(line));
    } else if (line.startsWith("═")) {
      console.log(chalk.gray(line));
    } else if (line.includes("🛠️")) {
      console.log(chalk.gray(line));
    } else if (line.includes("✅")) {
      console.log(chalk.green(line));
    } else if (line.includes("�") || line.includes("🎯")) {
      console.log(chalk.cyan(line));
    } else if (line.includes("💡")) {
      console.log(chalk.yellow(line));
    } else {
      console.log(line);
    }
  }

  console.log("");
  console.log(
    chalk.gray(
      "Detailed verification catalog: run `a11y-audit coverage --details`."
    )
  );
  console.log(
    chalk.gray("Need machine-readable data? Try `a11y-audit coverage --json`.")
  );
  console.log("");
}

function printCoverageSummary(): void {
  console.log("");
  const summary = getCoverageSummary();
  const lines = summary.split("\n");

  for (const line of lines) {
    if (line.includes("📊")) {
      console.log(chalk.blue.bold(line));
    } else if (line.includes("🛠️")) {
      console.log(chalk.gray(line));
    } else if (line.includes("✅")) {
      console.log(chalk.green(line));
    } else if (line.includes("📈") || line.includes("🎯")) {
      console.log(chalk.cyan(line));
    } else if (line.includes("💡")) {
      console.log(chalk.yellow(line));
    } else {
      console.log(line);
    }
  }
  console.log("");
  console.log(
    chalk.gray("Use --verbose for the legal context and coverage snapshot.")
  );
  console.log(
    chalk.gray(
      "Need the full verified check list? a11y-audit coverage --details"
    )
  );
  console.log("");
}

function printLegalNote(): void {
  console.log(chalk.yellow.bold("⚖️  Legal Compliance Note:"));
  console.log(
    chalk.yellow(
      "   This automated scan catches ~30-50% of accessibility issues."
    )
  );
  console.log(chalk.yellow("   For full ADA compliance protection, consider:"));
  console.log(chalk.yellow("   • Professional accessibility audit"));
  console.log(chalk.yellow("   • Manual testing with screen readers"));
  console.log(chalk.yellow("   • User testing with people with disabilities"));
  console.log(chalk.yellow("   • Legal consultation for your jurisdiction"));
  console.log("");
}
