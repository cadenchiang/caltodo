/**
 * Tests for Google Calendar incremental sync logic.
 * Verifies syncToken handling, 410 Gone fallback, and DB state updates.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// Track fetch calls
const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

// Mock Supabase client
function createMockSupabase(storedToken: string | null = null) {
  const updateFn = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { gcal_sync_token: storedToken },
            error: null,
          }),
        }),
      }),
      update: updateFn,
    }),
    _updateFn: updateFn,
  };
}

describe("incremental-sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset module cache so each test gets fresh imports
    vi.resetModules();
  });

  it("performs full sync when no syncToken exists", async () => {
    const { performIncrementalSync } = await import("@/lib/gcal/incremental-sync");
    const supabase = createMockSupabase(null);

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], nextSyncToken: "token-abc" }),
    });

    const result = await performIncrementalSync(
      supabase as any,
      "user-1",
      "access-token",
      "primary"
    );

    expect(result).not.toBeNull();
    expect(result!.isFullSync).toBe(true);
    expect(result!.syncToken).toBe("token-abc");
  });

  it("performs incremental sync when syncToken exists", async () => {
    const { performIncrementalSync } = await import("@/lib/gcal/incremental-sync");
    const supabase = createMockSupabase("existing-token");

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ items: [{ id: "evt-1" }], nextSyncToken: "new-token" }),
    });

    const result = await performIncrementalSync(
      supabase as any,
      "user-1",
      "access-token",
      "primary"
    );

    expect(result).not.toBeNull();
    expect(result!.isFullSync).toBe(false);
    expect(result!.syncToken).toBe("new-token");

    // Verify fetch used syncToken param
    const fetchUrl = fetchMock.mock.calls[0][0];
    expect(fetchUrl).toContain("syncToken=existing-token");
  });

  it("falls back to full sync on 410 Gone", async () => {
    const { performIncrementalSync } = await import("@/lib/gcal/incremental-sync");
    const supabase = createMockSupabase("expired-token");

    // First call: 410 Gone
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 410,
    });
    // Second call: full sync
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], nextSyncToken: "fresh-token" }),
    });

    const result = await performIncrementalSync(
      supabase as any,
      "user-1",
      "access-token",
      "primary"
    );

    expect(result).not.toBeNull();
    expect(result!.isFullSync).toBe(true);
    expect(result!.syncToken).toBe("fresh-token");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns null when fetch fails", async () => {
    const { performFullSync } = await import("@/lib/gcal/incremental-sync");
    const supabase = createMockSupabase();

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    });

    const result = await performFullSync(
      supabase as any,
      "user-1",
      "access-token",
      "primary"
    );

    expect(result).toBeNull();
  });

  it("bounds the full sync to a 30-day window with token-only fields", async () => {
    const { performFullSync, FULL_SYNC_WINDOW_DAYS } = await import("@/lib/gcal/incremental-sync");
    const supabase = createMockSupabase();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ nextSyncToken: "tok" }) });

    const before = Date.now();
    const result = await performFullSync(supabase as any, "user-1", "access-token", "primary");
    expect(result).toEqual({ syncToken: "tok", isFullSync: true });

    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get("fields")).toBe("nextPageToken,nextSyncToken");
    const timeMin = new Date(url.searchParams.get("timeMin")!).getTime();
    const expected = before - FULL_SYNC_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    expect(Math.abs(timeMin - expected)).toBeLessThan(5_000);
  });

  it("gives up after the page limit and leaves the stored token alone", async () => {
    const { performFullSync, FULL_SYNC_MAX_PAGES } = await import("@/lib/gcal/incremental-sync");
    const supabase = createMockSupabase();
    // Every page has a next page and no sync token: an endless calendar.
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ nextPageToken: "more" }) });

    const result = await performFullSync(supabase as any, "user-1", "access-token", "primary");
    expect(result).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(FULL_SYNC_MAX_PAGES);
    expect(supabase._updateFn).not.toHaveBeenCalled();
  });

  it("treats a 400 on the syncToken request as expired and full-syncs", async () => {
    // A token issued for the old watched (caltodo) calendar is not valid on
    // primary; without this the webhook would fail on every notification.
    const { performIncrementalSync } = await import("@/lib/gcal/incremental-sync");
    const supabase = createMockSupabase("foreign-token");

    fetchMock.mockResolvedValueOnce({ ok: false, status: 400, text: async () => "Invalid sync token" });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], nextSyncToken: "fresh-token" }),
    });

    const result = await performIncrementalSync(supabase as any, "user-1", "access-token", "primary");
    expect(result).toEqual({ syncToken: "fresh-token", isFullSync: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
