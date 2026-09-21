/**
 * Tests for the /api/mobile/tasks routes (M9, L10).
 *
 * Every route must authenticate the bearer token before it queries, so an
 * expired JWT is a 401 rather than a 500 from the query. POST derives
 * completed_at from is_completed, PATCH keeps dismissed_by_user in step
 * with dismissed_at, and GET is bounded.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { GET, POST } from "@/app/api/mobile/tasks/route";
import { PATCH, DELETE } from "@/app/api/mobile/tasks/[taskId]/route";
import { logger } from "@/lib/logger";

const USER = { id: "user-1", email: "a@b.c" };

/** A request with a bearer header and an optional JSON body. */
function req(method: string, body?: unknown, token = "jwt"): NextRequest {
  return new NextRequest("http://localhost/api/mobile/tasks", {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const params = { params: Promise.resolve({ taskId: "task-1" }) };

/** Query builder stub: every method chains, the terminal ones resolve `result`. */
function builder(result: unknown) {
  const b: Record<string, unknown> = {};
  const chain = () => b;
  for (const m of ["select", "insert", "update", "is", "order", "eq", "range", "limit"]) b[m] = vi.fn(chain);
  b.single = vi.fn(() => Promise.resolve(result));
  b.maybeSingle = vi.fn(() => Promise.resolve(result));
  b.then = (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return b;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
});

describe("authentication comes first (M9)", () => {
  const expired = { data: { user: null }, error: { message: "JWT expired" } };

  it.each([
    ["GET", () => GET(req("GET"))],
    ["POST", () => POST(req("POST", { title: "x" }))],
    ["PATCH", () => PATCH(req("PATCH", { title: "x" }), params)],
    ["DELETE", () => DELETE(req("DELETE"), params)],
  ])("%s returns 401 on an expired token without querying", async (_name, call) => {
    mockGetUser.mockResolvedValue(expired);
    mockFrom.mockReturnValue(builder({ data: null, error: { message: "should not run" } }));
    const res = await call();
    expect(res.status).toBe(401);
    expect(mockFrom).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("bearer token rejected"),
      expect.objectContaining({ error: "JWT expired" }),
    );
  });

  it("returns 401 without a bearer header", async () => {
    const res = await GET(new NextRequest("http://localhost/api/mobile/tasks"));
    expect(res.status).toBe(401);
    expect(mockGetUser).not.toHaveBeenCalled();
  });
});

describe("GET /api/mobile/tasks", () => {
  it("returns the user's tasks", async () => {
    const rows = [{ id: "t1" }];
    mockFrom.mockReturnValue(builder({ data: rows, error: null }));
    const res = await GET(req("GET"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(rows);
  });

  it("logs and returns 500 when the query fails", async () => {
    mockFrom.mockReturnValue(builder({ data: null, error: { message: "boom" } }));
    const res = await GET(req("GET"));
    expect(res.status).toBe(500);
    expect(logger.error).toHaveBeenCalledWith(
      "GET /api/mobile/tasks: query failed",
      expect.objectContaining({ userId: "user-1", error: "boom" }),
    );
  });
});

describe("POST /api/mobile/tasks", () => {
  it("derives completed_at for a task created already complete", async () => {
    const b = builder({ data: { id: "t1" }, error: null });
    mockFrom.mockReturnValue(b);
    const res = await POST(req("POST", { title: "x", is_completed: true }));
    expect(res.status).toBe(200);
    const inserted = (b.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(inserted.user_id).toBe("user-1");
    expect(typeof inserted.completed_at).toBe("string");
  });

  it("forces user_id to the token's user and drops non-allowlisted fields", async () => {
    const b = builder({ data: { id: "t1" }, error: null });
    mockFrom.mockReturnValue(b);
    await POST(req("POST", { title: "x", user_id: "victim", source: "canvas" }));
    const inserted = (b.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(inserted).toEqual({ title: "x", user_id: "user-1" });
  });

  it("returns 400 on a malformed body", async () => {
    const bad = new NextRequest("http://localhost/api/mobile/tasks", {
      method: "POST",
      headers: { authorization: "Bearer jwt" },
      body: "not json",
    });
    const res = await POST(bad);
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/mobile/tasks/:taskId", () => {
  it("sets dismissed_by_user when the client dismisses", async () => {
    const b = builder({ data: { id: "task-1" }, error: null });
    mockFrom.mockReturnValue(b);
    const res = await PATCH(req("PATCH", { dismissed_at: "2026-09-21T00:00:00.000Z" }), params);
    expect(res.status).toBe(200);
    const update = (b.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(update).toEqual({ dismissed_at: "2026-09-21T00:00:00.000Z", dismissed_by_user: true });
  });

  it("clears dismissed_by_user when the client undismisses", async () => {
    const b = builder({ data: { id: "task-1" }, error: null });
    mockFrom.mockReturnValue(b);
    await PATCH(req("PATCH", { dismissed_at: null }), params);
    const update = (b.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(update).toEqual({ dismissed_at: null, dismissed_by_user: false });
  });

  it("still derives completed_at on completion", async () => {
    const b = builder({ data: { id: "task-1" }, error: null });
    mockFrom.mockReturnValue(b);
    await PATCH(req("PATCH", { is_completed: true }), params);
    const update = (b.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(update.is_completed).toBe(true);
    expect(typeof update.completed_at).toBe("string");
  });

  it("returns 404 when no row matched", async () => {
    mockFrom.mockReturnValue(builder({ data: null, error: null }));
    const res = await PATCH(req("PATCH", { title: "x" }), params);
    expect(res.status).toBe(404);
  });

  it("returns 400 when nothing editable was sent", async () => {
    const res = await PATCH(req("PATCH", { user_id: "victim" }), params);
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/mobile/tasks/:taskId", () => {
  it("dismisses as the user and returns success", async () => {
    const b = builder({ data: [{ id: "task-1" }], error: null });
    mockFrom.mockReturnValue(b);
    const res = await DELETE(req("DELETE"), params);
    expect(res.status).toBe(200);
    const update = (b.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(update.dismissed_by_user).toBe(true);
  });

  it("returns 404 when no row matched", async () => {
    mockFrom.mockReturnValue(builder({ data: [], error: null }));
    const res = await DELETE(req("DELETE"), params);
    expect(res.status).toBe(404);
  });
});
