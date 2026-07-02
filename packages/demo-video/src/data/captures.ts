/** Real CLI output captured from reach-a11y (see scripts/capture-output.sh). */

export const quickCommand = 'reach quick https://example.com';
export const quickLines = [
  '✔ ✅ https://example.com - No violations found',
];

export const auditCommand = 'reach audit https://yoursite.com/page';
export const auditLines = [
  '🔍 Reach — Accessibility Audit Report',
  '══════════════════════════════════════════════════',
  '',
  '📊 Summary:',
  '  ❌ 6 violations found',
  '    🔴 Critical: 3',
  '    🟡 Serious: 3',
  '',
  '🚨 Violations:',
  '',
  '1. 🔴 Ensure buttons have discernible text',
  '   Impact: CRITICAL · WCAG 2.0 A',
  '',
  '2. 🔴 Ensure <img> elements have alternative text',
  '   Impact: CRITICAL · WCAG 2.0 A',
  '',
  '3. 🟡 Ensure every HTML document has a lang attribute',
  '   Impact: SERIOUS · WCAG 2.0 A',
  '',
  '4. 🟡 Ensure the contrast between foreground and background',
  '   colors meets WCAG 2 AA minimum contrast ratio thresholds',
  '   Impact: SERIOUS · WCAG 2.0 AA',
];

export const crawlCommand = 'reach crawl https://yoursite.com --max-pages 25';
export const crawlLines = [
  '✔ Audited 2 pages',
  '',
  'Crawl summary for https://yoursite.com/',
  'Pages discovered: 2 · Audits run: 2 (success: 2)',
  'Total violations found: 1',
  '',
  'Violation overview',
  '🟡 html-has-lang — 1 occurrence across 1 page',
  '   Ensure every HTML document has a lang attribute',
  '',
  'Per-page results',
  '✅ / — No violations detected',
  '⚠️ /about — 1 violation',
];

export const historyCommand = 'reach history';
export const historyLines = [
  '📊 Reach — Audit History Report',
  '══════════════════════════════════════════════════',
  '',
  'Total Audits: 3',
  'Total Violations: 6',
  'Average Violations per Audit: 2.0',
  '',
  'Recent Audits:',
  '1. ✅ https://example.com — 0 violations',
  '2. ⚠️ https://yoursite.com/page — 6 violations',
  '3. ⚠️ https://yoursite.com/about — 1 violation',
];

export const features = [
  { label: 'Quick', desc: 'Fast pass/fail' },
  { label: 'Audit', desc: 'Full WCAG report' },
  { label: 'Crawl', desc: 'Whole-site checks' },
  { label: 'History', desc: 'Track progress' },
  { label: 'JSON', desc: 'CI & reports' },
  { label: 'MCP', desc: 'AI assistants' },
];
