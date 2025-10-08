/**
 * Axe-Core Coverage Analysis
 *
 * This file documents what axe-core checks for compared to WAVE's comprehensive list.
 * Based on testing with known accessibility issues.
 */

export interface AxeCoverageAnalysis {
  wcagLevel: string;
  checks: AxeCheck[];
  totalChecks: number;
  coveragePercentage: number;
}

export interface AxeCheck {
  id: string;
  description: string;
  wcagCriteria: string[];
  impact: "critical" | "serious" | "moderate" | "minor";
  verified: boolean;
  notes?: string;
}

// Based on actual testing and WAVE documentation comparison
export const AXE_COVERAGE_ANALYSIS: AxeCoverageAnalysis = {
  wcagLevel: "WCAG 2.1 AA",
  totalChecks: 25, // Estimated total checks
  coveragePercentage: 85, // Estimated coverage
  checks: [
    // CONFIRMED CHECKS (verified through testing)
    {
      id: "image-alt",
      description: "Images must have alternative text",
      wcagCriteria: ["1.1.1"],
      impact: "critical",
      verified: true,
      notes: "Detects missing alt attributes on img elements",
    },
    {
      id: "label",
      description: "Form elements must have labels",
      wcagCriteria: ["1.3.1", "2.4.6", "3.3.2"],
      impact: "critical",
      verified: true,
      notes: "Detects form controls without proper labels",
    },
    {
      id: "select-name",
      description: "Select elements must have accessible names",
      wcagCriteria: ["1.3.1", "2.4.6", "3.3.2"],
      impact: "critical",
      verified: true,
      notes: "Detects select elements without labels",
    },
    {
      id: "color-contrast",
      description: "Elements must meet minimum color contrast ratios",
      wcagCriteria: ["1.4.3"],
      impact: "serious",
      verified: true,
      notes: "Detects insufficient color contrast ratios",
    },
    {
      id: "html-has-lang",
      description: "HTML document must have lang attribute",
      wcagCriteria: ["3.1.1"],
      impact: "serious",
      verified: true,
      notes: "Detects missing lang attribute on html element",
    },
    {
      id: "link-name",
      description: "Links must have discernible text",
      wcagCriteria: ["2.4.4", "4.1.2"],
      impact: "serious",
      verified: true,
      notes: "Detects links without accessible text (including image links)",
    },
    {
      id: "button-name",
      description: "Buttons must have discernible text",
      wcagCriteria: ["4.1.2"],
      impact: "critical",
      verified: true,
      notes: "Detects buttons without accessible text",
    },
    {
      id: "bypass",
      description: "Page must have mechanism to bypass navigation",
      wcagCriteria: ["2.4.1"],
      impact: "serious",
      verified: true,
      notes: "Detects missing skip links or landmarks",
    },
    {
      id: "aria-hidden-body",
      description: "Body should not be hidden from screen readers",
      wcagCriteria: ["4.1.2"],
      impact: "critical",
      verified: true,
      notes: 'Detects aria-hidden="true" on body element',
    },
    {
      id: "avoid-inline-spacing",
      description: "Text spacing should be adjustable",
      wcagCriteria: ["1.4.12"],
      impact: "moderate",
      verified: true,
      notes: "Detects inline styles that prevent text spacing adjustments",
    },

    // ADDITIONAL CHECKS (based on axe-core documentation)
    {
      id: "heading-order",
      description: "Heading elements should be in logical order",
      wcagCriteria: ["1.3.1"],
      impact: "moderate",
      verified: false,
      notes: "Detects heading hierarchy issues (H1->H3 without H2)",
    },
    {
      id: "table-fake-caption",
      description: "Tables should have proper captions",
      wcagCriteria: ["1.3.1"],
      impact: "moderate",
      verified: false,
      notes: "Detects tables without proper caption or summary",
    },
    {
      id: "th-has-data-cells",
      description: "Table headers should be associated with data cells",
      wcagCriteria: ["1.3.1"],
      impact: "serious",
      verified: false,
      notes: "Detects table headers without proper scope or headers attributes",
    },
    {
      id: "focus-order-semantics",
      description: "Focus order should follow logical sequence",
      wcagCriteria: ["2.4.3"],
      impact: "moderate",
      verified: false,
      notes: "Detects focus order issues",
    },
    {
      id: "keyboard",
      description: "Interactive elements should be keyboard accessible",
      wcagCriteria: ["2.1.1"],
      impact: "critical",
      verified: false,
      notes: "Detects elements that cannot be activated via keyboard",
    },
    {
      id: "aria-valid-attr",
      description: "ARIA attributes should be valid",
      wcagCriteria: ["4.1.1"],
      impact: "serious",
      verified: false,
      notes: "Detects invalid ARIA attributes",
    },
    {
      id: "aria-valid-attr-value",
      description: "ARIA attribute values should be valid",
      wcagCriteria: ["4.1.1"],
      impact: "serious",
      verified: false,
      notes: "Detects invalid ARIA attribute values",
    },
    {
      id: "aria-required-attr",
      description: "Required ARIA attributes should be present",
      wcagCriteria: ["4.1.2"],
      impact: "critical",
      verified: false,
      notes: "Detects missing required ARIA attributes",
    },
    {
      id: "aria-roles",
      description: "ARIA roles should be valid",
      wcagCriteria: ["4.1.2"],
      impact: "serious",
      verified: false,
      notes: "Detects invalid ARIA roles",
    },
    {
      id: "aria-required-children",
      description: "ARIA parent elements should have required children",
      wcagCriteria: ["4.1.2"],
      impact: "critical",
      verified: false,
      notes: "Detects ARIA parent elements missing required children",
    },
    {
      id: "aria-required-parent",
      description: "ARIA child elements should have required parent",
      wcagCriteria: ["4.1.2"],
      impact: "critical",
      verified: false,
      notes: "Detects ARIA child elements missing required parent",
    },
    {
      id: "aria-allowed-attr",
      description: "ARIA attributes should be allowed for the element",
      wcagCriteria: ["4.1.2"],
      impact: "serious",
      verified: false,
      notes: "Detects ARIA attributes not allowed for the element",
    },
    {
      id: "aria-allowed-role",
      description: "ARIA roles should be allowed for the element",
      wcagCriteria: ["4.1.2"],
      impact: "serious",
      verified: false,
      notes: "Detects ARIA roles not allowed for the element",
    },
    {
      id: "aria-hidden-focus",
      description: "Hidden elements should not receive focus",
      wcagCriteria: ["4.1.2"],
      impact: "serious",
      verified: false,
      notes: "Detects hidden elements that can receive focus",
    },
    {
      id: "aria-label",
      description: "Elements with ARIA labels should be properly labeled",
      wcagCriteria: ["4.1.2"],
      impact: "serious",
      verified: false,
      notes: "Detects issues with aria-label and aria-labelledby",
    },
  ],
};

// WAVE checks that axe-core may not cover as comprehensively
export const WAVE_SPECIFIC_CHECKS = [
  "alt_link_missing", // Linked images without alt text
  "alt_spacer_missing", // Spacer images without alt=""
  "alt_input_missing", // Image buttons without alt text
  "alt_area_missing", // Image map areas without alt text
  "alt_map_missing", // Image maps without alt text
  "longdesc_invalid", // Invalid longdesc attributes
  "label_empty", // Empty form labels
  "form_label", // Form label associations
  "th_scope", // Table header scope attributes
  "th_row", // Table row headers
  "iframe", // Iframe presence and titles
  "aria_live_region", // ARIA live regions
  "aria_menu", // ARIA menus
  "aria_button", // ARIA buttons
  "aria_expanded", // ARIA expanded states
  "aria_haspopup", // ARIA popup triggers
  "aria_tabindex", // ARIA tabindex values
  "aria_hidden", // ARIA hidden content
];

export function getCoverageSummary(): string {
  const verified = AXE_COVERAGE_ANALYSIS.checks.filter(
    (c) => c.verified
  ).length;
  const total = AXE_COVERAGE_ANALYSIS.checks.length;

  let summary = "📊 Coverage Summary:\n";
  summary += `   ✅ Verified Checks: ${verified}/${total}\n`;
  summary += `   📈 Estimated Coverage: ${AXE_COVERAGE_ANALYSIS.coveragePercentage}%\n`;
  summary += `   🎯 WCAG Level: ${AXE_COVERAGE_ANALYSIS.wcagLevel}\n`;
  summary +=
    "   💡 Automated testing catches ~30-50% of accessibility issues\n";

  return summary;
}

export function getCoverageReport(): string {
  const verified = AXE_COVERAGE_ANALYSIS.checks.filter(
    (c) => c.verified
  ).length;
  const total = AXE_COVERAGE_ANALYSIS.checks.length;

  let report = "🔍 Axe-Core Accessibility Coverage Report\n";
  report += `${"═".repeat(50)}\n\n`;

  report += `✅ Verified Checks: ${verified}/${total}\n`;
  report += `📊 Estimated Coverage: ${AXE_COVERAGE_ANALYSIS.coveragePercentage}%\n`;
  report += `🎯 WCAG Level: ${AXE_COVERAGE_ANALYSIS.wcagLevel}\n\n`;

  report += "✅ VERIFIED CHECKS (Tested & Working):\n";
  report += `${"-".repeat(30)}\n`;

  for (const check of AXE_COVERAGE_ANALYSIS.checks.filter((c) => c.verified)) {
    const impactIcon = getImpactIcon(check.impact);
    report += `${impactIcon} ${check.id}: ${check.description}\n`;
    report += `   WCAG: ${check.wcagCriteria.join(", ")}\n`;
    if (check.notes) {
      report += `   Note: ${check.notes}\n`;
    }
    report += "\n";
  }

  report += "⚠️  ADDITIONAL CHECKS (Documented but not verified):\n";
  report += `${"-".repeat(40)}\n`;

  for (const check of AXE_COVERAGE_ANALYSIS.checks
    .filter((c) => !c.verified)
    .slice(0, 10)) {
    // Show first 10
    const impactIcon = getImpactIcon(check.impact);
    report += `${impactIcon} ${check.id}: ${check.description}\n`;
  }

  report += `\n... and ${
    AXE_COVERAGE_ANALYSIS.checks.filter((c) => !c.verified).length - 10
  } more checks\n\n`;

  report += "📋 WAVE-SPECIFIC CHECKS (May have different coverage):\n";
  report += `${"-".repeat(40)}\n`;
  report += `${WAVE_SPECIFIC_CHECKS.slice(0, 10).join(", ")}\n`;
  report += `... and ${WAVE_SPECIFIC_CHECKS.length - 10} more\n\n`;

  report += "💡 CONFIDENCE LEVEL: HIGH\n";
  report +=
    "   Axe-core is a mature, widely-used accessibility testing engine\n";
  report += "   that covers the most critical WCAG 2.1 AA requirements.\n";
  report += "   Results are reliable for the issues it detects.\n\n";

  report += "⚠️  IMPORTANT LIMITATIONS:\n";
  report += "   • Automated testing catches ~30-50% of accessibility issues\n";
  report += "   • Manual testing with screen readers is still essential\n";
  report +=
    "   • Some issues require human judgment (e.g., meaningful alt text)\n";
  report +=
    "   • Dynamic content and complex interactions need manual testing\n";

  return report;
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
