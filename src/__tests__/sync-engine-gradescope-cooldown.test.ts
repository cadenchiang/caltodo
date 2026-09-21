/**
 * Tests for how the sync engine takes, holds, and releases the Gradescope
 * login cooldown.
 *
 * Audit H9: the cooldown was claimed before login and held on failure, so a
 * student who fixed their password saw "up to date" for 30 minutes.
 * Audit M8: the claim wrote last_gradescope_synced_at, the column the fleet
 * health check reads as proof of success, so a login outage looked healthy.
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
import { fetchAllGradescopeAssignments } from "@/lib/gradescope-client";

const mockGradescope = vi.mocked(fetchAllGradescopeAssignments);

const CREDS = {
  canvas_token: null,
  canvas_token_created_at: null,
  canvas_base_url: "https://bcourses.berkeley.edu",
  canvas_ical_url: null,
  gradescope_email: "user@berkeley.edu",
  gradescope_password_encrypted: "enc",
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
 * A thenable query builder that records every update payload made against
 * integration_credentials and resolves everything else empty.
 */
function makeSupabase(options: { rpcClaimed: boolean }) {
  const credentialUpdates: Array<Record<string, unknown>> = [];

  function builder(resolved: unknown, onUpdate?: (payload: Record<string, unknown>) => void) {
    const target = function () {} as unknown as object;
    const proxy: any = new Proxy(target, {
      get(_t, prop) {
        if (prop === "then") {
          return (res: (v: unknown) => void, rej?: (e: unknown) => void) =>
            Promise.resolve(resolved).then(res, rej);
        }
        if (prop === "update" && onUpdate) {
          return (payload: Record<string, unknown>) => {
            onUpdate(payload);
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

  const rpc = vi.fn().mockResolvedValue({ data: options.rpcClaimed, error: null });
  const from = vi.fn((table: string) => {
    if (table === "integration_credentials") {
      return builder({ data: CREDS, error: null }, (payload) => credentialUpdates.push(payload));
    }
    return builder({ data: [], error: null });
  });

  return { client: { from, rpc } as any, rpc, credentialUpdates };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("syncGradescope cooldown handling", () => {
  it("writes the success timestamp and the claim only after a successful fetch", async () => {
    const { client, credentialUpdates } = makeSupabase({ rpcClaimed: true });
    mockGradescope.mockResolvedValueOnce([
      { external_id: "1", course_name: "CS 61A", course_id: "1", title: "HW", due_date: null, source_url: null, points_possible: null },
    ]);

    const result = await runSync(client, "user-1", "America/Los_Angeles", undefined, false, ["gradescope"]);

    expect(result.gradescope.synced).toBe(1);
    const success = credentialUpdates.find((u) => "last_gradescope_synced_at" in u);
    expect(success).toBeDefined();
    expect(success).toMatchObject({ gradescope_claim_at: expect.any(String), gradescope_auth_failed: false });
  });

  it("releases the claim when the login fails, so a fixed password syncs at once", async () => {
    const { client, credentialUpdates } = makeSupabase({ rpcClaimed: true });
    mockGradescope.mockRejectedValueOnce(new Error("Gradescope login failed. Check your email and password."));

    const result = await runSync(client, "user-1", "America/Los_Angeles", undefined, false, ["gradescope"]);

    expect(result.gradescope.errors[0]).toContain("login failed");
    expect(credentialUpdates).toContainEqual({ gradescope_auth_failed: true });
    expect(credentialUpdates).toContainEqual({ gradescope_claim_at: null });
    expect(credentialUpdates.some((u) => "last_gradescope_synced_at" in u)).toBe(false);
  });

  it("keeps the claim on a non-login failure so auto-syncs cannot hammer the login", async () => {
    const { client, credentialUpdates } = makeSupabase({ rpcClaimed: true });
    mockGradescope.mockRejectedValueOnce(new Error("Gradescope dashboard returned 503"));

    await runSync(client, "user-1", "America/Los_Angeles", undefined, false, ["gradescope"]);

    expect(credentialUpdates).not.toContainEqual({ gradescope_claim_at: null });
    expect(credentialUpdates.some((u) => "last_gradescope_synced_at" in u)).toBe(false);
  });

  it("skips the login without error while another sync holds the window", async () => {
    const { client } = makeSupabase({ rpcClaimed: false });

    const result = await runSync(client, "user-1", "America/Los_Angeles", undefined, false, ["gradescope"]);

    expect(mockGradescope).not.toHaveBeenCalled();
    expect(result.gradescope).toEqual({ synced: 0, errors: [] });
  });

  it("a forced sync bypasses the claim and does not release it on login failure", async () => {
    const { client, rpc, credentialUpdates } = makeSupabase({ rpcClaimed: false });
    mockGradescope.mockRejectedValueOnce(new Error("Gradescope login failed"));

    await runSync(client, "user-1", "America/Los_Angeles", undefined, true, ["gradescope"]);

    expect(rpc).not.toHaveBeenCalled();
    expect(mockGradescope).toHaveBeenCalledOnce();
    expect(credentialUpdates).not.toContainEqual({ gradescope_claim_at: null });
  });
});
