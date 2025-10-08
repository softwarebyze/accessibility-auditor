# Accessibility Auditor

A comprehensive, enterprise-grade accessibility testing tool built with Bun and axe-core. Features advanced reporting, audit history tracking, MCP server support, and detailed coverage analysis.

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Install browsers (one-time setup)
bun run install-browsers

# Quick check (minimal output)
bun run dev quick https://example.com

# Full audit report with coverage analysis
bun run dev audit https://example.com

# Save results to JSON file
bun run dev audit https://example.com --output json --file results.json

# Crawl and audit an entire site
bun run dev crawl https://example.com --max-pages 25

# View audit history
bun run dev history

# Clear audit history
bun run dev history --clear
```

## 🤝 Working with Clients

1. **Run a crawl-based audit** – `bun run dev crawl https://client-site.com --max-pages 40 --max-depth 2` collects the key pages your client cares about.
2. **Export a shareable report** – Add `--output json --file client-report.json` to generate a deliverable you can email or drop into project tooling.
3. **Review highlights together** – Use the console output (or rerun with `--verbose`) to walk stakeholders through critical violations and quick wins.
4. **Track follow-up progress** – Re-run the crawl after fixes land; compare the new JSON against history and include the trendlines from `bun run dev history` in your status updates.
5. **Bundle recommendations** – Pair automated findings with manual testing notes so clients understand where human review is still required.

## 📋 Commands

### `quick <url>`

Fast accessibility check with minimal output - perfect for quick scans.

```bash
bun run dev quick https://ebenfeld.tech
```

**Output:**

```
✅ https://ebenfeld.tech - No violations found
```

### `audit <url>`

Full accessibility audit with comprehensive reporting including coverage analysis.

```bash
bun run dev audit https://ebenfeld.tech
```

**Options:**

- `--output <format>`: Output format (`console` or `json`)
- `--file <filename>`: Save results to file
- `--timeout <ms>`: Timeout in milliseconds (default: 30000)

### `history`

View audit history and statistics.

```bash
# View recent audits
bun run dev history

# View more entries
bun run dev history --limit 20

# Clear history
bun run dev history --clear
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

### Under the Hood (`src/core/auditor.ts`)

When you run `bun run dev audit <url>`, the [`AccessibilityAuditor`](./src/core/auditor.ts) class orchestrates the entire flow:

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

The tool features a modern, modular architecture:

```
src/
├── core/
│   ├── auditor.ts          # Main testing engine
│   ├── types.ts            # Type definitions
│   ├── history.ts          # Audit history tracking
│   └── axe-coverage.ts     # Coverage analysis
├── reporters/
│   ├── console.ts          # Enhanced console reporting
│   ├── json.ts             # JSON output
│   └── crawl.ts            # Multi-page crawl reporting
├── mcp/
│   ├── server.ts           # MCP server implementation
│   └── index.ts            # MCP entry point
└── tests/                  # Comprehensive test suite
```

## 🔧 Development

### Testing

The project includes comprehensive testing with both real browser tests and fast mock-based tests:

```bash
# Run all tests (includes slow browser tests)
bun test

# Run only fast tests (mocks, unit tests)
bun run test:fast

# Run specific test file
bun test tests/auditor-mock.test.ts

# Run integration tests
bun run test:integration
```

**Mock Testing System:**

- Fast, reliable tests without browser dependencies
- Predefined scenarios for different accessibility conditions
- Easy to extend with custom test cases
- See `tests/mocks/README.md` for detailed usage

### Code Quality

```bash
# Run linting
bun run lint

# Fix linting issues
bun run lint:fix

# Format code
bun run format

# Build for production
bun run build
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

All audits are automatically saved to `/tmp/a11y-audit-history/` with:

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

🔍 Coverage & Confidence Report:

🔍 Axe-Core Accessibility Coverage Report
══════════════════════════════════════════════════

✅ Verified Checks: 10/25
📊 Estimated Coverage: 85%
🎯 WCAG Level: WCAG 2.1 AA

✅ VERIFIED CHECKS (Tested & Working):
------------------------------
🔴 image-alt: Images must have alternative text
   WCAG: 1.1.1
   Note: Detects missing alt attributes on img elements

🔴 label: Form elements must have labels
   WCAG: 1.3.1, 2.4.6, 3.3.2
   Note: Detects form controls without proper labels

💡 CONFIDENCE LEVEL: HIGH
   Axe-core is a mature, widely-used accessibility testing engine
   that covers the most critical WCAG 2.1 AA requirements.
   Results are reliable for the issues it detects.

⚠️  IMPORTANT LIMITATIONS:
   • Professional accessibility audit
   • Manual testing with screen readers
   • User testing with people with disabilities
   • Legal consultation for your jurisdiction
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

Ready for npm publication with:

- **Binary executable** (`a11y-audit`)
- **TypeScript definitions**
- **Bun runtime requirement**
- **Proper file inclusion**

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
