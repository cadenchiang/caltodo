/**
 * Tests for MCP API key authentication.
 * Covers bearer parsing, key mismatch, and misconfiguration handling.
 */

import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { authenticateMcpRequest, extractBearerToken } from "@/lib/mcp/auth";

const VALID_KEY = "sk-caltodo-test-key-0123456789";
const USER_ID = "user-abc-123";

/** Builds an env object with the MCP variables set. */
function env(overrides: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
  return {
    POKE_MCP_API_KEY: VALID_KEY,
    POKE_MCP_USER_ID: USER_ID,
    ...overrides,
  } as unknown as NodeJS.ProcessEnv;
}

/** Builds headers with the given Authorization value. */
function headers(authorization?: string): Headers {
  return new Headers(authorization ? { authorization } : {});
}

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
  it("accepts the configured key and returns the mapped user id", () => {
    const result = authenticateMcpRequest(headers(`Bearer ${VALID_KEY}`), env());
    expect(result).toEqual({ ok: true, userId: USER_ID });
  });

  it("rejects a missing Authorization header with 401", () => {
    const result = authenticateMcpRequest(headers(), env());
    expect(result).toMatchObject({ ok: false, status: 401 });
  });

  it("rejects a wrong key of the same length with 401", () => {
    const wrong = "sk-caltodo-test-key-9876543210";
    expect(wrong).toHaveLength(VALID_KEY.length);
    const result = authenticateMcpRequest(headers(`Bearer ${wrong}`), env());
    expect(result).toMatchObject({ ok: false, status: 401 });
  });

  it("rejects a wrong key of a different length with 401", () => {
    const result = authenticateMcpRequest(headers("Bearer short"), env());
    expect(result).toMatchObject({ ok: false, status: 401 });
  });

  it("returns 500 when POKE_MCP_API_KEY is unset", () => {
    const result = authenticateMcpRequest(
      headers(`Bearer ${VALID_KEY}`),
      env({ POKE_MCP_API_KEY: undefined })
    );
    expect(result).toMatchObject({ ok: false, status: 500 });
  });

  it("returns 500 when POKE_MCP_API_KEY is shorter than the minimum", () => {
    const result = authenticateMcpRequest(
      headers("Bearer tiny"),
      env({ POKE_MCP_API_KEY: "tiny" })
    );
    expect(result).toMatchObject({ ok: false, status: 500 });
  });

  it("returns 500 when POKE_MCP_USER_ID is unset", () => {
    const result = authenticateMcpRequest(
      headers(`Bearer ${VALID_KEY}`),
      env({ POKE_MCP_USER_ID: undefined })
    );
    expect(result).toMatchObject({ ok: false, status: 500 });
  });
});
