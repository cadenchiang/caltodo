/**
 * Tests for how the sync engine reads the rows it already holds before
 * upserting (audit M5).
 *
 * A failed page read used to break out of the loop and continue with a
 * partial list, treating every unseen assignment as new: colours and
 * manual edits overwritten, user-dismissed tasks resurrected. The read now
 * aborts that source for the run, and every paginated scan carries a
 * stable order so pages cannot overlap or skip rows.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock("@/lib/canvas-client", () => ({
  fetchAllCanvasAssignments: vi.fn(),
  fetchCanvasAssignmentsForCourses: vi.fn(),
  fetchCanvasCourses: vi.fn(),
}));
vi.mock("@/lib/gradescope-client", () => ({
  fetchAllGradescopeAssignments: vi.fn(),
  fetchGradescopeAssignmentsForCourses: vi.fn(),
}));
vi.mock("@/lib/crypto", () => ({ decrypt: vi.fn(() => "pw") }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => {
    throw new Error("admin client not available in this test");
  },
}));
vi.mock("@/lib/integration-alerts", () => ({ reportSyncFailures: vi.fn() }));
vi.mock("next/server", () => ({ after: vi.fn() }));

import { runSync } from "@/lib/sync-engine";
import { fetchAllCanvasAssignments } from "@/lib/canvas-client";
import { logger } from "@/lib/logger";

const mockCanvas = vi.mocked(fetchAllCanvasAssignments);

const CREDS = {
  canvas_token: "tok",
  canvas_token_created_at: new Date().toISOString(),
  canvas_base_url: "https://bcourses.berkeley.edu",
  canvas_ical_url: null,
  gradescope_email: null,
  gradescope_password_encrypted: null,
  gradescope_auth_failed: false,
  last_gradescope_synced_at: null,
  selected_canvas_courses: null,
  selected_gradescope_courses: null,
  selected_pensieve_courses: null,
  pensieve_calendar_url: null,
  brightspace_calendar_url: null,
  blackboard_calendar_url: null,
  classroom_enabled: false,
  selected_classroom_courses: null,
  classroom_auth_failed: false,
  additional_canvas_accounts: [],
};

/**
 * A Supabase stub whose tasks selects fail with `selectError`, recording
 * every upsert and every .order() call.
 */
function makeSupabase(selectError: { message: string } | null) {
  const upserted: unknown[] = [];
  const orders: unknown[][] = [];
  function builder(resolved: unknown, isTasks: boolean) {
    const target = function () {} as unknown as object;
    const proxy: any = new Proxy(target, {
      get(_t, prop) {
        if (prop === "then") {
          return (res: (v: unknown) => void, rej?: (e: unknown) => void) =>
            Promise.resolve(resolved).then(res, rej);
        }
        if (prop === "upsert" && isTasks) {
          return (rows: unknown[]) => {
            upserted.push(...rows);
            return proxy;
          };
        }
        if (prop === "order" && isTasks) {
          return (...args: unknown[]) => {
            orders.push(args);
            return proxy;
          };
        }
        return () => proxy;
      },
      apply() {
        return proxy;
      },
    });
    return proxy;
  }
  const from = vi.fn((table: string) =>
    table === "integration_credentials"
      ? builder({ data: CREDS, error: null }, false)
      : builder(selectError ? { data: null, error: selectError } : { data: [], error: null }, true)
  );
  return { client: { from } as any, upserted, orders };
}

const assignment = {
  external_id: "1",
  course_name: "CS 61A",
  course_id: "1",
  title: "HW",
  due_date: null,
  source_url: null,
  points_possible: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("existing-rows read", () => {
  it("aborts the source for this run when a page read fails, writing nothing", async () => {
    const { client, upserted } = makeSupabase({ message: "canceling statement due to timeout" });
    mockCanvas.mockResolvedValueOnce([assignment]);

    const result = await runSync(client, "user-1", "America/Los_Angeles", undefined, false, ["canvas"]);

    expect(upserted).toEqual([]);
    expect(result.canvas.synced).toBe(0);
    expect(result.canvas.errors[0]).toContain("could not read existing tasks");
    expect(result.canvas.errors[0]).toContain("canceling statement due to timeout");
    expect(logger.error).toHaveBeenCalledWith(
      "upsertAssignments: failed to page existing tasks, skipping source this run",
      expect.objectContaining({ source: "canvas", cause: "canceling statement due to timeout", impact: expect.any(String) })
    );
  });

  it("still writes when the read succeeds", async () => {
    const { client, upserted } = makeSupabase(null);
    mockCanvas.mockResolvedValueOnce([assignment]);

    const result = await runSync(client, "user-1", "America/Los_Angeles", undefined, false, ["canvas"]);

    expect(upserted).toHaveLength(1);
    expect(result.canvas.synced).toBe(1);
  });

  it("orders every paginated tasks scan by primary key", async () => {
    const { client, orders } = makeSupabase(null);
    mockCanvas.mockResolvedValueOnce([assignment]);

    await runSync(client, "user-1", "America/Los_Angeles", undefined, false, ["canvas"]);

    // One for the existing-rows read, one for the dismiss-missing read.
    expect(orders).toEqual([["id", { ascending: true }], ["id", { ascending: true }]]);
  });
});

describe("every .range() pagination carries an .order()", () => {
  it("in the sync engine and the admin overview", () => {
    const root = path.resolve(__dirname, "../..");
    for (const rel of ["src/lib/sync-engine.ts", "src/app/api/admin/overview/route.ts"]) {
      const src = fs.readFileSync(path.join(root, rel), "utf8");
      // Only real calls (an argument list), not the word in a comment.
      const ranges = src.match(/\.range\(\w+,/g) ?? [];
      const orderedRanges = src.match(/\.order\([^)]*\)\s*\n\s*\.range\(\w+,/g) ?? [];
      expect(ranges.length, rel).toBeGreaterThan(0);
      expect(orderedRanges.length, rel).toBe(ranges.length);
    }
  });
});
