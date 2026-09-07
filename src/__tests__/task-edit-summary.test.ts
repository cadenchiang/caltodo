/**
 * Tests for the edit summary that drives the undo toast.
 * Each case checks both halves: what the toast says, and that the revert
 * really puts the task back.
 */

import { describe, it, expect } from "vitest";
import { summariseTaskEdit, isRealChange } from "@/lib/task-edit-summary";
import type { Task, TaskUpdate } from "@/lib/types";

/** A task with only the fields these tests read. */
function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "t1",
    title: "Chapter 5 - Interest Rates",
    description: "Please read chapter 5.",
    due_date: "2026-09-08",
    due_time: null,
    tags: ["bCourses"],
    course_name: "UGBA 103-LEC-001 FA26",
    color: "#0e89d6",
    is_completed: false,
    repeat_interval: null,
    repeat_unit: null,
    ...overrides,
  } as Task;
}

/** Applies an update to a task, the way the context would. */
function apply(task: Task, updates: TaskUpdate): Task {
  return { ...task, ...updates } as Task;
}

describe("isRealChange", () => {
  it("ignores an update that writes the same values back", () => {
    const task = makeTask();
    expect(isRealChange(task, { due_date: "2026-09-08" })).toBe(false);
    expect(isRealChange(task, { title: task.title })).toBe(false);
  });

  it("ignores tags re-saved in the same order", () => {
    expect(isRealChange(makeTask(), { tags: ["bCourses"] })).toBe(false);
  });

  it("sees a reordering of tags as a change", () => {
    const task = makeTask({ tags: ["a", "b"] });
    expect(isRealChange(task, { tags: ["b", "a"] })).toBe(true);
  });

  it("treats null and an absent value as the same", () => {
    expect(isRealChange(makeTask({ due_time: null }), { due_time: null })).toBe(false);
  });

  it("sees a real edit", () => {
    expect(isRealChange(makeTask(), { due_date: "2026-09-28" })).toBe(true);
  });

  it("sees clearing a field as a change", () => {
    expect(isRealChange(makeTask(), { course_name: null })).toBe(true);
  });

  it("is false for an empty update", () => {
    expect(isRealChange(makeTask(), {})).toBe(false);
  });
});

describe("summariseTaskEdit", () => {
  it("returns null when nothing changes, so no toast is shown", () => {
    expect(summariseTaskEdit(makeTask(), { due_date: "2026-09-08" })).toBeNull();
    expect(summariseTaskEdit(makeTask(), {})).toBeNull();
  });

  it("names a single changed field", () => {
    expect(summariseTaskEdit(makeTask(), { due_date: "2026-09-28" })?.label)
      .toBe("Due date changed");
    expect(summariseTaskEdit(makeTask(), { course_name: "CS 61A" })?.label)
      .toBe("Class changed");
    expect(summariseTaskEdit(makeTask(), { tags: ["Exam"] })?.label)
      .toBe("Tags changed");
  });

  it("counts fields when several change at once", () => {
    const summary = summariseTaskEdit(makeTask(), {
      due_date: "2026-09-28",
      due_time: "23:59",
    });
    expect(summary?.label).toBe("2 fields changed");
  });

  it("treats a repeat as one idea, not two columns", () => {
    const summary = summariseTaskEdit(makeTask(), {
      repeat_interval: 1,
      repeat_unit: "week",
    });
    expect(summary?.label).toBe("Repeat changed");
  });

  it("restores the previous value", () => {
    const task = makeTask();
    const updates: TaskUpdate = { due_date: "2026-09-28" };
    const summary = summariseTaskEdit(task, updates);
    const edited = apply(task, updates);
    expect(apply(edited, summary!.revert).due_date).toBe("2026-09-08");
  });

  it("restores several fields together", () => {
    const task = makeTask();
    const updates: TaskUpdate = { due_date: "2026-09-28", due_time: "23:59" };
    const summary = summariseTaskEdit(task, updates);
    const back = apply(apply(task, updates), summary!.revert);
    expect(back.due_date).toBe("2026-09-08");
    expect(back.due_time).toBeNull();
  });

  it("restores tags as a list, never as null", () => {
    // The column is not nullable, so an undo must write [] rather than null.
    const task = makeTask({ tags: [] });
    const summary = summariseTaskEdit(task, { tags: ["Exam"] });
    expect(summary?.revert.tags).toEqual([]);
  });

  it("copies the tag list rather than aliasing the task's", () => {
    const task = makeTask({ tags: ["bCourses"] });
    const summary = summariseTaskEdit(task, { tags: ["Exam"] });
    expect(summary?.revert.tags).toEqual(["bCourses"]);
    expect(summary?.revert.tags).not.toBe(task.tags);
  });

  it("restores a cleared field", () => {
    const task = makeTask();
    const summary = summariseTaskEdit(task, { course_name: null });
    expect(summary?.label).toBe("Class changed");
    expect(apply(apply(task, { course_name: null }), summary!.revert).course_name)
      .toBe("UGBA 103-LEC-001 FA26");
  });

  it("reverts only the fields that actually moved", () => {
    // due_date is unchanged here, so it has no business in the undo.
    const task = makeTask();
    const summary = summariseTaskEdit(task, {
      due_date: "2026-09-08",
      due_time: "23:59",
    });
    expect(Object.keys(summary!.revert)).toEqual(["due_time"]);
  });

  it("falls back to a generic label for a field with no name", () => {
    const summary = summariseTaskEdit(makeTask(), { sort_order: 5 });
    expect(summary?.label).toBe("Assignment updated");
  });
});
