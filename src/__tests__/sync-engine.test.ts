/**
 * Tests for the sync engine that orchestrates Canvas + Gradescope fetching.
 * Mocks both client libraries and Supabase to verify upsert behavior
 * into the unified tasks table.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock canvas client
vi.mock("@/lib/canvas-client", () => ({
  fetchAllCanvasAssignments: vi.fn(),
}));

// Mock gradescope client
vi.mock("@/lib/gradescope-client", () => ({
  fetchAllGradescopeAssignments: vi.fn(),
}));

// Mock crypto
vi.mock("@/lib/crypto", () => ({
  decrypt: vi.fn((val: string) => `decrypted-${val}`),
}));

import { runSync } from "@/lib/sync-engine";
import { fetchAllCanvasAssignments } from "@/lib/canvas-client";
import { fetchAllGradescopeAssignments } from "@/lib/gradescope-client";

const mockCanvasFetch = vi.mocked(fetchAllCanvasAssignments);
const mockGradescopeFetch = vi.mocked(fetchAllGradescopeAssignments);

/**
 * Creates a chainable mock that returns itself for any chained method call.
 * Terminates the chain by resolving with { error: null }.
 */
function createChainMock() {
  const mock: Record<string, ReturnType<typeof vi.fn>> & { _self: unknown } = {} as any;
  const handler: ProxyHandler<typeof mock> = {
    get(target, prop) {
      if (prop === "_self") return target;
      if (typeof prop === "string" && !target[prop]) {
        target[prop] = vi.fn().mockReturnValue(new Proxy({} as typeof mock, handler));
      }
      if (typeof prop === "string") return target[prop];
      return undefined;
    },
  };
  // The final call in the chain (e.g. gte) should resolve with { error: null }
  // We use a Proxy that auto-creates chainable mocks
  return new Proxy(mock, handler);
}

/**
 * Returns a chainable + thenable query mock: every method (eq, or, select, is,
 * range, in, ...) returns the same object, and awaiting it resolves `resolved`.
 * Lets the mock tolerate any PostgREST chain depth (e.g. paginated .range()
 * loops and the atomic .update().or().select() cooldown claim).
 */
function chainable(resolved: unknown): any {
  const target = function () {} as unknown as object;
  const proxy: any = new Proxy(target, {
    get(_t, prop) {
      if (prop === "then") {
        return (res: (v: unknown) => void, rej?: (e: unknown) => void) =>
          Promise.resolve(resolved).then(res, rej);
      }
      return () => proxy;
    },
    apply() {
      return proxy;
    },
  });
  return proxy;
}

function createMockSupabase(credentialsData: Record<string, unknown> | null = null) {
  const upsertMock = vi.fn().mockReturnValue({ error: null });
  const updateMock = vi.fn().mockReturnValue(chainable({ data: [{ user_id: "user-123" }], error: null }));

  // Chainable mock for auto-complete update (tasks.update().eq().eq().eq().eq().in())
  const tasksAutoCompleteMock = vi.fn().mockImplementation(() => {
    const chain = {
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
    };
    chain.eq.mockReturnValue(chain);
    chain.in.mockReturnValue(chain);
    // Make the chain thenable so await resolves it
    (chain as any).then = (resolve: (v: { error: null }) => void) => {
      resolve({ error: null });
      return chain;
    };
    return chain;
  });

  return {
    from: vi.fn((table: string) => {
      if (table === "integration_credentials") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: credentialsData,
                error: credentialsData ? null : { code: "PGRST116", message: "No rows" },
              }),
            }),
          }),
          // update().eq() resolves {error:null}; update().or().select() (the
          // atomic cooldown claim) resolves a claimed row. A single chainable
          // handling both — the .eq() callers only read `error`.
          update: updateMock,
        };
      }
      if (table === "tasks") {
        return {
          upsert: upsertMock,
          update: tasksAutoCompleteMock,
          // Chainable so paginated select().eq().eq().range() (and the
          // dismiss-missing select().eq()...is().range()) all resolve empty.
          select: vi.fn().mockReturnValue(chainable({ data: [], error: null })),
        };
      }
      return {};
    }),
    _upsertMock: upsertMock,
    _updateMock: updateMock,
    _tasksAutoCompleteMock: tasksAutoCompleteMock,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("runSync", () => {
  it("should return empty results when no credentials are configured", async () => {
    const supabase = createMockSupabase(null);
    const result = await runSync(supabase as any, "user-123");

    expect(result.canvas.synced).toBe(0);
    expect(result.gradescope.synced).toBe(0);
    expect(result.canvas.errors[0]).toContain("No integration credentials");
  });

  it("should sync Canvas assignments into tasks table when token is configured", async () => {
    const supabase = createMockSupabase({
      canvas_token: "canvas-token-123",
      canvas_base_url: "https://bcourses.berkeley.edu",
      canvas_token_created_at: new Date().toISOString(),
      gradescope_email: null,
      gradescope_password_encrypted: null,
    });

    mockCanvasFetch.mockResolvedValueOnce([
      {
        external_id: "101",
        course_name: "CS 61A",
        course_id: "1",
        title: "HW 1",
        due_date: "2026-03-01T23:59:00Z",
        source_url: "https://bcourses.berkeley.edu/courses/1/assignments/101",
        points_possible: 10,
      },
    ]);

    const result = await runSync(supabase as any, "user-123");

    expect(result.canvas.synced).toBe(1);
    expect(result.canvas.errors).toHaveLength(0);
    expect(result.gradescope.synced).toBe(0);
    expect(supabase._upsertMock).toHaveBeenCalledOnce();

    // Verify upsert goes to tasks table, not assignments
    const fromCalls = supabase.from.mock.calls.map((c: string[]) => c[0]);
    expect(fromCalls).toContain("tasks");
    expect(fromCalls).not.toContain("assignments");
  });

  it("should sync Gradescope assignments into tasks table when credentials are configured", async () => {
    const supabase = createMockSupabase({
      canvas_token: null,
      canvas_base_url: "https://bcourses.berkeley.edu",
      gradescope_email: "user@berkeley.edu",
      gradescope_password_encrypted: "encrypted-pw",
    });

    mockGradescopeFetch.mockResolvedValueOnce([
      {
        external_id: "gs-1",
        course_name: "CS 61A",
        course_id: "123",
        title: "Lab 1",
        due_date: "2026-03-10T23:59:00Z",
        source_url: "https://www.gradescope.com/courses/123/assignments/1",
        points_possible: null,
      },
      {
        external_id: "gs-2",
        course_name: "CS 61A",
        course_id: "123",
        title: "Lab 2",
        due_date: null,
        source_url: "https://www.gradescope.com/courses/123/assignments/2",
        points_possible: null,
      },
    ]);

    const result = await runSync(supabase as any, "user-123");

    expect(result.canvas.synced).toBe(0);
    expect(result.gradescope.synced).toBe(2);
    expect(result.gradescope.errors).toHaveLength(0);
    expect(mockGradescopeFetch).toHaveBeenCalledWith(
      "user@berkeley.edu",
      "decrypted-encrypted-pw"
    );
  });

  it("should handle Canvas failure without blocking Gradescope", async () => {
    const supabase = createMockSupabase({
      canvas_token: "bad-token",
      canvas_base_url: "https://bcourses.berkeley.edu",
      canvas_token_created_at: new Date().toISOString(),
      gradescope_email: "user@berkeley.edu",
      gradescope_password_encrypted: "encrypted-pw",
    });

    mockCanvasFetch.mockRejectedValueOnce(new Error("Canvas token is invalid"));
    mockGradescopeFetch.mockResolvedValueOnce([
      {
        external_id: "gs-1",
        course_name: "CS 61A",
        course_id: "123",
        title: "Lab 1",
        due_date: null,
        source_url: null,
        points_possible: null,
      },
    ]);

    const result = await runSync(supabase as any, "user-123");

    expect(result.canvas.synced).toBe(0);
    expect(result.canvas.errors).toHaveLength(1);
    expect(result.canvas.errors[0]).toContain("Canvas token is invalid");
    expect(result.gradescope.synced).toBe(1);
    expect(result.gradescope.errors).toHaveLength(0);
  });

  it("should normalize Canvas 401 errors and mark token auth_failed", async () => {
    const supabase = createMockSupabase({
      canvas_token: "bad-token",
      canvas_base_url: "https://bcourses.berkeley.edu",
      canvas_token_created_at: new Date().toISOString(),
      gradescope_email: null,
      gradescope_password_encrypted: null,
    });

    mockCanvasFetch.mockRejectedValueOnce(new Error("Canvas returned 401 for course 1553118"));

    const result = await runSync(supabase as any, "user-123");

    expect(result.canvas.errors).toEqual(["Canvas token is invalid or expired. Reconnect in Settings."]);
    expect(supabase._updateMock).toHaveBeenCalledWith({ canvas_auth_failed: true });
  });

  it("should retry credential load when last_gradescope_synced_at column is missing", async () => {
    const upsertMock = vi.fn().mockReturnValue({ error: null });
    const updateMock = vi.fn().mockReturnValue(chainable({ data: [{ user_id: "user-123" }], error: null }));
    const selectMock = vi
      .fn()
      .mockReturnValueOnce({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: {
              code: "42703",
              message: "column integration_credentials.last_gradescope_synced_at does not exist",
            },
          }),
        }),
      })
      .mockReturnValueOnce({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              canvas_token: "canvas-token-123",
              canvas_base_url: "https://bcourses.berkeley.edu",
              canvas_token_created_at: new Date().toISOString(),
              gradescope_email: null,
              gradescope_password_encrypted: null,
            },
            error: null,
          }),
        }),
      });
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "integration_credentials") {
          return { select: selectMock, update: updateMock };
        }
        if (table === "tasks") {
          return {
            upsert: upsertMock,
            update: vi.fn().mockReturnValue(chainable({ error: null })),
            select: vi.fn().mockReturnValue(chainable({ data: [], error: null })),
          };
        }
        return {};
      }),
    };

    mockCanvasFetch.mockResolvedValueOnce([
      {
        external_id: "101",
        course_name: "CS 61A",
        course_id: "1",
        title: "HW 1",
        due_date: "2026-03-01T23:59:00Z",
        source_url: "https://bcourses.berkeley.edu/courses/1/assignments/101",
        points_possible: 10,
      },
    ]);

    const result = await runSync(supabase as any, "user-123");

    expect(result.canvas.synced).toBe(1);
    expect(selectMock).toHaveBeenCalledTimes(2);
  });

  it("should handle Gradescope failure without blocking Canvas", async () => {
    const supabase = createMockSupabase({
      canvas_token: "good-token",
      canvas_base_url: "https://bcourses.berkeley.edu",
      canvas_token_created_at: new Date().toISOString(),
      gradescope_email: "user@berkeley.edu",
      gradescope_password_encrypted: "encrypted-pw",
    });

    mockCanvasFetch.mockResolvedValueOnce([
      {
        external_id: "101",
        course_name: "CS 61A",
        course_id: "1",
        title: "HW 1",
        due_date: null,
        source_url: null,
        points_possible: null,
      },
    ]);
    mockGradescopeFetch.mockRejectedValueOnce(new Error("Gradescope login failed"));

    const result = await runSync(supabase as any, "user-123");

    expect(result.canvas.synced).toBe(1);
    expect(result.gradescope.synced).toBe(0);
    expect(result.gradescope.errors[0]).toContain("Gradescope login failed");
  });

  it("should update last_synced_at after sync", async () => {
    const supabase = createMockSupabase({
      canvas_token: null,
      canvas_base_url: "https://bcourses.berkeley.edu",
      gradescope_email: null,
      gradescope_password_encrypted: null,
    });

    const result = await runSync(supabase as any, "user-123");

    expect(result.last_synced_at).toBeDefined();
    expect(new Date(result.last_synced_at).getTime()).not.toBeNaN();
  });

  it("should preserve user-edited due_date / due_time on existing tasks", async () => {
    // Cause: Gradescope/Canvas resyncs were clobbering manual date edits.
    // Context: tasks table now has *_manually_edited_at columns (migration
    // 20260409000001) — when set, the upsert payload must omit those fields.
    // Impact: drag-drop reschedules and manual edits survive future syncs.
    const upsertMock = vi.fn().mockReturnValue({ error: null });

    const tasksAutoCompleteMock = vi.fn().mockImplementation(() => {
      const chain = {
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
      };
      chain.eq.mockReturnValue(chain);
      chain.in.mockReturnValue(chain);
      (chain as any).then = (resolve: (v: { error: null }) => void) => {
        resolve({ error: null });
        return chain;
      };
      return chain;
    });

    // Custom select returning one existing task with due_date locked.
    // Chainable so the paginated .range() lookup resolves this data on its
    // first page; the second page returns empty to end the loop.
    let selectPage = 0;
    const selectMock = vi.fn(() =>
      chainable(
        selectPage++ === 0
          ? {
              data: [
                {
                  external_id: "gs-locked",
                  due_date_manually_edited_at: "2026-04-08T12:00:00Z",
                  due_time_manually_edited_at: null,
                },
              ],
              error: null,
            }
          : { data: [], error: null },
      ),
    );

    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "integration_credentials") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    canvas_token: null,
                    canvas_base_url: "https://bcourses.berkeley.edu",
                    gradescope_email: "user@berkeley.edu",
                    gradescope_password_encrypted: "encrypted-pw",
                  },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue(chainable({ data: [{ user_id: "user-123" }], error: null })),
          };
        }
        if (table === "tasks") {
          return {
            upsert: upsertMock,
            update: tasksAutoCompleteMock,
            select: selectMock,
          };
        }
        return {};
      }),
    };

    mockGradescopeFetch.mockResolvedValueOnce([
      {
        external_id: "gs-locked",
        course_name: "CS 61A",
        course_id: "123",
        title: "Lab 1",
        // Scraped (original) date — must NOT overwrite the user's manual edit.
        due_date: "2026-03-10T23:59:00Z",
        source_url: "https://www.gradescope.com/courses/123/assignments/1",
        points_possible: null,
      },
    ]);

    await runSync(supabase as any, "user-123");

    // Locate the upsert call carrying the existing (locked) task.
    const lockedCalls = upsertMock.mock.calls.filter((call) => {
      const rows = call[0] as Array<Record<string, unknown>>;
      return Array.isArray(rows) && rows.some((r) => r.external_id === "gs-locked");
    });
    expect(lockedCalls.length).toBe(1);

    const lockedRow = (lockedCalls[0][0] as Array<Record<string, unknown>>).find(
      (r) => r.external_id === "gs-locked"
    )!;

    // due_date column must be absent so Supabase leaves the existing value alone.
    expect("due_date" in lockedRow).toBe(false);
    // due_time wasn't locked, so it should still be present.
    expect("due_time" in lockedRow).toBe(true);
    // Other fields still update normally.
    expect(lockedRow.title).toBe("Lab 1");
  });

  it("should auto-complete newly synced submitted assignments", async () => {
    const supabase = createMockSupabase({
      canvas_token: "canvas-token-123",
      canvas_base_url: "https://bcourses.berkeley.edu",
      canvas_token_created_at: new Date().toISOString(),
      gradescope_email: null,
      gradescope_password_encrypted: null,
    });

    mockCanvasFetch.mockResolvedValueOnce([
      {
        external_id: "201",
        course_name: "CS 61A",
        course_id: "1",
        title: "Attendance-04",
        due_date: "2026-02-10T07:59:00Z",
        source_url: "https://bcourses.berkeley.edu/courses/1/assignments/201",
        points_possible: 1,
        is_submitted: true,
      },
      {
        external_id: "202",
        course_name: "CS 61A",
        course_id: "1",
        title: "HW 5",
        due_date: "2026-02-15T23:59:00Z",
        source_url: "https://bcourses.berkeley.edu/courses/1/assignments/202",
        points_possible: 10,
        is_submitted: false,
      },
    ]);

    const result = await runSync(supabase as any, "user-123");

    expect(result.canvas.synced).toBe(2);

    // Verify that auto-complete update was called on tasks table
    // The from("tasks") call should include an update() for auto-completing
    const tasksFromCalls = supabase.from.mock.calls.filter(
      (c: string[]) => c[0] === "tasks"
    );
    // 4 calls: select existing IDs (color/manual-edit), upsert new tasks,
    // auto-complete update, and dismissMissingTasks' source-deletion check.
    expect(tasksFromCalls.length).toBe(4);

    // Verify the auto-complete mock was invoked with is_completed: true and updated_at
    const autoCompleteArg = supabase._tasksAutoCompleteMock.mock.calls[0][0];
    expect(autoCompleteArg.is_completed).toBe(true);
    expect(autoCompleteArg.updated_at).toBeDefined();
  });
});
