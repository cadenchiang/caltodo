/**
 * Tests for the POST/GET/DELETE handlers of /api/mcp.
 * Mocks auth, protocol dispatch, and the rate limiter.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const mockAuth = vi.fn();
vi.mock("@/lib/mcp/auth", () => ({
  authenticateMcpRequest: (...args: unknown[]) => mockAuth(...args),
}));

const mockHandleBody = vi.fn();
vi.mock("@/lib/mcp/protocol", async () => {
  const actual = await vi.importActual<typeof import("@/lib/mcp/protocol")>(
    "@/lib/mcp/protocol"
  );
  return {
    ...actual,
    handleBody: (...args: unknown[]) => mockHandleBody(...args),
  };
});

const mockRateLimit = vi.fn();
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
}));

import { POST, GET, DELETE } from "@/app/api/mcp/[[...transport]]/route";
import type { NextRequest } from "next/server";

const USER_ID = "user-abc-123";

/**
 * Builds a minimal NextRequest stand-in.
 *
 * @param body - Value returned by `request.json()`, or the string "invalid" to throw
 * @returns A fake request accepted by the route handler
 */
function makeRequest(body: unknown): NextRequest {
  return {
    headers: new Headers({ authorization: "Bearer test" }),
    json: async () => {
      if (body === "invalid") throw new SyntaxError("Unexpected token");
      return body;
    },
  } as unknown as NextRequest;
}

describe("POST /api/mcp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockReturnValue({ ok: true, userId: USER_ID });
    mockRateLimit.mockReturnValue({ allowed: true });
    mockHandleBody.mockResolvedValue([{ jsonrpc: "2.0", id: 1, result: {} }]);
  });

  it("returns a single response object for a single request", async () => {
    const response = await POST(makeRequest({ jsonrpc: "2.0", id: 1, method: "ping" }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ jsonrpc: "2.0", id: 1, result: {} });
  });

  it("returns an array for a batch response", async () => {
    mockHandleBody.mockResolvedValue([
      { jsonrpc: "2.0", id: 1, result: {} },
      { jsonrpc: "2.0", id: 2, result: {} },
    ]);
    const response = await POST(makeRequest([]));
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(2);
  });

  it("returns 202 with no body for a notification-only request", async () => {
    mockHandleBody.mockResolvedValue([]);
    const response = await POST(
      makeRequest({ jsonrpc: "2.0", method: "notifications/initialized" })
    );
    expect(response.status).toBe(202);
    await expect(response.text()).resolves.toBe("");
  });

  it("passes the authenticated user id to the dispatcher", async () => {
    await POST(makeRequest({ jsonrpc: "2.0", id: 1, method: "ping" }));
    expect(mockHandleBody).toHaveBeenCalledWith({ jsonrpc: "2.0", id: 1, method: "ping" }, USER_ID);
  });

  it("returns 401 when authentication fails", async () => {
    mockAuth.mockReturnValue({ ok: false, status: 401, message: "Invalid API key" });
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(401);
    expect(mockHandleBody).not.toHaveBeenCalled();
  });

  it("returns 500 when the server is misconfigured", async () => {
    mockAuth.mockReturnValue({ ok: false, status: 500, message: "MCP server is not configured" });
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(500);
  });

  it("returns 429 when the rate limit is exceeded", async () => {
    mockRateLimit.mockReturnValue({ allowed: false });
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(429);
    expect(mockHandleBody).not.toHaveBeenCalled();
  });

  it("rate limits per authenticated user", async () => {
    await POST(makeRequest({}));
    expect(mockRateLimit).toHaveBeenCalledWith(`mcp:${USER_ID}`, 60, 60_000);
  });

  it("returns a JSON-RPC parse error for an unparseable body", async () => {
    const response = await POST(makeRequest("invalid"));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe(-32700);
  });

  it("returns a JSON-RPC internal error when dispatch throws", async () => {
    mockHandleBody.mockRejectedValue(new Error("boom"));
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error.code).toBe(-32603);
    expect(body.error.message).toBe("Internal server error");
  });
});

describe("GET and DELETE /api/mcp", () => {
  it("rejects GET with 405 and an Allow header", async () => {
    const response = await GET();
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST");
  });

  it("rejects DELETE with 405 and an Allow header", async () => {
    const response = await DELETE();
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST");
  });
});
