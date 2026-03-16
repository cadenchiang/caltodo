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

function createMockSupabase(credentialsData: Record<string, unknown> | null = null) {
  const upsertMock = vi.fn().mockReturnValue({ error: null });
  const updateMock = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({ error: null }),
  });

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
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({ error: null }),
          }),
        };
      }
      if (table === "tasks") {
        return {
          upsert: upsertMock,
          update: tasksAutoCompleteMock,
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
    // Should have 2 calls: one for upsert, one for auto-complete update
    expect(tasksFromCalls.length).toBe(2);

    // Verify the auto-complete mock was invoked with is_completed: true and updated_at
    const autoCompleteArg = supabase._tasksAutoCompleteMock.mock.calls[0][0];
    expect(autoCompleteArg.is_completed).toBe(true);
    expect(autoCompleteArg.updated_at).toBeDefined();
  });
});
