/**
 * Tests for the sync function's time budget (audit M7) and for the function
 * limits declared in vercel.json agreeing with the routes (audit L7).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock("@/lib/canvas-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/canvas-client")>()),
  fetchAllCanvasAssignments: vi.fn(),
  fetchCanvasAssignmentsForCourses: vi.fn(),
  fetchCanvasCourses: vi.fn(),
}));
vi.mock("@/lib/canvas-ical-client", () => ({ fetchCanvasICalAssignments: vi.fn() }));
vi.mock("@/lib/gradescope-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/gradescope-client")>()),
  fetchAllGradescopeAssignments: vi.fn(),
  fetchGradescopeAssignmentsForCourses: vi.fn(),
}));
vi.mock("@/lib/crypto", () => ({ decrypt: vi.fn(() => "pw") }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));
vi.mock("@/lib/integration-alerts", () => ({ reportSyncFailures: vi.fn() }));
vi.mock("next/server", () => ({ after: vi.fn() }));

import { runSync } from "@/lib/sync-engine";
import { startSyncBudget, SYNC_BUDGET_MS, SYNC_FUNCTION_MAX_DURATION_MS } from "@/lib/sync-budget";
import { fetchCanvasICalAssignments } from "@/lib/canvas-ical-client";
import { fetchCanvasCourses, FETCH_TIMEOUT_MS as CANVAS_TIMEOUT } from "@/lib/canvas-client";
import { FETCH_TIMEOUT_MS as GRADESCOPE_TIMEOUT } from "@/lib/gradescope-client";
import { FEED_FETCH_TIMEOUT_MS } from "@/lib/feed-fetch";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

describe("startSyncBudget", () => {
  it("is spent once the budget has elapsed", () => {
    let t = 1_000;
    const budget = startSyncBudget(45_000, () => t);
    expect(budget.exhausted()).toBe(false);
    t += 44_999;
    expect(budget.exhausted()).toBe(false);
    expect(budget.elapsedMs()).toBe(44_999);
    t += 1;
    expect(budget.exhausted()).toBe(true);
  });

  it("leaves headroom under the function limit for in-flight writes", () => {
    expect(SYNC_BUDGET_MS).toBeLessThan(SYNC_FUNCTION_MAX_DURATION_MS);
    expect(SYNC_FUNCTION_MAX_DURATION_MS - SYNC_BUDGET_MS).toBeGreaterThanOrEqual(10_000);
  });
});

describe("per-request upstream timeouts fit the budget", () => {
  it("no single request can take more than a fraction of it", () => {
    for (const timeout of [CANVAS_TIMEOUT, GRADESCOPE_TIMEOUT, FEED_FETCH_TIMEOUT_MS]) {
      expect(timeout).toBeLessThanOrEqual(10_000);
      expect(timeout * 3).toBeLessThanOrEqual(SYNC_BUDGET_MS);
    }
  });
});

describe("runSync skips later stages once the budget is spent", () => {
  const creds = {
    canvas_token: null,
    canvas_token_created_at: null,
    canvas_base_url: "https://bcourses.berkeley.edu",
    canvas_ical_url: null,
    gradescope_email: null,
    gradescope_password_encrypted: null,
    gradescope_auth_failed: false,
    last_gradescope_synced_at: null,
    selected_canvas_courses: [{ id: 1, name: "CS 61A" }],
    selected_gradescope_courses: null,
    selected_pensieve_courses: null,
    pensieve_calendar_url: null,
    brightspace_calendar_url: null,
    blackboard_calendar_url: null,
    classroom_enabled: false,
    selected_classroom_courses: null,
    classroom_auth_failed: false,
    additional_canvas_accounts: [
      { id: "acc1", label: "Other school", base_url: "https://o.instructure.com", token: "", ical_url: "https://o.instructure.com/f.ics", selected_courses: null },
    ],
  };

  function makeSupabase() {
    function builder(resolved: unknown) {
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
    return {
      from: vi.fn((table: string) =>
        table === "integration_credentials" ? builder({ data: creds, error: null }) : builder({ data: [], error: null })
      ),
    } as any;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips the extra Canvas account, enrollment and course detection with a logged reason", async () => {
    const spent = { elapsedMs: () => 46_000, exhausted: () => true };

    const result = await runSync(makeSupabase(), "user-1", "America/Los_Angeles", undefined, false, undefined, spent);

    expect(fetchCanvasICalAssignments).not.toHaveBeenCalled();
    expect(createAdminClient).not.toHaveBeenCalled();
    expect(fetchCanvasCourses).not.toHaveBeenCalled();
    expect(result.canvas.errors).toEqual([
      "Other school: skipped, the sync ran out of time. It will retry on the next sync.",
    ]);
    const warnings = vi.mocked(logger.warn).mock.calls.map((c) => c[0]);
    expect(warnings).toContain("runSync: skipping additional Canvas account, sync budget exhausted");
    expect(warnings).toContain("runSync: skipping course enrollment, sync budget exhausted");
  });

  it("runs every stage while the budget holds", async () => {
    vi.mocked(fetchCanvasICalAssignments).mockResolvedValueOnce([]);
    vi.mocked(createAdminClient).mockReturnValue(makeSupabase());
    const fresh = { elapsedMs: () => 0, exhausted: () => false };

    const result = await runSync(makeSupabase(), "user-1", "America/Los_Angeles", undefined, false, undefined, fresh);

    expect(fetchCanvasICalAssignments).toHaveBeenCalledOnce();
    expect(createAdminClient).toHaveBeenCalledOnce();
    expect(result.canvas.errors).toEqual([]);
  });
});

describe("vercel.json agrees with the routes (audit L7, M7)", () => {
  const vercel = JSON.parse(read("vercel.json")) as { functions: Record<string, { maxDuration: number }> };

  it("gives the sync route the budget the code assumes", () => {
    expect(vercel.functions["src/app/api/assignments/sync/route.ts"].maxDuration).toBe(60);
    expect(read("src/app/api/assignments/sync/route.ts")).toContain("export const maxDuration = 60;");
    expect(SYNC_FUNCTION_MAX_DURATION_MS).toBe(60_000);
  });

  it("gives the syllabus route the 60s it declares", () => {
    expect(vercel.functions["src/app/api/syllabus/extract/route.ts"].maxDuration).toBe(60);
    expect(read("src/app/api/syllabus/extract/route.ts")).toContain("export const maxDuration = 60;");
  });
});
