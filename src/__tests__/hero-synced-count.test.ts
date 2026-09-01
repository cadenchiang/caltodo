/**
 * Tests for the hero's rolling "N assignments synced" counter.
 *
 * The animation itself needs a browser, and this suite runs under the node
 * environment, so these guard the properties that made it janky in the first
 * place by parsing the source: the reserved width that stops the centred line
 * reflowing, the roll timing that keeps the digits part of the eyebrow's
 * entrance rather than a separate motion after it, the baseline alignment that
 * keeps them sitting on the same line as the surrounding words, and the
 * reduced-motion escape hatch.
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

  it("rolls as part of the entrance, not after it", () => {
    // Starting once the eyebrow had settled left the number still spinning
    // long after the rest of the page had come to rest, which read as a
    // second, unrelated animation bolted on.
    expect(rollStart).toBe(eyebrowDelay);
  });

  it("lands the number before the line stops moving", () => {
    // So the entrance finishes on a figure that is already still, rather than
    // handing over to another motion.
    const travel = Number(counter.match(/ROLL_TIMING = \{\s*duration: (\d+)/)?.[1]);
    expect(travel).toBeGreaterThan(0);
    expect(rollStart + travel).toBeLessThanOrEqual(eyebrowDelay + fadeDuration);
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
  it("aligns the digits to the sentence by baseline, not by box top", () => {
    // The previous attempt laid the digits over the sizer with
    // `absolute top-0`, which lines up the two *boxes*. number-flow's box is
    // not the text's box: it forces `line-height: 1` on itself and pads each
    // digit by half its fade mask, so anchoring at the top left the figure
    // sitting 2.5px below the words at 18px/28px (measured in Chromium).
    // Grid baseline alignment lets the browser do the metrics instead, which
    // holds at any font size or zoom.
    expect(counter).toContain('<span className="inline-grid align-baseline font-semibold tabular-nums">');
    expect(counter).not.toMatch(/className="[^"]*\babsolute\b/);
    expect(counter).not.toMatch(/className="[^"]*\btop-0\b/);
  });

  it("stacks the sizer and the digits in one grid cell", () => {
    // Both in cell 1/1 so the sizer reserves the final width without the
    // digits contributing any of their own — that reservation is what stops
    // the centred line reflowing as digits are added.
    expect(counter.match(/\[grid-area:1\/1\]/g)?.length).toBe(2);
    expect(counter.match(/self-baseline/g)?.length).toBe(2);
  });

  it("anchors the digits to the left edge of the reserved width", () => {
    // Right-aligning parked a lone "0" at the far end of a box sized for the
    // final figure, leaving a gap mid-sentence for the whole entrance.
    expect(counter).not.toContain("justify-self-end");
    expect(counter).toContain("justify-self-start");
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
    // Differing weight or figure width would make the reservation wrong. Both
    // now inherit from the shared wrapper rather than repeating the classes.
    expect(counter.match(/font-semibold tabular-nums/g)?.length).toBeGreaterThanOrEqual(2);
  });
});

describe("SyncedCount motion preferences", () => {
  it("asks the library whether it may animate at all", () => {
    expect(counter).toContain("useCanAnimate");
    expect(counter).toContain("const canAnimate = useCanAnimate()");
  });

  it("never schedules a roll it cannot play", () => {
    expect(counter).toMatch(/if \(count <= 0 \|\| !canAnimate\) return;/);
  });

  it("shows the figure immediately instead of holding a zero", () => {
    // Rendered straight from `count`, not from the rolling state, so there is
    // no window where a reduced-motion viewer sees a placeholder "0".
    expect(counter).toMatch(
      /if \(!canAnimate\) \{\s*return <span[^>]*>\{formatted\}<\/span>;\s*\}/
    );
    expect(counter).toContain("const formatted = count.toLocaleString(LOCALE)");
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
