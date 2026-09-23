/**
 * Tests for root metadata strings.
 *
 * The description is a click-through pitch shown in search results, so its
 * length is bounded on both sides: long enough to say something, short enough
 * that Google does not truncate it around 155 characters.
 *
 * layout.tsx cannot be imported under vitest (it calls next/font at module
 * load, which only runs inside the Next build), so the metadata strings are
 * read from source the same way onboarding-videos.test.ts inspects components.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

/** The em dash, spelled out so this file never contains one itself. */
const EM_DASH = String.fromCharCode(0x2014);

const SOURCE = fs.readFileSync(
  path.join(path.resolve(__dirname, "../.."), "src/app/layout.tsx"),
  "utf8",
);

/** The platform list the share cards interpolate while Classroom is gated. */
const SOURCE_LIST = (SOURCE.match(/: "(Canvas, Gradescope, and Brightspace)";/) ?? [])[1] ?? "";

/**
 * Extracts every `description:` string from layout.tsx in file order,
 * resolving the `${SOURCE_LIST}` template the share cards use.
 *
 * @returns Root, openGraph, and twitter descriptions as written in source.
 */
function descriptions(): string[] {
  return [...SOURCE.matchAll(/description:\s*\n?\s*(?:"((?:[^"\\]|\\.)*)"|`([^`]*)`)/g)].map((m) =>
    (m[1] ?? m[2]).replace("${SOURCE_LIST}", SOURCE_LIST),
  );
}

describe("root metadata", () => {
  const [root, og, twitter] = descriptions();

  it("finds all three description strings", () => {
    expect(descriptions().length).toBeGreaterThanOrEqual(3);
  });

  it("keeps the root description within Google's display limit", () => {
    expect(root.length).toBeGreaterThan(80);
    expect(root.length).toBeLessThanOrEqual(158);
  });

  it("names more than the two original platforms", () => {
    const named = ["canvas", "gradescope", "brightspace", "google classroom"].filter((p) =>
      root.toLowerCase().includes(p),
    );
    expect(named.length).toBeGreaterThanOrEqual(3);
  });

  it("mentions the syllabus path, which no platform keyword covers", () => {
    expect(root.toLowerCase()).toContain("syllabus");
  });

  it("does not sell Google Classroom on the share cards while it is gated", () => {
    expect(SOURCE).toContain("...(CLASSROOM_AVAILABLE ? [\"google classroom planner\"] : [])");
    expect(SOURCE_LIST).not.toMatch(/classroom/i);
    for (const d of [og, twitter]) expect(d.toLowerCase()).not.toContain("classroom");
  });

  it("keeps openGraph and twitter descriptions on the same platform coverage", () => {
    for (const d of [og, twitter]) {
      for (const p of ["canvas", "gradescope", "brightspace"]) {
        expect(d.toLowerCase()).toContain(p);
      }
    }
  });

  it("declares the canonical host", () => {
    expect(SOURCE).toContain('metadataBase: new URL("https://caltodo.me")');
  });
});

describe("viewport", () => {
  it("never blocks pinch zoom", () => {
    // maximumScale: 1 + userScalable: false disabled zoom site-wide (WCAG 1.4.4).
    expect(SOURCE).not.toContain("maximumScale");
    expect(SOURCE).not.toContain("userScalable");
    expect(SOURCE).toContain('viewportFit: "cover"');
  });

  it("keeps the share-card alt text free of em dashes", () => {
    expect(SOURCE).not.toContain(EM_DASH);
  });
});
