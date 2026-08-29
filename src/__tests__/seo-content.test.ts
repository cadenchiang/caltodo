/**
 * Tests for the generated SEO content collections.
 *
 * Guards the properties that make these pages indexable rather than thin:
 * unique slugs, present and length-bounded metadata, real per-school Canvas
 * hosts, and complete sitemap coverage of both registries.
 */

import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import { GUIDES, getGuide } from "@/lib/seo/guides";
import { SCHOOLS, getSchool } from "@/lib/seo/schools";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe("guides registry", () => {
  it("publishes at least one guide", () => {
    expect(GUIDES.length).toBeGreaterThan(0);
  });

  it("has unique, URL-safe slugs", () => {
    const slugs = GUIDES.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(SLUG);
  });

  it("gives every guide a title and a description within SERP limits", () => {
    for (const g of GUIDES) {
      expect(g.title.length).toBeGreaterThan(0);
      expect(g.title.length).toBeLessThanOrEqual(70);
      expect(g.description.length).toBeGreaterThan(50);
      expect(g.description.length).toBeLessThanOrEqual(165);
    }
  });

  it("dates every guide as a valid ISO day", () => {
    for (const g of GUIDES) {
      expect(g.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(new Date(g.updated).getTime())).toBe(false);
    }
  });

  it("gives every guide real body content", () => {
    for (const g of GUIDES) {
      expect(g.intro.length).toBeGreaterThan(80);
      expect(g.sections.length).toBeGreaterThanOrEqual(3);
      for (const s of g.sections) {
        expect(s.heading.length).toBeGreaterThan(0);
        expect(s.body.length).toBeGreaterThan(0);
        for (const p of s.body) expect(p.length).toBeGreaterThan(40);
      }
    }
  });

  it("resolves known slugs and rejects unknown ones", () => {
    expect(getGuide(GUIDES[0].slug)).toBe(GUIDES[0]);
    expect(getGuide("not-a-guide")).toBeUndefined();
  });
});

describe("schools registry", () => {
  it("has unique, URL-safe slugs", () => {
    const slugs = SCHOOLS.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(SLUG);
  });

  it("gives every school a distinct Canvas host", () => {
    const hosts = SCHOOLS.map((s) => s.canvasHost);
    expect(new Set(hosts).size).toBe(hosts.length);
  });

  it("uses bare hostnames, not URLs", () => {
    for (const s of SCHOOLS) {
      expect(s.canvasHost).toMatch(/^[a-z0-9.-]+\.[a-z.]{2,}$/);
      expect(s.canvasHost).not.toContain("/");
      expect(s.canvasHost).not.toContain(":");
    }
  });

  it("names every school", () => {
    for (const s of SCHOOLS) expect(s.name.trim().length).toBeGreaterThan(1);
  });

  it("resolves known slugs and rejects unknown ones", () => {
    expect(getSchool(SCHOOLS[0].slug)).toBe(SCHOOLS[0]);
    expect(getSchool("not-a-school")).toBeUndefined();
  });
});

describe("sitemap covers generated routes", () => {
  const urls = sitemap().map((e) => e.url);

  it("lists the guides index", () => {
    expect(urls).toContain("https://caltodo.me/guides");
  });

  it("lists every guide", () => {
    for (const g of GUIDES) {
      expect(urls).toContain(`https://caltodo.me/guides/${g.slug}`);
    }
  });

  it("lists every school", () => {
    for (const s of SCHOOLS) {
      expect(urls).toContain(`https://caltodo.me/for/${s.slug}`);
    }
  });

  it("still contains no duplicates once generated routes are merged", () => {
    expect(new Set(urls).size).toBe(urls.length);
  });
});
