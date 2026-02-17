/**
 * Tests for listWritableCalendars in calendar-client.ts.
 *
 * Verifies:
 * - Filters calendars by accessRole (owner/writer only)
 * - Handles Google API failure gracefully (returns null)
 * - Maps fields correctly from API response to GCalCalendarEntry
 * - Handles empty calendar list
 * - Handles missing optional fields with defaults
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { listWritableCalendars } from "@/lib/gcal/calendar-client";

// Mock the logger to suppress output during tests
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

describe("listWritableCalendars", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("filters calendars to only owner and writer accessRoles", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockCalendarListResponse([
        { id: "cal-owner", summary: "My Cal", accessRole: "owner", primary: true, backgroundColor: "#4285f4" },
        { id: "cal-writer", summary: "Shared Cal", accessRole: "writer", primary: false, backgroundColor: "#ff0000" },
        { id: "cal-reader", summary: "Read Only", accessRole: "reader", primary: false, backgroundColor: "#00ff00" },
        { id: "cal-freebusy", summary: "Free/Busy", accessRole: "freeBusyReader", primary: false, backgroundColor: "#cccccc" },
      ])
    );

    const result = await listWritableCalendars(MOCK_ACCESS_TOKEN);

    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);
    expect(result![0].id).toBe("cal-owner");
    expect(result![1].id).toBe("cal-writer");
  });

  it("returns null when the API call fails", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    } as unknown as Response);

    const result = await listWritableCalendars(MOCK_ACCESS_TOKEN);

    expect(result).toBeNull();
  });

  it("maps fields correctly from API response to GCalCalendarEntry", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockCalendarListResponse([
        {
          id: "test@gmail.com",
          summary: "Test Calendar",
          accessRole: "owner",
          primary: true,
          backgroundColor: "#039be5",
          foregroundColor: "#000000",
          description: "My test calendar",
        },
      ])
    );

    const result = await listWritableCalendars(MOCK_ACCESS_TOKEN);

    expect(result).toHaveLength(1);
    expect(result![0]).toEqual({
      id: "test@gmail.com",
      summary: "Test Calendar",
      primary: true,
      backgroundColor: "#039be5",
      accessRole: "owner",
    });
  });

  it("handles empty calendar list", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockCalendarListResponse([])
    );

    const result = await listWritableCalendars(MOCK_ACCESS_TOKEN);

    expect(result).not.toBeNull();
    expect(result).toHaveLength(0);
  });

  it("uses default values for missing optional fields", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockCalendarListResponse([
        {
          id: "minimal-cal",
          accessRole: "owner",
          // summary, primary, backgroundColor are missing
        },
      ])
    );

    const result = await listWritableCalendars(MOCK_ACCESS_TOKEN);

    expect(result).toHaveLength(1);
    expect(result![0].summary).toBe("(No name)");
    expect(result![0].primary).toBe(false);
    expect(result![0].backgroundColor).toBe("#4285f4");
  });

  it("calls the correct Google Calendar API endpoint", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockCalendarListResponse([])
    );

    await listWritableCalendars(MOCK_ACCESS_TOKEN);

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
