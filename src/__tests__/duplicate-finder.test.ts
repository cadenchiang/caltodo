import { describe, it, expect } from "vitest";
import {
  normalizeTitle,
  tokenSimilarity,
  isLikelyDuplicate,
  findDuplicatesFor,
} from "@/lib/duplicate-finder";
import type { Task } from "@/lib/types";

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: "t1",
    user_id: "u1",
    title: "",
    description: "",
    due_date: null,
    due_time: null,
    is_completed: false,
    color: "blue",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    source: null,
    external_id: null,
    course_name: null,
    source_url: null,
    points_possible: null,
    is_submitted: false,
    google_event_id: null,
    dismissed_at: null,
    repeat_interval: null,
    repeat_unit: null,
    repeat_end_date: null,
    repeat_end_count: null,
    late_due_date: null,
    completed_at: null,
    tags: [],
    snoozed_until: null,
    sort_order: null,
    due_date_manually_edited_at: null,
    due_time_manually_edited_at: null,
    ...overrides,
  };
}

describe("normalizeTitle", () => {
  it("strips course codes, punctuation, and noise words", () => {
    expect(normalizeTitle("CS 188 - Homework 3: Search")).toEqual(["3", "search"]);
    expect(normalizeTitle("HW 4 - Markov Decision Processes")).toEqual(["4", "markov", "decision", "processes"]);
  });

  it("handles empty input", () => {
    expect(normalizeTitle("")).toEqual([]);
  });
});

describe("tokenSimilarity", () => {
  it("returns 1 for identical tokens", () => {
    expect(tokenSimilarity(["a", "b"], ["a", "b"])).toBe(1);
  });

  it("returns 0 for disjoint tokens", () => {
    expect(tokenSimilarity(["a"], ["b"])).toBe(0);
  });

  it("returns Jaccard for partial overlap", () => {
    expect(tokenSimilarity(["a", "b", "c"], ["b", "c", "d"])).toBeCloseTo(0.5);
  });

  it("returns 1 for two empty token lists", () => {
    expect(tokenSimilarity([], [])).toBe(1);
  });
});

describe("isLikelyDuplicate", () => {
  const base = {
    title: "Homework 3",
    due_date: "2026-05-10",
    course_name: "CS 188",
  } as const;

  it("matches same assignment across canvas + gradescope", () => {
    const a = makeTask({ id: "1", source: "canvas", ...base, title: "CS 188 HW 3 - Search" });
    const b = makeTask({ id: "2", source: "gradescope", ...base, title: "Homework 3: Search" });
    expect(isLikelyDuplicate(a, b)).toBe(true);
  });

  it("does not match same source", () => {
    const a = makeTask({ id: "1", source: "canvas", ...base });
    const b = makeTask({ id: "2", source: "canvas", ...base });
    expect(isLikelyDuplicate(a, b)).toBe(false);
  });

  it("does not match different due dates", () => {
    const a = makeTask({ id: "1", source: "canvas", ...base });
    const b = makeTask({ id: "2", source: "gradescope", ...base, due_date: "2026-05-11" });
    expect(isLikelyDuplicate(a, b)).toBe(false);
  });

  it("does not match manual tasks (source = null)", () => {
    const a = makeTask({ id: "1", source: null, ...base });
    const b = makeTask({ id: "2", source: "gradescope", ...base });
    expect(isLikelyDuplicate(a, b)).toBe(false);
  });

  it("does not match dismissed tasks", () => {
    const a = makeTask({ id: "1", source: "canvas", ...base });
    const b = makeTask({ id: "2", source: "gradescope", ...base, dismissed_at: "2026-05-09T12:00:00Z" });
    expect(isLikelyDuplicate(a, b)).toBe(false);
  });

  it("does not match different courses", () => {
    const a = makeTask({ id: "1", source: "canvas", ...base, course_name: "CS 188" });
    const b = makeTask({ id: "2", source: "gradescope", ...base, course_name: "MATH 53" });
    expect(isLikelyDuplicate(a, b)).toBe(false);
  });

  it("does not match dissimilar titles", () => {
    const a = makeTask({ id: "1", source: "canvas", ...base, title: "Final Project Proposal" });
    const b = makeTask({ id: "2", source: "gradescope", ...base, title: "Lab 7" });
    expect(isLikelyDuplicate(a, b)).toBe(false);
  });
});

describe("findDuplicatesFor", () => {
  const due = "2026-05-10";

  it("returns all matching duplicates", () => {
    const a = makeTask({ id: "1", source: "canvas", title: "CS 188 HW 3 - Search", due_date: due, course_name: "CS 188" });
    const b = makeTask({ id: "2", source: "gradescope", title: "Homework 3: Search", due_date: due, course_name: "CS 188" });
    const c = makeTask({ id: "3", source: "pensieve", title: "HW 3 Search", due_date: due, course_name: "CS 188" });
    const unrelated = makeTask({ id: "4", source: "canvas", title: "Lab 1", due_date: due, course_name: "CS 188" });
    const dupes = findDuplicatesFor(a, [a, b, c, unrelated]);
    expect(dupes.map((t) => t.id).sort()).toEqual(["2", "3"]);
  });

  it("returns empty when no duplicates exist", () => {
    const a = makeTask({ id: "1", source: "canvas", title: "Unique Task", due_date: due });
    const b = makeTask({ id: "2", source: "gradescope", title: "Other Task", due_date: due });
    expect(findDuplicatesFor(a, [a, b])).toEqual([]);
  });

  it("never returns the task itself", () => {
    const a = makeTask({ id: "1", source: "canvas", title: "Same", due_date: due });
    expect(findDuplicatesFor(a, [a])).toEqual([]);
  });
});
