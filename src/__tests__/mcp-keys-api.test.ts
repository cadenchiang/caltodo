/**
 * Tests for GET/POST/DELETE /api/mcp-keys.
 * Mocks Supabase auth and the key helpers to test session auth, rate limiting,
 * user scoping, and that a plaintext key is returned only on creation.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve({ auth: { getUser: mockGetUser } })),
}));

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const mockRateLimit = vi.fn();
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
}));

const mockCreate = vi.fn();
const mockList = vi.fn();
const mockRevoke = vi.fn();
vi.mock("@/lib/mcp/api-keys", () => ({
  createApiKey: (...args: unknown[]) => mockCreate(...args),
  listApiKeys: (...args: unknown[]) => mockList(...args),
  revokeApiKey: (...args: unknown[]) => mockRevoke(...args),
}));

import { GET, POST, DELETE } from "@/app/api/mcp-keys/route";
import type { NextRequest } from "next/server";

const USER_ID = "user-abc-123";

const RECORD = {
  id: "key-1",
  label: "Poke",
  keyPrefix: "sk-caltodo-01234567",
  createdAt: "2026-08-22T00:00:00Z",
  lastUsedAt: null,
  expiresAt: null,
  scope: "full",
};

/** Builds a request stub with an optional JSON body and query string. */
function makeRequest(body?: unknown, search = ""): NextRequest {
  return {
    json: async () => {
      if (body === undefined) throw new SyntaxError("no body");
      return body;
    },
    nextUrl: { searchParams: new URLSearchParams(search) },
  } as unknown as NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } }, error: null });
  mockRateLimit.mockReturnValue({ allowed: true });
});

describe("GET /api/mcp-keys", () => {
  it("returns the caller's keys", async () => {
    mockList.mockResolvedValue([RECORD]);
    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ keys: [RECORD] });
    expect(mockList).toHaveBeenCalledWith(expect.anything(), USER_ID);
  });

  it("returns 401 when signed out", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "no session" } });
    const response = await GET();
    expect(response.status).toBe(401);
    expect(mockList).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limited", async () => {
    mockRateLimit.mockReturnValue({ allowed: false });
    const response = await GET();
    expect(response.status).toBe(429);
    expect(mockList).not.toHaveBeenCalled();
  });

  it("returns 500 without leaking the internal message", async () => {
    mockList.mockRejectedValue(new Error("relation does not exist"));
    const response = await GET();
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Failed to load API keys");
  });
});

describe("POST /api/mcp-keys", () => {
  it("creates a key and returns the plaintext once", async () => {
    mockCreate.mockResolvedValue({ key: "sk-caltodo-secret", record: RECORD });
    const response = await POST(makeRequest({ label: "Poke" }));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      key: "sk-caltodo-secret",
      record: RECORD,
    });
    expect(mockCreate).toHaveBeenCalledWith(expect.anything(), USER_ID, "Poke", null, "full");
  });

  it("defaults the label when the body has none", async () => {
    mockCreate.mockResolvedValue({ key: "k", record: RECORD });
    await POST(makeRequest({}));
    expect(mockCreate).toHaveBeenCalledWith(expect.anything(), USER_ID, "Poke", null, "full");
  });

  it("defaults the label when there is no body at all", async () => {
    mockCreate.mockResolvedValue({ key: "k", record: RECORD });
    await POST(makeRequest());
    expect(mockCreate).toHaveBeenCalledWith(expect.anything(), USER_ID, "Poke", null, "full");
  });

  it("ignores a non-string label", async () => {
    mockCreate.mockResolvedValue({ key: "k", record: RECORD });
    await POST(makeRequest({ label: 42 }));
    expect(mockCreate).toHaveBeenCalledWith(expect.anything(), USER_ID, "Poke", null, "full");
  });

  it("passes a positive lifetime through", async () => {
    mockCreate.mockResolvedValue({ key: "k", record: RECORD });
    await POST(makeRequest({ label: "Poke", expiresInDays: 30 }));
    expect(mockCreate).toHaveBeenCalledWith(expect.anything(), USER_ID, "Poke", 30, "full");
  });

  it("treats a non-positive or non-numeric lifetime as no expiry", async () => {
    mockCreate.mockResolvedValue({ key: "k", record: RECORD });
    await POST(makeRequest({ expiresInDays: 0 }));
    expect(mockCreate).toHaveBeenCalledWith(expect.anything(), USER_ID, "Poke", null, "full");
    await POST(makeRequest({ expiresInDays: "forever" }));
    expect(mockCreate).toHaveBeenLastCalledWith(expect.anything(), USER_ID, "Poke", null, "full");
  });

  it("returns 401 when signed out", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(401);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 500 when creation fails", async () => {
    mockCreate.mockRejectedValue(new Error("Label is too long (max 60 characters)."));
    const response = await POST(makeRequest({ label: "x" }));
    expect(response.status).toBe(500);
  });
});

describe("DELETE /api/mcp-keys", () => {
  it("revokes the given key for the caller", async () => {
    mockRevoke.mockResolvedValue(undefined);
    const response = await DELETE(makeRequest(undefined, "id=key-1"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ revoked: true });
    expect(mockRevoke).toHaveBeenCalledWith(expect.anything(), USER_ID, "key-1");
  });

  it("returns 400 when no id is given", async () => {
    const response = await DELETE(makeRequest(undefined, ""));
    expect(response.status).toBe(400);
    expect(mockRevoke).not.toHaveBeenCalled();
  });

  it("returns 400 when the key is not the caller's", async () => {
    mockRevoke.mockRejectedValue(new Error("That API key does not exist."));
    const response = await DELETE(makeRequest(undefined, "id=someone-elses"));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/does not exist/);
  });

  it("returns 401 when signed out", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const response = await DELETE(makeRequest(undefined, "id=key-1"));
    expect(response.status).toBe(401);
    expect(mockRevoke).not.toHaveBeenCalled();
  });
});
