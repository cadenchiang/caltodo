/**
 * Tests for MCP API key authentication.
 * Covers bearer parsing, key lookup, unknown keys, lookup failure, and the
 * fire-and-forget last-used stamp.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => {
    throw new Error("createAdminClient should not be called when a client is injected");
  }),
}));

const mockFindKeyOwner = vi.fn();
const mockTouchApiKey = vi.fn();

vi.mock("@/lib/mcp/api-keys", () => ({
  findKeyOwner: (...args: unknown[]) => mockFindKeyOwner(...args),
  touchApiKey: (...args: unknown[]) => mockTouchApiKey(...args),
}));

import { authenticateMcpRequest, extractBearerToken } from "@/lib/mcp/auth";
import type { SupabaseClient } from "@supabase/supabase-js";

const USER_ID = "user-abc-123";
const KEY_ID = "key-1";
const VALID_KEY = "sk-caltodo-0123456789abcdef";

/** Builds headers with the given Authorization value. */
function headers(authorization?: string): Headers {
  return new Headers(authorization ? { authorization } : {});
}

const client = {} as SupabaseClient;

describe("extractBearerToken", () => {
  it("extracts a token from a well-formed header", () => {
    expect(extractBearerToken("Bearer abc123")).toBe("abc123");
  });

  it("matches the scheme case-insensitively and trims whitespace", () => {
    expect(extractBearerToken("  bearer   abc123  ")).toBe("abc123");
  });

  it("returns null for a missing header", () => {
    expect(extractBearerToken(null)).toBeNull();
  });

  it("returns null for a non-bearer scheme", () => {
    expect(extractBearerToken("Basic abc123")).toBeNull();
  });

  it("returns null for a bearer header with no token", () => {
    expect(extractBearerToken("Bearer    ")).toBeNull();
  });
});

describe("authenticateMcpRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTouchApiKey.mockResolvedValue(undefined);
  });

  it("accepts a stored key and returns its owner", async () => {
    mockFindKeyOwner.mockResolvedValue({ userId: USER_ID, keyId: KEY_ID });

    await expect(
      authenticateMcpRequest(headers(`Bearer ${VALID_KEY}`), client)
    ).resolves.toEqual({ ok: true, userId: USER_ID, keyId: KEY_ID });

    expect(mockFindKeyOwner).toHaveBeenCalledWith(client, VALID_KEY);
  });

  it("stamps the key as used", async () => {
    mockFindKeyOwner.mockResolvedValue({ userId: USER_ID, keyId: KEY_ID });
    await authenticateMcpRequest(headers(`Bearer ${VALID_KEY}`), client);
    expect(mockTouchApiKey).toHaveBeenCalledWith(client, KEY_ID);
  });

  it("still authenticates when the last-used stamp fails", async () => {
    mockFindKeyOwner.mockResolvedValue({ userId: USER_ID, keyId: KEY_ID });
    mockTouchApiKey.mockRejectedValue(new Error("write failed"));

    await expect(
      authenticateMcpRequest(headers(`Bearer ${VALID_KEY}`), client)
    ).resolves.toMatchObject({ ok: true, userId: USER_ID });
  });

  it("rejects a missing Authorization header without a lookup", async () => {
    await expect(authenticateMcpRequest(headers(), client)).resolves.toMatchObject({
      ok: false,
      status: 401,
    });
    expect(mockFindKeyOwner).not.toHaveBeenCalled();
  });

  it("rejects a malformed Authorization header without a lookup", async () => {
    await expect(
      authenticateMcpRequest(headers("Basic abc"), client)
    ).resolves.toMatchObject({ ok: false, status: 401 });
    expect(mockFindKeyOwner).not.toHaveBeenCalled();
  });

  it("rejects a key that matches no stored key", async () => {
    mockFindKeyOwner.mockResolvedValue(null);
    const result = await authenticateMcpRequest(headers("Bearer sk-caltodo-wrong"), client);
    expect(result).toMatchObject({ ok: false, status: 401 });
    expect(mockTouchApiKey).not.toHaveBeenCalled();
  });

  it("points the user at settings when the key is unknown", async () => {
    mockFindKeyOwner.mockResolvedValue(null);
    const result = await authenticateMcpRequest(headers("Bearer nope"), client);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/Settings/);
  });

  it("denies access when the lookup itself fails", async () => {
    // findKeyOwner reports a failed read as "no match", so a transient database
    // error must deny rather than grant.
    mockFindKeyOwner.mockResolvedValue(null);
    await expect(
      authenticateMcpRequest(headers(`Bearer ${VALID_KEY}`), client)
    ).resolves.toMatchObject({ ok: false, status: 401 });
  });
});
