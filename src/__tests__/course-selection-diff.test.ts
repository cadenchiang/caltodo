/**
 * Tests for matching a stored class selection against a fetched course list.
 *
 * Both helpers guard the same reported bug: editing classes in settings "just
 * adds on and doesn't get rid of the old classes". `seedSelection` is why the
 * picker opened with the wrong ticks, and `diffCourseSelection` is what tells
 * the caller which classes to hide tasks for.
 */

import { describe, it, expect } from "vitest";
import { diffCourseSelection, seedSelection } from "@/lib/course-selection-diff";

describe("diffCourseSelection", () => {
  it("reports a removed class", () => {
    const diff = diffCourseSelection(
      [{ id: 1, name: "UGBA 100-LEC-003" }, { id: 2, name: "UGBA 103-LEC-001 FA26" }],
      [{ id: 2, name: "UGBA 103-LEC-001 FA26" }]
    );

    expect(diff.removedNames).toEqual(["UGBA 100-LEC-003"]);
    expect(diff.addedNames).toEqual([]);
  });

  it("reports an added class", () => {
    const diff = diffCourseSelection(
      [{ id: 1, name: "UGBA 100" }],
      [{ id: 1, name: "UGBA 100" }, { id: 7, name: "UGBA 107-LEC-001 FA26" }]
    );

    expect(diff.addedNames).toEqual(["UGBA 107-LEC-001 FA26"]);
    expect(diff.removedNames).toEqual([]);
  });

  it("reports nothing when the same classes come back under different ids", () => {
    // The token path numbers its courses; the feed path derives ids from the
    // name. Diffing on ids would call this a full swap and hide every task.
    const diff = diffCourseSelection(
      [{ id: 0, name: "UGBA 100" }, { id: 0, name: "UGBA 103" }],
      [{ id: 918273, name: "UGBA 100" }, { id: 645342, name: "UGBA 103" }]
    );

    expect(diff.addedNames).toEqual([]);
    expect(diff.removedNames).toEqual([]);
  });

  it("treats a null previous selection as nothing selected", () => {
    const diff = diffCourseSelection(null, [{ id: 1, name: "UGBA 100" }]);

    expect(diff.addedNames).toEqual(["UGBA 100"]);
    expect(diff.removedNames).toEqual([]);
  });

  it("reports every class as removed when the selection is emptied", () => {
    const diff = diffCourseSelection([{ id: 1, name: "UGBA 100" }], []);

    expect(diff.removedNames).toEqual(["UGBA 100"]);
  });

  it("ignores blank names on both sides", () => {
    const diff = diffCourseSelection(
      [{ id: 1, name: "  " }, { id: 2, name: "UGBA 100" }],
      [{ id: 2, name: "UGBA 100" }, { id: 3, name: "" }]
    );

    expect(diff.addedNames).toEqual([]);
    expect(diff.removedNames).toEqual([]);
  });

  it("ignores surrounding whitespace when matching", () => {
    const diff = diffCourseSelection(
      [{ id: 1, name: "UGBA 100 " }],
      [{ id: 1, name: "UGBA 100" }]
    );

    expect(diff.addedNames).toEqual([]);
    expect(diff.removedNames).toEqual([]);
  });
});

describe("seedSelection", () => {
  const available = [
    { id: 918273, name: "UGBA 100-LEC-003" },
    { id: 645342, name: "UGBA 103-LEC-001 FA26" },
    { id: 112233, name: "UGBA 107-LEC-001 FA26" },
  ];

  it("ticks courses matched by id", () => {
    const seeded = seedSelection(available, [{ id: 645342, name: "anything" }]);

    expect([...seeded]).toEqual(["645342"]);
  });

  it("ticks courses matched by name when the stored ids are stale", () => {
    // Every feed course used to be stored with id 0, so id matching alone
    // opened the picker with nothing ticked and closing it wiped the class.
    const seeded = seedSelection(available, [
      { id: 0, name: "UGBA 100-LEC-003" },
      { id: 0, name: "UGBA 107-LEC-001 FA26" },
    ]);

    expect([...seeded].sort()).toEqual(["112233", "918273"]);
  });

  it("ignores stored classes the provider no longer offers", () => {
    const seeded = seedSelection(available, [
      { id: 0, name: "UGBA 100-LEC-003" },
      { id: 0, name: "CS 61A (Fall 2025)" },
    ]);

    expect([...seeded]).toEqual(["918273"]);
  });

  it("returns an empty set for an empty or missing selection", () => {
    expect(seedSelection(available, []).size).toBe(0);
    expect(seedSelection(available, null).size).toBe(0);
  });

  it("returns an empty set when the provider offers no courses", () => {
    expect(seedSelection([], [{ id: 1, name: "UGBA 100" }]).size).toBe(0);
  });
});
