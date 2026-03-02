/**
 * Tests for GET /api/gcal/unsynced-count endpoint.
 * Validates auth checks, GCal connection checks, and count query behavior.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock dependencies before importing the route handler
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/gcal/token-manager", () => ({
  getValidAccessToken: vi.fn(),
  getCalendarId: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => ({ allowed: true })),
}));

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { GET } from "@/app/api/gcal/unsynced-count/route";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, getCalendarId } from "@/lib/gcal/token-manager";

const mockCreateClient = vi.mocked(createClient);
const mockGetValidAccessToken = vi.mocked(getValidAccessToken);
const mockGetCalendarId = vi.mocked(getCalendarId);

/**
 * Creates a mock Supabase client with configurable auth and query responses.
 *
 * @param user - The authenticated user object, or null for unauthenticated
 * @param countResult - The count query result { count, error }
 */
function createMockSupabase(
  user: { id: string } | null,
  countResult: { count: number | null; error: { message: string } | null } = { count: 0, error: null },
) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: user ? null : { message: "Not authenticated" },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          not: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              is: vi.fn().mockResolvedValue(countResult),
            }),
          }),
        }),
      }),
    }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/gcal/unsynced-count", () => {
  it("returns 401 for unauthenticated request", async () => {
    const supabase = createMockSupabase(null);
    mockCreateClient.mockResolvedValue(supabase as never);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns { count: 0, connected: false } when GCal not connected", async () => {
    const supabase = createMockSupabase({ id: "user-123" });
    mockCreateClient.mockResolvedValue(supabase as never);
    mockGetValidAccessToken.mockResolvedValue(null);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ count: 0, connected: false });
  });

  it("returns { count: 0, connected: true } when no calendar selected", async () => {
    const supabase = createMockSupabase({ id: "user-123" });
    mockCreateClient.mockResolvedValue(supabase as never);
    mockGetValidAccessToken.mockResolvedValue("valid-token");
    mockGetCalendarId.mockResolvedValue(null);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ count: 0, connected: true });
  });

  it("returns count of unsynced tasks for authenticated user", async () => {
    const supabase = createMockSupabase({ id: "user-123" }, { count: 42, error: null });
    mockCreateClient.mockResolvedValue(supabase as never);
    mockGetValidAccessToken.mockResolvedValue("valid-token");
    mockGetCalendarId.mockResolvedValue("calendar-123");

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ count: 42, connected: true });
  });

  it("returns { count: 0 } when no unsynced tasks exist", async () => {
    const supabase = createMockSupabase({ id: "user-123" }, { count: 0, error: null });
    mockCreateClient.mockResolvedValue(supabase as never);
    mockGetValidAccessToken.mockResolvedValue("valid-token");
    mockGetCalendarId.mockResolvedValue("calendar-123");

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ count: 0, connected: true });
  });

  it("returns 500 when count query fails", async () => {
    const supabase = createMockSupabase(
      { id: "user-123" },
      { count: null, error: { message: "DB error" } },
    );
    mockCreateClient.mockResolvedValue(supabase as never);
    mockGetValidAccessToken.mockResolvedValue("valid-token");
    mockGetCalendarId.mockResolvedValue("calendar-123");

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Failed to count unsynced tasks");
  });
});
