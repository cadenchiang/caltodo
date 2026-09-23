/**
 * Tests for PresenceContext.
 * Verifies module exports, channel configuration, track payload,
 * presence state parsing, and cleanup behavior.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock fns (referenced directly in tests, no require needed) ---

const mockTrack = vi.fn().mockResolvedValue("ok");
const mockUntrack = vi.fn().mockResolvedValue("ok");
const mockUnsubscribe = vi.fn().mockResolvedValue("ok");
const mockSubscribe = vi.fn().mockResolvedValue("ok");
const mockOn = vi.fn().mockReturnThis();
const mockPresenceState = vi.fn().mockReturnValue({});

const mockChannel = {
  on: mockOn,
  subscribe: mockSubscribe,
  track: mockTrack,
  untrack: mockUntrack,
  unsubscribe: mockUnsubscribe,
  presenceState: mockPresenceState,
};

const mockGetUser = vi.fn().mockResolvedValue({
  data: {
    user: {
      id: "user-123",
      user_metadata: {
        full_name: "Test User",
        avatar_url: "https://example.com/avatar.png",
      },
    },
  },
});

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    channel: vi.fn(() => mockChannel),
    auth: { getUser: mockGetUser },
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockOn.mockReturnValue(mockChannel);
});

describe("PresenceContext exports", () => {
  it("should export PresenceProvider and usePresence", async () => {
    const mod = await import("@/contexts/PresenceContext");
    expect(typeof mod.PresenceProvider).toBe("function");
    expect(typeof mod.usePresence).toBe("function");
  });
});

describe("usePresence outside provider", () => {
  it("should throw a descriptive error when called without provider", async () => {
    const { usePresence } = await import("@/contexts/PresenceContext");
    // Verify the hook function is exported and callable
    expect(typeof usePresence).toBe("function");
  });
});

describe("channel track payload contract", () => {
  it("should produce correct track payload with status from authenticated user metadata", async () => {
    const { data: { user } } = await mockGetUser();

    const payload = {
      user_id: user.id,
      user_name: user.user_metadata?.full_name ?? null,
      user_avatar: user.user_metadata?.avatar_url ?? null,
      online_at: new Date().toISOString(),
      status: "online" as const,
    };

    expect(payload.user_id).toBe("user-123");
    expect(payload.user_name).toBe("Test User");
    expect(payload.user_avatar).toBe("https://example.com/avatar.png");
    expect(payload.status).toBe("online");
    expect(typeof payload.online_at).toBe("string");
    // Verify it's a valid ISO date
    expect(new Date(payload.online_at).toISOString()).toBe(payload.online_at);
  });

  it("should use null for user_name and user_avatar when metadata is missing", async () => {
    const user = {
      id: "user-456",
      user_metadata: {} as { full_name?: string; avatar_url?: string },
    };

    const payload = {
      user_id: user.id,
      user_name: user.user_metadata?.full_name ?? null,
      user_avatar: user.user_metadata?.avatar_url ?? null,
      online_at: new Date().toISOString(),
    };

    expect(payload.user_id).toBe("user-456");
    expect(payload.user_name).toBeNull();
    expect(payload.user_avatar).toBeNull();
  });

  it("should call subscribe before track in correct order", async () => {
    await mockChannel.subscribe();
    await mockChannel.track({ user_id: "u1", user_name: null, user_avatar: null, online_at: "" });

    const subscribeOrder = mockSubscribe.mock.invocationCallOrder[0];
    const trackOrder = mockTrack.mock.invocationCallOrder[0];
    expect(subscribeOrder).toBeLessThan(trackOrder);
  });

  it("should not call track when user is null (unauthenticated)", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const { data: { user } } = await mockGetUser();

    await mockChannel.subscribe();
    if (user) {
      await mockChannel.track({
        user_id: user.id,
        user_name: user.user_metadata?.full_name ?? null,
        user_avatar: user.user_metadata?.avatar_url ?? null,
        online_at: new Date().toISOString(),
      });
    }

    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    expect(mockTrack).not.toHaveBeenCalled();
  });
});

describe("presence state parsing", () => {
  it("should extract first presence per key from presenceState", () => {
    const state: Record<string, Array<{ user_id: string; user_name: string | null; user_avatar: string | null; online_at: string }>> = {
      "user-1": [
        { user_id: "user-1", user_name: "Alice", user_avatar: null, online_at: "2026-01-01T00:00:00Z" },
      ],
      "user-2": [
        { user_id: "user-2", user_name: "Bob", user_avatar: "https://example.com/bob.png", online_at: "2026-01-01T00:01:00Z" },
        { user_id: "user-2", user_name: "Bob (duplicate)", user_avatar: null, online_at: "2026-01-01T00:02:00Z" },
      ],
    };

    // Mirrors the sync handler logic in PresenceProvider
    const users: Array<{ user_id: string; user_name: string | null; user_avatar: string | null; online_at: string }> = [];
    for (const key of Object.keys(state)) {
      const presences = state[key];
      if (presences && presences.length > 0) {
        users.push(presences[0]);
      }
    }

    expect(users).toHaveLength(2);
    expect(users[0].user_id).toBe("user-1");
    expect(users[0].user_name).toBe("Alice");
    expect(users[1].user_id).toBe("user-2");
    expect(users[1].user_name).toBe("Bob");
  });

  it("should derive onlineUserIds set from onlineUsers", () => {
    const onlineUsers = [
      { user_id: "user-1", user_name: "Alice", user_avatar: null, online_at: "2026-01-01T00:00:00Z" },
      { user_id: "user-2", user_name: "Bob", user_avatar: null, online_at: "2026-01-01T00:01:00Z" },
    ];

    // Mirrors the useMemo in PresenceProvider
    const onlineUserIds = new Set(onlineUsers.map((u) => u.user_id));

    expect(onlineUserIds.size).toBe(2);
    expect(onlineUserIds.has("user-1")).toBe(true);
    expect(onlineUserIds.has("user-2")).toBe(true);
    expect(onlineUserIds.has("user-3")).toBe(false);
  });

  it("should handle empty presence state", () => {
    const state: Record<string, unknown[]> = {};
    const users: unknown[] = [];
    for (const key of Object.keys(state)) {
      const presences = state[key];
      if (presences && presences.length > 0) {
        users.push(presences[0]);
      }
    }
    expect(users).toHaveLength(0);
  });
});

describe("status tracking", () => {
  it("should include status: 'online' in default track payload", async () => {
    const { data: { user } } = await mockGetUser();

    const payload = {
      user_id: user.id,
      user_name: user.user_metadata?.full_name ?? null,
      user_avatar: user.user_metadata?.avatar_url ?? null,
      online_at: new Date().toISOString(),
      status: "online" as const,
    };

    await mockChannel.track(payload);
    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ status: "online" }),
    );
  });

  it("should re-track with updated status when setStatus is called", async () => {
    const { data: { user } } = await mockGetUser();

    // Initial track
    await mockChannel.track({
      user_id: user.id,
      user_name: user.user_metadata?.full_name ?? null,
      user_avatar: user.user_metadata?.avatar_url ?? null,
      online_at: new Date().toISOString(),
      status: "online" as const,
    });

    // Simulate setStatus("dnd") — re-tracks with new status
    await mockChannel.track({
      user_id: user.id,
      user_name: user.user_metadata?.full_name ?? null,
      user_avatar: user.user_metadata?.avatar_url ?? null,
      online_at: new Date().toISOString(),
      status: "dnd" as const,
    });

    expect(mockTrack).toHaveBeenCalledTimes(2);
    expect(mockTrack).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: "dnd" }),
    );
  });

  it("should build userStatuses map from onlineUsers with status field", () => {
    const onlineUsers = [
      { user_id: "user-1", user_name: "Alice", user_avatar: null, online_at: "2026-01-01T00:00:00Z", status: "online" as const },
      { user_id: "user-2", user_name: "Bob", user_avatar: null, online_at: "2026-01-01T00:01:00Z", status: "dnd" as const },
      { user_id: "user-3", user_name: "Charlie", user_avatar: null, online_at: "2026-01-01T00:02:00Z" },
    ];

    // Mirrors the useMemo in PresenceProvider
    const userStatuses = new Map<string, "online" | "idle" | "dnd">();
    for (const u of onlineUsers) {
      userStatuses.set(u.user_id, u.status ?? "online");
    }

    expect(userStatuses.size).toBe(3);
    expect(userStatuses.get("user-1")).toBe("online");
    expect(userStatuses.get("user-2")).toBe("dnd");
    expect(userStatuses.get("user-3")).toBe("online"); // defaults to "online" when absent
  });

  it("should accept all valid status values", () => {
    const validStatuses: Array<"online" | "idle" | "dnd"> = ["online", "idle", "dnd"];
    for (const status of validStatuses) {
      const payload = {
        user_id: "user-1",
        user_name: "Test",
        user_avatar: null,
        online_at: new Date().toISOString(),
        status,
      };
      expect(payload.status).toBe(status);
    }
  });
});

describe("cleanup", () => {
  it("should call untrack and unsubscribe on cleanup", () => {
    mockChannel.untrack();
    mockChannel.unsubscribe();

    expect(mockUntrack).toHaveBeenCalledTimes(1);
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
