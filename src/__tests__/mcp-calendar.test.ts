/**
 * Tests for the MCP Google Calendar layer.
 * Mocks the token manager and fetch to assert calendar selection parsing,
 * multi-calendar listing, partial-failure tolerance, and the recolor patch.
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

import {
  getSelectedCalendarIds,
  listCalendarEvents,
  setEventColor,
} from "@/lib/mcp/calendar";
import type { SupabaseClient } from "@supabase/supabase-js";

const USER_ID = "user-abc-123";

/**
 * Builds a Supabase mock whose credentials row holds the given calendar value.
 *
 * @param googleCalendarId - Raw `google_calendar_id` column value, or null
 * @param error - Optional error to surface from the select
 */
function makeClient(
  googleCalendarId: string | null,
  error: unknown = null
): SupabaseClient {
  const builder = {
    select: () => builder,
    eq: () => builder,
    single: () =>
      Promise.resolve({ data: googleCalendarId === null ? null : { google_calendar_id: googleCalendarId }, error }),
  };
  return { from: () => builder } as unknown as SupabaseClient;
}

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
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getSelectedCalendarIds", () => {
  it("returns a single stored id", async () => {
    await expect(getSelectedCalendarIds(makeClient("work@group.calendar"), USER_ID)).resolves.toEqual([
      "work@group.calendar",
    ]);
  });

  it("returns every id from a stored JSON array", async () => {
    await expect(
      getSelectedCalendarIds(makeClient('["primary","work@group.calendar"]'), USER_ID)
    ).resolves.toEqual(["primary", "work@group.calendar"]);
  });

  it("falls back to primary when nothing is stored", async () => {
    await expect(getSelectedCalendarIds(makeClient(null), USER_ID)).resolves.toEqual(["primary"]);
  });

  it("falls back to primary on an empty array", async () => {
    await expect(getSelectedCalendarIds(makeClient("[]"), USER_ID)).resolves.toEqual(["primary"]);
  });

  it("falls back to primary on unparseable JSON rather than throwing", async () => {
    await expect(getSelectedCalendarIds(makeClient("[not json"), USER_ID)).resolves.toEqual([
      "primary",
    ]);
  });

  it("falls back to primary when the query errors", async () => {
    await expect(
      getSelectedCalendarIds(makeClient(null, { message: "timeout" }), USER_ID)
    ).resolves.toEqual(["primary"]);
  });
});

describe("listCalendarEvents", () => {
  it("errors clearly when Google Calendar is not connected", async () => {
    mockGetToken.mockResolvedValue(null);
    await expect(listCalendarEvents(USER_ID, {}, makeClient("primary"))).rejects.toThrow(
      /not connected/
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps events and names their colors", async () => {
    fetchMock.mockResolvedValue(
      googleResponse(200, {
        items: [
          { id: "e1", summary: "Standup", colorId: "7", start: { dateTime: "2026-08-24T09:00:00Z" } },
          { id: "e2", summary: "Holiday", start: { date: "2026-08-25" } },
        ],
      })
    );

    const events = await listCalendarEvents(USER_ID, {}, makeClient("primary"));

    expect(events).toEqual([
      {
        id: "e1",
        calendarId: "primary",
        title: "Standup",
        start: "2026-08-24T09:00:00Z",
        allDay: false,
        colorId: "7",
        colorName: "Peacock",
      },
      {
        id: "e2",
        calendarId: "primary",
        title: "Holiday",
        start: "2026-08-25",
        allDay: true,
        colorId: null,
        colorName: "default (calendar color)",
      },
    ]);
  });

  it("reads every selected calendar and sorts the merged result by start", async () => {
    fetchMock.mockImplementation((url: string) =>
      Promise.resolve(
        googleResponse(200, {
          items: url.includes("work")
            ? [{ id: "w1", summary: "Later", start: { dateTime: "2026-08-24T15:00:00Z" } }]
            : [{ id: "p1", summary: "Earlier", start: { dateTime: "2026-08-24T09:00:00Z" } }],
        })
      )
    );

    const events = await listCalendarEvents(USER_ID, {}, makeClient('["primary","work"]'));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(events.map((e) => e.id)).toEqual(["p1", "w1"]);
    expect(events.map((e) => e.calendarId)).toEqual(["primary", "work"]);
  });

  it("skips a failing calendar but still returns the others", async () => {
    fetchMock.mockImplementation((url: string) =>
      Promise.resolve(
        url.includes("broken")
          ? googleResponse(403, { error: "forbidden" })
          : googleResponse(200, {
              items: [{ id: "p1", summary: "Kept", start: { dateTime: "2026-08-24T09:00:00Z" } }],
            })
      )
    );

    const events = await listCalendarEvents(USER_ID, {}, makeClient('["primary","broken"]'));
    expect(events.map((e) => e.id)).toEqual(["p1"]);
  });

  it("throws only when no calendar could be read", async () => {
    fetchMock.mockResolvedValue(googleResponse(500, { error: "boom" }));
    await expect(listCalendarEvents(USER_ID, {}, makeClient("primary"))).rejects.toThrow(
      /Could not read any/
    );
  });

  it("passes the time range, query and limit to Google", async () => {
    fetchMock.mockResolvedValue(googleResponse(200, { items: [] }));

    await listCalendarEvents(
      USER_ID,
      { timeMin: "2026-08-24T00:00:00Z", timeMax: "2026-08-25T00:00:00Z", query: "standup", limit: 5 },
      makeClient("primary")
    );

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("timeMin=2026-08-24T00%3A00%3A00Z");
    expect(url).toContain("timeMax=2026-08-25T00%3A00%3A00Z");
    expect(url).toContain("q=standup");
    expect(url).toContain("maxResults=5");
    expect(url).toContain("singleEvents=true");
  });

  it("clamps the limit and trims the merged result to it", async () => {
    fetchMock.mockResolvedValue(
      googleResponse(200, {
        items: Array.from({ length: 3 }, (_, i) => ({
          id: `e${i}`,
          summary: `Event ${i}`,
          start: { dateTime: `2026-08-24T0${i}:00:00Z` },
        })),
      })
    );

    const events = await listCalendarEvents(USER_ID, { limit: 2 }, makeClient('["a","b"]'));
    expect(events).toHaveLength(2);
    expect(fetchMock.mock.calls[0][0]).toContain("maxResults=2");
  });

  it("skips events with no id", async () => {
    fetchMock.mockResolvedValue(
      googleResponse(200, { items: [{ summary: "Ghost" }, { id: "e1", summary: "Real" }] })
    );
    const events = await listCalendarEvents(USER_ID, {}, makeClient("primary"));
    expect(events.map((e) => e.id)).toEqual(["e1"]);
  });
});

describe("setEventColor", () => {
  it("patches only colorId, leaving the rest of the event alone", async () => {
    fetchMock.mockResolvedValue(googleResponse(200, { id: "e1", summary: "Standup" }));

    await expect(
      setEventColor(USER_ID, "e1", "7", "primary", makeClient("primary"))
    ).resolves.toEqual({ title: "Standup", colorName: "Peacock" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/calendars/primary/events/e1");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({ colorId: "7" });
  });

  it("defaults to the first selected calendar", async () => {
    fetchMock.mockResolvedValue(googleResponse(200, { id: "e1", summary: "Standup" }));
    await setEventColor(USER_ID, "e1", "7", undefined, makeClient('["work@group","other"]'));
    expect(fetchMock.mock.calls[0][0]).toContain("/calendars/work%40group/events/e1");
  });

  it("sends an explicit null colorId to clear a color", async () => {
    fetchMock.mockResolvedValue(googleResponse(200, { id: "e1", summary: "Standup" }));
    const result = await setEventColor(USER_ID, "e1", null, "primary", makeClient("primary"));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ colorId: null });
    expect(result.colorName).toBe("default (calendar color)");
  });

  it("reports a missing event rather than a raw 404", async () => {
    fetchMock.mockResolvedValue(googleResponse(404, { error: "not found" }));
    await expect(
      setEventColor(USER_ID, "gone", "7", "primary", makeClient("primary"))
    ).rejects.toThrow(/No event "gone"/);
  });

  it("treats a 410 as a missing event too", async () => {
    fetchMock.mockResolvedValue(googleResponse(410, { error: "gone" }));
    await expect(
      setEventColor(USER_ID, "gone", "7", "primary", makeClient("primary"))
    ).rejects.toThrow(/No event/);
  });

  it("surfaces other Google failures with the status", async () => {
    fetchMock.mockResolvedValue(googleResponse(403, { error: "forbidden" }));
    await expect(
      setEventColor(USER_ID, "e1", "7", "primary", makeClient("primary"))
    ).rejects.toThrow(/HTTP 403/);
  });

  it("errors clearly when Google Calendar is not connected", async () => {
    mockGetToken.mockResolvedValue(null);
    await expect(
      setEventColor(USER_ID, "e1", "7", "primary", makeClient("primary"))
    ).rejects.toThrow(/not connected/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
