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

/** The quiet treatment, taken from the step used as the reference. */
const QUIET_CANCEL = "text-xs font-medium text-muted-foreground hover:text-foreground transition-colors";

describe("the Canvas add step", () => {
  it("no longer gives cancel a raised button of its own", () => {
    expect(canvas).not.toContain("btn-elevated-secondary");
  });

  it("no longer sets cancel beside the primary action at equal width", () => {
    // `flex-1` on both halves is what made them equal.
    expect(canvas).not.toMatch(/flex-1[^"]*text-muted-foreground[^"]*rounded-xl/);
    expect(canvas).not.toContain(">\n              cancel\n");
  });

  it("uses the same quiet cancel as the reference step", () => {
    expect(canvas).toContain(QUIET_CANCEL);
    expect(brightspace).toContain(QUIET_CANCEL);
  });

  it("applies it to all three of the step's screens", () => {
    // Calendar feed, API token, and the course picker.
    expect(canvas.split(QUIET_CANCEL).length - 1).toBe(3);
  });

  it("gives the primary action the full width instead", () => {
    const primaries = canvas.match(/w-full px-5 py-2\.5 bg-gray-900/g) ?? [];
    expect(primaries.length).toBe(3);
    expect(canvas).not.toMatch(/flex-1 px-5 py-2\.5 bg-gray-900/);
  });

  it("still routes cancel to the same handler", () => {
    expect(canvas.match(/onClick=\{onSkip\}/g)?.length).toBe(3);
  });

  it("keeps the course picker's cancel disabled while saving", () => {
    // Backing out mid-write would leave the selection half-applied.
    expect(canvas).toMatch(/onClick=\{onSkip\}\s*\n\s*disabled=\{saving\}/);
  });

  it("centres the cancel, as the step's own container does", () => {
    expect(canvas).toContain('<div className="text-center">');
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
