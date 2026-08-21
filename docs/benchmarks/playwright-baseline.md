# Reach benchmark: playwright-baseline

Captured: 2026-08-21T22:22:56.803Z
Engine note: Playwright Chromium via @axe-core/playwright (current main)

## Environment

| Item | Value |
| --- | --- |
| Node | v22.14.0 (/exec-daemon/node) |
| npm | 10.9.7 (/home/ubuntu/.nvm/versions/node/v22.22.2/bin/npm) |
| Bun | 1.4.0 (/home/ubuntu/.bun/bin/bun) |
| Chrome | /usr/local/bin/google-chrome |
| Platform | linux x64 |

## Disk usage

| Path | Size |
| --- | --- |
| node_modules | 645M |
| playwright package | 4.2M |
| @axe-core/playwright | 68K |
| puppeteer-core | 12M |
| ~/.cache/ms-playwright | 1.5G |
| ~/.bun | 787M |

## Install

Fresh `npx playwright install chromium` into `/tmp/reach-pw-browsers-playwright-baseline`: **6008 ms**, peak RSS **329.8 MB**, browser dir **924M**, exit 0.

```
Downloading Chromium 141.0.7390.37 (playwright build v1194) from https://cdn.playwright.dev/dbazure/download/playwright/builds/chromium/1194/chromium-linux.zip
|                                                                                |   0% of 173.9 MiB
|■■■■■■■■                                                                        |  10% of 173.9 MiB
|■■■■■■■■■■■■■■■■                                                                |  20% of 173.9 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■                                                        |  30% of 173.9 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                                |  40% of 173.9 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                        |  50% of 173.9 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                |  60% of 173.9 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                        |  70% of 173.9 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                |  80% of 173.9 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■        |  90% of 173.9 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■| 100% of 173.9 MiB
Chromium 141.0.7390.37 (playwright build v1194) downloaded to /tmp/reach-pw-browsers-playwright-baseline/chromium-1194
Downloading FFMPEG playwright build v1011 from https://cdn.playwright.dev/dbazure/download/playwright/builds/ffmpeg/1011/ffmpeg-linux.zip
|                                                                                |   0% of 2.3 MiB
|■■■■■■■■                                                                        |  10% of 2.3 MiB
|■■■■■■■■■■■■■■■■                                                                |  20% of 2.3 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■                                                        |  30% of 2.3 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                                |  40% of 2.3 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                        |  50% of 2.3 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                |  60% of 2.3 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                        |  70% of 2.3 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                |  80% of 2.3 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■        
…[truncated 1732 bytes]
```

`npm run install-browsers` (existing cache): **668.3 ms**, peak RSS **318.8 MB**, exit 0.

## CLI usage

| Command | Duration | Peak RSS | Exit |
| --- | --- | --- | --- |
| quick-example.com | 1428.1 ms | 785.5 MB | 0 |
| audit-example.com | 1272.9 ms | 862.7 MB | 0 |
| audit-example.com-json | 1230.8 ms | 762.2 MB | 0 |
| audit-local-violations | 1269.7 ms | 860.4 MB | 0 |
| crawl-example.com-max-3 | 1321.6 ms | 868.2 MB | 0 |

### quick-example.com

```
> accessibility-auditor@1.0.0 dev
> bash ./scripts/run-workspace.sh packages/reach dev quick https://example.com


> reach-a11y@1.0.2 dev
> tsx index.ts quick https://example.com
```

### audit-example.com

```
> accessibility-auditor@1.0.0 dev
> bash ./scripts/run-workspace.sh packages/reach dev audit https://example.com


> reach-a11y@1.0.2 dev
> tsx index.ts audit https://example.com


🔍 Reach — Accessibility Audit Report
══════════════════════════════════════════════════
URL: https://example.com
Timestamp: 8/21/2026, 10:23:07 PM

📊 Summary:
  ✅ 8 checks passed

✅ No accessibility violations found!
📝 Manual & Hybrid Checks:

▶ Common Checks
  ⚠️ Color Contrast
     • Automation: HYBRID (rules: color-contrast, link-in-text-block)
     • What to look for: Normal text meets at least 4.5:1 contrast; large text meets 3:1.
     • Notes: Verify gradients, background images, and focus outlines maintain adequate contrast.

  ⚠️ Headings
     • Automation: HYBRID (rules: heading-order, landmark-one-main, region)
     • What to look for: A single first-level heading establishes the page topic.
     • Notes: Check visually that headings convey a logical outline and that important sections aren't plain paragraphs.

  ⚠️ Image Alternative Text
     • Automation: HYBRID (rules: image-alt, area-alt, input-image-alt)
     • What to look for: Meaningful images describe purpose or action, not purely visual detail.
     • Notes: Review alt text manually to ensure it communicates intent and context.

  ✅ Language of Page
     • Automation: AUTOMATED (rules: html-has-lang, html-lang-valid)
     • What to look for: The <html> element includes a valid BCP 47 language code.

  ⚠️ Page Title
     • Automation: HYBRID (rules: page-title)
     • What to look for: Titles summarize the page purpose in a concise phrase.
     • Notes: Verify the copy reflects the page content and is distinguishable from other pages.

  ⚠️ Skip Link
     • Automation: HYBRID (rules: bypass)
     • What to look for: The first tabbable element is a functional skip link or landmark.
     • Notes: Confirm the skip link is visible on focus and targets the correct region.

  ⚠️ Visible Keyboard Focus
     • Automation: HYBRID (rules: focus-order-semantics, focus-visible, focus-trap)
     • What to look for: Each tabbable element exposes a clear focus outline.
     • Notes: Run a manual tab-through to ensure focus indicators are prominent and meet contrast guidelines.

  📝 Zoom
     • Automation: MANUAL
     • What to look for: At 200% zoom the page avoids horizontal scrolling for primary content.
     • Notes: Manually zoom the page and confirm responsive behavior without clipped content.

▶ Audio / Visual Checks
  📝 Audio Description
     • Automation: MANUAL
     • What to look for: Look for a described-video track or narration covering on-screen text, visuals, and actions.
     • Notes: Watch representative videos while toggling described tracks or confirm alternate versions exist.

  📝 Captions
     • Automation: MANUAL
     • What to look for: Captions include dialogue, speaker identification, and essential sound effects.
     • Notes: Play each media asset and verify captions are present, accurate, and synchronized.

  📝 Transcripts
     • Automation: MANUAL
     • What to look for: Transcripts cover spoken words and meaningful non-speech audio cues.
     • Notes: Inspect media detail pages or documentation for downloadable or inline transcripts.

▶ Form Checks
  ⚠️ Labels
     • Automation: HYBRID (rules: label, aria-label, aria-labelledby, form-field-multiple-labels)
     • What to look for: Inputs use <label for>, aria-label, or aria-labelledby with descriptive copy.
     • Note
…[truncated 761 bytes]
```

### audit-example.com-json

```
> accessibility-auditor@1.0.0 dev
> bash ./scripts/run-workspace.sh packages/reach dev audit https://example.com --output json


> reach-a11y@1.0.2 dev
> tsx index.ts audit https://example.com --output json

{
  "url": "https://example.com",
  "timestamp": "2026-08-21T22:23:08.885Z",
  "summary": {
    "totalViolations": 0,
    "criticalViolations": 0,
    "seriousViolations": 0,
    "moderateViolations": 0,
    "minorViolations": 0,
    "totalPasses": 8,
    "incomplete": 0
  },
  "violations": [],
  "rawAxeResults": {
    "testEngine": {
      "name": "axe-core",
      "version": "4.10.3"
    },
    "testRunner": {
      "name": "axe"
    },
    "testEnvironment": {
      "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.37 Safari/537.36",
      "windowWidth": 1280,
      "windowHeight": 720,
      "orientationAngle": 0,
      "orientationType": "landscape-primary"
    },
    "timestamp": "2026-08-21T22:23:08.733Z",
    "url": "https://example.com/",
    "toolOptions": {
      "runOnly": {
        "type": "tag",
        "values": [
          "wcag2a",
          "wcag2aa",
          "wcag21a",
          "wcag21aa"
        ]
      },
      "reporter": "v1"
    },
    "inapplicable": [
      {
        "id": "area-alt",
        "impact": null,
        "tags": [
          "cat.text-alternatives",
          "wcag2a",
          "wcag244",
          "wcag412",
          "section508",
          "section508.22.a",
          "TTv5",
          "TT6.a",
          "EN-301-549",
          "EN-9.2.4.4",
          "EN-9.4.1.2",
          "ACT"
        ],
        "description": "Ensure <area> elements of image maps have alternative text",
        "help": "Active <area> elements must have alternative text",
        "helpUrl": "https://dequeuniversity.com/rules/axe/4.10/area-alt?application=playwright",
        "nodes": []
      },
      {
        "id": "aria-allowed-attr",
        "impact": null,
        "tags": [
          "cat.aria",
          "wcag2a",
          "wcag412",
          "EN-301-549",
          "EN-9.4.1.2"
        ],
        "description": "Ensure an element's role supports its ARIA attributes",
        "help": "Elements must only use supported ARIA attributes",
        "helpUrl": "https://dequeuniversity.com/rules/axe/4.10/aria-allowed-attr?application=playwright",
        "nodes": []
      },
      {
        "id": "aria-braille-equivalent",
        "impact": null,
        "tags": [
          "cat.aria",
          "wcag2a",
          "wcag412",
          "EN-301-549",
          "EN-9.4.1.2"
        ],
        "description": "Ensure aria-braillelabel and aria-brailleroledescription have a non-braille equivalent",
        "help": "aria-braille attributes must have a non-braille equivalent",
        "helpUrl": "https://dequeuniversity.com/rules/axe/4.10/aria-braille-equivalent?application=playwright",
        "nodes": []
      },
      {
        "id": "aria-command-name",
        "impact": null,
        "tags": [
          "cat.aria",
          "wcag2a",
          "wcag412",
          "TTv5",
          "TT6.a",
          "EN-301-549",
          "EN-9.4.1.2",
          "ACT"
        ],
        "description": "Ensure every ARIA button, link and menuitem has an accessible name",
        "help": "ARIA commands must have an accessible name",
        "helpUrl": "https://dequeuniversity.com/rules/axe/4.10/aria-command-name?application=playwright",
        "nodes": []
      },
      {
 
…[truncated 2526 bytes]
```

### audit-local-violations

```
> accessibility-auditor@1.0.0 dev
> bash ./scripts/run-workspace.sh packages/reach dev audit http://127.0.0.1:46829/violations


> reach-a11y@1.0.2 dev
> tsx index.ts audit http://127.0.0.1:46829/violations


🔍 Reach — Accessibility Audit Report
══════════════════════════════════════════════════
URL: http://127.0.0.1:46829/violations
Timestamp: 8/21/2026, 10:23:11 PM

📊 Summary:
  ❌ 6 violations found
    🔴 Critical: 3
    🟡 Serious: 3

🚨 Violations:

1. 🔴 Ensure all ARIA attributes have valid values
   Impact: CRITICAL
   WCAG Level: WCAG 2.0 A
   Help: https://dequeuniversity.com/rules/axe/4.10/aria-valid-attr-value?application=playwright
   Affected elements: 1
     1. div[role="button"]

2. 🔴 Ensure buttons have discernible text
   Impact: CRITICAL
   WCAG Level: WCAG 2.0 A
   Help: https://dequeuniversity.com/rules/axe/4.10/button-name?application=playwright
   Affected elements: 1
     1. div > button

3. 🟡 Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
   Impact: SERIOUS
   WCAG Level: WCAG 2.0 AA
   Help: https://dequeuniversity.com/rules/axe/4.10/color-contrast?application=playwright
   Affected elements: 1
     1. p

4. 🟡 Ensure every HTML document has a lang attribute
   Impact: SERIOUS
   WCAG Level: WCAG 2.0 A
   Help: https://dequeuniversity.com/rules/axe/4.10/html-has-lang?application=playwright
   Affected elements: 1
     1. html

5. 🔴 Ensure <img> elements have alternative text or a role of none or presentation
   Impact: CRITICAL
   WCAG Level: WCAG 2.0 A
   Help: https://dequeuniversity.com/rules/axe/4.10/image-alt?application=playwright
   Affected elements: 1
     1. img

6. 🟡 Ensure links have discernible text
   Impact: SERIOUS
   WCAG Level: WCAG 2.0 A
   Help: https://dequeuniversity.com/rules/axe/4.10/link-name?application=playwright
   Affected elements: 1
     1. a

📝 Manual & Hybrid Checks:

▶ Common Checks
  ❌ Color Contrast
     • Automation: HYBRID (rules: color-contrast, link-in-text-block)
     • What to look for: Normal text meets at least 4.5:1 contrast; large text meets 3:1.
     • Notes: Verify gradients, background images, and focus outlines maintain adequate contrast.

  ⚠️ Headings
     • Automation: HYBRID (rules: heading-order, landmark-one-main, region)
     • What to look for: A single first-level heading establishes the page topic.
     • Notes: Check visually that headings convey a logical outline and that important sections aren't plain paragraphs.

  ❌ Image Alternative Text
     • Automation: HYBRID (rules: image-alt, area-alt, input-image-alt)
     • What to look for: Meaningful images describe purpose or action, not purely visual detail.
     • Notes: Review alt text manually to ensure it communicates intent and context.

  ❌ Language of Page
     • Automation: AUTOMATED (rules: html-has-lang, html-lang-valid)
     • What to look for: The <html> element includes a valid BCP 47 language code.

  ⚠️ Page Title
     • Automation: HYBRID (rules: page-title)
     • What to look for: Titles summarize the page purpose in a concise phrase.
     • Notes: Verify the copy reflects the page content and is distinguishable from other pages.

  ⚠️ Skip Link
     • Automation: HYBRID (rules: bypass)
     • What to look for: The first tabbable element is a functional skip link or landmark.
     • Notes: Confirm the skip link is visible on focus and targets the correct region.

  ⚠️ Visible Keyboard Focus
     • Automation: HY
…[truncated 2260 bytes]
```

### crawl-example.com-max-3

```
> accessibility-auditor@1.0.0 dev
> bash ./scripts/run-workspace.sh packages/reach dev crawl https://example.com --max-pages 3


> reach-a11y@1.0.2 dev
> tsx index.ts crawl https://example.com --max-pages 3


Crawl summary for https://example.com/
Pages discovered: 1 (skipped: 1, crawl errors: 0)
Audits run: 1 (success: 1, failed: 0)
Total violations found: 0

Per-page results
✅ https://example.com/ — No violations detected
```

## In-process auditor

| Step | Duration | Notes |
| --- | --- | --- |
| import-and-construct | 377.4 ms | rss=138.7MB |
| browser-launch | 37.3 ms | rss=139.5MB |
| cold-audit:http://127.0.0.1:46829/valid | 354.4 ms | violations=0 passes=16 rss=162.1MB |
| warm-audit:http://127.0.0.1:46829/violations | 297.6 ms | violations=6 passes=19 rss=164.7MB |
| warm-audit:https://example.com | 285.7 ms | violations=0 passes=8 rss=165.1MB |
| browser-close | 24.3 ms | rss=165.1MB |

Process RSS after close: **165.1 MB**
Peak sampled RSS: **816.6 MB**
