# Reach

Check your site for accessibility—one page or a whole site. Quick checks, full reports, and simple history. Built for [Bun](https://bun.sh).

## Install

**Run without installing:**

```bash
npx reach quick https://example.com
npx reach audit https://example.com
```

**Install globally:**

```bash
npm install -g reach
# or: bun add -g reach

reach quick https://example.com
reach audit https://example.com --output json --file report.json
reach crawl https://example.com --max-pages 25
reach history
```

Requires [Bun](https://bun.sh) (≥1.0).

## Commands

| Command | What it does |
|--------|----------------|
| `quick <url>` | Fast pass/fail—did the page pass? |
| `audit <url>` | Full report: what’s wrong, how serious, and how to fix it |
| `crawl <url>` | Check every page on the site (with limits) |
| `history` | See past runs and trends |

**Audit:** `--output console|json`, `--file <path>`, `--timeout <ms>`, `--verbose`, `--show-checks`  
**Crawl:** `--max-pages`, `--max-depth`, `--delay`, `--allow-external`, `--output`, `--file`, `--verbose`

## What Reach does

- Opens your page in a real browser and checks it against common accessibility rules (WCAG 2.1 AA).
- Tells you what failed and how bad it is (critical → minor).
- Saves runs locally so you can track progress; can export JSON for reports or CI.

Automated checks only catch some issues—pair with manual testing when it matters.

## More

Full docs and how it’s built: [github.com/softwarebyze/accessibility-auditor](https://github.com/softwarebyze/accessibility-auditor).

## License

MIT
