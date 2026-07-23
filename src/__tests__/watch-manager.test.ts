/**
 * Tests for Google Calendar watch channel management.
 * Verifies channel registration, stopping, and renewal logic.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// Mock crypto.randomUUID
vi.stubGlobal("crypto", { randomUUID: () => "test-uuid-1234" });

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("watch-manager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.NEXT_PUBLIC_APP_URL = "https://caltodo.vercel.app";
  });

  it("registers a watch channel successfully", async () => {
    const { registerWatchChannel } = await import("@/lib/gcal/watch-manager");

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "test-uuid-1234",
        resourceId: "resource-abc",
        expiration: String(Date.now() + 6 * 24 * 60 * 60 * 1000),
      }),
    });

    const result = await registerWatchChannel("access-token", "primary", "user-1");

    expect(result).not.toBeNull();
    expect(result!.channelId).toBe("test-uuid-1234");
    expect(result!.resourceId).toBe("resource-abc");

    // Verify fetch was called with correct URL and body
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/events/watch");
    const body = JSON.parse(options.body);
    expect(body.type).toBe("web_hook");
    expect(body.address).toBe("https://caltodo.vercel.app/api/gcal/webhook");
    // Channel token is the random channel id (a secret), not the user_id.
    expect(body.token).toBe(body.id);
    expect(body.token).toBe("test-uuid-1234");
  });

  it("returns null when NEXT_PUBLIC_APP_URL is not set", async () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    const { registerWatchChannel } = await import("@/lib/gcal/watch-manager");

    const result = await registerWatchChannel("access-token", "primary", "user-1");

    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns null when events.watch fails", async () => {
    const { registerWatchChannel } = await import("@/lib/gcal/watch-manager");

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () => "Forbidden",
    });

    const result = await registerWatchChannel("access-token", "primary", "user-1");

    expect(result).toBeNull();
  });

  it("stops a watch channel (ignores 404)", async () => {
    const { stopWatchChannel } = await import("@/lib/gcal/watch-manager");

    fetchMock.mockResolvedValueOnce({ ok: false, status: 404, text: async () => "Not Found" });

    // Should not throw
    await stopWatchChannel("access-token", "channel-1", "resource-1");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
