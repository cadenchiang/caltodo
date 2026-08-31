/**
 * Guards the static-asset caching rules added to next.config.ts.
 *
 * A DevTools trace of /app/inbox showed every file served out of public/
 * carrying Vercel's default `cache-control: public, max-age=0,
 * must-revalidate`. That defeats the browser's in-memory cache (the same
 * image was requested twice inside one page load) and forces a 304 round
 * trip per asset on every repeat visit.
 *
 * These tests read next.config.ts as source rather than importing it: the
 * config imports @serwist/next and @next/bundle-analyzer, which pull in the
 * webpack toolchain and are far too heavy for a unit test.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const CONFIG = readFileSync(resolve(__dirname, "..", "..", "next.config.ts"), "utf8");

/** Extract the Cache-Control value declared for the static-asset route. */
function staticAssetCacheControl(): string {
  const match = CONFIG.match(/source:\s*"\/:path\*\.:ext\(([^)]+)\)"[\s\S]*?value:\s*\n?\s*"([^"]+)"/);
  if (!match) throw new Error("No static-asset Cache-Control rule found in next.config.ts");
  return match[2];
}

/** Extract the extension list the static-asset rule matches on. */
function matchedExtensions(): string[] {
  const match = CONFIG.match(/source:\s*"\/:path\*\.:ext\(([^)]+)\)"/);
  if (!match) throw new Error("No static-asset header rule found in next.config.ts");
  return match[1].split("|");
}

describe("static asset Cache-Control", () => {
  it("declares a rule for public/ static files", () => {
    expect(() => staticAssetCacheControl()).not.toThrow();
  });

  it("is publicly cacheable", () => {
    expect(staticAssetCacheControl()).toMatch(/\bpublic\b/);
  });

  it("caches for at least a day so the browser can reuse its in-memory copy", () => {
    const maxAge = Number(staticAssetCacheControl().match(/max-age=(\d+)/)?.[1]);
    expect(Number.isFinite(maxAge)).toBe(true);
    expect(maxAge).toBeGreaterThanOrEqual(86_400);
  });

  it("does not use must-revalidate, which is what forced the 304 per asset", () => {
    expect(staticAssetCacheControl()).not.toMatch(/must-revalidate/);
  });

  /**
   * public/ filenames are not content-hashed and scripts/sync-logo.mjs
   * rewrites brand art in place, so `immutable` would strand users on a
   * stale logo for the full max-age with no way to recover.
   */
  it("does not mark unhashed public/ assets immutable", () => {
    expect(staticAssetCacheControl()).not.toMatch(/immutable/);
  });

  it("pairs the max-age with stale-while-revalidate so swapped art still propagates", () => {
    const swr = Number(staticAssetCacheControl().match(/stale-while-revalidate=(\d+)/)?.[1]);
    expect(Number.isFinite(swr)).toBe(true);
    expect(swr).toBeGreaterThan(0);
  });

  it.each(["png", "jpg", "webp", "svg", "ico", "woff2"])("matches .%s files", (ext) => {
    expect(matchedExtensions()).toContain(ext);
  });

  /**
   * The security headers were already there and apply to every route. The
   * caching rule must not have displaced them.
   */
  it.each(["X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy"])(
    "still sends the %s security header",
    (header) => {
      expect(CONFIG).toContain(header);
    },
  );
});

describe("next/image cache TTL", () => {
  it("raises minimumCacheTTL above the 1-day default", () => {
    const ttl = Number(CONFIG.match(/minimumCacheTTL:\s*(\d+)/)?.[1]);
    expect(Number.isFinite(ttl), "minimumCacheTTL should be set in next.config.ts").toBe(true);
    expect(ttl).toBeGreaterThan(86_400);
  });
});
