# Playwright vs bun.WebView vs Node fallback

Same machine, same URLs, same harness (`scripts/benchmark-reach.mjs`). Playwright numbers are from **before** the engine change; bun.WebView and Node numbers are from **after**.

## Install (the original pain)

| Step | Playwright (before) | After |
| --- | --- | --- |
| Documented setup | `npm run install-browsers` plus host libs (`playwright install-deps`) | `reach doctor` — no browser download |
| Fresh Chromium download | **6.0s**, 173.9 MiB + 104.3 MiB headless shell + 2.3 MiB ffmpeg | none |
| Unpacked browser dir | **924M** (Chromium-only temp install) | 0 extra; uses system Chrome |
| Full Playwright cache | **1.5G** (`~/.cache/ms-playwright`, all browsers) | unused |
| Host warning | “missing dependencies… sudo npx playwright install-deps” | none |
| `node_modules` (this monorepo) | 645M including Playwright packages | 633M after removing leftover Playwright dirs |

New users with only Node/npm still need **Chrome/Chromium/Edge/Brave installed**, which most desktops already have. They do **not** need a 900MB+ Playwright browser download.

## CLI (`quick` / `audit` / `crawl`)

Process-tree peak RSS includes the Chrome renderer.

| Command | Playwright + tsx | bun.WebView + Bun 1.4 | Node + puppeteer-core |
| --- | --- | --- | --- |
| `quick https://example.com` | 1428 ms / 786 MB | **366 ms** / 774 MB | 1280 ms / 1263 MB |
| `audit https://example.com` | 1273 ms / 863 MB | **351 ms** / 862 MB | 1286 ms / 1280 MB |
| `audit --output json` | 1231 ms / 762 MB | **345 ms** / 856 MB | 1258 ms / 1277 MB |
| local violations fixture | 1270 ms / 860 MB | **365 ms** / 814 MB | 1262 ms / 1279 MB |
| `crawl --max-pages 3` | 1322 ms / 868 MB | **369 ms** / 693 MB | 1369 ms / 1323 MB |
| Result on example.com | 0 violations, 8 passes | 0 violations, 8 passes | 0 violations, 8 passes |
| Result on violations fixture | 6 violations (3 critical, 3 serious) | same 6 rule ids | same 6 rule ids |

`bun run` is faster mostly because it skips `tsx` + Playwright startup. The Node fallback is in the same ballpark as the old Playwright CLI.

## In-process auditor (fairer engine comparison)

Browser is launched once, then three pages are audited.

| Step | Playwright | bun.WebView | Node puppeteer-core |
| --- | --- | --- | --- |
| import + construct | 377 ms | **8.8 ms** | 10 ms |
| browser launch | 37 ms (already-cached Chromium) | **1.1 ms** (Chrome already running for CLI) | 319 ms (cold system Chrome) |
| cold local valid page | 354 ms (0 / 16) | 270 ms (0 / 16) | **155 ms** (0 / 16) |
| warm local violations | 298 ms (6 / 19) | 141 ms (6 / 19) | 139 ms (6 / 19) |
| warm example.com | 286 ms (0 / 8) | 153 ms (0 / 8) | 149 ms (0 / 8) |
| close | 24 ms | 0.1 ms | 45 ms |
| Node/Bun process RSS after close | 165 MB | **46 MB** | 134 MB |
| Peak sampled process-tree RSS | 817 MB | 986 MB | 1121 MB |

Violation IDs on the local fixture matched across bun.WebView and puppeteer-core: `aria-valid-attr-value`, `button-name`, `color-contrast`, `html-has-lang`, `image-alt`, `link-name`.

## How to reproduce

```bash
node scripts/benchmark-reach.mjs --label playwright-baseline
node scripts/benchmark-reach.mjs --label bun-webview --skip-playwright-install --cli bun --runtime bun
node scripts/benchmark-reach.mjs --label node-puppeteer --skip-playwright-install --cli npm --runtime node
```
