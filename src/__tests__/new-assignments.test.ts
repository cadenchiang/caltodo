/**
 * Tests which assignments a background sync reports as new.
 *
 * The bug this covers was silent: the caller snapshotted the baseline *after*
 * the refetch had already overwritten it, so the comparison was the fresh list
 * against itself and the "N new assignments found" toast never fired. Nothing
 * failed, nothing logged, the feature was just gone.
 */

import { describe, it, expect } from "vitest";
import { findNewAssignments } from "@/lib/new-assignments";
import type { Task } from "@/lib/types";

/**
 * Builds a task with only the fields this function reads.
 *
 * @param id - Task id.
 * @param source - Sync source, or null for a task the user typed.
 * @returns A Task shaped enough for these tests.
 */
function task(id: string, source: string | null = "canvas"): Task {
  return { id, source, title: id } as unknown as Task;
}

describe("findNewAssignments", () => {
  it("reports a synced task that was not in the baseline", () => {
    const before = [task("a")];
    const after = [task("a"), task("b")];
    expect(findNewAssignments(before, after).map((t) => t.id)).toEqual(["b"]);
  });

  it("reports nothing when the sync brought nothing in", () => {
    const before = [task("a"), task("b")];
    expect(findNewAssignments(before, [task("a"), task("b")])).toEqual([]);
  });

  it("reports nothing when the baseline is the fresh list itself", () => {
    // The exact shape of the bug: both sides are the same array.
    const fresh = [task("a"), task("b")];
    expect(findNewAssignments(fresh, fresh)).toEqual([]);
  });

  it("ignores a task the user typed, which no sync found", () => {
    const after = [task("a"), task("mine", null)];
    expect(findNewAssignments([task("a")], after)).toEqual([]);
  });

  it("treats an empty baseline as everything being new", () => {
    // Guarded by the caller's shouldNotify, which suppresses the first sync.
    expect(findNewAssignments([], [task("a"), task("b")]).map((t) => t.id)).toEqual(["a", "b"]);
  });

  it("does not report an assignment whose contents merely changed", () => {
    const before = [{ ...task("a"), title: "Old" } as Task];
    const after = [{ ...task("a"), title: "New" } as Task];
    expect(findNewAssignments(before, after)).toEqual([]);
  });

  it("keeps the order of the fresh list", () => {
    const after = [task("c"), task("a"), task("b")];
    expect(findNewAssignments([task("a")], after).map((t) => t.id)).toEqual(["c", "b"]);
  });

  it("does not mutate either list", () => {
    const before = [task("a")];
    const after = [task("a"), task("b")];
    findNewAssignments(before, after);
    expect(before).toHaveLength(1);
    expect(after).toHaveLength(2);
  });
});
