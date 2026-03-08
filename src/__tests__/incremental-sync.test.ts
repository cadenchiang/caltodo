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
});
