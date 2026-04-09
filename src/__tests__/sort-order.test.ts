/**
 * Tests for the sort_order-aware sorting logic used in TaskList and inbox page.
 * Validates that tasks with sort_order come first, followed by due_date sorting.
 */

import { describe, it, expect } from "vitest";
import type { Task } from "@/lib/types";

/**
 * Creates a minimal Task object for sort-order testing.
 *
 * @param overrides - Partial Task fields to override defaults
 * @returns A complete Task object
 */
function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    user_id: "user-1",
    title: "Test Task",
    description: "",
    due_date: null,
    due_time: null,
    is_completed: false,
    color: "#3B82F6",
    created_at: "2026-02-20T00:00:00Z",
    updated_at: "2026-02-20T00:00:00Z",
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

/**
 * Sorts tasks by sort_order first (manual drag order), then by due_date.
 * Mirrors the logic in TaskList.tsx and inbox/page.tsx.
 *
 * @param tasks - Array of tasks to sort
 * @returns New sorted array (does not mutate input)
 */
function sortByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aHasOrder = a.sort_order !== null && a.sort_order !== undefined;
    const bHasOrder = b.sort_order !== null && b.sort_order !== undefined;

    if (aHasOrder && bHasOrder) return a.sort_order! - b.sort_order!;
    if (aHasOrder) return -1;
    if (bHasOrder) return 1;

    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return -1;
    if (!b.due_date) return 1;
    return a.due_date.localeCompare(b.due_date);
  });
}

describe("sortByDueDate with sort_order", () => {
  it("should place sort_order tasks before null sort_order tasks", () => {
    const tasks = [
      makeTask({ id: "a", sort_order: null, due_date: "2026-02-01" }),
      makeTask({ id: "b", sort_order: 1000, due_date: "2026-03-01" }),
    ];

    const sorted = sortByDueDate(tasks);
    expect(sorted.map((t) => t.id)).toEqual(["b", "a"]);
  });

  it("should sort sort_order tasks by ascending value", () => {
    const tasks = [
      makeTask({ id: "c", sort_order: 3000 }),
      makeTask({ id: "a", sort_order: 1000 }),
      makeTask({ id: "b", sort_order: 2000 }),
    ];

    const sorted = sortByDueDate(tasks);
    expect(sorted.map((t) => t.id)).toEqual(["a", "b", "c"]);
  });

  it("should preserve due_date sorting for null sort_order tasks", () => {
    const tasks = [
      makeTask({ id: "c", sort_order: null, due_date: "2026-03-15" }),
      makeTask({ id: "a", sort_order: null, due_date: "2026-01-10" }),
      makeTask({ id: "b", sort_order: null, due_date: "2026-02-20" }),
    ];

    const sorted = sortByDueDate(tasks);
    expect(sorted.map((t) => t.id)).toEqual(["a", "b", "c"]);
  });

  it("should be backward-compatible: all null sort_order sorts by due_date", () => {
    const tasks = [
      makeTask({ id: "undated", sort_order: null, due_date: null }),
      makeTask({ id: "late", sort_order: null, due_date: "2026-12-01" }),
      makeTask({ id: "early", sort_order: null, due_date: "2026-01-01" }),
    ];

    const sorted = sortByDueDate(tasks);
    // Undated first, then ascending by due_date
    expect(sorted.map((t) => t.id)).toEqual(["undated", "early", "late"]);
  });

  it("should handle mixed sort_order and null with correct boundary", () => {
    const tasks = [
      makeTask({ id: "manual-2", sort_order: 2000, due_date: "2026-06-01" }),
      makeTask({ id: "auto-early", sort_order: null, due_date: "2026-01-01" }),
      makeTask({ id: "manual-1", sort_order: 1000, due_date: "2026-12-01" }),
      makeTask({ id: "auto-late", sort_order: null, due_date: "2026-12-31" }),
    ];

    const sorted = sortByDueDate(tasks);
    // Manual tasks first (by sort_order), then auto tasks (by due_date)
    expect(sorted.map((t) => t.id)).toEqual([
      "manual-1",
      "manual-2",
      "auto-early",
      "auto-late",
    ]);
  });

  it("should not mutate the input array", () => {
    const tasks = [
      makeTask({ id: "b", sort_order: 2000 }),
      makeTask({ id: "a", sort_order: 1000 }),
    ];
    const original = [...tasks];

    sortByDueDate(tasks);
    expect(tasks.map((t) => t.id)).toEqual(original.map((t) => t.id));
  });
});
