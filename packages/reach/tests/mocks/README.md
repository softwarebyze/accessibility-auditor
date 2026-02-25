# Test Mocks

This directory contains utilities for testing the accessibility auditor without making real network calls. The browser and axe-core analysis are still real - only the network layer is mocked.

## Approach

Instead of fully mocking axe-core results, this system:

1. **Caches HTML content** for specific URLs
2. **Uses real browsers** (Playwright) to load the cached content
3. **Runs real axe-core analysis** on the cached HTML
4. **Generates authentic results** without network dependencies

This gives you **real accessibility testing** on **predictable content**.

## Structure

```
tests/mocks/
├── html/                    # Cached HTML pages for testing
│   ├── valid-page.html      # Accessible page with no violations
│   ├── violations-page.html # Page with multiple accessibility issues
│   └── simple-page.html     # Minimal page with just missing lang attribute
├── network-cache.ts         # NetworkCache class for URL -> HTML mapping
├── testable-auditor.ts      # TestableAccessibilityAuditor with cache support
└── README.md               # This file
```

## Available Mock Scenarios

### `VALID_PAGE`

- **Description**: A well-structured, accessible page
- **Violations**: 0
- **Features**: Proper headings, alt text, form labels, skip links, lang attribute
- **Use case**: Testing successful audits, baseline functionality

### `VIOLATIONS_PAGE`

- **Description**: Page with multiple accessibility issues
- **Violations**: 7 (critical, serious, and moderate)
- **Issues**: Missing alt text, unlabeled forms, poor contrast, empty links, missing lang attribute
- **Use case**: Testing violation detection and processing

### `SIMPLE_PAGE`

- **Description**: Minimal page with one violation
- **Violations**: 1 (missing lang attribute)
- **Use case**: Testing basic functionality, simple scenarios

## Usage

### Basic Network-Cached Testing

```typescript
import { createTestAuditor } from "./mocks/testable-auditor.js";

const auditor = createTestAuditor();

// These use cached HTML files instead of network requests
const result1 = await auditor.audit("https://example.com"); // simple-page.html
const result2 = await auditor.audit("https://www.google.com"); // valid-page.html
const result3 = await auditor.audit("https://bad-site.com"); // violations-page.html

// Still gets real axe-core analysis results!
```

### Custom HTML Content

```typescript
import { NetworkCache, TestableAccessibilityAuditor } from "./mocks/index.js";

const cache = new NetworkCache();
const auditor = new TestableAccessibilityAuditor(cache);

// Set custom HTML for testing
cache.setPage(
  "https://my-app.com",
  `
  <!DOCTYPE html>
  <html lang="en">
  <body>
    <img src="test.jpg"> <!-- Missing alt - will be detected by axe-core -->
    <h1>My Test Page</h1>
  </body>
  </html>
`
);

const result = await auditor.audit("https://my-app.com");
// Gets real violations from axe-core analysis
```

### Loading from Files

```typescript
const cache = new NetworkCache();
cache.loadPageFromFile("https://test.com", "my-test-page.html");

const auditor = new TestableAccessibilityAuditor(cache);
const result = await auditor.audit("https://test.com");
```

## Benefits of Network Caching

1. **Speed**: No network latency or external site dependencies
2. **Reliability**: Consistent HTML content that doesn't change unexpectedly
3. **Offline**: Tests work without internet connection
4. **Real Analysis**: Still uses real axe-core engine for authentic results
5. **Controlled Content**: Test specific accessibility scenarios with known HTML
6. **Debugging**: Predictable content makes issues easier to reproduce

## Adding New Mock Scenarios

1. Create an HTML file in `html/` directory
2. Create corresponding axe-core results in `axe-results/`
3. Add the scenario to `MockScenarios` constant in `index.ts`
4. Update the mock data utilities as needed

### Example: Adding a new scenario

```typescript
// 1. Add to MockScenarios
export const MockScenarios = {
  // ... existing scenarios
  NEW_SCENARIO: "new-scenario",
} as const;

// 2. Create html/new-scenario.html
// 3. Create axe-results/new-scenario.json
// 4. Use in tests
auditor.setupMockScenario("https://test.com", MockScenarios.NEW_SCENARIO);
```

## Real vs Network-Cached Tests

- Use **network-cached tests** for reliable, fast testing with real axe-core analysis
- Use **real network tests** for integration testing and verifying live site behavior
- **Network caching** gives you the best of both: real accessibility analysis on predictable content
