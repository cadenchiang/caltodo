/**
 * Tests for the pure list operations behind TaskContext's optimistic writes.
 * Covers the fetch merge (H7, M2), temp-row replacement (M2), and the
 * explicit rollback of a failed edit (H7).
 */

import { describe, it, expect } from "vitest";
import {
  mergeFetchedTasks,
  replaceTempTask,
  applyOptimisticEdit,
  restoreTaskSnapshot,
  applyServerStamp,
} from "@/lib/task-merge";
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
    color: "#0e89d6",
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

const NONE: ReadonlySet<string> = new Set();

describe("mergeFetchedTasks", () => {
  it("returns the fresh list as-is when there is no local baseline", () => {
    const fresh = [makeTask()];
    expect(mergeFetchedTasks([], fresh, NONE)).toBe(fresh);
  });

  it("lets the server row win when the local row carries the same stamp", () => {
    const local = makeTask({ title: "local" });
    const fresh = makeTask({ title: "server" });
    expect(mergeFetchedTasks([local], [fresh], NONE)[0].title).toBe("server");
  });

  it("keeps the local row while an edit to it is still in flight", () => {
    const local = makeTask({ is_completed: true });
    const fresh = makeTask({ is_completed: false });
    const merged = mergeFetchedTasks([local], [fresh], new Set(["task-1"]));
    expect(merged[0].is_completed).toBe(true);
  });

  it("keeps the local row when its server stamp is newer than the fetched one", () => {
    const local = makeTask({ is_completed: true, updated_at: "2026-03-02T00:00:00Z" });
    const fresh = makeTask({ is_completed: false, updated_at: "2026-03-01T00:00:00Z" });
    expect(mergeFetchedTasks([local], [fresh], NONE)[0].is_completed).toBe(true);
  });

  it("does not let a failed edit survive once its rollback restored the old stamp", () => {
    // After rollback the local row is the snapshot again: same stamp as the
    // server, no pending edit. The server row must win.
    const snapshot = makeTask({ is_completed: false });
    const fresh = makeTask({ is_completed: false });
    const merged = mergeFetchedTasks([snapshot], [fresh], NONE);
    expect(merged[0]).toBe(fresh);
  });

  it("preserves temp rows the server does not know about yet, at the front", () => {
    const temp = makeTask({ id: "temp-123" });
    const fresh = makeTask({ id: "real-1" });
    const merged = mergeFetchedTasks([temp], [fresh], NONE);
    expect(merged.map((t) => t.id)).toEqual(["temp-123", "real-1"]);
  });

  it("drops a local row the server no longer returns", () => {
    const gone = makeTask({ id: "gone" });
    const merged = mergeFetchedTasks([gone], [makeTask()], NONE);
    expect(merged.map((t) => t.id)).toEqual(["task-1"]);
  });

  it("treats an unparseable local stamp as older than the server's", () => {
    const local = makeTask({ title: "local", updated_at: "not-a-date" });
    const fresh = makeTask({ title: "server" });
    expect(mergeFetchedTasks([local], [fresh], NONE)[0].title).toBe("server");
  });
});

describe("replaceTempTask", () => {
  it("swaps the temp row for the inserted row in place", () => {
    const temp = makeTask({ id: "temp-1", title: "new" });
    const other = makeTask({ id: "other" });
    const real = makeTask({ id: "real-1", title: "new" });
    const result = replaceTempTask([temp, other], "temp-1", real);
    expect(result.map((t) => t.id)).toEqual(["real-1", "other"]);
  });

  it("drops the temp row when a fetch already brought the real row in", () => {
    const temp = makeTask({ id: "temp-1" });
    const real = makeTask({ id: "real-1" });
    const result = replaceTempTask([temp, real], "temp-1", real);
    expect(result.map((t) => t.id)).toEqual(["real-1"]);
  });

  it("leaves the list alone when the temp row is already gone", () => {
    const other = makeTask({ id: "other" });
    const real = makeTask({ id: "real-1" });
    expect(replaceTempTask([other], "temp-1", real)).toEqual([other]);
  });
});

describe("applyOptimisticEdit", () => {
  it("applies the fields without touching updated_at", () => {
    const task = makeTask({ updated_at: "2026-03-01T00:00:00Z" });
    const [edited] = applyOptimisticEdit([task], "task-1", { is_completed: true });
    expect(edited.is_completed).toBe(true);
    expect(edited.updated_at).toBe("2026-03-01T00:00:00Z");
  });

  it("leaves other rows untouched", () => {
    const other = makeTask({ id: "other" });
    const [, untouched] = applyOptimisticEdit([makeTask(), other], "task-1", { title: "x" });
    expect(untouched).toBe(other);
  });
});

describe("restoreTaskSnapshot", () => {
  it("puts the pre-edit row back in place", () => {
    const snapshot = makeTask({ title: "before" });
    const edited = makeTask({ title: "after" });
    const other = makeTask({ id: "other" });
    const result = restoreTaskSnapshot([edited, other], snapshot);
    expect(result[0]).toBe(snapshot);
    expect(result[1]).toBe(other);
  });

  it("does not resurrect a row that was deleted meanwhile", () => {
    const snapshot = makeTask({ id: "deleted" });
    const list = [makeTask()];
    expect(restoreTaskSnapshot(list, snapshot)).toBe(list);
  });
});

describe("applyServerStamp", () => {
  it("records the server's updated_at on the written row only", () => {
    const other = makeTask({ id: "other" });
    const result = applyServerStamp([makeTask(), other], "task-1", "2026-04-01T00:00:00Z");
    expect(result[0].updated_at).toBe("2026-04-01T00:00:00Z");
    expect(result[1].updated_at).toBe("2026-03-01T00:00:00Z");
  });
});
