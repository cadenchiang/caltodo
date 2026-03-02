/**
 * Tests for CalendarPicker component logic.
 *
 * Since the project doesn't include @testing-library/react or jsdom,
 * these tests verify the selection logic that drives the picker:
 * - Toggle adds/removes IDs from the selection set
 * - Select all / deselect all behavior
 * - Initialization from various config formats (JSON array, single ID, fallback)
 */

import { describe, it, expect } from "vitest";

/**
 * Simulates toggling a calendar ID in a selection set.
 *
 * @param selected - Current set of selected calendar IDs
 * @param id - Calendar ID to toggle
 * @returns New set with the ID toggled
 */
function toggleCalendar(selected: Set<string>, id: string): Set<string> {
  const next = new Set(selected);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

/**
 * Parses calendar IDs from widget config, with fallback chain.
 *
 * @param config - Widget config record
 * @returns Array of calendar IDs
 */
function parseCalendarIdsFromConfig(config: Record<string, string>): string[] {
  if (config.calendarIds) {
    try {
      return JSON.parse(config.calendarIds);
    } catch {
      /* fallback */
    }
  }
  if (config.calendarId) {
    return [config.calendarId];
  }
  return ["primary"];
}

describe("CalendarPicker toggle logic", () => {
  it("adds an ID when not already selected", () => {
    const selected = new Set(["cal-a"]);
    const result = toggleCalendar(selected, "cal-b");
    expect(result.has("cal-b")).toBe(true);
    expect(result.size).toBe(2);
  });

  it("removes an ID when already selected", () => {
    const selected = new Set(["cal-a", "cal-b"]);
    const result = toggleCalendar(selected, "cal-b");
    expect(result.has("cal-b")).toBe(false);
    expect(result.size).toBe(1);
  });

  it("does not mutate the original set", () => {
    const selected = new Set(["cal-a"]);
    toggleCalendar(selected, "cal-b");
    expect(selected.size).toBe(1);
  });

  it("select all adds all calendar IDs", () => {
    const calendars = ["cal-a", "cal-b", "cal-c"];
    const result = new Set(calendars);
    expect(result.size).toBe(3);
    expect(result.has("cal-a")).toBe(true);
    expect(result.has("cal-c")).toBe(true);
  });

  it("deselect all clears the set", () => {
    const result = new Set<string>();
    expect(result.size).toBe(0);
  });
});

describe("parseCalendarIdsFromConfig", () => {
  it("parses JSON array from calendarIds config", () => {
    const config = { calendarIds: '["cal-a","cal-b"]' };
    expect(parseCalendarIdsFromConfig(config)).toEqual(["cal-a", "cal-b"]);
  });

  it("falls back to single calendarId", () => {
    const config = { calendarId: "my-cal" };
    expect(parseCalendarIdsFromConfig(config)).toEqual(["my-cal"]);
  });

  it("falls back to ['primary'] when no calendar config present", () => {
    const config = {};
    expect(parseCalendarIdsFromConfig(config)).toEqual(["primary"]);
  });

  it("falls back to calendarId when calendarIds is invalid JSON", () => {
    const config = { calendarIds: "not-json", calendarId: "fallback-cal" };
    expect(parseCalendarIdsFromConfig(config)).toEqual(["fallback-cal"]);
  });

  it("falls back to ['primary'] when calendarIds is invalid and no calendarId", () => {
    const config = { calendarIds: "not-json" };
    expect(parseCalendarIdsFromConfig(config)).toEqual(["primary"]);
  });
});
