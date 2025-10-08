# Accessibility Auditor

A lightweight, modular accessibility testing tool built with Bun and axe-core. Perfect for quick accessibility checks and client reporting.

## Quick Start

```bash
# Install dependencies
bun install

# Install browsers (one-time setup)
bunx playwright install chromium

# Quick check (minimal output)
bun run index.ts quick https://example.com

# Full audit report
bun run index.ts audit https://example.com

# Save results to JSON file
bun run index.ts audit https://example.com --output json --file results.json
```

## Commands

### `quick <url>`

Fast accessibility check with minimal output - perfect for quick scans.

```bash
bun run index.ts quick https://ebenfeld.tech
```

### `audit <url>`

Full accessibility audit with detailed reporting.

```bash
bun run index.ts audit https://ebenfeld.tech
```

**Options:**

- `--output <format>`: Output format (`console` or `json`)
- `--file <filename>`: Save results to file
- `--timeout <ms>`: Timeout in milliseconds (default: 30000)

## What It Tests

This tool runs axe-core with WCAG 2.1 AA standards, checking for:

- **Color contrast** issues
- **Keyboard navigation** problems
- **Screen reader** compatibility
- **Focus management** issues
- **Alt text** for images
- **Form labels** and accessibility
- **Heading structure** problems
- **ARIA** implementation issues
- And 20+ other accessibility checks

## Legal Compliance Note

⚠️ **Important**: This automated tool catches ~30-50% of accessibility issues. For full ADA compliance protection, consider:

- Professional accessibility audit
- Manual testing with screen readers
- User testing with people with disabilities
- Legal consultation for your jurisdiction

## Architecture

The tool is built with a modular architecture:

- `src/core/auditor.ts` - Main testing engine
- `src/core/types.ts` - Type definitions
- `src/reporters/` - Output formatters (console, JSON)
- `index.ts` - CLI interface

## Future Extensions

The modular design allows for easy plugin development:

- Additional testing engines
- Custom reporting formats
- Integration with CI/CD pipelines
- Manual testing checklists
- Performance impact analysis

## Example Output

```
🔍 Accessibility Audit Report
══════════════════════════════════════════════════
URL: https://ebenfeld.tech
Timestamp: 10/7/2025, 8:05:50 PM

📊 Summary:
  ✅ 19 checks passed
  ✅ 19 checks passed

✅ No accessibility violations found!
```

## Built With

- [Bun](https://bun.sh/) - Fast JavaScript runtime
- [Playwright](https://playwright.dev/) - Browser automation
- [axe-core](https://github.com/dequelabs/axe-core) - Accessibility testing engine
- [Commander.js](https://github.com/tj/commander.js) - CLI framework
