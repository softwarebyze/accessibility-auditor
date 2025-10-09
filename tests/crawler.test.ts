import { describe, expect, it } from "bun:test";
import { SiteCrawler } from "../src/core/crawler.js";
import { type MockResponse, createMockFetch } from "./helpers/mock-fetch.js";

describe("SiteCrawler", () => {
  it("should discover linked pages within depth and page limits", async () => {
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
        body: `
          <html>
            <body>
              <a href="/team">Team</a>
            </body>
          </html>
        `,
      },
      "https://example.com/contact": {
        status: 200,
        statusText: "OK",
        body: "<html><body>Contact</body></html>",
      },
      "https://example.com/team": {
        status: 200,
        statusText: "OK",
        body: "<html><body>Team</body></html>",
      },
    };

    const crawler = new SiteCrawler(createMockFetch(responses));
    const result = await crawler.crawl("https://example.com", {
      maxDepth: 2,
      maxPages: 10,
    });

    expect(result.pages).toEqual([
      "https://example.com/",
      "https://example.com/about",
      "https://example.com/contact",
      "https://example.com/team",
    ]);
    expect(result.errors).toHaveLength(0);
  });

  it("should skip external domains when sameOrigin is true", async () => {
    const responses: Record<string, MockResponse> = {
      "https://example.com/": {
        status: 200,
        statusText: "OK",
        body: `
          <html>
            <body>
              <a href="https://example.com/about">About</a>
              <a href="https://external.com">External</a>
            </body>
          </html>
        `,
      },
      "https://example.com/about": {
        status: 200,
        statusText: "OK",
        body: "<html><body>About</body></html>",
      },
    };

    const crawler = new SiteCrawler(createMockFetch(responses));
    const result = await crawler.crawl("https://example.com", {
      maxDepth: 1,
      maxPages: 5,
      sameOrigin: true,
    });

    expect(result.pages).toEqual([
      "https://example.com/",
      "https://example.com/about",
    ]);
    expect(result.skipped).toBeGreaterThan(0);
  });

  it("should record errors for failed requests", async () => {
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
        status: 404,
        statusText: "Not Found",
        body: "",
      },
    };

    const crawler = new SiteCrawler(createMockFetch(responses));
    const result = await crawler.crawl("https://example.com");

    expect(result.pages).toContain("https://example.com/");
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.url).toBe("https://example.com/missing");
  });

  it("should obey the maxPages option", async () => {
    const responses: Record<string, MockResponse> = {
      "https://example.com/": {
        status: 200,
        statusText: "OK",
        body: `
          <html>
            <body>
              <a href="/a">A</a>
              <a href="/b">B</a>
              <a href="/c">C</a>
            </body>
          </html>
        `,
      },
      "https://example.com/a": {
        status: 200,
        statusText: "OK",
        body: "<html><body>A</body></html>",
      },
      "https://example.com/b": {
        status: 200,
        statusText: "OK",
        body: "<html><body>B</body></html>",
      },
      "https://example.com/c": {
        status: 200,
        statusText: "OK",
        body: "<html><body>C</body></html>",
      },
    };

    const crawler = new SiteCrawler(createMockFetch(responses));
    const result = await crawler.crawl("https://example.com", {
      maxPages: 2,
      maxDepth: 1,
    });

    expect(result.pages).toEqual([
      "https://example.com/",
      "https://example.com/a",
    ]);
    expect(result.errors).toHaveLength(0);
  });

  it("should treat trailing slash variants as the same page", async () => {
    const responses: Record<string, MockResponse> = {
      "https://example.com/": {
        status: 200,
        statusText: "OK",
        body: `
          <html>
            <body>
              <a href="/profile">Profile</a>
              <a href="/profile/">Profile trailing slash</a>
            </body>
          </html>
        `,
      },
      "https://example.com/profile": {
        status: 200,
        statusText: "OK",
        body: "<html><body>Profile</body></html>",
      },
    };

    const crawler = new SiteCrawler(createMockFetch(responses));
    const result = await crawler.crawl("https://example.com");

    expect(result.pages).toEqual([
      "https://example.com/",
      "https://example.com/profile",
    ]);
    expect(result.skipped).toBeGreaterThan(0);
  });
});
