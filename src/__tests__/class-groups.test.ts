/**
 * Tests the platform grouping behind the Classes list.
 *
 * The list used to encode a class's origin as a chip colour and nothing else,
 * so the questions that matter here are which platforms appear, in what order,
 * and whether a stale cached total can make a group claim more classes are
 * available than are selected.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  buildClassGroups,
  groupCountLabel,
  type SelectedClassNames,
  type PlatformTotals,
} from "@/lib/class-groups";

const ROOT = path.resolve(__dirname, "../..");

/** Nothing selected anywhere. */
const none: SelectedClassNames = { canvas: [], gradescope: [], pensieve: [], syllabus: [] };

/** The reported case: three bCourses classes and one from Gradescope. */
const reported: SelectedClassNames = {
  canvas: ["UGBA 100-LEC-003", "UGBA 103-LEC-001 FA26", "UGBA 107-LEC-001 FA26"],
  gradescope: ["ASTRON 11- ASTROBIO"],
  pensieve: [],
  syllabus: [],
};

const totals: PlatformTotals = { canvas: 12, gradescope: 3, pensieve: 0 };

describe("buildClassGroups", () => {
  it("returns nothing when nothing is selected", () => {
    expect(buildClassGroups(none, totals)).toEqual([]);
  });

  it("omits a platform that contributed no class", () => {
    const ids = buildClassGroups(reported, totals).map((g) => g.id);
    expect(ids).toEqual(["canvas", "gradescope"]);
    expect(ids).not.toContain("pensieve");
  });

  it("keeps platform order stable regardless of selection order", () => {
    const selected: SelectedClassNames = {
      canvas: ["A"],
      gradescope: ["B"],
      pensieve: ["C"],
      syllabus: ["D"],
    };
    expect(buildClassGroups(selected, totals).map((g) => g.id)).toEqual([
      "canvas",
      "gradescope",
      "pensieve",
      "syllabus",
    ]);
  });

  it("names Canvas as bCourses, the way students say it", () => {
    const canvas = buildClassGroups(reported, totals).find((g) => g.id === "canvas")!;
    expect(canvas.label).toBe("bCourses");
    expect(canvas.logo).toBe("/bcourses-logo.png");
  });

  it("carries each platform's classes through unchanged and in order", () => {
    const canvas = buildClassGroups(reported, totals).find((g) => g.id === "canvas")!;
    expect(canvas.courses).toEqual(reported.canvas);
  });

  it("gives every group a distinct chip style", () => {
    const selected: SelectedClassNames = {
      canvas: ["A"], gradescope: ["B"], pensieve: ["C"], syllabus: ["D"],
    };
    const styles = buildClassGroups(selected, totals).map((g) => g.chipClassName);
    expect(new Set(styles).size).toBe(styles.length);
  });

  it("reports no total for syllabus, which is not a list you pick from", () => {
    const group = buildClassGroups({ ...none, syllabus: ["Econ 1"] }, totals)[0];
    expect(group.total).toBeNull();
  });

  it("reports no total when the picker has never been opened", () => {
    for (const group of buildClassGroups(reported, null)) {
      expect(group.total).toBeNull();
    }
  });
});

describe("groupCountLabel", () => {
  it("reads 'n of m' when the total is known", () => {
    const canvas = buildClassGroups(reported, totals).find((g) => g.id === "canvas")!;
    expect(groupCountLabel(canvas)).toBe("3 of 12");
  });

  it("falls back to the bare count when the total is unknown", () => {
    const canvas = buildClassGroups(reported, null).find((g) => g.id === "canvas")!;
    expect(groupCountLabel(canvas)).toBe("3");
  });

  it("never claims fewer available than selected", () => {
    // The total is cached when the picker is opened, so it can predate a
    // class being added. "4 of 3" reads as a bug rather than as staleness.
    const stale: PlatformTotals = { canvas: 1, gradescope: 0, pensieve: 0 };
    const canvas = buildClassGroups(reported, stale).find((g) => g.id === "canvas")!;
    expect(groupCountLabel(canvas)).toBe("3");
  });

  it("handles an exact match", () => {
    const exact: PlatformTotals = { canvas: 3, gradescope: 1, pensieve: 0 };
    const canvas = buildClassGroups(reported, exact).find((g) => g.id === "canvas")!;
    expect(groupCountLabel(canvas)).toBe("3 of 3");
  });
});

describe("settings wiring", () => {
  const section = fs.readFileSync(
    path.join(ROOT, "src/components/settings/ClassesSection.tsx"),
    "utf8"
  );

  it("renders the grouped list rather than a flat chip column", () => {
    expect(section).toContain("<SelectedClassesByPlatform groups={classGroups} />");
    expect(section).toContain("buildClassGroups");
  });

  it("drops the platform count that the groups now state themselves", () => {
    expect(section).not.toContain("platformCount");
    expect(section).not.toContain("from ${platformCount} platforms");
  });

  it("does not render a summary claiming more selected than available", () => {
    expect(section).toContain("totalAvailable >= totalSelected");
  });
});
