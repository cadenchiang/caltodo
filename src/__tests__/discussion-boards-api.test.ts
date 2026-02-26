/**
 * Tests for the discussion boards API route.
 * Verifies that enrolled courses are returned with message stats.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue({ allowed: true }),
}));

import { GET } from "@/app/api/discussions/boards/route";
import { createClient } from "@/lib/supabase/server";

const mockCreateClient = vi.mocked(createClient);

beforeEach(() => {
  vi.clearAllMocks();
});

/**
 * Creates a mock Supabase client for boards API testing.
 * The boards route uses rpc("get_user_boards") which returns rows directly.
 *
 * @param options - Configuration for mock behavior
 * @returns Mock Supabase client
 */
function createMockSupabase(options: {
  userId?: string;
  rpcData?: Array<Record<string, unknown>> | null;
  rpcError?: { message: string } | null;
}) {
  const { userId = "user-1", rpcData = [], rpcError = null } = options;

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: userId ? { id: userId } : null },
        error: userId ? null : { message: "Not authenticated" },
      }),
    },
    rpc: vi.fn().mockResolvedValue({
      data: rpcData,
      error: rpcError,
    }),
  };
}

describe("GET /api/discussions/boards", () => {
  it("should return 401 when not authenticated", async () => {
    const supabase = createMockSupabase({ userId: "" });
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Not authenticated" },
    });
    mockCreateClient.mockResolvedValue(supabase as any);

    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("should return empty array when no boards", async () => {
    const supabase = createMockSupabase({ rpcData: [] });
    mockCreateClient.mockResolvedValue(supabase as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });

  it("should return boards with message stats", async () => {
    const supabase = createMockSupabase({
      rpcData: [
        {
          course_id: "c-1",
          course_source: "canvas",
          course_external_id: "123",
          course_name: "CS 61A",
          course_created_at: "2026-01-01T00:00:00Z",
          message_count: 5,
          last_message_body: "Hello!",
          last_message_author: "Alice",
          last_message_at: "2026-02-25T10:00:00Z",
          member_count: 3,
          member_avatars: [{ name: "Alice", avatar: null }],
        },
      ],
    });
    mockCreateClient.mockResolvedValue(supabase as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].message_count).toBe(5);
    expect(data[0].last_message_body).toBe("Hello!");
    expect(data[0].course.name).toBe("CS 61A");
  });

  it("should return 500 when rpc fails", async () => {
    const supabase = createMockSupabase({
      rpcError: { message: "DB error" },
    });
    mockCreateClient.mockResolvedValue(supabase as any);

    const response = await GET();
    expect(response.status).toBe(500);
  });
});
