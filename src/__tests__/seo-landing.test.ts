/**
 * Tests for landing-page SEO fundamentals.
 *
 * Guards the two on-page signals that are easy to regress silently:
 * the single <h1> on the marketing hero, and the set of public URLs
 * advertised in sitemap.xml.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import sitemap from "@/app/sitemap";

const ROOT = path.resolve(__dirname, "../..");
const HERO = path.join(ROOT, "src/components/landing/Hero.tsx");

describe("landing hero heading", () => {
  const source = fs.readFileSync(HERO, "utf8");

  it("declares exactly one <h1>", () => {
    expect(source.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
  });

  it("closes the <h1> it opens", () => {
    expect(source.match(/<\/h1>/g) ?? []).toHaveLength(1);
  });

  it("does not open an <h2> before the <h1>", () => {
    const h1 = source.indexOf("<h1");
    const h2 = source.indexOf("<h2");
    expect(h1).toBeGreaterThan(-1);
    if (h2 > -1) expect(h2).toBeGreaterThan(h1);
  });
});

describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it("lists every public marketing page", () => {
    for (const p of ["", "/login", "/about", "/contact", "/privacy", "/terms"]) {
      expect(urls).toContain(`https://caltodo.me${p}`);
    }
  });

  it("contains no duplicate URLs", () => {
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("uses absolute https URLs on the canonical host", () => {
    for (const u of urls) expect(u.startsWith("https://caltodo.me")).toBe(true);
  });

  it("excludes authenticated and non-content routes", () => {
    for (const u of urls) {
      expect(u).not.toContain("/app/");
      expect(u).not.toContain("/api/");
      expect(u).not.toContain("/auth/");
      expect(u).not.toContain("/share");
    }
  });

  it("gives every entry a valid priority", () => {
    for (const e of entries) {
      expect(e.priority).toBeGreaterThan(0);
      expect(e.priority).toBeLessThanOrEqual(1);
    }
  });
});
