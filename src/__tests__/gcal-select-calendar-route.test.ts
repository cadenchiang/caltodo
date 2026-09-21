/**
 * Tests for POST /api/gcal/select-calendar.
 *
 * Verifies the write calendar (index 0) cannot be changed while tasks still
 * reference events in it, that a first-time selection or an unchanged write
 * target is stored, and that the push channel watches the user's own
 * primary calendar rather than the write calendar.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockCredsUpdateEq = vi.fn();
const mockTasksNot = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve({ auth: { getUser: mockGetUser }, from: mockFrom })),
}));

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => ({ allowed: true })),
}));

const mockGetCalendarId = vi.fn();
vi.mock("@/lib/gcal/token-manager", () => ({
  getValidAccessToken: vi.fn(async () => "access-token"),
  getCalendarId: (...args: unknown[]) => mockGetCalendarId(...args),
}));

const mockRenewWatchChannel = vi.fn();
vi.mock("@/lib/gcal/watch-manager", () => ({
  WATCHED_CALENDAR_ID: "primary",
  renewWatchChannel: (...args: unknown[]) => mockRenewWatchChannel(...args),
}));

import { POST } from "@/app/api/gcal/select-calendar/route";

function request(body: unknown) {
  return new Request("http://localhost/api/gcal/select-calendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** Wires the mock so tasks.count returns `syncedCount` and credentials.update succeeds. */
function setup(syncedCount: number, countError: { message: string } | null = null) {
  mockTasksNot.mockResolvedValue({ count: syncedCount, error: countError });
  mockFrom.mockImplementation((table: string) => {
    if (table === "tasks") {
      return { select: vi.fn(() => ({ eq: vi.fn(() => ({ not: mockTasksNot })) })) };
    }
    return { update: vi.fn(() => ({ eq: mockCredsUpdateEq })) };
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
  mockCredsUpdateEq.mockResolvedValue({ error: null });
  mockRenewWatchChannel.mockResolvedValue({ channelId: "ch", resourceId: "r", expiration: "2026-09-27T00:00:00Z" });
});

describe("POST /api/gcal/select-calendar", () => {
  it("refuses to change the write calendar while tasks reference events", async () => {
    setup(12);
    mockGetCalendarId.mockResolvedValue("caltodo-cal");
    const res = await POST(request({ calendarIds: ["primary", "caltodo-cal"] }));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.reason).toBe("write_calendar_locked");
    expect(body.error).toContain("12");
    expect(mockCredsUpdateEq).not.toHaveBeenCalled();
    expect(mockRenewWatchChannel).not.toHaveBeenCalled();
  });

  it("allows a write calendar change when no task has an event", async () => {
    setup(0);
    mockGetCalendarId.mockResolvedValue("caltodo-cal");
    const res = await POST(request({ calendarIds: ["primary"] }));
    expect(res.status).toBe(200);
    expect(mockCredsUpdateEq).toHaveBeenCalled();
  });

  it("does not count tasks when the write calendar stays first", async () => {
    setup(50);
    mockGetCalendarId.mockResolvedValue("caltodo-cal");
    const res = await POST(request({ calendarIds: ["caltodo-cal", "primary", "other"] }));
    expect(res.status).toBe(200);
    expect(mockTasksNot).not.toHaveBeenCalled();
    expect(await res.json()).toEqual({ calendarIds: ["caltodo-cal", "primary", "other"] });
  });

  it("allows the first selection after connect (nothing stored yet)", async () => {
    setup(50);
    mockGetCalendarId.mockResolvedValue(null);
    const res = await POST(request({ calendarIds: ["caltodo-cal"] }));
    expect(res.status).toBe(200);
    expect(mockTasksNot).not.toHaveBeenCalled();
  });

  it("fails closed when the synced-task count cannot be read", async () => {
    setup(0, { message: "db down" });
    mockGetCalendarId.mockResolvedValue("caltodo-cal");
    const res = await POST(request({ calendarIds: ["primary"] }));
    expect(res.status).toBe(500);
    expect(mockCredsUpdateEq).not.toHaveBeenCalled();
  });

  it("registers the push channel on the user's primary calendar, not the write calendar", async () => {
    setup(0);
    mockGetCalendarId.mockResolvedValue(null);
    const res = await POST(request({ calendarIds: ["caltodo-cal", "other"] }));
    expect(res.status).toBe(200);
    expect(mockRenewWatchChannel).toHaveBeenCalledTimes(1);
    expect(mockRenewWatchChannel.mock.calls[0][3]).toBe("primary");
  });

  it("still saves the selection when channel registration fails", async () => {
    setup(0);
    mockGetCalendarId.mockResolvedValue(null);
    mockRenewWatchChannel.mockResolvedValue(null);
    const res = await POST(request({ calendarIds: ["caltodo-cal"] }));
    expect(res.status).toBe(200);
    expect(mockCredsUpdateEq).toHaveBeenCalled();
  });

  it("rejects an empty or oversized selection", async () => {
    setup(0);
    expect((await POST(request({ calendarIds: [] }))).status).toBe(400);
    expect((await POST(request({ calendarIds: Array(11).fill("c") }))).status).toBe(400);
    expect((await POST(request({ calendarIds: [""] }))).status).toBe(400);
  });
});
