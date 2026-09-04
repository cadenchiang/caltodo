/**
 * Tests that Canvas syncs through the path it is actually configured for, and
 * that a failure is attributed to the right one.
 *
 * The reported bug: students who reconnected bCourses by pasting a calendar
 * feed URL kept seeing "Your Canvas calendar feed stopped loading" no matter
 * how many times they re-pasted it. Two faults produced that. The 120-day
 * token check aborted the whole sync before the feed was fetched, even though
 * the feed needs no token; and the error it returned went into `canvas.errors`,
 * which the health banner read as proof the feed was broken.
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

vi.mock("@/lib/canvas-ical-client", () => ({
  fetchCanvasICalAssignments: vi.fn(),
}));

vi.mock("@/lib/integration-alerts", () => ({
  reportSyncFailures: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/server", () => ({
  after: (fn: () => unknown) => fn(),
}));

import { runSync } from "@/lib/sync-engine";
import { fetchCanvasICalAssignments } from "@/lib/canvas-ical-client";
import { fetchAllCanvasAssignments } from "@/lib/canvas-client";

const mockIcalFetch = vi.mocked(fetchCanvasICalAssignments);
const mockTokenFetch = vi.mocked(fetchAllCanvasAssignments);

/** An access token created 200 days ago, well past the 120-day lifetime. */
const EXPIRED_TOKEN_CREATED_AT = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString();

/** One assignment, enough to prove a path ran. */
const ASSIGNMENT = {
  external_id: "evt-1",
  course_name: "UGBA 100-LEC-003",
  course_id: "1",
  title: "Problem Set 1",
  due_date: "2026-09-10T23:59:00Z",
  source_url: "https://bcourses.berkeley.edu/a/1",
  points_possible: 10,
  is_submitted: false,
  description: "",
};

/**
 * Resolves any PostgREST chain depth with a fixed result.
 *
 * @param resolved - What awaiting the chain yields.
 * @returns A proxy that answers every method with itself.
 */
function chainable(resolved: unknown): any {
  const proxy: any = new Proxy(function () {} as unknown as object, {
    get(_t, prop) {
      if (prop === "then") {
        return (res: (v: unknown) => void, rej?: (e: unknown) => void) =>
          Promise.resolve(resolved).then(res, rej);
      }
      return () => proxy;
    },
    apply: () => proxy,
  });
  return proxy;
}

/**
 * Builds a Supabase mock over one credentials row.
 *
 * @param credentialsData - The integration_credentials row to serve.
 * @returns The client, plus a record of credential column writes.
 */
function createMockSupabase(credentialsData: Record<string, unknown>) {
  const credentialUpdates: Array<Record<string, unknown>> = [];

  const client = {
    from: vi.fn((table: string) => {
      if (table === "integration_credentials") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: credentialsData, error: null }),
            }),
          }),
          update: vi.fn((payload: Record<string, unknown>) => {
            credentialUpdates.push(payload);
            return chainable({ data: [], error: null });
          }),
        };
      }
      if (table === "tasks") {
        return {
          upsert: vi.fn().mockReturnValue({ error: null }),
          update: vi.fn().mockReturnValue(chainable({ error: null })),
          select: vi.fn().mockReturnValue(chainable({ data: [], error: null })),
        };
      }
      return {};
    }),
  };

  return { client, credentialUpdates };
}

beforeEach(() => {
  // reset, not clear: `mockResolvedValueOnce` queues survive clearAllMocks, so
  // a test whose fetch never ran would hand its queued value to the next one.
  mockIcalFetch.mockReset();
  mockTokenFetch.mockReset();
  vi.clearAllMocks();
});

describe("syncCanvas path selection", () => {
  it("syncs the calendar feed even when a leftover token has expired", async () => {
    // The exact reported shape: connected by token months ago, reconnected by
    // pasting a feed URL, and the dead token still sits on the row.
    const { client } = createMockSupabase({
      canvas_token: "old-token",
      canvas_base_url: "https://bcourses.berkeley.edu",
      canvas_token_created_at: EXPIRED_TOKEN_CREATED_AT,
      canvas_ical_url: "https://bcourses.berkeley.edu/feeds/calendars/user_abc.ics",
    });
    mockIcalFetch.mockResolvedValueOnce([ASSIGNMENT]);

    const result = await runSync(client as any, "user-123", "America/Los_Angeles");

    expect(mockIcalFetch).toHaveBeenCalledOnce();
    expect(mockTokenFetch).not.toHaveBeenCalled();
    expect(result.canvas.synced).toBe(1);
    expect(result.canvas.errors).toEqual([]);
  });

  it("still reports an expired token when the token is the only path", async () => {
    const { client } = createMockSupabase({
      canvas_token: "old-token",
      canvas_base_url: "https://bcourses.berkeley.edu",
      canvas_token_created_at: EXPIRED_TOKEN_CREATED_AT,
      canvas_ical_url: null,
    });

    const result = await runSync(client as any, "user-123", "America/Los_Angeles");

    expect(mockTokenFetch).not.toHaveBeenCalled();
    expect(result.canvas.errors[0]).toContain("token expired");
    expect(result.canvas.ical_failed).toBeUndefined();
  });

  it("clears canvas_ical_failed after the feed loads cleanly", async () => {
    const { client, credentialUpdates } = createMockSupabase({
      canvas_ical_url: "https://bcourses.berkeley.edu/feeds/calendars/user_abc.ics",
      canvas_ical_failed: true,
    });
    mockIcalFetch.mockResolvedValueOnce([ASSIGNMENT]);

    await runSync(client as any, "user-123", "America/Los_Angeles");

    expect(credentialUpdates).toContainEqual({ canvas_ical_failed: false });
  });
});

describe("syncCanvas failure attribution", () => {
  it("marks a broken feed URL as an iCal failure", async () => {
    const { client, credentialUpdates } = createMockSupabase({
      canvas_ical_url: "https://bcourses.berkeley.edu/feeds/calendars/stale.ics",
    });
    mockIcalFetch.mockRejectedValueOnce(new Error("Canvas iCal fetch failed: 404"));

    const result = await runSync(client as any, "user-123", "America/Los_Angeles");

    expect(result.canvas.ical_failed).toBe(true);
    expect(credentialUpdates).toContainEqual({ canvas_ical_failed: true });
  });

  it("does not blame the feed for a token failure", async () => {
    // A 401 on the token path must not set the marker the banner reads to
    // decide the feed URL needs re-pasting.
    const { client, credentialUpdates } = createMockSupabase({
      canvas_token: "revoked-token",
      canvas_base_url: "https://bcourses.berkeley.edu",
      canvas_token_created_at: new Date().toISOString(),
      canvas_ical_url: null,
    });
    mockTokenFetch.mockRejectedValueOnce(new Error("Canvas returned 401 unauthorized"));

    const result = await runSync(client as any, "user-123", "America/Los_Angeles");

    expect(result.canvas.ical_failed).toBeUndefined();
    expect(result.canvas.errors[0]).toContain("401");
    expect(credentialUpdates).toContainEqual({ canvas_auth_failed: true });
    expect(credentialUpdates).not.toContainEqual({ canvas_ical_failed: true });
  });
});
