/**
 * Tests for the derived colours behind tag and class chips.
 */

import { describe, it, expect } from "vitest";
import { labelColor, courseColor } from "@/lib/label-colors";
import { TASK_COLORS, DEFAULT_TASK_COLOR } from "@/lib/constants";

const PALETTE = TASK_COLORS.slice(1);

describe("labelColor", () => {
  it("returns a colour from the task palette", () => {
    for (const name of ["Canvas", "Gradescope", "HKU", "Hong Kong", "Pensive"]) {
      expect(PALETTE).toContain(labelColor(name));
    }
  });

  it("never returns the neutral grey", () => {
    // A grey dot beside grey text tells the user nothing.
    const grey = TASK_COLORS[0];
    for (let i = 0; i < 200; i++) {
      expect(labelColor(`tag-${i}`)).not.toBe(grey);
    }
  });

  it("gives the same name the same colour every time", () => {
    expect(labelColor("Canvas")).toBe(labelColor("Canvas"));
  });

  it("ignores case and surrounding space", () => {
    expect(labelColor("Hong Kong")).toBe(labelColor("hong kong"));
    expect(labelColor("  Canvas  ")).toBe(labelColor("Canvas"));
  });

  it("lets different names share a colour", () => {
    // Eight colours and unbounded names: collisions are certain, and are the
    // accepted cost of a colour that needs no storage. The dot is a visual
    // aid beside the name, never the thing that identifies it.
    const seen = new Map<string, string>();
    let collided = false;
    for (let i = 0; i < 50 && !collided; i++) {
      const name = `label ${i}`;
      const color = labelColor(name);
      if (seen.has(color)) collided = true;
      seen.set(color, name);
    }
    expect(collided).toBe(true);
  });

  it("returns a real colour for an empty name", () => {
    expect(PALETTE).toContain(labelColor(""));
    expect(PALETTE).toContain(labelColor("   "));
  });

  it("spreads a realistic list across more than one colour", () => {
    // A palette that collapsed to one colour would defeat the point.
    const names = ["Canvas", "Gradescope", "HKU", "Hong Kong", "Pensive", "Exam", "Reading"];
    expect(new Set(names.map(labelColor)).size).toBeGreaterThan(1);
  });

  it("uses the whole palette across many names", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 500; i++) seen.add(labelColor(`label ${i}`));
    expect(seen.size).toBe(PALETTE.length);
  });
});

describe("courseColor", () => {
  it("prefers the colour the class's assignments already use", () => {
    const colors = new Map([["UGBA 103", DEFAULT_TASK_COLOR]]);
    expect(courseColor("UGBA 103", colors)).toBe(DEFAULT_TASK_COLOR);
  });

  it("falls back to the derived colour when the class has none", () => {
    expect(courseColor("UGBA 103", new Map())).toBe(labelColor("UGBA 103"));
  });

  it("treats an empty stored colour as none", () => {
    const colors = new Map([["UGBA 103", ""]]);
    expect(courseColor("UGBA 103", colors)).toBe(labelColor("UGBA 103"));
  });

  it("matches the class name exactly, as stored", () => {
    const colors = new Map([["UGBA 103", DEFAULT_TASK_COLOR]]);
    expect(courseColor("ugba 103", colors)).toBe(labelColor("ugba 103"));
  });
});
