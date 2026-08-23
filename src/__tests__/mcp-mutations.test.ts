/**
 * Tests for MCP task creation and deletion.
 * Mocks the Supabase query builder to assert validation, user scoping, and the
 * soft-delete-for-synced / hard-delete-for-manual split.
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

import { buildTaskRow, createTask, deleteTask } from "@/lib/mcp/mutations";
import type { SupabaseClient } from "@supabase/supabase-js";

const USER_ID = "user-abc-123";

describe("buildTaskRow", () => {
  it("trims the title and defaults the optional fields", () => {
    expect(buildTaskRow({ title: "  Read chapter 4  " })).toEqual({
      title: "Read chapter 4",
      description: "",
      due_date: null,
      due_time: null,
      course_name: null,
      tags: [],
      color: "#3B82F6",
    });
  });

  it("keeps a due time when a due date is present", () => {
    const row = buildTaskRow({ title: "x", dueDate: "2026-08-30", dueTime: "17:00" });
    expect(row.due_date).toBe("2026-08-30");
    expect(row.due_time).toBe("17:00");
  });

  it("drops a due time with no due date, since the app cannot show it", () => {
    const row = buildTaskRow({ title: "x", dueTime: "17:00" });
    expect(row.due_time).toBeNull();
  });

  it("rejects a blank title", () => {
    expect(() => buildTaskRow({ title: "   " })).toThrow(/non-empty title/);
  });

  it("rejects a title over the length cap", () => {
    expect(() => buildTaskRow({ title: "x".repeat(501) })).toThrow(/too long/);
  });

  it("rejects a malformed due date", () => {
    expect(() => buildTaskRow({ title: "x", dueDate: "Aug 30" })).toThrow(/YYYY-MM-DD/);
    expect(() => buildTaskRow({ title: "x", dueDate: "2026-8-30" })).toThrow(/YYYY-MM-DD/);
  });

  it("rejects a malformed or out-of-range due time", () => {
    expect(() => buildTaskRow({ title: "x", dueDate: "2026-08-30", dueTime: "5pm" })).toThrow(
      /HH:MM/
    );
    expect(() => buildTaskRow({ title: "x", dueDate: "2026-08-30", dueTime: "24:00" })).toThrow(
      /HH:MM/
    );
    expect(() => buildTaskRow({ title: "x", dueDate: "2026-08-30", dueTime: "12:60" })).toThrow(
      /HH:MM/
    );
  });
});

/** Records builder calls so assertions can inspect the composed statement. */
interface Spy {
  calls: Array<{ method: string; args: unknown[] }>;
  client: SupabaseClient;
}

/**
 * Builds a chainable Supabase mock.
 *
 * @param terminals - Result for each terminal method the code awaits
 * @returns A spy recording builder calls plus the fake client
 */
function makeClient(terminals: {
  single?: { data: unknown; error: unknown };
  maybeSingle?: { data: unknown; error: unknown };
  update?: { error: unknown };
  delete?: { error: unknown };
}): Spy {
  const calls: Array<{ method: string; args: unknown[] }> = [];
  const builder: Record<string, unknown> = {};

  // Returns `this`, not `builder`, so chaining off an awaitable update()/delete()
  // result keeps that result's thenable instead of falling back to the base builder.
  const chain = (method: string) =>
    function (this: unknown, ...args: unknown[]) {
      calls.push({ method, args });
      return this;
    };

  for (const m of ["insert", "select", "eq", "is"]) builder[m] = chain(m);

  builder.single = () => {
    calls.push({ method: "single", args: [] });
    return Promise.resolve(terminals.single ?? { data: null, error: null });
  };
  builder.maybeSingle = () => {
    calls.push({ method: "maybeSingle", args: [] });
    return Promise.resolve(terminals.maybeSingle ?? { data: null, error: null });
  };
  // update()/delete() are chainable AND awaitable: the code appends .eq() calls
  // and awaits the result, so the returned object is a thenable builder.
  const writeResult = (method: "update" | "delete") => (...args: unknown[]) => {
    calls.push({ method, args });
    const result = terminals[method] ?? { error: null };
    return Object.assign(Object.create(builder), {
      then: (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve),
    });
  };
  builder.update = writeResult("update");
  builder.delete = writeResult("delete");

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

/** Whether a builder method was called at all. */
function called(spy: Spy, method: string): boolean {
  return spy.calls.some((c) => c.method === method);
}

describe("createTask", () => {
  beforeEach(() => vi.clearAllMocks());

  it("inserts the row with the caller's user_id and returns the created task", async () => {
    const created = {
      id: "new-1",
      title: "Read chapter 4",
      due_date: null,
      due_time: null,
      course_name: null,
    };
    const spy = makeClient({ single: { data: created, error: null } });

    await expect(
      createTask(USER_ID, { title: "Read chapter 4" }, spy.client)
    ).resolves.toEqual(created);

    expect(allCalls(spy, "from")).toContainEqual(["tasks"]);
    const insertArg = allCalls(spy, "insert")[0][0] as Record<string, unknown>;
    expect(insertArg.user_id).toBe(USER_ID);
    expect(insertArg.title).toBe("Read chapter 4");
    // No source: the sync engine must leave manual tasks alone.
    expect(insertArg.source).toBeUndefined();
  });

  it("validates before touching the database", async () => {
    const spy = makeClient({});
    await expect(createTask(USER_ID, { title: "  " }, spy.client)).rejects.toThrow(
      /non-empty title/
    );
    expect(called(spy, "insert")).toBe(false);
  });

  it("throws with the Supabase message when the insert fails", async () => {
    const spy = makeClient({ single: { data: null, error: { message: "null violation" } } });
    await expect(createTask(USER_ID, { title: "x" }, spy.client)).rejects.toThrow(
      /null violation/
    );
  });
});

describe("deleteTask", () => {
  beforeEach(() => vi.clearAllMocks());

  const manualTask = {
    id: "task-1",
    title: "Buy a notebook",
    source: null,
    external_id: null,
    dismissed_at: null,
  };

  const syncedTask = {
    id: "task-2",
    title: "Chapter 1 - Corporations",
    source: "canvas",
    external_id: "9107004",
    dismissed_at: null,
  };

  it("hard-deletes a manual task", async () => {
    const spy = makeClient({ maybeSingle: { data: manualTask, error: null } });
    await expect(deleteTask(USER_ID, "task-1", spy.client)).resolves.toEqual({
      title: "Buy a notebook",
      soft: false,
    });
    expect(called(spy, "delete")).toBe(true);
    expect(called(spy, "update")).toBe(false);
  });

  it("soft-deletes a synced assignment so sync cannot resurrect it", async () => {
    const spy = makeClient({ maybeSingle: { data: syncedTask, error: null } });
    await expect(deleteTask(USER_ID, "task-2", spy.client)).resolves.toEqual({
      title: "Chapter 1 - Corporations",
      soft: true,
    });
    expect(called(spy, "delete")).toBe(false);
    const patch = allCalls(spy, "update")[0][0] as Record<string, unknown>;
    expect(patch.dismissed_by_user).toBe(true);
    expect(typeof patch.dismissed_at).toBe("string");
  });

  it("scopes both the lookup and the write to the caller's user_id", async () => {
    const spy = makeClient({ maybeSingle: { data: manualTask, error: null } });
    await deleteTask(USER_ID, "task-1", spy.client);
    const userScopes = allCalls(spy, "eq").filter((a) => a[0] === "user_id");
    expect(userScopes).toHaveLength(2);
    expect(userScopes.every((a) => a[1] === USER_ID)).toBe(true);
  });

  it("reports not found for an id that is not the caller's", async () => {
    const spy = makeClient({ maybeSingle: { data: null, error: null } });
    await expect(deleteTask(USER_ID, "someone-elses", spy.client)).rejects.toThrow(
      /No task found/
    );
    expect(called(spy, "delete")).toBe(false);
    expect(called(spy, "update")).toBe(false);
  });

  it("refuses to delete an already-deleted task", async () => {
    const spy = makeClient({
      maybeSingle: { data: { ...syncedTask, dismissed_at: "2026-08-01T00:00:00Z" }, error: null },
    });
    await expect(deleteTask(USER_ID, "task-2", spy.client)).rejects.toThrow(/already deleted/);
    expect(called(spy, "update")).toBe(false);
  });

  it("throws when the lookup itself fails", async () => {
    const spy = makeClient({ maybeSingle: { data: null, error: { message: "timeout" } } });
    await expect(deleteTask(USER_ID, "task-1", spy.client)).rejects.toThrow(/timeout/);
  });

  it("throws when the delete statement fails", async () => {
    const spy = makeClient({
      maybeSingle: { data: manualTask, error: null },
      delete: { error: { message: "permission denied" } },
    });
    await expect(deleteTask(USER_ID, "task-1", spy.client)).rejects.toThrow(
      /permission denied/
    );
  });
});
