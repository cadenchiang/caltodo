/**
 * Tests for the server-side initial task fetch and the TaskProvider
 * contract that consumes it.
 *
 * Background: TaskProvider fetched tasks from a mount effect, so the list
 * could not start loading until ~1.5MB of app JS had hydrated. A trace of
 * /app/inbox showed the query starting at 871ms and rows landing at 1216ms.
 * The layout now runs the query server-side and passes the rows down.
 *
 * The distinction these tests protect: `undefined` means "the server fetch
 * did not produce rows, fall back to the client fetch", while `[]` means
 * "this user really has no tasks". Collapsing the two would either strand
 * empty accounts or make every load pay for a redundant refetch.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fetchInitialTasks } from "@/lib/tasks/fetch-initial-tasks";

const SRC = resolve(__dirname, "..");
const read = (rel: string) => readFileSync(resolve(SRC, rel), "utf8");

/** Minimal PostgREST-style builder that records the chained calls. */
function stubSupabase(result: { data?: unknown; error?: unknown } | Error) {
  const calls: Record<string, unknown[]> = {};
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "is", "order"]) {
    builder[method] = (...args: unknown[]) => {
      calls[method] = args;
      return builder;
    };
  }
  // `order` is the awaited terminal in this query.
  builder.order = (...args: unknown[]) => {
    calls.order = args;
    if (result instanceof Error) return Promise.reject(result);
    return Promise.resolve(result);
  };
  return {
    client: {
      from: (table: string) => {
        calls.from = [table];
        return builder;
      },
    } as never,
    calls,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchInitialTasks", () => {
  it("returns the rows on success", async () => {
    const rows = [{ id: "1" }, { id: "2" }];
    const { client } = stubSupabase({ data: rows, error: null });
    await expect(fetchInitialTasks(client)).resolves.toEqual(rows);
  });

  it("returns [] for a user with no tasks, not undefined", async () => {
    const { client } = stubSupabase({ data: [], error: null });
    await expect(fetchInitialTasks(client)).resolves.toEqual([]);
  });

  it("treats a null data payload as an empty list", async () => {
    const { client } = stubSupabase({ data: null, error: null });
    await expect(fetchInitialTasks(client)).resolves.toEqual([]);
  });

  it("queries the same shape as TaskContext.fetchTasks", async () => {
    const { client, calls } = stubSupabase({ data: [], error: null });
    await fetchInitialTasks(client);
    expect(calls.from).toEqual(["tasks"]);
    expect(calls.select).toEqual(["*"]);
    expect(calls.is).toEqual(["dismissed_at", null]);
    expect(calls.order).toEqual(["created_at", { ascending: false }]);
  });

  it("returns undefined and logs the cause when the query errors", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const { client } = stubSupabase({ data: null, error: { message: "boom", code: "42501" } });
    await expect(fetchInitialTasks(client)).resolves.toBeUndefined();
    expect(err).toHaveBeenCalled();
    expect(String(err.mock.calls[0][0])).toContain("boom");
  });

  it("returns undefined and logs the cause when the query throws", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const { client } = stubSupabase(new Error("network down"));
    await expect(fetchInitialTasks(client)).resolves.toBeUndefined();
    expect(err).toHaveBeenCalled();
    expect(String(err.mock.calls[0][0])).toContain("network down");
  });

  it("never rejects, so a failure cannot break the layout render", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { client } = stubSupabase(new Error("boom"));
    await expect(fetchInitialTasks(client)).resolves.not.toThrow;
  });
});

describe("AppLayout wiring", () => {
  const layout = read("app/app/layout.tsx");

  it("fetches initial tasks server-side", () => {
    expect(layout).toContain("fetchInitialTasks");
  });

  it("passes them into TaskProvider", () => {
    expect(layout).toMatch(/<TaskProvider\s+initialTasks=\{[^}]+\}>/);
  });

  it("runs the task query concurrently with the session lookup", () => {
    expect(layout).toContain("Promise.all");
  });

  it("still redirects an unauthenticated visitor", () => {
    expect(layout).toMatch(/if \(!session\)/);
    expect(layout).toContain('redirect("/login")');
  });
});

describe("TaskProvider seeding contract", () => {
  const ctx = read("contexts/TaskContext.tsx");

  it("accepts an optional initialTasks prop", () => {
    expect(ctx).toMatch(/initialTasks\?:\s*Task\[\]/);
  });

  it("distinguishes undefined from an empty array", () => {
    expect(ctx).toMatch(/const hasServerTasks = initialTasks !== undefined/);
  });

  it("seeds state directly so server and client first renders match", () => {
    expect(ctx).toMatch(/useState<Task\[\]>\(initialTasks \?\? \[\]\)/);
  });

  it("starts un-loading when the server supplied rows", () => {
    expect(ctx).toMatch(/useState\(!hasServerTasks\)/);
  });

  it("skips the redundant mount fetch when the server supplied rows", () => {
    expect(ctx).toMatch(/if \(!hasServerTasks\) fetchTasks\(\)/);
  });

  it("still fetches when no server rows were passed", () => {
    // The guard must be a conditional call, not a removal of the fetch.
    expect(ctx).toContain("fetchTasks()");
  });

  it("seeds the sync baseline so the first auto-sync sees a real baseline", () => {
    expect(ctx).toMatch(/useRef<Task\[\]>\(initialTasks \?\? \[\]\)/);
    expect(ctx).toMatch(/hasInitialFetchRef = useRef\(hasServerTasks\)/);
  });

  it("does not overwrite server rows with the localStorage cache", () => {
    const effect = ctx.slice(ctx.indexOf("useLayoutEffect(() => {"));
    expect(effect).toMatch(/if \(hasServerTasks\) return;/);
  });

  it("runs getCurrentUser concurrently with the task query", () => {
    expect(ctx).toMatch(/Promise\.all\(\[\s*getCurrentUser\(\)/);
  });
});
