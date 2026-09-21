/**
 * Tests for GET /api/cron/gcal-sync.
 *
 * Verifies the cron fails closed without a secret, watches and reads the
 * user's primary calendar, only renews channels that are missing or about
 * to expire, and only full-syncs users whose last full sync is stale.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockLimit = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        not: vi.fn(() => ({
          order: vi.fn(() => ({ limit: mockLimit })),
        })),
      })),
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
  process.env.CRON_SECRET = "secret";
  mockRenew.mockResolvedValue({ channelId: "c", resourceId: "r", expiration: "x" });
  mockFullSync.mockResolvedValue({ syncToken: "t", isFullSync: true });
});

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
        { user_id: "u-never", gcal_channel_expiration: null, gcal_last_full_sync_at: null },
        {
          user_id: "u-fresh",
          gcal_channel_expiration: new Date(Date.now() + 5 * DAY).toISOString(),
          gcal_last_full_sync_at: new Date().toISOString(),
        },
      ],
      error: null,
    });

    const res = await GET(cronRequest("secret"));
    const body = await res.json();
    expect(body).toMatchObject({ renewed: 1, synced: 1, errors: 0, total: 2 });
    expect(mockRenew).toHaveBeenCalledTimes(1);
    expect(mockRenew.mock.calls[0][1]).toBe("u-never");
    expect(mockRenew.mock.calls[0][3]).toBe("primary");
    expect(mockFullSync).toHaveBeenCalledTimes(1);
    expect(mockFullSync.mock.calls[0][3]).toBe("primary");
  });

  it("counts a user whose processing throws as an error and keeps going", async () => {
    mockLimit.mockResolvedValue({
      data: [
        { user_id: "u-bad", gcal_channel_expiration: null, gcal_last_full_sync_at: null },
        { user_id: "u-ok", gcal_channel_expiration: null, gcal_last_full_sync_at: null },
      ],
      error: null,
    });
    mockRenew.mockRejectedValueOnce(new Error("watch exploded"));
    const body = await (await GET(cronRequest("secret"))).json();
    expect(body.errors).toBe(1);
    expect(body.renewed).toBe(1);
  });
});
