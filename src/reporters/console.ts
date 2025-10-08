import chalk from "chalk";
import { AuditResult, Violation } from "../core/types.js";

export class ConsoleReporter {
  static report(result: AuditResult): void {
    console.log("\n" + chalk.bold.blue("🔍 Accessibility Audit Report"));
    console.log(chalk.gray("═".repeat(50)));

    // Header
    console.log(chalk.bold(`URL: ${result.url}`));
    console.log(
      chalk.gray(`Timestamp: ${new Date(result.timestamp).toLocaleString()}`)
    );
    console.log("");

    // Summary
    this.printSummary(result.summary);

    // Violations
    if (result.violations.length > 0) {
      this.printViolations(result.violations);
    } else {
      console.log(chalk.green.bold("✅ No accessibility violations found!"));
    }

    // Legal compliance note
    this.printLegalNote();
  }

  private static printSummary(summary: any): void {
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

    console.log(chalk.green(`  ✅ ${totalPasses} checks passed`));
    console.log("");
  }

  private static printViolations(violations: Violation[]): void {
    console.log(chalk.bold("🚨 Violations:"));
    console.log("");

    violations.forEach((violation, index) => {
      const impactColor = this.getImpactColor(violation.impact);
      const impactIcon = this.getImpactIcon(violation.impact);

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

  private static getImpactColor(impact: string) {
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

  private static getImpactIcon(impact: string): string {
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

  private static printLegalNote(): void {
    console.log(chalk.yellow.bold("⚖️  Legal Compliance Note:"));
    console.log(
      chalk.yellow(
        "   This automated scan catches ~30-50% of accessibility issues."
      )
    );
    console.log(
      chalk.yellow("   For full ADA compliance protection, consider:")
    );
    console.log(chalk.yellow("   • Professional accessibility audit"));
    console.log(chalk.yellow("   • Manual testing with screen readers"));
    console.log(
      chalk.yellow("   • User testing with people with disabilities")
    );
    console.log(chalk.yellow("   • Legal consultation for your jurisdiction"));
    console.log("");
  }
}
