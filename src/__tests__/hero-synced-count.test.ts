/**
 * Tests for the hero's rolling "N assignments synced" counter.
 *
 * The animation itself needs a browser, and this suite runs under the node
 * environment, so these guard the properties that made it janky in the first
 * place by parsing the source: the reserved width that stops the centred line
 * reflowing, the roll start that stops it overlapping the eyebrow's fade-up,
 * and the reduced-motion escape hatch.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const COUNTER = path.join(ROOT, "src/components/landing/SyncedCount.tsx");
const HERO = path.join(ROOT, "src/components/landing/Hero.tsx");
const CSS = path.join(ROOT, "src/app/globals.css");

const counter = fs.readFileSync(COUNTER, "utf8");
const hero = fs.readFileSync(HERO, "utf8");
const css = fs.readFileSync(CSS, "utf8");

describe("SyncedCount roll timing", () => {
  /**
   * The `animationDelay` on the eyebrow <p> that wraps the counter. Scoped to
   * the last delay declared before <SyncedCount>, since Hero staggers several
   * elements and a file-wide match would pick up an unrelated one.
   */
  const delaysBeforeCounter = [
    ...hero
      .slice(0, hero.indexOf("<SyncedCount"))
      .matchAll(/animationDelay:\s*"(\d+)ms"/g),
  ];
  const eyebrowDelay = Number(
    delaysBeforeCounter.at(-1)?.[1] ?? NaN
  );
  /** Duration of the `.animate-fade-up` keyframe the eyebrow uses. */
  const fadeDuration = Number(
    css
      .match(/\.animate-fade-up\s*\{[^}]*animation-duration:\s*(\d+)ms/)?.[1] ??
      NaN
  );
  const rollStart = Number(counter.match(/ROLL_START_MS = (\d+)/)?.[1] ?? NaN);

  it("reads a real delay off the eyebrow and a real fade duration off the CSS", () => {
    expect(eyebrowDelay).toBe(1000);
    expect(fadeDuration).toBe(900);
  });

  it("starts the roll only after the eyebrow has finished entering", () => {
    expect(rollStart).toBeGreaterThanOrEqual(eyebrowDelay + fadeDuration);
  });

  it("does not stall the number long after the entrance", () => {
    expect(rollStart).toBeLessThanOrEqual(eyebrowDelay + fadeDuration + 400);
  });

  it("fades digits faster than it travels them, so they do not smear", () => {
    const travel = Number(counter.match(/ROLL_TIMING = \{\s*duration: (\d+)/)?.[1]);
    const fade = Number(counter.match(/FADE_TIMING = \{ duration: (\d+)/)?.[1]);
    expect(travel).toBeGreaterThan(0);
    expect(fade).toBeGreaterThan(0);
    expect(fade).toBeLessThan(travel);
  });

  it("eases on the same curve as the rest of the landing entrances", () => {
    const pageCurve = css
      .match(/\.animate-fade-up\s*\{[^}]*animation-timing-function:\s*([^;]+);/)?.[1]
      ?.trim();
    expect(pageCurve).toBeTruthy();
    expect(counter).toContain(pageCurve!);
  });
});

describe("SyncedCount layout stability", () => {
  it("stacks a sizer and the number in one grid cell", () => {
    // Both children must land in the same cell, or the sizer would sit beside
    // the digits and double the width instead of reserving it.
    expect(counter.match(/col-start-1 row-start-1/g) ?? []).toHaveLength(2);
    expect(counter).toContain("inline-grid");
  });

  it("hides the sizer from paint and from screen readers", () => {
    expect(counter).toMatch(/aria-hidden="true"[\s\S]{0,120}invisible/);
  });

  it("pins the locale so the sizer and the digits format identically", () => {
    expect(counter).toContain('const LOCALE = "en-US"');
    expect(counter).toContain("locales={LOCALE}");
    expect(counter).toContain("count.toLocaleString(LOCALE)");
  });

  it("gives the sizer and the digits the same type metrics", () => {
    // Differing weight or figure width would make the reservation wrong.
    expect(counter.match(/font-semibold tabular-nums/g)?.length).toBeGreaterThanOrEqual(3);
  });
});

describe("SyncedCount motion preferences", () => {
  it("asks the library whether it may animate at all", () => {
    expect(counter).toContain("useCanAnimate");
    expect(counter).toContain("const canAnimate = useCanAnimate()");
  });

  it("shows the figure immediately instead of holding a zero", () => {
    expect(counter).toMatch(/if \(!canAnimate\) \{\s*setValue\(count\);/);
    expect(counter).toMatch(/if \(!canAnimate\) \{\s*return <span[\s\S]*?\{formatted\}/);
  });
});

describe("Hero wiring", () => {
  it("delegates the counter and keeps no rolling state of its own", () => {
    expect(hero).toContain("<SyncedCount count={assignmentCount} />");
    expect(hero).not.toContain("rolledCount");
    expect(hero).not.toContain("@number-flow/react");
  });

  it("still falls back to the brand name when there is no count", () => {
    expect(hero).toMatch(/assignmentCount > 0 \?/);
    expect(hero).toContain('"Caltodo"');
  });
});
