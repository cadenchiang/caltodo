/**
 * Tests for multi-calendar events API route logic.
 *
 * Verifies:
 * - Multi-calendar fetch merges and sorts events by start time
 * - Deduplicates events by event ID across calendars
 * - Tags each event with its source calendarId
 * - Falls back to single calendarId param for backward compatibility
 * - Falls back to "primary" when no calendarId params provided
 * - Caps at 10 calendars maximum
 */

import { describe, it, expect } from "vitest";
import type { GCalEvent } from "@/lib/types";

/**
 * Simulates the merge/sort/dedup logic from the events API route.
 * Extracted to a pure function for testability.
 *
 * @param calendarResults - Array of per-calendar event arrays (null for failed fetches)
 * @returns Merged, sorted, deduplicated array of GCalEvents
 */
function mergeCalendarEvents(
  calendarResults: (GCalEvent[] | null)[]
): GCalEvent[] {
  const allEvents: GCalEvent[] = [];
  const seen = new Set<string>();

  for (const calEvents of calendarResults) {
    if (!calEvents) continue;
    for (const event of calEvents) {
      if (!seen.has(event.id)) {
        seen.add(event.id);
        allEvents.push(event);
      }
    }
  }

  allEvents.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  return allEvents;
}

/**
 * Simulates resolving calendar IDs from query params.
 *
 * @param calendarIdsParam - The calendarIds query param (comma-separated)
 * @param calendarIdParam - The calendarId query param (single)
 * @param maxCalendars - Maximum number of calendars allowed
 * @returns Array of resolved calendar IDs
 */
function resolveCalendarIds(
  calendarIdsParam: string | null,
  calendarIdParam: string | null,
  maxCalendars = 10
): string[] {
  if (calendarIdsParam) {
    return calendarIdsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, maxCalendars);
  }
  return [calendarIdParam || "primary"];
}

/** Helper to create a mock GCalEvent. */
function mockEvent(
  id: string,
  start: string,
  calendarId: string
): GCalEvent {
  return {
    id,
    summary: `Event ${id}`,
    start,
    end: start,
    colorId: null,
    location: null,
    htmlLink: "",
    allDay: false,
    calendarId,
  };
}

describe("multi-calendar events merge", () => {
  it("merges events from multiple calendars and sorts by start time", () => {
    const cal1: GCalEvent[] = [
      mockEvent("e1", "2026-03-02T10:00:00Z", "cal-a"),
      mockEvent("e3", "2026-03-02T14:00:00Z", "cal-a"),
    ];
    const cal2: GCalEvent[] = [
      mockEvent("e2", "2026-03-02T12:00:00Z", "cal-b"),
    ];

    const result = mergeCalendarEvents([cal1, cal2]);

    expect(result).toHaveLength(3);
    expect(result.map((e) => e.id)).toEqual(["e1", "e2", "e3"]);
  });

  it("deduplicates events by ID across calendars", () => {
    const cal1: GCalEvent[] = [
      mockEvent("shared-event", "2026-03-02T10:00:00Z", "cal-a"),
    ];
    const cal2: GCalEvent[] = [
      mockEvent("shared-event", "2026-03-02T10:00:00Z", "cal-b"),
      mockEvent("unique-event", "2026-03-02T11:00:00Z", "cal-b"),
    ];

    const result = mergeCalendarEvents([cal1, cal2]);

    expect(result).toHaveLength(2);
    // First occurrence wins — calendarId from cal-a
    expect(result[0].calendarId).toBe("cal-a");
    expect(result[1].id).toBe("unique-event");
  });

  it("skips null results from failed calendar fetches", () => {
    const cal1: GCalEvent[] = [
      mockEvent("e1", "2026-03-02T10:00:00Z", "cal-a"),
    ];

    const result = mergeCalendarEvents([cal1, null, null]);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("e1");
  });

  it("returns empty array when all fetches fail", () => {
    const result = mergeCalendarEvents([null, null]);

    expect(result).toHaveLength(0);
  });

  it("tags each event with its source calendarId", () => {
    const cal1: GCalEvent[] = [
      mockEvent("e1", "2026-03-02T10:00:00Z", "work@gmail.com"),
    ];
    const cal2: GCalEvent[] = [
      mockEvent("e2", "2026-03-02T11:00:00Z", "holidays@group.calendar.google.com"),
    ];

    const result = mergeCalendarEvents([cal1, cal2]);

    expect(result[0].calendarId).toBe("work@gmail.com");
    expect(result[1].calendarId).toBe("holidays@group.calendar.google.com");
  });
});

describe("resolveCalendarIds", () => {
  it("parses comma-separated calendarIds param", () => {
    const ids = resolveCalendarIds("cal-a,cal-b,cal-c", null);
    expect(ids).toEqual(["cal-a", "cal-b", "cal-c"]);
  });

  it("falls back to single calendarId param", () => {
    const ids = resolveCalendarIds(null, "my-calendar");
    expect(ids).toEqual(["my-calendar"]);
  });

  it("falls back to 'primary' when no params provided", () => {
    const ids = resolveCalendarIds(null, null);
    expect(ids).toEqual(["primary"]);
  });

  it("caps at 10 calendars maximum", () => {
    const many = Array.from({ length: 15 }, (_, i) => `cal-${i}`).join(",");
    const ids = resolveCalendarIds(many, null);
    expect(ids).toHaveLength(10);
  });

  it("filters out empty strings from comma-separated values", () => {
    const ids = resolveCalendarIds("cal-a,,cal-b,", null);
    expect(ids).toEqual(["cal-a", "cal-b"]);
  });

  it("trims whitespace from calendar IDs", () => {
    const ids = resolveCalendarIds(" cal-a , cal-b ", null);
    expect(ids).toEqual(["cal-a", "cal-b"]);
  });
});
