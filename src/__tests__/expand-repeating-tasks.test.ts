/**
 * Tests for display-time expansion of repeating tasks.
 * Validates that virtual instances are generated correctly within date ranges,
 * respecting end-date/count limits and ignoring completed/non-repeating tasks.
 */

import { describe, it, expect } from "vitest";
import {
  expandRepeatingTasks,
  isVirtualRepeatInstance,
  getRealTaskId,
} from "@/lib/expand-repeating-tasks";
import type { Task } from "@/lib/types";

/** Creates a minimal task for testing. */
function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    user_id: "user-1",
    title: "Test Task",
    description: "",
    due_date: "2026-03-01",
    due_time: null,
    is_completed: false,
    color: "#3b82f6",
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
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

describe("isVirtualRepeatInstance", () => {
  it("returns true for virtual IDs", () => {
    expect(isVirtualRepeatInstance("task-1:repeat:2026-03-08")).toBe(true);
  });

  it("returns false for real IDs", () => {
    expect(isVirtualRepeatInstance("task-1")).toBe(false);
  });
});

describe("getRealTaskId", () => {
  it("extracts real ID from virtual ID", () => {
    expect(getRealTaskId("task-1:repeat:2026-03-08")).toBe("task-1");
  });

  it("returns original ID if not virtual", () => {
    expect(getRealTaskId("task-1")).toBe("task-1");
  });
});

describe("expandRepeatingTasks", () => {
  it("passes through non-repeating tasks unchanged", () => {
    const task = makeTask();
    const result = expandRepeatingTasks([task], "2026-03-01", "2026-03-31");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("task-1");
  });

  it("expands weekly repeat within range", () => {
    const task = makeTask({
      repeat_interval: 1,
      repeat_unit: "week",
    });
    const result = expandRepeatingTasks([task], "2026-03-01", "2026-03-31");
    // March 1, 8, 15, 22, 29 = 5 instances
    expect(result).toHaveLength(5);
    expect(result[0].due_date).toBe("2026-03-01");
    expect(result[0].id).toBe("task-1");
    expect(result[1].due_date).toBe("2026-03-08");
    expect(result[1].id).toBe("task-1:repeat:2026-03-08");
    expect(result[4].due_date).toBe("2026-03-29");
  });

  it("expands daily repeat within range", () => {
    const task = makeTask({
      due_date: "2026-03-01",
      repeat_interval: 1,
      repeat_unit: "day",
    });
    const result = expandRepeatingTasks([task], "2026-03-01", "2026-03-05");
    // March 1, 2, 3, 4, 5 = 5
    expect(result).toHaveLength(5);
  });

  it("respects repeat_end_date", () => {
    const task = makeTask({
      repeat_interval: 1,
      repeat_unit: "week",
      repeat_end_date: "2026-03-15",
    });
    const result = expandRepeatingTasks([task], "2026-03-01", "2026-03-31");
    // March 1, 8, 15 — 22 exceeds end_date
    expect(result).toHaveLength(3);
  });

  it("respects repeat_end_count", () => {
    const task = makeTask({
      repeat_interval: 1,
      repeat_unit: "week",
      repeat_end_count: 3,
    });
    const result = expandRepeatingTasks([task], "2026-03-01", "2026-12-31");
    // Only 3 total: March 1, 8, 15
    expect(result).toHaveLength(3);
  });

  it("does not expand completed repeating tasks", () => {
    const task = makeTask({
      repeat_interval: 1,
      repeat_unit: "week",
      is_completed: true,
    });
    const result = expandRepeatingTasks([task], "2026-03-01", "2026-03-31");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("task-1");
  });

  it("does not expand tasks without due_date", () => {
    const task = makeTask({
      due_date: null,
      repeat_interval: 1,
      repeat_unit: "week",
    });
    const result = expandRepeatingTasks([task], "2026-03-01", "2026-03-31");
    expect(result).toHaveLength(1);
  });

  it("only includes virtual instances within visible range", () => {
    const task = makeTask({
      due_date: "2026-02-01",
      repeat_interval: 1,
      repeat_unit: "week",
    });
    // Range starts March 1 — original (Feb 1) is included but Feb instances are not generated as virtual
    // Actually original is always included, then virtual ones from Feb 8, 15, 22, Mar 1, 8, ...
    // Only those >= rangeStart are in virtual results
    const result = expandRepeatingTasks([task], "2026-03-01", "2026-03-14");
    // Original (Feb 1) + virtual Mar 1, Mar 8 that are in range
    const virtualOnes = result.filter((t) => isVirtualRepeatInstance(t.id));
    expect(virtualOnes.every((t) => t.due_date! >= "2026-03-01")).toBe(true);
    expect(virtualOnes.every((t) => t.due_date! <= "2026-03-14")).toBe(true);
  });

  it("handles monthly repeat", () => {
    const task = makeTask({
      due_date: "2026-01-15",
      repeat_interval: 1,
      repeat_unit: "month",
    });
    const result = expandRepeatingTasks([task], "2026-01-01", "2026-04-30");
    // Jan 15, Feb 15, Mar 15, Apr 15 = 4
    expect(result).toHaveLength(4);
  });
});
