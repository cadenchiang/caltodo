/**
 * Unit tests for the shared image-compression helper used by
 * scripts/compress-landing-images.mjs and scripts/compress-app-images.mjs.
 *
 * Covers the pure pieces (`formatSavings`, `parseTarget`) plus the target
 * tables the scripts actually declare, so a typo in a filename or a width
 * regression is caught by `npm test` rather than by a broken image in prod.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { formatSavings, parseTarget } from "../../scripts/lib/compress-image.mjs";

const ROOT = resolve(__dirname, "..", "..");

describe("formatSavings", () => {
  it("reports the percentage saved", () => {
    expect(formatSavings("logo.png", 1024 * 100, 1024 * 25)).toBe("logo.png: 100KB → 25KB (-75.0%)");
  });

  it("reports 0% when nothing was saved", () => {
    expect(formatSavings("a.png", 2048, 2048)).toBe("a.png: 2KB → 2KB (-0.0%)");
  });

  it("reports a negative saving when the output grew", () => {
    expect(formatSavings("a.png", 1024, 2048)).toContain("-100.0%");
  });

  it("throws on a zero-byte source rather than reporting NaN", () => {
    expect(() => formatSavings("a.png", 0, 0)).toThrow(/before size is 0/);
  });

  it.each([
    ["negative before", -1, 10],
    ["negative after", 10, -1],
    ["NaN before", NaN, 10],
    ["Infinite after", 10, Infinity],
  ])("throws on %s", (_label, before, after) => {
    expect(() => formatSavings("a.png", before, after)).toThrow(TypeError);
  });
});

describe("parseTarget", () => {
  it("accepts a well-formed target", () => {
    expect(parseTarget(["logo.png", 512])).toEqual({ filename: "logo.png", maxWidth: 512 });
  });

  it.each([
    ["a non-array", "logo.png"],
    ["a wrong-length tuple", ["logo.png"]],
    ["an empty filename", ["", 512]],
    ["a non-png", ["logo.jpg", 512]],
    ["a zero width", ["logo.png", 0]],
    ["a negative width", ["logo.png", -10]],
    ["a fractional width", ["logo.png", 51.5]],
    ["a string width", ["logo.png", "512"]],
  ])("rejects %s", (_label, target) => {
    expect(() => parseTarget(target)).toThrow(TypeError);
  });
});

/**
 * Read the `TARGETS` table out of a compression script by evaluating just
 * that array literal. Keeps the test honest about what the script will
 * actually do without importing sharp or running any I/O.
 */
function readTargets(scriptPath: string): Array<[string, number]> {
  const source = readFileSync(resolve(ROOT, scriptPath), "utf8");
  const match = source.match(/const TARGETS = (\[[\s\S]*?\n\]);/);
  if (!match) throw new Error(`No TARGETS array found in ${scriptPath}`);
  // The literal contains only strings, numbers and comments.
  return JSON.parse(match[1].replace(/\/\/[^\n]*/g, "").replace(/,(\s*])/g, "$1"));
}

describe.each([
  ["scripts/compress-landing-images.mjs"],
  ["scripts/compress-app-images.mjs"],
])("%s TARGETS", (scriptPath) => {
  const targets = readTargets(scriptPath);

  it("declares at least one target", () => {
    expect(targets.length).toBeGreaterThan(0);
  });

  it("declares only valid targets", () => {
    for (const target of targets) {
      expect(() => parseTarget(target)).not.toThrow();
    }
  });

  it("points every target at a file that exists in public/", () => {
    for (const [filename] of targets) {
      expect(existsSync(resolve(ROOT, "public", filename)), `public/${filename} is missing`).toBe(true);
    }
  });

  it("lists each file at most once", () => {
    const names = targets.map(([name]) => name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("app image budget", () => {
  const targets = readTargets("scripts/compress-app-images.mjs");

  /**
   * The whole point of the compression pass: these app-shell images sit on
   * the authenticated critical path, and `empty-task-illustration.png` was
   * measured as the LCP element of /app/inbox. Lock in a ceiling so a future
   * asset drop cannot silently reintroduce a ~1MB LCP image.
   */
  it.each(targets)("keeps public/%s under its byte budget", (filename) => {
    const budgets: Record<string, number> = {
      "empty-task-illustration.png": 40 * 1024,
      "bcourses-logo.png": 20 * 1024,
      "canvas-logo.png": 20 * 1024,
      "login-bear.png": 200 * 1024,
      "logo.png": 96 * 1024,
    };
    const budget = budgets[filename];
    expect(budget, `no budget declared for ${filename}`).toBeDefined();
    const size = readFileSync(resolve(ROOT, "public", filename)).byteLength;
    expect(size, `public/${filename} is ${(size / 1024).toFixed(0)}KB`).toBeLessThanOrEqual(budget);
  });

  /**
   * scripts/sync-logo.mjs raw-copies public/logo.png into pwa-icon-512.png,
   * so shrinking the master below 512px would silently degrade the PWA
   * install icon. Guard the invariant that couples those two scripts.
   */
  it("keeps logo.png at >= 512px wide for the PWA icon pipeline", () => {
    const logo = targets.find(([name]) => name === "logo.png");
    expect(logo, "logo.png should be a compression target").toBeDefined();
    expect(logo![1]).toBeGreaterThanOrEqual(512);
  });
});
