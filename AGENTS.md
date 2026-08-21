# AGENTS.md

## Cursor Cloud specific instructions

### Overview

**Reach** is a web accessibility auditing CLI tool (`packages/reach`) and marketing website (`packages/website`), built as a Bun monorepo. It uses axe-core against a real rendered page: **Bun.WebView** on Bun 1.4+, or **puppeteer-core + system Chrome** when only Node/npm is installed.

### Prerequisites

- **Bun** (>=1.4) must be installed and on PATH for the WebView engine. Install: `curl -fsSL https://bun.sh/install | bash`
- **Chrome, Chromium, Edge, or Brave** must be installed for Linux/Windows WebView and for the Node/npm fallback. No Playwright browser download.
- Node.js 20+ is enough to run the CLI (`npx reach-a11y`) if a Chrome-family browser is present.

### Key commands (run from repo root)

All standard commands are documented in `README.md` and `package.json`. Quick reference:

| Action | Command |
|---|---|
| Install deps | `bun install` |
| Lint | `bun run lint` |
| Format | `bun run format` |
| Fast tests (no browser) | `bun run test:fast` |
| All tests | `bun run test` |
| Integration test | `bun run test:integration` |
| Build CLI | `bun run build` |
| Build website | `bun run build:site` |
| Run CLI (dev) | `bun run dev <command> [args]` |
| Full check (lint+test+build) | `bun run check` |
| Website dev server | `bun run site` (port 4321) |
| Browser doctor | `bun run dev -- doctor` |

### Non-obvious caveats

- The `auditor.test.ts` tests launch a real headless browser (Bun.WebView on Bun, puppeteer-core on Node) and may make network requests. They need Chrome/Chromium (or Bun.WebView on macOS WebKit).
- Integration tests (`bun run test:integration`) audit `https://example.com` over the network, so internet access is required.
- Audit history is stored as JSON files in `/tmp/reach-history/`. Tests that exercise history create and clean up files there.
- The build script (`bun run build`) runs lint first, then bundles. If lint fails, build fails.
- Pre-commit hooks (Husky + lint-staged) run `bunx lint-staged` which applies Biome to staged `.ts/.tsx/.js` files in `packages/reach/`.
- The website package (`packages/website`) uses Astro and is independent of the CLI package. It builds as a static site.
- Bun must be on PATH. If using a fresh shell, you may need `export PATH="$HOME/.bun/bin:$PATH"`.
- Force an engine with `REACH_ENGINE=webview` or `REACH_ENGINE=puppeteer`. Point at a Chrome binary with `REACH_CHROME_PATH`.
