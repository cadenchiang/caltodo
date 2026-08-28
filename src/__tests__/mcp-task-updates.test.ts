/**
 * Tests for MCP task completion and edits.
 * Mocks the Supabase query builder to assert ownership scoping, the
 * completed_at stamp, edit validation, and the manual-edit markers that stop
 * the sync engine overwriting a deliberately moved due date.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => {
    throw new Error("createAdminClient should not be called when a client is injected");
  }),
}));

import { setTaskCompletion, updateTask, buildEditPatch } from "@/lib/mcp/task-updates";
import type { SupabaseClient } from "@supabase/supabase-js";

const USER_ID = "user-abc-123";

const TASK = {
  id: "task-1",
  title: "Problem Set 3",
  is_completed: false,
  due_date: "2026-09-04",
  due_time: "17:00",
  course_name: "UGBA 103",
};

/** Records builder calls so assertions can inspect the composed statement. */
interface Spy {
  calls: Array<{ method: string; args: unknown[] }>;
  client: SupabaseClient;
}

/**
 * Builds a chainable Supabase mock.
 *
 * @param lookup - Result of the ownership lookup (maybeSingle)
 * @param write - Result of the update (single)
 */
function makeClient(
  lookup: { data: unknown; error: unknown },
  write: { data: unknown; error: unknown } = { data: TASK, error: null }
): Spy {
  const calls: Array<{ method: string; args: unknown[] }> = [];
  const builder: Record<string, unknown> = {};
  let updating = false;

  const chain = (method: string) =>
    function (this: unknown, ...args: unknown[]) {
      calls.push({ method, args });
      if (method === "update") updating = true;
      return this;
    };

  for (const m of ["select", "eq", "is", "update"]) builder[m] = chain(m);

  builder.maybeSingle = () => {
    calls.push({ method: "maybeSingle", args: [] });
    return Promise.resolve(lookup);
  };
  builder.single = () => {
    calls.push({ method: "single", args: [] });
    return Promise.resolve(updating ? write : lookup);
  };

  const client = {
    from: (...args: unknown[]) => {
      calls.push({ method: "from", args });
      return builder;
    },
  } as unknown as SupabaseClient;

  return { calls, client };
}

/** Every call to a builder method. */
function allCalls(spy: Spy, method: string): unknown[][] {
  return spy.calls.filter((c) => c.method === method).map((c) => c.args);
}

describe("buildEditPatch", () => {
  it("maps supplied fields onto columns", () => {
    expect(buildEditPatch({ title: "  New  ", course: "CS 61A" })).toEqual({
      title: "New",
      course_name: "CS 61A",
    });
  });

  it("leaves unmentioned fields out entirely", () => {
    const patch = buildEditPatch({ title: "New" });
    expect("due_date" in patch).toBe(false);
    expect("course_name" in patch).toBe(false);
  });

  it("clears a due date and its time together", () => {
    // A time with no date is invisible in the app.
    expect(buildEditPatch({ dueDate: null })).toEqual({ due_date: null, due_time: null });
  });

  it("clears a course when given null", () => {
    expect(buildEditPatch({ course: null })).toEqual({ course_name: null });
  });

  it("rejects a blank title", () => {
    expect(() => buildEditPatch({ title: "   " })).toThrow(/cannot be empty/);
  });

  it("rejects malformed dates and times", () => {
    expect(() => buildEditPatch({ dueDate: "Sept 4" })).toThrow(/YYYY-MM-DD/);
    expect(() => buildEditPatch({ dueTime: "5pm" })).toThrow(/HH:MM/);
    expect(() => buildEditPatch({ dueTime: "24:00" })).toThrow(/HH:MM/);
  });

  it("rejects an empty edit", () => {
    expect(() => buildEditPatch({})).toThrow(/at least one field/);
  });
});

describe("setTaskCompletion", () => {
  beforeEach(() => vi.clearAllMocks());

  it("marks a task done and stamps completed_at", async () => {
    const spy = makeClient(
      { data: TASK, error: null },
      { data: { ...TASK, is_completed: true }, error: null }
    );
    const result = await setTaskCompletion(USER_ID, "task-1", true, spy.client);

    const patch = allCalls(spy, "update")[0][0] as Record<string, unknown>;
    expect(patch.is_completed).toBe(true);
    expect(typeof patch.completed_at).toBe("string");
    expect(result.is_completed).toBe(true);
  });

  it("clears completed_at when reopening", async () => {
    const spy = makeClient(
      { data: { ...TASK, is_completed: true }, error: null },
      { data: TASK, error: null }
    );
    await setTaskCompletion(USER_ID, "task-1", false, spy.client);

    const patch = allCalls(spy, "update")[0][0] as Record<string, unknown>;
    expect(patch.is_completed).toBe(false);
    expect(patch.completed_at).toBeNull();
  });

  it("writes nothing when the task is already in that state", async () => {
    const spy = makeClient({ data: { ...TASK, is_completed: true }, error: null });
    const result = await setTaskCompletion(USER_ID, "task-1", true, spy.client);
    expect(allCalls(spy, "update")).toHaveLength(0);
    expect(result.is_completed).toBe(true);
  });

  it("scopes the lookup to the caller", async () => {
    const spy = makeClient({ data: TASK, error: null });
    await setTaskCompletion(USER_ID, "task-1", true, spy.client);
    expect(allCalls(spy, "eq")).toContainEqual(["user_id", USER_ID]);
  });

  it("reports another user's task as not found", async () => {
    const spy = makeClient({ data: null, error: null });
    await expect(
      setTaskCompletion(USER_ID, "someone-elses", true, spy.client)
    ).rejects.toThrow(/No task found/);
    expect(allCalls(spy, "update")).toHaveLength(0);
  });

  it("ignores tasks already deleted", async () => {
    const spy = makeClient({ data: TASK, error: null });
    await setTaskCompletion(USER_ID, "task-1", true, spy.client);
    expect(allCalls(spy, "is")).toContainEqual(["dismissed_at", null]);
  });
});

describe("updateTask", () => {
  beforeEach(() => vi.clearAllMocks());

  it("writes only the supplied fields", async () => {
    const spy = makeClient({ data: TASK, error: null });
    await updateTask(USER_ID, "task-1", { title: "Renamed" }, spy.client);

    const patch = allCalls(spy, "update")[0][0] as Record<string, unknown>;
    expect(patch.title).toBe("Renamed");
    expect("course_name" in patch).toBe(false);
  });

  it("stamps the manual-edit marker when a due date changes", async () => {
    // Without this the next sync would overwrite the date the user just moved.
    const spy = makeClient({ data: TASK, error: null });
    await updateTask(USER_ID, "task-1", { dueDate: "2026-09-10" }, spy.client);

    const patch = allCalls(spy, "update")[0][0] as Record<string, unknown>;
    expect(typeof patch.due_date_manually_edited_at).toBe("string");
  });

  it("does not stamp the marker for an unrelated edit", async () => {
    const spy = makeClient({ data: TASK, error: null });
    await updateTask(USER_ID, "task-1", { title: "Renamed" }, spy.client);

    const patch = allCalls(spy, "update")[0][0] as Record<string, unknown>;
    expect("due_date_manually_edited_at" in patch).toBe(false);
  });

  it("validates before touching the database", async () => {
    const spy = makeClient({ data: TASK, error: null });
    await expect(updateTask(USER_ID, "task-1", {}, spy.client)).rejects.toThrow(
      /at least one field/
    );
    expect(allCalls(spy, "update")).toHaveLength(0);
  });

  it("reports another user's task as not found", async () => {
    const spy = makeClient({ data: null, error: null });
    await expect(
      updateTask(USER_ID, "someone-elses", { title: "x" }, spy.client)
    ).rejects.toThrow(/No task found/);
  });

  it("surfaces a write failure", async () => {
    const spy = makeClient(
      { data: TASK, error: null },
      { data: null, error: { message: "permission denied" } }
    );
    await expect(
      updateTask(USER_ID, "task-1", { title: "x" }, spy.client)
    ).rejects.toThrow(/permission denied/);
  });
});
