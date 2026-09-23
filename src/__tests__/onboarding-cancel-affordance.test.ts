/**
 * Tests that cancelling a setup step is quieter than completing it.
 *
 * The Canvas add flow was the one step that paired cancel with Connect as two
 * equal side-by-side buttons, both elevated, so backing out looked exactly as
 * important as connecting. Every other step already used the pattern this
 * pins: a full-width primary action with a plain text link beneath it.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const canvas = read("src/components/onboarding/AddCanvasStep.tsx");
const brightspace = read("src/components/onboarding/BrightspaceStep.tsx");

/** The quiet treatment: a ghost Button, small, beneath the primary. */
const QUIET_CANCEL = '<Button variant="ghost" size="sm" onClick={onSkip} disabled={saving}>';

describe("the Canvas add step", () => {
  it("no longer gives cancel a raised button of its own", () => {
    expect(canvas).not.toContain("btn-elevated-secondary");
  });

  it("no longer sets cancel beside the primary action at equal width", () => {
    // `flex-1` on both halves is what made them equal.
    expect(canvas).not.toMatch(/flex-1[^"]*text-muted-foreground[^"]*rounded-xl/);
  });

  it("uses one quiet cancel, defined once", () => {
    expect(canvas).toContain(QUIET_CANCEL);
    expect(canvas.split(QUIET_CANCEL).length - 1).toBe(1);
  });

  it("applies it to all three of the step's screens", () => {
    // Calendar feed, API token, and the course picker each render {cancel}.
    expect(canvas.split("{cancel}").length - 1).toBe(3);
  });

  it("gives the primary action the full width instead", () => {
    // The feed and token forms own their submit button; the picker has one here.
    expect(canvas).toMatch(/<Button type="submit" variant="inverted" size="lg" className="w-full"/);
    for (const form of ["CanvasFeedForm.tsx", "CanvasTokenForm.tsx"]) {
      expect(read(`src/components/onboarding/${form}`)).toMatch(
        /<Button type="submit" variant="inverted" size="lg" className="w-full"/
      );
    }
  });

  it("keeps cancel disabled while saving", () => {
    // Backing out mid-write would leave the selection half-applied.
    expect(QUIET_CANCEL).toContain("disabled={saving}");
  });

  it("centres the cancel, as the step's own container does", () => {
    expect(canvas).toContain('<div className="mt-3 text-center">');
  });

  it("brightspace keeps its quiet cancel too", () => {
    expect(brightspace).toMatch(/onClick=\{onSkip\}/);
    expect(brightspace).not.toContain("btn-elevated-secondary");
  });
});

describe("no step reintroduces the raised cancel", () => {
  const dir = path.join(ROOT, "src/components/onboarding");
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".tsx"))) {
    it(`${file} leaves cancel as a text link`, () => {
      expect(read(`src/components/onboarding/${file}`)).not.toContain("btn-elevated-secondary");
    });
  }
});
