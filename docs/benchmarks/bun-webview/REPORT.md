# Reach benchmark: bun-webview

Captured: 2026-08-21T22:30:08.029Z
Engine note: Bun.WebView chrome backend (Bun 1.4.0)

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
| axe-core | 2.8M |
| puppeteer-core | 12M |
| ~/.cache/ms-playwright | 1.5G |
| ~/.bun | 789M |

## Install

Playwright fresh Chromium install skipped.

## CLI usage

| Command | Duration | Peak RSS | Exit |
| --- | --- | --- | --- |
| quick-example.com | 365.8 ms | 774.4 MB | 0 |
| audit-example.com | 350.8 ms | 862.2 MB | 0 |
| audit-example.com-json | 344.6 ms | 856 MB | 0 |
| audit-local-violations | 364.8 ms | 813.5 MB | 0 |
| crawl-example.com-max-3 | 369.3 ms | 693.1 MB | 0 |

### quick-example.com

```
$ bash ./scripts/run-workspace.sh packages/reach dev quick https://example.com
$ node ./scripts/run-dev.mjs quick https://example.com
- Running quick accessibility check...
✔ ✅ https://example.com - No violations found
```

### audit-example.com

```
🔍 Reach — Accessibility Audit Report
══════════════════════════════════════════════════
URL: https://example.com
Timestamp: 8/21/2026, 10:30:09 PM

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
     • Notes: Review complex fields (date pickers, custom dropdowns) to ensure labels are read correctly.

  ⚠️ Required Fields
     • Automation: HYBRID (rules: aria-required-attr, aria-requi
…[truncated 609 bytes]
```

### audit-example.com-json

```
{
  "url": "https://example.com",
  "timestamp": "2026-08-21T22:30:09.543Z",
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
    "violations": [],
    "passes": [
      {
        "id": "aria-hidden-body",
        "impact": null,
        "description": "Ensure aria-hidden=\"true\" is not present on the document body.",
        "help": "aria-hidden=\"true\" must not be present on the document body",
        "helpUrl": "https://dequeuniversity.com/rules/axe/4.10/aria-hidden-body?application=axeAPI",
        "tags": [
          "cat.aria",
          "wcag2a",
          "wcag131",
          "wcag412",
          "EN-301-549",
          "EN-9.1.3.1",
          "EN-9.4.1.2"
        ],
        "nodes": []
      },
      {
        "id": "bypass",
        "impact": null,
        "description": "Ensure each page has at least one mechanism for a user to bypass navigation and jump straight to the content",
        "help": "Page must have means to bypass repeated blocks",
        "helpUrl": "https://dequeuniversity.com/rules/axe/4.10/bypass?application=axeAPI",
        "tags": [
          "cat.keyboard",
          "wcag2a",
          "wcag241",
          "section508",
          "section508.22.o",
          "TTv5",
          "TT9.a",
          "EN-301-549",
          "EN-9.2.4.1"
        ],
        "nodes": []
      },
      {
        "id": "color-contrast",
        "impact": null,
        "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
        "help": "Elements must meet minimum color contrast ratio thresholds",
        "helpUrl": "https://dequeuniversity.com/rules/axe/4.10/color-contrast?application=axeAPI",
        "tags": [
          "cat.color",
          "wcag2aa",
          "wcag143",
          "TTv5",
          "TT13.c",
          "EN-301-549",
          "EN-9.1.4.3",
          "ACT"
        ],
        "nodes": []
      },
      {
        "id": "document-title",
        "impact": null,
        "description": "Ensure each HTML document contains a non-empty <title> element",
        "help": "Documents must have <title> element to aid in navigation",
        "helpUrl": "https://dequeuniversity.com/rules/axe/4.10/document-title?application=axeAPI",
        "tags": [
          "cat.text-alternatives",
          "wcag2a",
          "wcag242",
          "TTv5",
          "TT12.a",
          "EN-301-549",
          "EN-9.2.4.2",
          "ACT"
        ],
        "nodes": []
      },
      {
        "id": "html-has-lang",
        "impact": null,
        "description": "Ensure every HTML document has a lang attribute",
        "help": "<html> element must have a lang attribute",
        "helpUrl": "https://dequeuniversity.com/rules/axe/4.10/html-has-lang?application=axeAPI",
        "tags": [
          "cat.language",
          "wcag2a",
          "wcag311",
          "TTv5",
          "TT11.a",
          "EN-301-549",
          "EN-9.3.1.1",
          "ACT"
        ],
        "nodes": []
      },
      {
        "id": "html-lang-valid",
        "impact": null,
        "description": "Ensure the lang attribute of the <html> element has a valid value",
        "help": "<html> element must have a valid value for the lang attribute",
        "helpUrl": "https://dequeuniversity.com/rules/
…[truncated 2525 bytes]
```

### audit-local-violations

```
🔍 Reach — Accessibility Audit Report
══════════════════════════════════════════════════
URL: http://127.0.0.1:37949/violations
Timestamp: 8/21/2026, 10:30:10 PM

📊 Summary:
  ❌ 6 violations found
    🔴 Critical: 3
    🟡 Serious: 3

🚨 Violations:

1. 🔴 Ensure all ARIA attributes have valid values
   Impact: CRITICAL
   WCAG Level: WCAG 2.0 A
   Help: https://dequeuniversity.com/rules/axe/4.10/aria-valid-attr-value?application=axeAPI
   Affected elements: 1
     1. div[role="button"]

2. 🔴 Ensure buttons have discernible text
   Impact: CRITICAL
   WCAG Level: WCAG 2.0 A
   Help: https://dequeuniversity.com/rules/axe/4.10/button-name?application=axeAPI
   Affected elements: 1
     1. div > button

3. 🟡 Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
   Impact: SERIOUS
   WCAG Level: WCAG 2.0 AA
   Help: https://dequeuniversity.com/rules/axe/4.10/color-contrast?application=axeAPI
   Affected elements: 1
     1. p

4. 🟡 Ensure every HTML document has a lang attribute
   Impact: SERIOUS
   WCAG Level: WCAG 2.0 A
   Help: https://dequeuniversity.com/rules/axe/4.10/html-has-lang?application=axeAPI
   Affected elements: 1
     1. html

5. 🔴 Ensure <img> elements have alternative text or a role of none or presentation
   Impact: CRITICAL
   WCAG Level: WCAG 2.0 A
   Help: https://dequeuniversity.com/rules/axe/4.10/image-alt?application=axeAPI
   Affected elements: 1
     1. img

6. 🟡 Ensure links have discernible text
   Impact: SERIOUS
   WCAG Level: WCAG 2.0 A
   Help: https://dequeuniversity.com/rules/axe/4.10/link-name?application=axeAPI
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
     • Automation: HYBRID (rules: focus-order-semantics, focus-visible, focus-trap)
     • What to look for: Each tabbable element exposes a clear focus outline.
     • Notes: Run a manual tab-through to ensure focus indicators are prominent and meet con
…[truncated 2056 bytes]
```

### crawl-example.com-max-3

```
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
| import-and-construct | 8.8 ms | rss=25.9MB |
| browser-launch | 1.1 ms | rss=26.4MB |
| cold-audit:http://127.0.0.1:37949/valid | 270 ms | violations=0 passes=16 rss=35.2MB |
| warm-audit:http://127.0.0.1:37949/violations | 141.4 ms | violations=6 passes=19 rss=38.6MB |
| warm-audit:https://example.com | 153.3 ms | violations=0 passes=8 rss=42.3MB |
| browser-close | 0.1 ms | rss=42.9MB |

Process RSS after close: **45.5 MB**
Peak sampled RSS: **986.3 MB**
