import { describe, expect, it } from "bun:test";
import { SiteCrawler } from "../src/core/crawler.js";
import { SiteAuditRunner } from "../src/core/site-audit.js";
import { type MockResponse, createMockFetch } from "./helpers/mock-fetch.js";
import { MockAccessibilityAuditor } from "./mocks/mock-auditor.js";

function createRunner(
  responses: Record<string, MockResponse>,
  auditor: MockAccessibilityAuditor
) {
  const crawlerFactory = () => new SiteCrawler(createMockFetch(responses));
  const auditorFactory = () => auditor;
  return new SiteAuditRunner(crawlerFactory, auditorFactory);
}

describe("SiteAuditRunner", () => {
  it("should crawl and audit discovered pages", async () => {
    const responses: Record<string, MockResponse> = {
      "https://example.com/": {
        status: 200,
        statusText: "OK",
        body: `
          <html>
            <body>
              <a href="/about">About</a>
              <a href="/contact">Contact</a>
            </body>
          </html>
        `,
      },
      "https://example.com/about": {
        status: 200,
        statusText: "OK",
        body: "<html><body>About</body></html>",
      },
      "https://example.com/contact": {
        status: 200,
        statusText: "OK",
        body: "<html><body>Contact</body></html>",
      },
    };

    const auditor = new MockAccessibilityAuditor();
    auditor.setupMockScenario("https://example.com/", "simple-page");
    auditor.setupMockScenario("https://example.com/about", "valid-page");
    auditor.setupMockScenario("https://example.com/contact", "violations-page");

    const runner = createRunner(responses, auditor);
    const result = await runner.run("https://example.com", {
      maxDepth: 1,
      maxPages: 10,
    });

    expect(result.crawl.pages).toEqual([
      "https://example.com/",
      "https://example.com/about",
      "https://example.com/contact",
    ]);
    expect(result.summary.totalPages).toBe(3);
    expect(result.summary.successes).toBe(3);
    expect(result.summary.failures).toBe(0);
    expect(result.summary.totalViolations).toBeGreaterThanOrEqual(0);
  });

  it("should capture audit failures without stopping the run", async () => {
    const responses: Record<string, MockResponse> = {
      "https://example.com/": {
        status: 200,
        statusText: "OK",
        body: `
          <html>
            <body>
              <a href="/missing">Missing</a>
            </body>
          </html>
        `,
      },
      "https://example.com/missing": {
        status: 200,
        statusText: "OK",
        body: "<html><body>Missing</body></html>",
      },
    };

    const auditor = new MockAccessibilityAuditor();
    auditor.setupMockScenario("https://example.com/", "simple-page");
    // Intentionally omit scenario for /missing to trigger failure

    const runner = createRunner(responses, auditor);
    const result = await runner.run("https://example.com");

    expect(result.summary.totalPages).toBe(2);
    expect(result.summary.successes).toBe(1);
    expect(result.summary.failures).toBe(1);
    expect(result.audits).toHaveLength(2);

    const failure = result.audits.find((item) => item.status === "error");
    expect(failure).toBeDefined();
    expect(failure?.url).toBe("https://example.com/missing");
  });
});
