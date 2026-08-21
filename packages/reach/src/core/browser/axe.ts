import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type { AxeResults } from '../types.js';
import type { BrowserPage } from './types.js';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

export const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

export async function runAxeOnPage(page: BrowserPage): Promise<AxeResults> {
  await page.evaluate(`(() => {
    if (globalThis.axe && typeof globalThis.axe.run === 'function') return true;
    (0, eval)(${JSON.stringify(axeSource)});
    return true;
  })()`);

  // Slim in the page so Bun.WebView's JSON evaluate payload stays small.
  const results = await page.evaluate<AxeResults>(`(async () => {
    const full = await axe.run({
      runOnly: { type: 'tag', values: ${JSON.stringify(AXE_TAGS)} },
    });
    const slimNode = (node) => ({
      target: node.target,
      html: node.html,
      failureSummary: node.failureSummary,
      impact: node.impact,
    });
    const slimRule = (rule, includeNodes) => ({
      id: rule.id,
      impact: rule.impact,
      description: rule.description,
      help: rule.help,
      helpUrl: rule.helpUrl,
      tags: rule.tags,
      nodes: includeNodes ? (rule.nodes || []).map(slimNode) : [],
    });
    return {
      violations: (full.violations || []).map((rule) => slimRule(rule, true)),
      passes: (full.passes || []).map((rule) => slimRule(rule, false)),
      incomplete: (full.incomplete || []).map((rule) => slimRule(rule, false)),
    };
  })()`);

  return results;
}
