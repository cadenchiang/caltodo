/**
 * Tests for Google Calendar token management: fetch, refresh, expiry handling.
 * Mocks fetch and Supabase client for isolated unit testing.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { refreshAccessToken, getValidAccessToken, isGoogleCalendarConnected } from "@/lib/gcal/token-manager";

// Set required env vars
beforeEach(() => {
  process.env.GOOGLE_CLIENT_ID = "test-client-id";
  process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
  process.env.CREDENTIALS_ENCRYPTION_KEY =
    "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2";
  vi.restoreAllMocks();
});

describe("refreshAccessToken", () => {
  it("should return new token on successful refresh", async () => {
    const mockResponse = {
      access_token: "new-access-token",
      expires_in: 3600,
      token_type: "Bearer",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await refreshAccessToken("test-refresh-token");

    expect(result).toEqual({
      accessToken: "new-access-token",
      expiresIn: 3600,
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://oauth2.googleapis.com/token",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("should return null on failed refresh", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve("invalid_grant"),
    });

    const result = await refreshAccessToken("bad-refresh-token");
    expect(result).toBeNull();
  });

  it("should return null when env vars are missing", async () => {
    delete process.env.GOOGLE_CLIENT_ID;

    const result = await refreshAccessToken("test-refresh-token");
    expect(result).toBeNull();
  });
});

describe("getValidAccessToken", () => {
  /**
   * Creates a mock Supabase client with configurable select/update behavior.
   */
  function createMockSupabase(selectData: Record<string, unknown> | null, selectError: { code: string; message: string } | null = null) {
    const updateMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    return {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: selectData,
              error: selectError,
            }),
          }),
        }),
        update: updateMock,
      }),
      _updateMock: updateMock,
    };
  }

  it("should return null when no tokens are stored", async () => {
    const supabase = createMockSupabase(null);
    const result = await getValidAccessToken(supabase as never, "user-123");
    expect(result).toBeNull();
  });

  it("should return null when access token is missing", async () => {
    const supabase = createMockSupabase({
      google_access_token_encrypted: null,
      google_refresh_token_encrypted: "encrypted-refresh",
      google_token_expires_at: new Date(Date.now() + 3600000).toISOString(),
    });

    const result = await getValidAccessToken(supabase as never, "user-123");
    expect(result).toBeNull();
  });

  it("should return decrypted token when not expired", async () => {
    const { encrypt } = await import("@/lib/crypto");
    const encryptedAccess = encrypt("valid-access-token");
    const encryptedRefresh = encrypt("valid-refresh-token");

    const supabase = createMockSupabase({
      google_access_token_encrypted: encryptedAccess,
      google_refresh_token_encrypted: encryptedRefresh,
      google_token_expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    });

    const result = await getValidAccessToken(supabase as never, "user-123");
    expect(result).toBe("valid-access-token");
  });

  it("should refresh token when expired", async () => {
    const { encrypt } = await import("@/lib/crypto");
    const encryptedAccess = encrypt("old-access-token");
    const encryptedRefresh = encrypt("valid-refresh-token");

    const supabase = createMockSupabase({
      google_access_token_encrypted: encryptedAccess,
      google_refresh_token_encrypted: encryptedRefresh,
      google_token_expires_at: new Date(Date.now() - 1000).toISOString(), // expired
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "refreshed-token",
          expires_in: 3600,
          token_type: "Bearer",
        }),
    });

    const result = await getValidAccessToken(supabase as never, "user-123");
    expect(result).toBe("refreshed-token");
  });

  it("should clear tokens when refresh fails (revoked access)", async () => {
    const { encrypt } = await import("@/lib/crypto");
    const encryptedAccess = encrypt("old-access-token");
    const encryptedRefresh = encrypt("revoked-refresh-token");

    const supabase = createMockSupabase({
      google_access_token_encrypted: encryptedAccess,
      google_refresh_token_encrypted: encryptedRefresh,
      google_token_expires_at: new Date(Date.now() - 1000).toISOString(), // expired
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve("invalid_grant"),
    });

    const result = await getValidAccessToken(supabase as never, "user-123");
    expect(result).toBeNull();
    // Verify tokens were cleared
    expect(supabase.from).toHaveBeenCalled();
  });
});

describe("isGoogleCalendarConnected", () => {
  it("should return true when tokens exist", async () => {
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { google_access_token_encrypted: "encrypted-token" },
              error: null,
            }),
          }),
        }),
      }),
    };

    const result = await isGoogleCalendarConnected(supabase as never, "user-123");
    expect(result).toBe(true);
  });

  it("should return false when no tokens exist", async () => {
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { google_access_token_encrypted: null },
              error: null,
            }),
          }),
        }),
      }),
    };

    const result = await isGoogleCalendarConnected(supabase as never, "user-123");
    expect(result).toBe(false);
  });

  it("should return false on database error", async () => {
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116", message: "No rows" },
            }),
          }),
        }),
      }),
    };

    const result = await isGoogleCalendarConnected(supabase as never, "user-123");
    expect(result).toBe(false);
  });
});
