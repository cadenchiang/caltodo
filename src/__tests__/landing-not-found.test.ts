/**
 * Tests for the branded 404 and the slug routes that feed it: unknown
 * /guides/* and /for/* slugs 404 at the routing layer (dynamicParams=false)
 * so no page code, metadata, or JSON-LD script runs on the not-found path;
 * the 404 itself renders inside the landing shell with links home and to
 * the guides. Also pins the title suffix and the /for copy.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { buttonClasses } from "@/components/ui/button-recipe";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => readFileSync(path.join(ROOT, rel), "utf8");
const notFound = read("src/app/not-found.tsx");
const guide = read("src/app/(landing)/guides/[slug]/page.tsx");
const school = read("src/app/(landing)/for/[slug]/page.tsx");

describe("not-found page", () => {
  it("lives at the root, inside the landing shell, and links home and to the guides", () => {
    expect(notFound).toContain("<LandingShell>");
    expect(notFound).toContain('<Link href="/"');
    expect(notFound).toContain('<Link href="/guides"');
    expect(notFound).toContain('title: "Page not found"');
    expect(notFound).toContain("robots: { index: false, follow: false }");
  });

  it("styles its links through the server-safe button recipe", () => {
    expect(notFound).toContain('import { buttonClasses } from "@/components/ui/button-recipe"');
    expect(buttonClasses("inverted", "lg")).toContain("bg-gray-900");
    expect(read("src/components/ui/button-recipe.ts").startsWith('"use client"')).toBe(false);
    expect(read("src/components/ui/Button.tsx")).toContain('from "@/components/ui/button-recipe"');
  });
});

describe("slug routes", () => {
  it("refuse unknown slugs at the routing layer", () => {
    expect(guide).toContain("export const dynamicParams = false;");
    expect(school).toContain("export const dynamicParams = false;");
    expect(guide).toContain("export function generateStaticParams()");
    expect(school).toContain("export function generateStaticParams()");
  });

  it("keep JSON-LD only on the guide page, which no longer renders on 404", () => {
    expect(guide).toContain('type="application/ld+json"');
    expect(notFound).not.toContain("ld+json");
  });

  it("do not claim submission status on the calendar-feed path", () => {
    expect(school).not.toMatch(/submission status/);
  });

  it("use tokens for muted text and the button recipe for the CTA", () => {
    for (const src of [guide, school]) {
      expect(src).not.toMatch(/text-black\/[0-9]+/);
      expect(src).toContain('buttonClasses("inverted", "lg")');
    }
  });
});

describe("page titles", () => {
  it("do not repeat the brand the root template already appends", () => {
    for (const rel of [
      "src/app/(landing)/about/page.tsx",
      "src/app/(landing)/contact/page.tsx",
      "src/app/(landing)/privacy/page.tsx",
      "src/app/(landing)/terms/page.tsx",
      "src/app/login/page.tsx",
    ]) {
      const src = read(rel);
      expect(src, rel).not.toMatch(/title: "[^"]* - caltodo"/);
    }
  });
});
