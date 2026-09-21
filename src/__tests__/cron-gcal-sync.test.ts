/**
 * Tests for GET /api/cron/gcal-sync.
 *
 * Verifies the cron fails closed without a secret, watches and reads the
 * user's primary calendar, only renews channels that are missing or about
 * to expire, and only full-syncs users whose last full sync is stale.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockLimit = vi.fn();
const mockOrder = vi.fn();
const mockUpdate = vi.fn();
const mockUpdateEq = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        not: vi.fn(() => {
          // Two chained .order() calls, then .limit().
          const chain = { order: (...args: unknown[]) => { mockOrder(...args); return chain; }, limit: mockLimit };
          return chain;
        }),
      })),
      update: (payload: unknown) => { mockUpdate(payload); return { eq: mockUpdateEq }; },
    })),
  })),
}));

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/gcal/token-manager", () => ({
  getValidAccessToken: vi.fn(async () => "access-token"),
}));

const mockFullSync = vi.fn();
vi.mock("@/lib/gcal/incremental-sync", () => ({
  performFullSync: (...args: unknown[]) => mockFullSync(...args),
}));

const mockRenew = vi.fn();
vi.mock("@/lib/gcal/watch-manager", async () => {
  const actual = await vi.importActual<typeof import("@/lib/gcal/watch-manager")>("@/lib/gcal/watch-manager");
  return {
    WATCHED_CALENDAR_ID: actual.WATCHED_CALENDAR_ID,
    renewWatchChannel: (...args: unknown[]) => mockRenew(...args),
  };
});

import { GET } from "@/app/api/cron/gcal-sync/route";

function cronRequest(secret: string | null) {
  return new Request("http://localhost/api/cron/gcal-sync", {
    headers: secret ? { authorization: `Bearer ${secret}` } : {},
  }) as unknown as import("next/server").NextRequest;
}

const DAY = 24 * 60 * 60 * 1000;

beforeEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  process.env.CRON_SECRET = "secret";
  mockRenew.mockResolvedValue({ channelId: "c", resourceId: "r", expiration: "x" });
  mockFullSync.mockResolvedValue({ syncToken: "t", isFullSync: true });
  mockUpdateEq.mockResolvedValue({ error: null });
});

/** A never-watched, never-synced user row. */
function freshUser(id: string) {
  return { user_id: id, gcal_channel_expiration: null, gcal_last_full_sync_at: null, gcal_watch_failed_at: null };
}

describe("GET /api/cron/gcal-sync", () => {
  it("fails closed when CRON_SECRET is unset or wrong", async () => {
    delete process.env.CRON_SECRET;
    expect((await GET(cronRequest("secret"))).status).toBe(401);
    process.env.CRON_SECRET = "secret";
    expect((await GET(cronRequest("wrong"))).status).toBe(401);
    expect(mockLimit).not.toHaveBeenCalled();
  });

  it("renews expiring channels and full-syncs stale users on the primary calendar", async () => {
    mockLimit.mockResolvedValue({
      data: [
        freshUser("u-never"),
        {
          user_id: "u-fresh",
          gcal_channel_expiration: new Date(Date.now() + 5 * DAY).toISOString(),
          gcal_last_full_sync_at: new Date().toISOString(),
          gcal_watch_failed_at: null,
        },
      ],
      error: null,
    });

    const res = await GET(cronRequest("secret"));
    const body = await res.json();
    expect(body).toMatchObject({ renewed: 1, synced: 1, errors: 0, total: 2, skipped: 0 });
    expect(mockRenew).toHaveBeenCalledTimes(1);
    expect(mockRenew.mock.calls[0][1]).toBe("u-never");
    expect(mockRenew.mock.calls[0][3]).toBe("primary");
    expect(mockFullSync).toHaveBeenCalledTimes(1);
    expect(mockFullSync.mock.calls[0][3]).toBe("primary");
  });

  it("orders failed-watch users to the back, then by soonest channel expiration", async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });
    await GET(cronRequest("secret"));
    expect(mockOrder.mock.calls).toEqual([
      ["gcal_watch_failed_at", { ascending: true, nullsFirst: true }],
      ["gcal_channel_expiration", { ascending: true, nullsFirst: true }],
    ]);
  });

  it("stamps gcal_watch_failed_at on a failed registration and clears it on success", async () => {
    mockLimit.mockResolvedValue({
      data: [
        freshUser("u-fails"),
        { ...freshUser("u-recovers"), gcal_watch_failed_at: "2026-09-20T04:00:00Z" },
      ],
      error: null,
    });
    mockRenew.mockImplementation(async (_s: unknown, userId: string) =>
      userId === "u-fails" ? null : { channelId: "c", resourceId: "r", expiration: "x" }
    );
    await GET(cronRequest("secret"));
    const stamps = mockUpdate.mock.calls.map(([p]) => p as { gcal_watch_failed_at: string | null });
    expect(stamps).toHaveLength(2);
    expect(stamps.some((s) => typeof s.gcal_watch_failed_at === "string")).toBe(true);
    expect(stamps.some((s) => s.gcal_watch_failed_at === null)).toBe(true);
  });

  it("does not touch the stamp for a user who succeeds and was never failed", async () => {
    mockLimit.mockResolvedValue({ data: [freshUser("u-ok")], error: null });
    await GET(cronRequest("secret"));
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("stops dequeuing at the time budget and reports the skipped users", async () => {
    mockLimit.mockResolvedValue({ data: [freshUser("u1"), freshUser("u2"), freshUser("u3")], error: null });
    const start = 5_000_000;
    let calls = 0;
    // First call stamps startedAt; every later call is past the 55s budget.
    vi.spyOn(Date, "now").mockImplementation(() => (calls++ === 0 ? start : start + 56_000));
    const body = await (await GET(cronRequest("secret"))).json();
    expect(body).toMatchObject({ total: 3, skipped: 3, renewed: 0 });
    expect(mockRenew).not.toHaveBeenCalled();
  });

  it("counts a user whose processing throws as an error and keeps going", async () => {
    mockLimit.mockResolvedValue({ data: [freshUser("u-bad"), freshUser("u-ok")], error: null });
    mockRenew.mockRejectedValueOnce(new Error("watch exploded"));
    const body = await (await GET(cronRequest("secret"))).json();
    expect(body.errors).toBe(1);
    expect(body.renewed).toBe(1);
  });
});
