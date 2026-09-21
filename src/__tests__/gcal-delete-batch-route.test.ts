/**
 * Tests for POST /api/gcal/delete-batch.
 *
 * Verifies input validation, that only the caller's tasks with an event are
 * deleted, that deleted tasks get google_event_id cleared, and that a
 * Google failure is counted rather than hidden.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockRowsNot = vi.fn();
const mockIn = vi.fn();
const mockUpdateEq = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: () => ({
        select: () => ({ eq: () => ({ in: (...args: unknown[]) => { mockIn(...args); return { not: mockRowsNot }; } }) }),
        update: (payload: unknown) => { mockUpdate(payload); return { eq: mockUpdateEq }; },
      }),
    })
  ),
}));
vi.mock("@/lib/logger", () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: vi.fn(() => ({ allowed: true })) }));
const mockToken = vi.fn();
vi.mock("@/lib/gcal/token-manager", () => ({
  getValidAccessToken: (...args: unknown[]) => mockToken(...args),
  getCalendarId: vi.fn(async () => "caltodo-cal"),
}));
const mockDelete = vi.fn();
vi.mock("@/lib/gcal/calendar-sync", () => ({
  deleteCalendarEvent: (...args: unknown[]) => mockDelete(...args),
}));

import { POST } from "@/app/api/gcal/delete-batch/route";

function request(body: unknown) {
  return new Request("http://localhost/api/gcal/delete-batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
  mockToken.mockResolvedValue("access-token");
  mockUpdateEq.mockResolvedValue({ error: null });
  mockDelete.mockResolvedValue(true);
  mockRowsNot.mockResolvedValue({
    data: [{ id: "t1", google_event_id: "e1" }, { id: "t2", google_event_id: "e2" }],
    error: null,
  });
});

describe("POST /api/gcal/delete-batch", () => {
  it("rejects an empty, oversized or malformed id list", async () => {
    expect((await POST(request({ taskIds: [] }))).status).toBe(400);
    expect((await POST(request({ taskIds: Array(101).fill("t") }))).status).toBe(400);
    expect((await POST(request({ taskIds: ["t", 3] }))).status).toBe(400);
    expect((await POST(request({}))).status).toBe(400);
  });

  it("deletes each event once and clears the ids, skipping tasks without an event", async () => {
    const res = await POST(request({ taskIds: ["t1", "t2", "t3"] }));
    expect(await res.json()).toEqual({ deleted: 2, failed: 0, skipped: 1 });
    expect(mockIn).toHaveBeenCalledWith("id", ["t1", "t2", "t3"]);
    expect(mockDelete).toHaveBeenCalledTimes(2);
    expect(mockDelete).toHaveBeenCalledWith("access-token", "caltodo-cal", "e1");
    expect(mockUpdate).toHaveBeenCalledTimes(2);
    expect(mockUpdate).toHaveBeenCalledWith({ google_event_id: null });
  });

  it("counts a Google failure without clearing that task's id", async () => {
    mockDelete.mockImplementation(async (_t: string, _c: string, eventId: string) => eventId !== "e2");
    const res = await POST(request({ taskIds: ["t1", "t2"] }));
    expect(await res.json()).toEqual({ deleted: 1, failed: 1, skipped: 0 });
    expect(mockUpdate).toHaveBeenCalledTimes(1);
  });

  it("no-ops with a reason when Google Calendar is not connected", async () => {
    mockToken.mockResolvedValue(null);
    const res = await POST(request({ taskIds: ["t1"] }));
    expect(await res.json()).toEqual({ deleted: 0, failed: 0, skipped: 1, reason: "not_connected" });
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns 500 when the task rows cannot be loaded", async () => {
    mockRowsNot.mockResolvedValue({ data: null, error: { message: "db down" } });
    expect((await POST(request({ taskIds: ["t1"] }))).status).toBe(500);
  });
});
