/**
 * Tests that an extra Canvas account connected by calendar feed honours its
 * own class selection (audit M4). The token path already did; the feed path
 * synced every course the feed carried.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock("@/lib/canvas-client", () => ({
  fetchAllCanvasAssignments: vi.fn(),
  fetchCanvasAssignmentsForCourses: vi.fn(),
  fetchCanvasCourses: vi.fn(),
}));
vi.mock("@/lib/canvas-ical-client", () => ({ fetchCanvasICalAssignments: vi.fn() }));
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
import { fetchCanvasICalAssignments } from "@/lib/canvas-ical-client";
import type { NormalizedAssignment } from "@/lib/canvas-client";

const mockIcal = vi.mocked(fetchCanvasICalAssignments);

const inCourse = (externalId: string, course: string): NormalizedAssignment => ({
  external_id: externalId,
  course_name: course,
  course_id: "0",
  title: "HW",
  due_date: null,
  due_is_all_day: false,
  source_url: null,
  points_possible: null,
  is_submitted: false,
  description: null,
});

/**
 * Builds credentials with no primary Canvas connection and one extra iCal
 * account carrying the given selection.
 */
function credsWithExtra(selected: Array<{ id: number; name: string }> | null) {
  return {
    canvas_token: null,
    canvas_token_created_at: null,
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
    additional_canvas_accounts: [
      { id: "acc1", label: "Other school", base_url: "https://other.instructure.com", token: "", ical_url: "https://other.instructure.com/feeds/x.ics", selected_courses: selected },
    ],
  };
}

/** Records every tasks upsert so the test can see which rows were written. */
function makeSupabase(creds: Record<string, unknown>) {
  const upserted: Array<Record<string, unknown>> = [];
  function builder(resolved: unknown) {
    const target = function () {} as unknown as object;
    const proxy: any = new Proxy(target, {
      get(_t, prop) {
        if (prop === "then") {
          return (res: (v: unknown) => void, rej?: (e: unknown) => void) =>
            Promise.resolve(resolved).then(res, rej);
        }
        if (prop === "upsert") {
          return (rows: Array<Record<string, unknown>>) => {
            upserted.push(...rows);
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
    table === "integration_credentials" ? builder({ data: creds, error: null }) : builder({ data: [], error: null })
  );
  return { client: { from } as any, upserted };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("extra Canvas account via calendar feed", () => {
  it("keeps only the courses that account selected", async () => {
    const { client, upserted } = makeSupabase(credsWithExtra([{ id: 0, name: "MATH 53" }]));
    mockIcal.mockResolvedValueOnce([inCourse("a1", "CS 61A"), inCourse("a2", "MATH 53")]);

    const result = await runSync(client, "user-1", "America/Los_Angeles", undefined, false, ["canvas"]);

    expect(result.canvas.synced).toBe(1);
    expect(upserted.map((r) => r.external_id)).toEqual(["acc1:a2"]);
  });

  it("syncs every course when the account has no selection yet", async () => {
    const { client, upserted } = makeSupabase(credsWithExtra(null));
    mockIcal.mockResolvedValueOnce([inCourse("a1", "CS 61A"), inCourse("a2", "MATH 53")]);

    await runSync(client, "user-1", "America/Los_Angeles", undefined, false, ["canvas"]);

    expect(upserted.map((r) => r.external_id)).toEqual(["acc1:a1", "acc1:a2"]);
  });

  it("does not fetch the feed at all when every course is deselected", async () => {
    const { client, upserted } = makeSupabase(credsWithExtra([]));

    const result = await runSync(client, "user-1", "America/Los_Angeles", undefined, false, ["canvas"]);

    expect(mockIcal).not.toHaveBeenCalled();
    expect(upserted).toEqual([]);
    expect(result.canvas).toEqual({ synced: 0, errors: [] });
  });
});
