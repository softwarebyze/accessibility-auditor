import { describe, expect, it } from 'vitest';
import { hasBunWebView, requestedEngine, resolveChromePath } from '../src/core/browser/index.js';
import { withTimeout } from '../src/core/browser/timeout.js';

describe('browser engine selection', () => {
  it('detects Bun.WebView only when the Bun global exposes it', () => {
    const bun = (globalThis as { Bun?: { WebView?: unknown } }).Bun;
    expect(hasBunWebView()).toBe(typeof bun?.WebView === 'function');
  });

  it('parses REACH_ENGINE overrides', () => {
    const previous = process.env.REACH_ENGINE;
    try {
      process.env.REACH_ENGINE = '';
      expect(requestedEngine()).toBeUndefined();

      process.env.REACH_ENGINE = 'puppeteer';
      expect(requestedEngine()).toBe('puppeteer');

      process.env.REACH_ENGINE = 'webview';
      expect(requestedEngine()).toBe('webview');
    } finally {
      if (previous === undefined) process.env.REACH_ENGINE = '';
      else process.env.REACH_ENGINE = previous;
    }
  });

  it('finds a Chrome-family binary on this machine or returns null', () => {
    const path = resolveChromePath();
    if (path) {
      expect(path.length).toBeGreaterThan(0);
    } else {
      expect(path).toBeNull();
    }
  });
});

describe('withTimeout', () => {
  it('resolves when the work finishes in time', async () => {
    await expect(withTimeout(Promise.resolve('ok'), 100, 'nope')).resolves.toBe('ok');
  });

  it('rejects when the work exceeds the timeout', async () => {
    await expect(
      withTimeout(new Promise((resolve) => setTimeout(resolve, 50)), 5, 'too slow')
    ).rejects.toThrow('too slow');
  });
});
