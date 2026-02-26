/**
 * Tests for the user lookup utility.
 * Verifies batch resolution of user profiles from auth metadata.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { batchResolveUsers } from "@/lib/user-lookup";

beforeEach(() => {
  vi.clearAllMocks();
});

function createMockAdminClient(users: Array<{ id: string; user_metadata: Record<string, string | null> }>, error?: { message: string }) {
  return {
    auth: {
      admin: {
        listUsers: vi.fn().mockResolvedValue({
          data: error ? null : { users },
          error: error ?? null,
        }),
      },
    },
  };
}

describe("batchResolveUsers", () => {
  it("should return empty map for empty input", async () => {
    const client = createMockAdminClient([]);
    const result = await batchResolveUsers(client as any, []);
    expect(result.size).toBe(0);
  });

  it("should resolve user profiles from auth metadata", async () => {
    const client = createMockAdminClient([
      {
        id: "user-1",
        user_metadata: { full_name: "Alice", avatar_url: "https://example.com/alice.jpg" },
      },
      {
        id: "user-2",
        user_metadata: { full_name: "Bob", avatar_url: null },
      },
    ]);

    const result = await batchResolveUsers(client as any, ["user-1", "user-2"]);

    expect(result.size).toBe(2);
    expect(result.get("user-1")).toEqual({
      id: "user-1",
      name: "Alice",
      avatar: "https://example.com/alice.jpg",
    });
    expect(result.get("user-2")).toEqual({
      id: "user-2",
      name: "Bob",
      avatar: null,
    });
  });

  it("should deduplicate input user IDs", async () => {
    const client = createMockAdminClient([
      { id: "user-1", user_metadata: { full_name: "Alice", avatar_url: null } },
    ]);

    const result = await batchResolveUsers(client as any, ["user-1", "user-1", "user-1"]);

    expect(result.size).toBe(1);
    expect(client.auth.admin.listUsers).toHaveBeenCalledTimes(1);
  });

  it("should fill missing users with null profiles", async () => {
    const client = createMockAdminClient([
      { id: "user-1", user_metadata: { full_name: "Alice", avatar_url: null } },
    ]);

    const result = await batchResolveUsers(client as any, ["user-1", "user-missing"]);

    expect(result.size).toBe(2);
    expect(result.get("user-missing")).toEqual({
      id: "user-missing",
      name: null,
      avatar: null,
    });
  });

  it("should return empty map on admin API error", async () => {
    const client = createMockAdminClient([], { message: "Forbidden" });

    const result = await batchResolveUsers(client as any, ["user-1"]);

    expect(result.size).toBe(0);
  });
});
