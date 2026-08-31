/**
 * Tests for the class-selection toast copy.
 *
 * The regression these guard against is length: the toast used to list every
 * course title in full and overflowed as soon as two classes changed.
 */

import { describe, it, expect } from "vitest";
import {
  shortenClassName,
  describeClasses,
  buildClassSyncSummary,
} from "@/lib/class-sync-summary";

describe("shortenClassName", () => {
  it("pulls the course code out of real Canvas titles", () => {
    expect(shortenClassName("ASTRON 11- ASTROBIO")).toBe("ASTRON 11");
    expect(shortenClassName("UGBA 100-LEC-003")).toBe("UGBA 100");
    expect(shortenClassName("CS 198: Full Stack Decal (SP26)")).toBe("CS 198");
  });

  it("keeps the level letter on codes that carry one", () => {
    expect(
      shortenClassName(
        "UGBA 101A-LEC-002 Microeconomic Analysis for Business Decisions (Spring 2026)"
      )
    ).toBe("UGBA 101A");
  });

  it("handles two-word departments without eating the number", () => {
    expect(shortenClassName("COMP SCI 200 Programming I")).toBe("COMP SCI 200");
  });

  it("normalises irregular spacing inside the code", () => {
    expect(shortenClassName("MATH   1B - Calculus")).toBe("MATH 1B");
  });

  it("drops a trailing term parenthetical when there is no code", () => {
    expect(shortenClassName("Full Stack Decal (Spring 2026)")).toBe("Full Stack Decal");
  });

  it("clips a long uncoded name rather than returning it whole", () => {
    const out = shortenClassName("Introduction to the Study of Comparative Literature");
    expect(out.length).toBeLessThanOrEqual(24);
    expect(out.endsWith("…")).toBe(true);
  });

  it("returns empty for blank input", () => {
    expect(shortenClassName("")).toBe("");
    expect(shortenClassName("   ")).toBe("");
  });
});

describe("describeClasses", () => {
  it("names a single class", () => {
    expect(describeClasses(["UGBA 100-LEC-003"])).toBe("UGBA 100");
  });

  it("collapses several classes to a count", () => {
    expect(describeClasses(["CS 198: Decal", "UGBA 101A-LEC-002"])).toBe("2 classes");
  });

  it("ignores blank entries when counting", () => {
    expect(describeClasses(["CS 61A", "  ", ""])).toBe("CS 61A");
  });

  it("returns empty for an empty list", () => {
    expect(describeClasses([])).toBe("");
  });
});

describe("buildClassSyncSummary", () => {
  /** The exact change that produced the overlong toast being fixed. */
  const reportedCase = {
    syncedCount: 4,
    addedNames: ["ASTRON 11- ASTROBIO", "UGBA 100-LEC-003"],
    restoredCount: 0,
    reAddedNames: [],
    hiddenCount: 0,
    removedNames: [
      "CS 198: Full Stack Decal (SP26)",
      "UGBA 101A-LEC-002 Microeconomic Analysis for Business Decisions (Spring 2026)",
    ],
  };

  it("shortens the reported case to one short line", () => {
    expect(buildClassSyncSummary(reportedCase)).toBe(
      "Synced 4 tasks from 2 classes. Hid 2 classes."
    );
  });

  it("is dramatically shorter than listing the names", () => {
    const old =
      "Synced 4 tasks from ASTRON 11- ASTROBIO, UGBA 100-LEC-003. Hidden CS 198: Full Stack Decal (SP26), UGBA 101A-LEC-002 Microeconomic Analysis for Business Decisions (Spring 2026).";
    expect(buildClassSyncSummary(reportedCase).length).toBeLessThan(old.length / 3);
  });

  it("names the class when only one was added", () => {
    expect(
      buildClassSyncSummary({
        syncedCount: 1,
        addedNames: ["CS 61A: Structure and Interpretation"],
        restoredCount: 0,
        reAddedNames: [],
        hiddenCount: 0,
        removedNames: [],
      })
    ).toBe("Synced 1 task from CS 61A.");
  });

  it("reports restored tasks when nothing new synced", () => {
    expect(
      buildClassSyncSummary({
        syncedCount: 0,
        addedNames: ["MATH 1B"],
        restoredCount: 7,
        reAddedNames: ["MATH 1B"],
        hiddenCount: 0,
        removedNames: [],
      })
    ).toBe("Restored 7 tasks from MATH 1B.");
  });

  it("says so when an added class had nothing to pull", () => {
    expect(
      buildClassSyncSummary({
        syncedCount: 0,
        addedNames: ["MATH 1B"],
        restoredCount: 0,
        reAddedNames: [],
        hiddenCount: 0,
        removedNames: [],
      })
    ).toBe("No new tasks from MATH 1B.");
  });

  it("keeps the hidden task count when tasks were actually hidden", () => {
    expect(
      buildClassSyncSummary({
        syncedCount: 0,
        addedNames: [],
        restoredCount: 0,
        reAddedNames: [],
        hiddenCount: 12,
        removedNames: ["CS 198: Full Stack Decal (SP26)"],
      })
    ).toBe("Hid 12 tasks from CS 198.");
  });

  it("omits the count when a class was removed but held no tasks", () => {
    expect(
      buildClassSyncSummary({
        syncedCount: 0,
        addedNames: [],
        restoredCount: 0,
        reAddedNames: [],
        hiddenCount: 0,
        removedNames: ["CS 198: Full Stack Decal (SP26)"],
      })
    ).toBe("Hid CS 198.");
  });

  it("returns empty when nothing changed, so no toast is shown", () => {
    expect(
      buildClassSyncSummary({
        syncedCount: 0,
        addedNames: [],
        restoredCount: 0,
        reAddedNames: [],
        hiddenCount: 0,
        removedNames: [],
      })
    ).toBe("");
  });
});
