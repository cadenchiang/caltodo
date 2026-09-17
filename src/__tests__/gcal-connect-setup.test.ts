/**
 * Tests the post-OAuth calendar setup shared by settings-style connects and
 * the onboarding Google Calendar step.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { chooseCalendarIds, setUpConnectedCalendar } from "@/lib/gcal/connect-setup";

/** Builds a minimal fetch Response stand-in. */
const res = (ok: boolean, body: unknown, status = ok ? 200 : 500) =>
  ({ ok, status, json: async () => body }) as Response;

describe("chooseCalendarIds", () => {
  it("puts the caltodo calendar first so it is the write target", () => {
    expect(chooseCalendarIds("cal", ["a", "b"])).toEqual(["cal", "a", "b"]);
  });

  it("does not list the caltodo calendar twice", () => {
    expect(chooseCalendarIds("cal", ["a", "cal"])).toEqual(["cal", "a"]);
  });

  it("caps the selection at ten", () => {
    const many = Array.from({ length: 15 }, (_, i) => `c${i}`);
    expect(chooseCalendarIds("cal", many)).toHaveLength(10);
    expect(chooseCalendarIds(null, many)).toHaveLength(10);
  });

  it("falls back to the other calendars, then to primary", () => {
    expect(chooseCalendarIds(null, ["a"])).toEqual(["a"]);
    expect(chooseCalendarIds(null, [])).toEqual(["primary"]);
    expect(chooseCalendarIds(null, [""])).toEqual(["primary"]);
  });
});

describe("setUpConnectedCalendar", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("ensures the calendar, lists the rest, and saves the selection", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(res(true, { calendarId: "cal" }))
      .mockResolvedValueOnce(res(true, { calendars: [{ id: "cal" }, { id: "me@x.edu" }] }))
      .mockResolvedValueOnce(res(true, { calendarIds: ["cal", "me@x.edu"] }));

    const result = await setUpConnectedCalendar(fetchMock as unknown as typeof fetch);

    expect(result).toEqual({ ok: true, calendarIds: ["cal", "me@x.edu"] });
    expect(fetchMock.mock.calls.map((c) => c[0])).toEqual([
      "/api/gcal/ensure-caltodo-calendar",
      "/api/gcal/calendars?all=true",
      "/api/gcal/select-calendar",
    ]);
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({ calendarIds: ["cal", "me@x.edu"] });
  });

  it("still saves a selection when the dedicated calendar cannot be created", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(res(false, {}))
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(res(true, {}));

    const result = await setUpConnectedCalendar(fetchMock as unknown as typeof fetch);

    expect(result).toEqual({ ok: true, calendarIds: ["primary"] });
  });

  it("reports the server's message when saving the selection fails", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(res(true, { calendarId: "cal" }))
      .mockResolvedValueOnce(res(true, { calendars: [] }))
      .mockResolvedValueOnce(res(false, { error: "Google Calendar not connected" }, 400));

    const result = await setUpConnectedCalendar(fetchMock as unknown as typeof fetch);

    expect(result).toEqual({ ok: false, step: "select-calendar", error: "Google Calendar not connected" });
  });

  it("never throws when the save request itself rejects", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(res(true, { calendarId: "cal" }))
      .mockResolvedValueOnce(res(true, { calendars: [] }))
      .mockRejectedValueOnce(new Error("network down"));

    const result = await setUpConnectedCalendar(fetchMock as unknown as typeof fetch);

    expect(result).toEqual({ ok: false, step: "select-calendar", error: "network down" });
  });
});
