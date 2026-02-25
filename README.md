# Reach

**Reach** checks your site for accessibility—one page or a whole site. Quick checks, full reports, simple history. Built for [Bun](https://bun.sh).

This repo is a **monorepo**: the CLI is in `packages/reach`, the marketing site in `packages/website`. Tooling (install, test, build) uses Bun.

## 🚀 Use Reach (Bun)

Reach is built for [Bun](https://bun.sh). Run without installing:

```bash
bunx reach install-browsers   # one-time
bunx reach quick https://example.com
bunx reach audit https://example.com
```

**Install globally:**

```bash
bun add -g reach

reach install-browsers   # one-time
reach quick https://example.com
reach audit https://example.com --output json --file results.json
reach crawl https://example.com --max-pages 25
reach history
```

Requires Bun ≥1.0.

## 🛠 Develop from this repo

```bash
# From repo root
bun install

# Install browsers (one-time)
bun run install-browsers

# Run CLI from package
bun run dev quick https://example.com
bun run dev audit https://example.com
bun run dev audit https://example.com --output json --file results.json
bun run dev crawl https://example.com --max-pages 25
bun run dev history
bun run dev history --clear
```

## 🤝 Working with Clients

1. **Run a crawl-based audit** – `reach crawl https://client-site.com --max-pages 40 --max-depth 2` collects the key pages your client cares about.
2. **Export a shareable report** – Add `--output json --file client-report.json` to generate a deliverable you can email or drop into project tooling.
3. **Review highlights together** – Use the console output (or rerun with `--verbose`) to walk stakeholders through critical violations and quick wins.
4. **Track follow-up progress** – Re-run the crawl after fixes land; compare the new JSON against history and include the trendlines from `reach history` in your status updates.
5. **Bundle recommendations** – Pair automated findings with manual testing notes so clients understand where human review is still required.

## 📋 Commands

(Use `reach` when installed; from repo use `bun run dev`.)

### `quick <url>`

Fast accessibility check with minimal output - perfect for quick scans.

```bash
reach quick https://example.com
```

**Output:**

```
✅ https://ebenfeld.tech - No violations found
```

### `audit <url>`

Full accessibility audit with comprehensive reporting including coverage analysis.

```bash
reach audit https://example.com
```

**Options:**

- `--output <format>`: Output format (`console` or `json`)
- `--file <filename>`: Save results to file
- `--timeout <ms>`: Timeout in milliseconds (default: 30000)
- `--verbose`: Add legal context and compliance guidance to the summary
- `--show-checks`: Display the catalog of verified axe-core rules

### `history`

View audit history and statistics.

```bash
reach history
reach history --limit 20
reach history --clear
```

## 🧠 How It Works

### The Testing Process

1. **Browser Launch**: Uses Playwright to launch a headless Chromium browser
2. **Page Loading**: Navigates to the target URL and waits for DOM content to load
3. **Accessibility Analysis**: Runs axe-core engine with WCAG 2.1 AA ruleset
4. **Result Processing**: Categorizes violations by severity and maps to WCAG criteria
5. **Report Generation**: Produces detailed reports with actionable recommendations

### How Sites Are Evaluated

The tool determines accessibility by running **automated checks** against established standards:

#### ✅ **Passes** (Site is accessible for this check)

- All required elements are found and properly configured
- No violations detected for the specific accessibility rule
- Examples: All images have alt text, forms have labels, good color contrast

#### ❌ **Violations** (Site has accessibility issues)

- Missing required accessibility features
- Improperly configured elements
- Categorized by impact: Critical → Serious → Moderate → Minor

#### ⚠️ **Limitations**

- **Automated testing catches ~30-50%** of real accessibility issues
- **Cannot test**: Meaningful content quality, complex user flows, screen reader UX
- **Still needed**: Manual testing, user testing with disabilities, expert review

### WCAG Standards Applied

- **WCAG 2.1 Level A**: Basic accessibility (11 criteria)
- **WCAG 2.1 Level AA**: Standard accessibility (17 additional criteria)
- **Focus areas**: Perceivable, Operable, Understandable, Robust (POUR principles)

### Confidence Levels

- **🔴 Critical/Serious**: High confidence - clear violations that will impact users
- **🔵 Moderate/Minor**: Medium confidence - potential issues that should be reviewed
- **✅ Passes**: High confidence - requirements are met for automated checks

### Under the Hood (`packages/reach/src/core/auditor.ts`)

When you run `reach audit <url>`, the [`AccessibilityAuditor`](./packages/reach/src/core/auditor.ts) class orchestrates the entire flow:

1. **Chromium spin-up** – `chromium.launch` boots a headless browser (reused between audits for speed).
2. **Isolated page context** – `browser.newContext()` + `context.newPage()` give each audit a clean tab with no leaks between tests.
3. **Real DOM navigation** – `page.goto(url, { waitUntil: "domcontentloaded" })` loads the production site and executes its JavaScript just like a real user visit.
4. **axe-core injection** – `new AxeBuilder({ page })` injects axe-core, which walks the rendered DOM, inspecting roles, ARIA attributes, semantics, styles, and relationships.
5. **Result shaping** – `processViolations` converts axe’s JSON into our `Violation` shape, tagging each failing node with severity, WCAG mapping, helper URLs, and raw HTML snippets.
6. **Summary math** – counts for `criticalViolations`, `seriousViolations`, etc. are derived from the processed list, while `passes` and `incomplete` come directly from axe.
7. **Reporting** – the console and JSON reporters format the data: you get color-coded summaries, affected selectors, and the raw `axeResults` payload for downstream tooling.

Because axe analyses the _rendered_ DOM, whatever your frontend ships to the browser is exactly what gets audited—no brittle static code parsing required.

### Why Screen Reader UX Still Needs Humans

Automated engines confirm that labels, roles, and semantics exist, but they **cannot simulate a real assistive-technology session**:

- **Narration quality** – Having an `alt` attribute is easy to verify; knowing whether it’s descriptive enough requires human judgement.
- **Interaction flow** – Screen reader users depend on logical focus order, contextual announcements, and timing across multiple keystrokes.
- **Dynamic content** – Live regions, dialog announcements, and SPA state changes must be heard in real time to validate.
- **Device diversity** – VoiceOver, NVDA, JAWS, TalkBack, and Narrator all expose different shortcuts and behaviours. There’s no universal automation surface that reproduces them.

That’s why the report keeps reminding you about the ~30–50% automation ceiling: pair these results with manual screen reader testing and user research for full coverage.

## ✅ Comprehensive Accessibility Checklist

You can now pair the automated axe-core engine with a curated checklist that tracks both automated and manual reviews. Every entry explains what is being evaluated, why it matters, and what to verify during manual exploration.

### Common Checks

#### Image Alternative Text
- **What it checks:** Confirms images convey meaning through `alt` text or are marked decorative.
- **Why it matters:** People using screen readers rely on alt text to understand imagery.
- **What to look for:** Descriptions should communicate intent, not visual detail for its own sake. Decorative images should use empty `alt=""`.
- **Coverage:** Automated detection via axe rules `image-alt`, `area-alt`, and `input-image-alt`, plus manual reminder to judge description quality.

#### Page Title
- **What it checks:** Ensures each document exposes a unique, descriptive `<title>`.
- **Why it matters:** Screen readers announce titles first, orienting people to their location.
- **What to look for:** Titles should summarize page purpose and differ between sections.
- **Coverage:** Automated with axe rule `page-title`, with guidance to review for clarity.

#### Headings
- **What it checks:** Validates heading structure follows a logical outline.
- **Why it matters:** Screen reader users skim by heading level to understand content flow.
- **What to look for:** Make sure there is a single `<h1>` and headings increase sequentially without skipping levels.
- **Coverage:** Automated heuristics (`heading-order`, `region`, `landmark-one-main`) plus manual prompt to confirm logical hierarchy.

#### Color Contrast
- **What it checks:** Measures contrast ratios between text/interactive elements and their backgrounds.
- **Why it matters:** Low contrast makes content unreadable for people with low vision or color deficiencies.
- **What to look for:** Confirm minimum AA ratios (4.5:1 for text, 3:1 for large text) and test focus/hover states.
- **Coverage:** Automated via axe `color-contrast` and `link-in-text-block`, supplemented with manual review for gradients, images, and custom states.

#### Skip Link
- **What it checks:** Detects mechanisms for bypassing repeated navigation (skip links or landmark regions).
- **Why it matters:** Keyboard and assistive technology users need quick access to main content.
- **What to look for:** A visible link or landmark is first in tab order and actually moves focus to main content.
- **Coverage:** Automated with axe `bypass`, with manual verification of focus movement and visibility.

#### Visible Keyboard Focus
- **What it checks:** Tracks whether focus indicators are perceivable while tabbing through the page.
- **Why it matters:** Keyboard users must always know which element is active.
- **What to look for:** Tabbing should reveal a strong focus outline that meets contrast requirements.
- **Coverage:** Hybrid. Axe surfaces `focus-order-semantics`, `focus-visible`, and `focus-trap` heuristics; manual review confirms visual treatment.

#### Language of Page
- **What it checks:** Requires the root HTML element to define a valid primary language.
- **Why it matters:** Assistive tech needs correct language metadata to pronounce words correctly.
- **What to look for:** Ensure `<html lang="en">` (or appropriate code) matches the content language.
- **Coverage:** Automated via `html-has-lang` and `html-lang-valid` rules.

#### Zoom
- **What it checks:** Reminds you to confirm the experience remains usable at 200–400% zoom without horizontal scrolling or clipped content.
- **Why it matters:** Many people enlarge content to read comfortably.
- **What to look for:** Pages should reflow responsively; interactions and fixed elements must remain reachable.
- **Coverage:** Manual only—automated testing can’t verify layout at high zoom.

### Audio / Visual Checks

#### Captions
- **What it checks:** Verifies synchronized captions exist for multimedia with audio.
- **Why it matters:** Captions make spoken content accessible to Deaf and hard-of-hearing users.
- **What to look for:** Captions should include speech, speaker identification, and relevant sound effects.
- **Coverage:** Manual review with contextual guidance; automation cannot guarantee caption presence or accuracy.

#### Transcripts
- **What it checks:** Ensures audio and video content provides full transcripts available outside the media player.
- **Why it matters:** People who can’t process audio benefit from searchable, scannable alternatives.
- **What to look for:** Look for downloadable or inline transcripts kept in sync with published media.
- **Coverage:** Manual only.

#### Audio Description
- **What it checks:** Confirms that visual information in videos is available through audio description or alternative tracks.
- **Why it matters:** Blind and low-vision users rely on narration of visual context to follow along.
- **What to look for:** Identify described-video tracks or separate narrated versions covering on-screen text and actions.
- **Coverage:** Manual only.

### Form Checks

#### Labels
- **What it checks:** Checks that every form control exposes a programmatic label.
- **Why it matters:** Labels tell everyone what information to enter; assistive tech reads them aloud.
- **What to look for:** Ensure `<label for>`, `aria-label`, or `aria-labelledby` point to the input and the visible text is meaningful.
- **Coverage:** Automated via axe (`label`, `aria-label`, `aria-labelledby`), plus manual reminder to assess descriptive quality.

#### Required Fields
- **What it checks:** Highlights required inputs and their indicators.
- **Why it matters:** People need to know requirements before submitting forms to avoid errors.
- **What to look for:** Confirm required hints are conveyed visually and programmatically (`aria-required`, `required`, instructions).
- **Coverage:** Hybrid—axe flags missing `aria-required` (`aria-required-attr`, `aria-required-parent`); manual review checks instructions and error messaging.

> **Tip:** Run the audit with `--show-checks` or inspect the JSON output to see automated rule coverage alongside these manual review prompts.

## 🔍 What It Tests

This tool runs axe-core with WCAG 2.1 AA standards, checking for **25+ accessibility issues** including:

### ✅ Verified Checks (Tested & Working)

- **🔴 Image Alt Text** - Missing alt attributes on img elements (WCAG 1.1.1)
- **🔴 Form Labels** - Form controls without proper labels (WCAG 1.3.1, 2.4.6, 3.3.2)
- **🔴 Select Accessibility** - Select elements without accessible names (WCAG 1.3.1, 2.4.6, 3.3.2)
- **🟡 Color Contrast** - Insufficient color contrast ratios (WCAG 1.4.3)
- **🟡 HTML Language** - Missing lang attribute on html element (WCAG 3.1.1)
- **🟡 Link Accessibility** - Links without accessible text (WCAG 2.4.4, 4.1.2)
- **🔴 Button Accessibility** - Buttons without accessible text (WCAG 4.1.2)
- **🟡 Navigation Bypass** - Missing skip links or landmarks (WCAG 2.4.1)
- **🔴 ARIA Hidden Body** - Body hidden from screen readers (WCAG 4.1.2)
- **🔵 Text Spacing** - Inline styles preventing text spacing adjustments (WCAG 1.4.12)

### 📊 Coverage Analysis

The tool provides detailed coverage reports showing:

- **85% estimated coverage** of critical accessibility issues
- **10 verified checks** tested and working
- **15+ additional checks** based on axe-core documentation
- **WCAG 2.1 AA compliance** focus
- **High confidence level** in results

## 🏗️ Architecture

**Monorepo:**

```
packages/
├── reach/                 # CLI package (publishable to npm)
│   ├── index.ts            # Entry point
│   ├── src/
│   │   ├── core/           # auditor, types, history, axe-coverage, crawler, site-audit
│   │   ├── reporters/      # console, json, crawl
│   │   └── mcp/            # MCP server
│   └── tests/
└── website/                # Marketing site (Astro)
```

**CLI package layout:**

```
packages/reach/src/
├── core/         # auditor.ts, types.ts, history.ts, axe-coverage.ts, crawler, site-audit
├── reporters/    # console, json, crawl
└── mcp/          # server, index
```

## 🔧 Development

### Testing

From repo root:

```bash
# Run all tests (includes slow browser tests)
bun run test

# Run only fast tests (mocks, unit tests)
bun run test:fast

# Run integration tests
bun run test:integration
```

Or from `packages/reach`: `bun test`, `bun run test:fast`, etc.

**Mock Testing System:**

- Fast, reliable tests without browser dependencies
- Predefined scenarios for different accessibility conditions
- Easy to extend with custom test cases
- See `tests/mocks/README.md` for detailed usage

### Code Quality

From repo root:

```bash
bun run lint
bun run lint:fix
bun run format
bun run build          # builds packages/reach
bun run build:site     # builds packages/website
bun run site           # dev server for website
```

## 🌐 MCP Server Support

The tool includes a Model Context Protocol (MCP) server for integration with AI assistants:

```bash
# Run MCP server
bun run mcp
```

**Available MCP Tools:**

- `audit_website` - Audit a website for accessibility issues
- `get_audit_history` - Get audit history and statistics
- `get_audit_result` - Retrieve specific audit results by ID

## 📈 Audit History

All audits are automatically saved to `/tmp/reach-history/` with:

- **Individual audit results** (JSON format)
- **Aggregate history** with statistics
- **Trend analysis** and reporting
- **Easy cleanup** and management

## 🎯 Example Output

```
🔍 Accessibility Audit Report
══════════════════════════════════════════════════
URL: https://ebenfeld.tech
Timestamp: 10/7/2025, 8:25:00 PM

📊 Summary:
  ❌ 1 violations found
    🟡 Serious: 1

🚨 Violations:

1. 🟡 Ensure every HTML document has a lang attribute
   Impact: SERIOUS
   WCAG Level: WCAG 2.0 A

� Coverage Summary:
   🛠️ Engine: axe-core 4.x.x via @axe-core/playwright 4.x.x
   ✅ Verified Checks: 10/25
   � Estimated Coverage: 85%
   🎯 WCAG Level: WCAG 2.1 AA
   💡 Automated testing catches ~30-50% of accessibility issues

Add --verbose to include legal context and guidance.
Need the verified rule catalog? Re-run with --show-checks.
```

To include the verified rule catalog in the output, rerun with `--show-checks`:

```
✅ Verified axe-core checks in this release:
  🔴 image-alt — Images must have alternative text (WCAG 1.1.1) – Detects missing alt attributes on img elements
  🔴 label — Form elements must have labels (WCAG 1.3.1, 2.4.6, 3.3.2) – Detects form controls without proper labels
  …
```

## 🛠️ Built With

- **[Bun](https://bun.sh/)** - Fast JavaScript runtime and package manager
- **[Playwright](https://playwright.dev/)** - Browser automation and testing
- **[axe-core](https://github.com/dequelabs/axe-core)** - Industry-standard accessibility testing engine
- **[Commander.js](https://github.com/tj/commander.js)** - CLI framework
- **[Biome](https://biomejs.dev/)** - Fast linter and formatter
- **[Chalk](https://github.com/chalk/chalk)** - Terminal string styling
- **[Ora](https://github.com/sindresorhus/ora)** - Elegant terminal spinners

## 🧪 Testing & Quality

- **Comprehensive test suite** with unit and integration tests
- **Biome linting** with strict TypeScript rules
- **CI/CD pipeline** with GitHub Actions
- **Type safety** with no `any` types
- **Coverage analysis** and reporting

## 📦 NPM Package

The publishable package is **`reach`** in `packages/reach`. Publish from that directory (e.g. `npm publish` from `packages/reach` after building). Built for **Bun**; includes binary `reach` and `dist/`, README, LICENSE.

## ⚖️ Legal Compliance Note

⚠️ **Important**: This automated tool catches ~30-50% of accessibility issues. For full ADA compliance protection, consider:

- Professional accessibility audit
- Manual testing with screen readers
- User testing with people with disabilities
- Legal consultation for your jurisdiction

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Run tests and linting: `bun test && bun run lint`
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
