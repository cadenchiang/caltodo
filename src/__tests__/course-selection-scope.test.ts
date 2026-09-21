/**
 * Tests for resolving the task rows a class-selection change refers to.
 *
 * The reported bug (audit H6): sync stores the cross-platform canonical
 * course name on tasks, but removal matched the raw selection name. Removing
 * the Canvas section found nothing, and removing the Gradescope course with
 * the same code also matched the Canvas tasks.
 */

import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import {
  canonicalNameVariants,
  selectionCourseEntries,
  type SelectionSnapshot,
} from "@/lib/course-selection-scope";

const CANVAS_NAME = "UGBA 101A-LEC-002 Microeconomics for Business Decisions";
const GS_NAME = "UGBA 101A";

const merged: SelectionSnapshot = {
  selected_canvas_courses: [{ name: CANVAS_NAME }],
  selected_gradescope_courses: [{ name: GS_NAME }],
  selected_pensieve_courses: null,
};

describe("selectionCourseEntries", () => {
  it("flattens every platform, including extra Canvas accounts, with its source", () => {
    const entries = selectionCourseEntries({
      selected_canvas_courses: [{ name: "CS 61A" }],
      selected_gradescope_courses: [{ name: "CS 61A Fall" }],
      selected_pensieve_courses: [{ name: "EECS 16A" }],
      additional_canvas_accounts: [{ selected_courses: [{ name: "MATH 53" }] }, { selected_courses: null }],
    });

    expect(entries).toEqual([
      { source: "canvas", name: "CS 61A" },
      { source: "gradescope", name: "CS 61A Fall" },
      { source: "pensieve", name: "EECS 16A" },
      { source: "canvas", name: "MATH 53" },
    ]);
  });

  it("treats null and missing selections as empty", () => {
    expect(selectionCourseEntries({})).toEqual([]);
    expect(selectionCourseEntries({ selected_canvas_courses: null, additional_canvas_accounts: null })).toEqual([]);
  });
});

describe("canonicalNameVariants", () => {
  it("adds the canonical name sync stored for a merged Canvas section", () => {
    const names = canonicalNameVariants([CANVAS_NAME], [merged]);

    expect(names).toEqual([CANVAS_NAME, GS_NAME]);
  });

  it("keeps a name that is already canonical as a single entry", () => {
    expect(canonicalNameVariants([GS_NAME], [merged])).toEqual([GS_NAME]);
  });

  it("returns only the raw name when the code is confined to one platform", () => {
    const snapshot: SelectionSnapshot = {
      selected_canvas_courses: [{ name: CANVAS_NAME }],
      selected_gradescope_courses: [],
    };

    expect(canonicalNameVariants([CANVAS_NAME], [snapshot])).toEqual([CANVAS_NAME]);
  });

  it("unions the canonical forms across the before and after snapshots", () => {
    // After the Gradescope course is removed the map no longer merges, so the
    // after-snapshot contributes nothing new; the before-snapshot still does.
    const after: SelectionSnapshot = {
      selected_canvas_courses: [{ name: CANVAS_NAME }],
      selected_gradescope_courses: [],
    };

    expect(canonicalNameVariants([CANVAS_NAME], [merged, after])).toEqual([CANVAS_NAME, GS_NAME]);
  });

  it("drops blank names and returns nothing for an empty input", () => {
    expect(canonicalNameVariants([], [merged])).toEqual([]);
    expect(canonicalNameVariants(["  "], [merged])).toEqual([]);
  });

  it("trims whitespace before matching", () => {
    expect(canonicalNameVariants([`  ${GS_NAME} `], [merged])).toEqual([GS_NAME]);
  });
});
