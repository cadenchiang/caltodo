/**
 * Tests for the MCP assignment queries.
 * Mocks the Supabase query builder to assert filters, ordering, and errors.
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

const mockRunSync = vi.fn();
vi.mock("@/lib/sync-engine", () => ({
  runSync: (...args: unknown[]) => mockRunSync(...args),
}));

import {
  listAssignments,
  syncAssignments,
  todayInTimezone,
  addDays,
  clampLimit,
} from "@/lib/mcp/assignments";
import type { SupabaseClient } from "@supabase/supabase-js";

const USER_ID = "user-abc-123";

/** Records every builder call so assertions can inspect the composed query. */
interface QuerySpy {
  calls: Array<{ method: string; args: unknown[] }>;
  client: SupabaseClient;
}

/**
 * Builds a chainable Supabase mock that resolves to the given result.
 *
 * @param result - The `{ data, error }` the final await should produce
 * @returns A spy recording builder calls plus the fake client
 */
function makeClient(result: { data: unknown; error: unknown }): QuerySpy {
  const calls: Array<{ method: string; args: unknown[] }> = [];

  const builder: Record<string, unknown> = {};
  const chain = (method: string) => (...args: unknown[]) => {
    calls.push({ method, args });
    return builder;
  };

  for (const method of ["select", "eq", "is", "in", "or", "lt", "ilike", "order"]) {
    builder[method] = chain(method);
  }
  builder.limit = (...args: unknown[]) => {
    calls.push({ method: "limit", args });
    return Promise.resolve(result);
  };

  const client = {
    from: (...args: unknown[]) => {
      calls.push({ method: "from", args });
      return builder;
    },
  } as unknown as SupabaseClient;

  return { calls, client };
}

/** Finds the arguments of the first call to a builder method. */
function argsFor(spy: QuerySpy, method: string): unknown[] | undefined {
  return spy.calls.find((c) => c.method === method)?.args;
}

/** Finds every call to a builder method. */
function allCalls(spy: QuerySpy, method: string): unknown[][] {
  return spy.calls.filter((c) => c.method === method).map((c) => c.args);
}

const ROW = {
  id: "task-1",
  title: "Problem Set 3",
  course_name: "UGBA 101A",
  source: "canvas",
  due_date: "2026-08-25",
  due_time: "23:59",
  is_completed: false,
  is_submitted: false,
  points_possible: 20,
  source_url: "https://canvas.example/a/1",
};

describe("todayInTimezone", () => {
  it("formats the instant in the requested timezone", () => {
    const instant = new Date("2026-08-22T05:30:00Z");
    expect(todayInTimezone("America/Los_Angeles", instant)).toBe("2026-08-21");
    expect(todayInTimezone("UTC", instant)).toBe("2026-08-22");
  });

  it("falls back to the default timezone for an invalid name", () => {
    const instant = new Date("2026-08-22T05:30:00Z");
    expect(todayInTimezone("Not/AZone", instant)).toBe("2026-08-21");
  });
});

describe("addDays", () => {
  it("adds days across a month boundary", () => {
    expect(addDays("2026-08-30", 3)).toBe("2026-09-02");
  });

  it("subtracts days for a negative offset", () => {
    expect(addDays("2026-09-02", -3)).toBe("2026-08-30");
  });

  it("returns the same date for zero", () => {
    expect(addDays("2026-08-22", 0)).toBe("2026-08-22");
  });
});

describe("clampLimit", () => {
  it("defaults when undefined", () => {
    expect(clampLimit(undefined)).toBe(50);
  });

  it("clamps above the maximum and below the minimum", () => {
    expect(clampLimit(1000)).toBe(100);
    expect(clampLimit(0)).toBe(1);
    expect(clampLimit(-5)).toBe(1);
  });

  it("floors fractional values and rejects NaN", () => {
    expect(clampLimit(7.9)).toBe(7);
    expect(clampLimit(Number.NaN)).toBe(50);
  });
});

describe("listAssignments", () => {
  beforeEach(() => vi.clearAllMocks());

  it("scopes to the user, excludes dismissed rows, and maps the result", async () => {
    const spy = makeClient({ data: [ROW], error: null });
    const items = await listAssignments(USER_ID, {}, spy.client);

    expect(argsFor(spy, "from")).toEqual(["tasks"]);
    expect(allCalls(spy, "eq")).toContainEqual(["user_id", USER_ID]);
    expect(argsFor(spy, "is")).toEqual(["dismissed_at", null]);
    expect(items).toEqual([
      {
        id: "task-1",
        title: "Problem Set 3",
        course: "UGBA 101A",
        source: "canvas",
        due_date: "2026-08-25",
        due_time: "23:59",
        is_completed: false,
        is_submitted: false,
        points_possible: 20,
        url: "https://canvas.example/a/1",
      },
    ]);
  });

  it("includes both synced platforms and manual tasks when no source is given", async () => {
    const spy = makeClient({ data: [], error: null });
    await listAssignments(USER_ID, {}, spy.client);
    const orClauses = allCalls(spy, "or").map((a) => a[0] as string);
    expect(orClauses).toContain("source.in.(canvas,gradescope,pensieve,brightspace,blackboard,classroom,syllabus),source.is.null");
  });

  it("filters to manual tasks only when source is manual", async () => {
    const spy = makeClient({ data: [], error: null });
    await listAssignments(USER_ID, { source: "manual" }, spy.client);
    expect(allCalls(spy, "is")).toContainEqual(["source", null]);
    expect(allCalls(spy, "eq")).not.toContainEqual(["source", "manual"]);
  });

  it("filters to a single source when given", async () => {
    const spy = makeClient({ data: [], error: null });
    await listAssignments(USER_ID, { source: "gradescope" }, spy.client);
    expect(allCalls(spy, "eq")).toContainEqual(["source", "gradescope"]);
    expect(allCalls(spy, "or").map((a) => a[0] as string)).not.toContain(
      "source.in.(canvas,gradescope,pensieve,brightspace,blackboard,classroom,syllabus),source.is.null"
    );
  });

  it("excludes completed assignments by default and includes them on request", async () => {
    const withoutCompleted = makeClient({ data: [], error: null });
    await listAssignments(USER_ID, {}, withoutCompleted.client);
    expect(allCalls(withoutCompleted, "eq")).toContainEqual(["is_completed", false]);

    const withCompleted = makeClient({ data: [], error: null });
    await listAssignments(USER_ID, { includeCompleted: true }, withCompleted.client);
    expect(allCalls(withCompleted, "eq")).not.toContainEqual(["is_completed", false]);
  });

  it("uses a less-than filter for overdue", async () => {
    const spy = makeClient({ data: [], error: null });
    await listAssignments(USER_ID, { status: "overdue", timezone: "UTC" }, spy.client);
    const lt = argsFor(spy, "lt");
    expect(lt?.[0]).toBe("due_date");
    expect(lt?.[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("uses an equality filter for today", async () => {
    const spy = makeClient({ data: [], error: null });
    await listAssignments(USER_ID, { status: "today", timezone: "UTC" }, spy.client);
    const eqCalls = allCalls(spy, "eq").filter((a) => a[0] === "due_date");
    expect(eqCalls).toHaveLength(1);
  });

  it("uses a date-range-or-null filter for upcoming", async () => {
    const spy = makeClient({ data: [], error: null });
    await listAssignments(USER_ID, { status: "upcoming", daysAhead: 7 }, spy.client);
    const dateClause = allCalls(spy, "or")
      .map((a) => a[0] as string)
      .find((c) => c.includes("due_date"));
    expect(dateClause).toContain("due_date.gte.");
    expect(dateClause).toContain("due_date.lte.");
    expect(dateClause).toContain("due_date.is.null");
  });

  it("applies no date filter for status all", async () => {
    const spy = makeClient({ data: [], error: null });
    await listAssignments(USER_ID, { status: "all" }, spy.client);
    const dateClauses = allCalls(spy, "or")
      .map((a) => a[0] as string)
      .filter((c) => c.includes("due_date"));
    expect(dateClauses).toEqual([]);
    expect(argsFor(spy, "lt")).toBeUndefined();
  });

  it("applies a course substring filter", async () => {
    const spy = makeClient({ data: [], error: null });
    await listAssignments(USER_ID, { course: "101A" }, spy.client);
    expect(argsFor(spy, "ilike")).toEqual(["course_name", "%101A%"]);
  });

  it("clamps the limit passed to Supabase", async () => {
    const spy = makeClient({ data: [], error: null });
    await listAssignments(USER_ID, { limit: 500 }, spy.client);
    expect(argsFor(spy, "limit")).toEqual([100]);
  });

  it("orders by due date with nulls last, then title", async () => {
    const spy = makeClient({ data: [], error: null });
    await listAssignments(USER_ID, {}, spy.client);
    expect(allCalls(spy, "order")).toEqual([
      ["due_date", { ascending: true, nullsFirst: false }],
      ["title", { ascending: true }],
    ]);
  });

  it("returns an empty array when Supabase returns no rows", async () => {
    const spy = makeClient({ data: null, error: null });
    await expect(listAssignments(USER_ID, {}, spy.client)).resolves.toEqual([]);
  });

  it("throws with the Supabase message when the query fails", async () => {
    const spy = makeClient({ data: null, error: { message: "connection reset" } });
    await expect(listAssignments(USER_ID, {}, spy.client)).rejects.toThrow(
      /connection reset/
    );
  });
});

describe("syncAssignments", () => {
  beforeEach(() => vi.clearAllMocks());

  it("runs the sync engine for every platform it knows", async () => {
    // Naming only Canvas and Gradescope gave a student on any other platform
    // a "synced" result that had quietly skipped their work. The engine
    // no-ops for a platform that is not connected.
    const result = {
      canvas: { synced: 3, errors: [] },
      gradescope: { synced: 1, errors: [] },
      pensieve: { synced: 0, errors: [] },
      brightspace: { synced: 0, errors: [] },
      blackboard: { synced: 0, errors: [] },
      classroom: { synced: 0, errors: [] },
      last_synced_at: "2026-08-22T00:00:00Z",
    };
    mockRunSync.mockResolvedValue(result);

    const client = {} as SupabaseClient;
    await expect(syncAssignments(USER_ID, "UTC", client)).resolves.toBe(result);
    expect(mockRunSync).toHaveBeenCalledWith(client, USER_ID, "UTC", undefined, false, [
      "canvas",
      "gradescope",
      "pensieve",
      "brightspace",
      "blackboard",
      "classroom",
    ]);
  });

  it("propagates a sync engine failure", async () => {
    mockRunSync.mockRejectedValue(new Error("canvas token expired"));
    await expect(
      syncAssignments(USER_ID, "UTC", {} as SupabaseClient)
    ).rejects.toThrow(/canvas token expired/);
  });
});
