/**
 * Tests for listAllCalendars in calendar-list.ts.
 *
 * Verifies:
 * - Returns all calendars (no access role filter)
 * - Sorts primary first, then alphabetical by summary
 * - Handles Google API failure gracefully (returns null)
 * - Handles empty calendar list
 * - Uses default values for missing optional fields
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { listAllCalendars } from "@/lib/gcal/calendar-list";

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

const MOCK_ACCESS_TOKEN = "mock-access-token";

/**
 * Builds a mock Google Calendar API calendarList response.
 *
 * @param items - Array of calendar objects
 * @returns Mock Response with JSON body
 */
function mockCalendarListResponse(items: Record<string, unknown>[]) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ kind: "calendar#calendarList", items }),
    text: async () => JSON.stringify({ items }),
  } as unknown as Response;
}

describe("listAllCalendars", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns all calendars regardless of accessRole", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockCalendarListResponse([
        { id: "cal-owner", summary: "My Cal", accessRole: "owner", primary: true, backgroundColor: "#4285f4" },
        { id: "cal-writer", summary: "Shared Cal", accessRole: "writer", primary: false, backgroundColor: "#ff0000" },
        { id: "cal-reader", summary: "Read Only", accessRole: "reader", primary: false, backgroundColor: "#00ff00" },
        { id: "cal-freebusy", summary: "Free/Busy", accessRole: "freeBusyReader", primary: false, backgroundColor: "#cccccc" },
      ])
    );

    const result = await listAllCalendars(MOCK_ACCESS_TOKEN);

    expect(result).not.toBeNull();
    expect(result).toHaveLength(4);
  });

  it("sorts primary calendar first, then alphabetical by summary", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockCalendarListResponse([
        { id: "z-cal", summary: "Zebra", accessRole: "reader", primary: false, backgroundColor: "#000" },
        { id: "a-cal", summary: "Alpha", accessRole: "reader", primary: false, backgroundColor: "#000" },
        { id: "primary-cal", summary: "My Primary", accessRole: "owner", primary: true, backgroundColor: "#000" },
        { id: "m-cal", summary: "Middle", accessRole: "writer", primary: false, backgroundColor: "#000" },
      ])
    );

    const result = await listAllCalendars(MOCK_ACCESS_TOKEN);

    expect(result).not.toBeNull();
    expect(result!.map((c) => c.id)).toEqual([
      "primary-cal",
      "a-cal",
      "m-cal",
      "z-cal",
    ]);
  });

  it("returns null when the API call fails", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    } as unknown as Response);

    const result = await listAllCalendars(MOCK_ACCESS_TOKEN);

    expect(result).toBeNull();
  });

  it("handles empty calendar list", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockCalendarListResponse([])
    );

    const result = await listAllCalendars(MOCK_ACCESS_TOKEN);

    expect(result).not.toBeNull();
    expect(result).toHaveLength(0);
  });

  it("uses default values for missing optional fields", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockCalendarListResponse([
        { id: "minimal-cal", accessRole: "reader" },
      ])
    );

    const result = await listAllCalendars(MOCK_ACCESS_TOKEN);

    expect(result).toHaveLength(1);
    expect(result![0].summary).toBe("(No name)");
    expect(result![0].primary).toBe(false);
    expect(result![0].backgroundColor).toBe("#4285f4");
  });

  it("calls the correct Google Calendar API endpoint", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockCalendarListResponse([])
    );

    await listAllCalendars(MOCK_ACCESS_TOKEN);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList",
      {
        headers: {
          Authorization: `Bearer ${MOCK_ACCESS_TOKEN}`,
        },
      }
    );
  });
});
