/**
 * Tests for narrowing feed assignments to a stored class selection.
 *
 * The three selection states (null = everything, [] = nothing, list = those
 * courses) used to be re-implemented per feed path, and two paths forgot
 * them entirely (audit M4, H11).
 */

import { describe, it, expect } from "vitest";
import type { NormalizedAssignment } from "@/lib/canvas-client";
import { filterBySelectedCourses, selectsNothing } from "@/lib/course-selection-filter";

const inCourse = (externalId: string, course: string): NormalizedAssignment => ({
  external_id: externalId,
  course_name: course,
  course_id: "0",
  title: "HW",
  due_date: null,
  due_is_all_day: false,
  source_url: null,
  points_possible: null,
  is_submitted: false,
  description: null,
});

const all = [inCourse("1", "CS 61A"), inCourse("2", "MATH 53"), inCourse("3", "")];

describe("selectsNothing", () => {
  it("is true only for an explicit empty list", () => {
    expect(selectsNothing([])).toBe(true);
    expect(selectsNothing(null)).toBe(false);
    expect(selectsNothing(undefined)).toBe(false);
    expect(selectsNothing([{ name: "CS 61A" }])).toBe(false);
  });
});

describe("filterBySelectedCourses", () => {
  it("returns everything when no selection has been made", () => {
    expect(filterBySelectedCourses(all, null)).toBe(all);
    expect(filterBySelectedCourses(all, undefined)).toBe(all);
  });

  it("returns nothing for an explicit empty selection", () => {
    expect(filterBySelectedCourses(all, [])).toEqual([]);
  });

  it("keeps only assignments in the selected courses, by raw name", () => {
    expect(filterBySelectedCourses(all, [{ name: "MATH 53" }]).map((a) => a.external_id)).toEqual(["2"]);
  });

  it("never matches an assignment with no course name", () => {
    expect(filterBySelectedCourses(all, [{ name: "" }])).toEqual([]);
  });
});
