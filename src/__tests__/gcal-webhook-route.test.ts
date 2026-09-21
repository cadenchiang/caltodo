/**
 * Tests for POST /api/gcal/webhook.
 *
 * Verifies the notification is resolved by channel id, the incremental sync
 * reads the user's primary calendar (the watched one, not the write
 * calendar), and every outcome answers 200 so Google never retries.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockMaybeSingle = vi.fn();
const mockUpdateEq = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })) })),
      update: vi.fn(() => ({ eq: mockUpdateEq })),
    })),
  })),
}));

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const mockGetValidAccessToken = vi.fn();
vi.mock("@/lib/gcal/token-manager", () => ({
  getValidAccessToken: (...args: unknown[]) => mockGetValidAccessToken(...args),
}));

const mockIncrementalSync = vi.fn();
vi.mock("@/lib/gcal/incremental-sync", () => ({
  performIncrementalSync: (...args: unknown[]) => mockIncrementalSync(...args),
}));

import { POST } from "@/app/api/gcal/webhook/route";

function notification(headers: Record<string, string>) {
  return new Request("http://localhost/api/gcal/webhook", {
    method: "POST",
    headers,
  }) as unknown as import("next/server").NextRequest;
}

const CHANNEL = "channel-uuid";

beforeEach(() => {
  vi.clearAllMocks();
  mockGetValidAccessToken.mockResolvedValue("access-token");
  mockMaybeSingle.mockResolvedValue({ data: { user_id: "user-1", gcal_channel_id: CHANNEL } });
  mockIncrementalSync.mockResolvedValue({ syncToken: "t", isFullSync: false });
  mockUpdateEq.mockResolvedValue({ error: null });
});

describe("POST /api/gcal/webhook", () => {
  it("acks the sync handshake without touching the database", async () => {
    const res = await POST(notification({ "x-goog-resource-state": "sync", "x-goog-channel-id": CHANNEL }));
    expect(res.status).toBe(200);
    expect(mockMaybeSingle).not.toHaveBeenCalled();
  });

  it("syncs the primary calendar for a matching channel", async () => {
    const res = await POST(notification({
      "x-goog-resource-state": "exists",
      "x-goog-channel-id": CHANNEL,
      "x-goog-channel-token": CHANNEL,
    }));
    expect(res.status).toBe(200);
    expect(mockIncrementalSync).toHaveBeenCalledTimes(1);
    expect(mockIncrementalSync.mock.calls[0][1]).toBe("user-1");
    expect(mockIncrementalSync.mock.calls[0][3]).toBe("primary");
  });

  it("ignores a channel id that does not match the stored one", async () => {
    const res = await POST(notification({
      "x-goog-resource-state": "exists",
      "x-goog-channel-id": "stale-channel",
      "x-goog-channel-token": CHANNEL,
    }));
    expect(res.status).toBe(200);
    expect(mockIncrementalSync).not.toHaveBeenCalled();
  });

  it("records a failed token refresh by bumping the change marker and still acks", async () => {
    mockIncrementalSync.mockResolvedValue(null);
    const res = await POST(notification({
      "x-goog-resource-state": "exists",
      "x-goog-channel-id": CHANNEL,
      "x-goog-channel-token": CHANNEL,
    }));
    expect(res.status).toBe(200);
    expect(mockUpdateEq).toHaveBeenCalledTimes(1);
  });

  it("does not touch the change marker itself when the sync succeeds", async () => {
    await POST(notification({
      "x-goog-resource-state": "exists",
      "x-goog-channel-id": CHANNEL,
      "x-goog-channel-token": CHANNEL,
    }));
    expect(mockUpdateEq).not.toHaveBeenCalled();
  });

  it("returns 200 when the sync throws so Google stops retrying", async () => {
    mockIncrementalSync.mockRejectedValue(new Error("boom"));
    const res = await POST(notification({
      "x-goog-resource-state": "exists",
      "x-goog-channel-id": CHANNEL,
      "x-goog-channel-token": CHANNEL,
    }));
    expect(res.status).toBe(200);
  });
});
