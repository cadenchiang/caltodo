/**
 * Tests for POST /api/gcal/sync delete handling.
 *
 * Verifies the delete path resolves google_event_id from the task row when
 * the client does not send one, reports no_event_id when the row has none,
 * and surfaces a lookup failure instead of silently orphaning the event.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockMaybeSingle = vi.fn();
const mockUpdateEq2 = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({ eq: mockUpdateEq2 })),
        })),
      })),
    })
  ),
}));

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => ({ allowed: true })),
}));

vi.mock("@/lib/gcal/token-manager", () => ({
  getValidAccessToken: vi.fn(async () => "access-token"),
  getCalendarId: vi.fn(async () => "caltodo-cal"),
}));

const mockDeleteEvent = vi.fn();
vi.mock("@/lib/gcal/calendar-sync", () => ({
  createCalendarEvent: vi.fn(),
  updateCalendarEvent: vi.fn(),
  deleteCalendarEvent: (...args: unknown[]) => mockDeleteEvent(...args),
}));

import { POST } from "@/app/api/gcal/sync/route";

function request(body: unknown) {
  return new Request("http://localhost/api/gcal/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
  mockUpdateEq2.mockResolvedValue({ error: null });
  mockDeleteEvent.mockResolvedValue(true);
});

describe("POST /api/gcal/sync delete", () => {
  it("resolves the event id from the task row when the client omits it", async () => {
    mockMaybeSingle.mockResolvedValue({ data: { google_event_id: "evt-db" }, error: null });
    const res = await POST(request({ action: "delete", taskId: "task-1" }));
    const body = await res.json();
    expect(body).toEqual({ synced: true });
    expect(mockDeleteEvent).toHaveBeenCalledWith("access-token", "caltodo-cal", "evt-db");
  });

  it("uses the client's event id without a lookup when provided", async () => {
    const res = await POST(request({ action: "delete", taskId: "task-1", googleEventId: "evt-client" }));
    expect((await res.json()).synced).toBe(true);
    expect(mockMaybeSingle).not.toHaveBeenCalled();
    expect(mockDeleteEvent).toHaveBeenCalledWith("access-token", "caltodo-cal", "evt-client");
  });

  it("reports no_event_id when neither the client nor the row has one", async () => {
    mockMaybeSingle.mockResolvedValue({ data: { google_event_id: null }, error: null });
    const res = await POST(request({ action: "delete", taskId: "task-1" }));
    expect(await res.json()).toEqual({ synced: false, reason: "no_event_id" });
    expect(mockDeleteEvent).not.toHaveBeenCalled();
  });

  it("surfaces a lookup failure rather than reporting success", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: { message: "db down" } });
    const res = await POST(request({ action: "delete", taskId: "task-1" }));
    const body = await res.json();
    expect(body.synced).toBe(false);
    expect(body.error).toBe("Failed to look up task");
    expect(mockDeleteEvent).not.toHaveBeenCalled();
  });
});
