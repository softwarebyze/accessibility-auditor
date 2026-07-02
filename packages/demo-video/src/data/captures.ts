/** Real CLI output from reach-a11y (regenerate: scripts/capture-output.sh). */

export const quickCommand = "reach quick https://example.com";
export const quickLines = ["✔ ✅ https://example.com - No violations found"];

export const auditCommand =
  "reach audit http://localhost:8765/violations-page.html";
export const auditLines = [
  "🔍 Reach — Accessibility Audit Report",
  "══════════════════════════════════════════════════",
  "URL: http://localhost:8765/violations-page.html",
  "",
  "📊 Summary:",
  "  ❌ 6 violations found",
  "    🔴 Critical: 3",
  "    🟡 Serious: 3",
  "",
  "🚨 Violations:",
  "",
  "1. 🔴 Ensure buttons have discernible text",
  "   Impact: CRITICAL · WCAG 2.0 A",
  "",
  "2. 🔴 Ensure all ARIA attributes have valid values",
  "   Impact: CRITICAL · WCAG 2.0 A",
  "",
  "3. 🟡 Ensure every HTML document has a lang attribute",
  "   Impact: SERIOUS · WCAG 2.0 A",
  "",
  "4. 🟡 Ensure the contrast between foreground and background",
  "   colors meets WCAG 2 AA minimum contrast ratio thresholds",
  "   Impact: SERIOUS · WCAG 2.0 AA",
];

export const crawlCommand = "reach crawl http://localhost:8765/ --max-pages 2";
export const crawlLines = [
  "✔ Audited 2 pages",
  "",
  "Crawl summary for http://localhost:8765/",
  "Pages discovered: 2 · Audits run: 2 (success: 2)",
  "Total violations found: 1",
  "",
  "Violation overview",
  "🟡 html-has-lang — 1 occurrence across 1 page",
  "   Ensure every HTML document has a lang attribute",
  "",
  "Per-page results",
  "✅ http://localhost:8765/ — No violations detected",
  "⚠️ http://localhost:8765/simple-page.html — 1 violation",
];

export const historyCommand = "reach history";
export const historyLines = [
  "📊 Reach — Audit History Report",
  "══════════════════════════════════════════════════",
  "",
  "Total Audits: 4",
  "Total Violations: 7",
  "Average Violations per Audit: 1.8",
  "",
  "Recent Audits:",
  "1. ✅ https://example.com — 0 violations",
  "2. ⚠️ …/violations-page.html — 6 violations",
  "3. ✅ …/ — 0 violations",
  "4. ⚠️ …/simple-page.html — 1 violation",
];

export const features = [
  { label: "Quick", desc: "Fast pass/fail" },
  { label: "Audit", desc: "Full WCAG report" },
  { label: "Crawl", desc: "Whole-site checks" },
  { label: "History", desc: "Track progress" },
  { label: "JSON", desc: "CI & reports" },
  { label: "MCP", desc: "AI assistants" },
];
