# Reach engine benchmarks

These reports compare the Playwright-based auditor (before) with bun.WebView and the Node/npm Chrome fallback (after) on the same machine. Start with [`comparison.md`](./comparison.md).

Reproduce:

```bash
# From repo root
node scripts/benchmark-reach.mjs --label <label> [--skip-playwright-install] [--engine "notes"]
```

The harness:

1. Records Node/npm/Bun/Chrome versions and disk usage
2. Optionally times a fresh `npx playwright install chromium` into a temp directory
3. Runs the documented CLI commands (`quick`, `audit`, `audit --output json`, local fixture, `crawl`)
4. Times in-process browser launch plus cold/warm audits with peak RSS

Outputs land in `docs/benchmarks/<label>/` and `/opt/cursor/artifacts/benchmark-<label>/`.
