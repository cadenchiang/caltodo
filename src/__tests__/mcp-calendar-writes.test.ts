/**
 * Tests for MCP Google Calendar writes.
 * Mocks the token manager and fetch to assert body building, the all-day rule,
 * calendar defaulting, and how Google's failures are reported.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => {
    throw new Error("createAdminClient should not be called when a client is injected");
  }),
}));

const mockGetToken = vi.fn();
vi.mock("@/lib/gcal/token-manager", () => ({
  getValidAccessToken: (...args: unknown[]) => mockGetToken(...args),
}));

const mockCalendarIds = vi.fn();
vi.mock("@/lib/mcp/calendar", () => ({
  getSelectedCalendarIds: (...args: unknown[]) => mockCalendarIds(...args),
}));

import {
  buildEventBody,
  toTimePayload,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/lib/mcp/calendar-writes";
import type { SupabaseClient } from "@supabase/supabase-js";

const USER_ID = "user-abc-123";
const client = {} as SupabaseClient;

/** Builds a Google API response stub. */
function googleResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockGetToken.mockResolvedValue("ya29.token");
  mockCalendarIds.mockResolvedValue(["primary", "work@group"]);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("toTimePayload", () => {
  it("treats a bare date as all-day", () => {
    expect(toTimePayload("2026-09-04")).toEqual({ date: "2026-09-04" });
  });

  it("treats a timestamp as timed", () => {
    expect(toTimePayload("2026-09-04T15:00:00-07:00")).toEqual({
      dateTime: "2026-09-04T15:00:00-07:00",
    });
  });
});

describe("buildEventBody", () => {
  it("maps fields onto Google's shape", () => {
    expect(
      buildEventBody(
        { title: "Standup", start: "2026-09-04T09:00:00Z", end: "2026-09-04T09:15:00Z" },
        true
      )
    ).toEqual({
      summary: "Standup",
      start: { dateTime: "2026-09-04T09:00:00Z" },
      end: { dateTime: "2026-09-04T09:15:00Z" },
    });
  });

  it("rejects mixing an all-day date with a timestamp", () => {
    // Google rejects this with an opaque 400, so catch it first.
    expect(() =>
      buildEventBody({ title: "x", start: "2026-09-04", end: "2026-09-04T10:00:00Z" }, true)
    ).toThrow(/both be dates/);
  });

  it("accepts an all-day pair", () => {
    const body = buildEventBody({ title: "Holiday", start: "2026-09-04", end: "2026-09-05" }, true);
    expect(body.start).toEqual({ date: "2026-09-04" });
  });

  it("requires a title, start and end when creating", () => {
    expect(() => buildEventBody({ title: "x", start: "2026-09-04" }, true)).toThrow(/start and an end/);
    expect(() => buildEventBody({ start: "2026-09-04", end: "2026-09-05" }, true)).toThrow(/needs a title/);
  });

  it("allows a partial body when editing", () => {
    expect(buildEventBody({ title: "Renamed" }, false)).toEqual({ summary: "Renamed" });
  });

  it("rejects an empty edit and a blank title", () => {
    expect(() => buildEventBody({}, false)).toThrow(/at least one field/);
    expect(() => buildEventBody({ title: "  " }, false)).toThrow(/cannot be empty/);
  });
});

describe("createEvent", () => {
  const input = { title: "Standup", start: "2026-09-04T09:00:00Z", end: "2026-09-04T09:15:00Z" };

  it("posts to the given calendar and returns the event", async () => {
    fetchMock.mockResolvedValue(
      googleResponse(200, {
        id: "e1",
        summary: "Standup",
        start: { dateTime: "2026-09-04T09:00:00Z" },
        htmlLink: "https://calendar.google.com/e1",
      })
    );

    await expect(createEvent(USER_ID, input, "primary", client)).resolves.toEqual({
      id: "e1",
      title: "Standup",
      start: "2026-09-04T09:00:00Z",
      htmlLink: "https://calendar.google.com/e1",
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/calendars/primary/events");
    expect(init.method).toBe("POST");
  });

  it("defaults to the first selected calendar", async () => {
    fetchMock.mockResolvedValue(googleResponse(200, { id: "e1", summary: "Standup" }));
    await createEvent(USER_ID, input, undefined, client);
    expect(fetchMock.mock.calls[0][0]).toContain("/calendars/primary/events");
  });

  it("validates before spending a request", async () => {
    await expect(createEvent(USER_ID, { title: "x" }, "primary", client)).rejects.toThrow(
      /start and an end/
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("errors clearly when Calendar is not connected", async () => {
    mockGetToken.mockResolvedValue(null);
    await expect(createEvent(USER_ID, input, "primary", client)).rejects.toThrow(/not connected/);
  });
});

describe("updateEvent", () => {
  it("patches only what was supplied", async () => {
    fetchMock
      .mockResolvedValueOnce(googleResponse(200, { id: "e1", status: "confirmed" }))
      .mockResolvedValueOnce(googleResponse(200, { id: "e1", summary: "Renamed" }));
    await updateEvent(USER_ID, "e1", { title: "Renamed" }, "primary", client);

    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toContain("/calendars/primary/events/e1");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({ summary: "Renamed" });
  });

  it("refuses to patch a deleted event, which would resurrect it", async () => {
    // Google keeps deleted events as status "cancelled"; a blind PATCH both
    // reports success and puts the event back on the user's calendar.
    fetchMock.mockResolvedValue(googleResponse(200, { id: "e1", status: "cancelled" }));
    await expect(
      updateEvent(USER_ID, "e1", { title: "x" }, "primary", client)
    ).rejects.toThrow(/no longer exists/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].method).toBe("GET");
  });

  it("reports a missing event plainly", async () => {
    fetchMock.mockResolvedValue(googleResponse(404, { error: "not found" }));
    await expect(
      updateEvent(USER_ID, "gone", { title: "x" }, "primary", client)
    ).rejects.toThrow(/no longer exists/);
  });

  it("reports a permission problem plainly", async () => {
    fetchMock.mockResolvedValue(googleResponse(403, { error: "forbidden" }));
    await expect(
      updateEvent(USER_ID, "e1", { title: "x" }, "primary", client)
    ).rejects.toThrow(/do not have permission/);
  });

  it("surfaces other failures with the status", async () => {
    fetchMock.mockResolvedValue(googleResponse(500, { error: "boom" }));
    await expect(
      updateEvent(USER_ID, "e1", { title: "x" }, "primary", client)
    ).rejects.toThrow(/HTTP 500/);
  });
});

describe("deleteEvent", () => {
  it("sends a DELETE and tolerates the empty 204 body", async () => {
    fetchMock.mockResolvedValue(googleResponse(204, {}));
    await expect(deleteEvent(USER_ID, "e1", "primary", client)).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0][1].method).toBe("DELETE");
  });

  it("reports an already-deleted event plainly", async () => {
    fetchMock.mockResolvedValue(googleResponse(410, { error: "gone" }));
    await expect(deleteEvent(USER_ID, "e1", "primary", client)).rejects.toThrow(
      /no longer exists/
    );
  });
});
