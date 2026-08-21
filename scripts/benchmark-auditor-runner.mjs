#!/usr/bin/env node
/**
 * In-process AccessibilityAuditor timings.
 * Prints human-readable steps plus a trailing BENCHMARK_JSON: payload.
 *
 * Usage:
 *   npx tsx scripts/benchmark-auditor-runner.mjs --urls http://127.0.0.1:PORT/valid,https://example.com
 */

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function rssMb() {
  return Math.round((process.memoryUsage().rss / 1024 / 1024) * 10) / 10;
}

function parseUrls(argv) {
  const idx = argv.indexOf('--urls');
  const raw = idx >= 0 ? argv[idx + 1] : 'https://example.com';
  return raw.split(',').map((value) => value.trim()).filter(Boolean);
}

async function loadAuditor() {
  const { AccessibilityAuditor } = await import('../packages/reach/src/core/auditor.ts');
  return new AccessibilityAuditor();
}

async function main() {
  const urls = parseUrls(process.argv.slice(2));
  const steps = [];

  const importStarted = performance.now();
  const auditor = await loadAuditor();
  steps.push({
    name: 'import-and-construct',
    durationMs: Math.round((performance.now() - importStarted) * 10) / 10,
    notes: `rss=${rssMb()}MB`,
  });

  const initStarted = performance.now();
  await auditor.initialize();
  steps.push({
    name: 'browser-launch',
    durationMs: Math.round((performance.now() - initStarted) * 10) / 10,
    notes: `rss=${rssMb()}MB`,
  });

  for (const [index, url] of urls.entries()) {
    const started = performance.now();
    const result = await auditor.audit(url);
    steps.push({
      name: index === 0 ? `cold-audit:${url}` : `warm-audit:${url}`,
      durationMs: Math.round((performance.now() - started) * 10) / 10,
      notes: `violations=${result.summary.totalViolations} passes=${result.summary.totalPasses} rss=${rssMb()}MB`,
      url,
      summary: result.summary,
    });
  }

  const closeStarted = performance.now();
  await auditor.close();
  steps.push({
    name: 'browser-close',
    durationMs: Math.round((performance.now() - closeStarted) * 10) / 10,
    notes: `rss=${rssMb()}MB`,
  });

  const payload = {
    engineHint: detectEngineHint(),
    finalRssMb: rssMb(),
    steps,
  };

  for (const step of steps) {
    console.log(`${step.name}: ${step.durationMs} ms (${step.notes})`);
  }
  console.log(`BENCHMARK_JSON:${JSON.stringify(payload)}`);
}

function detectEngineHint() {
  try {
    const pkg = require('../packages/reach/package.json');
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps.playwright) return 'playwright-listed';
    if (deps['axe-core']) return 'axe-core-direct';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
