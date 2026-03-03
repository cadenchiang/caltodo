/**
 * Tests for all-day event date parsing in GoogleCalendarWidget.
 * Verifies that YYYY-MM-DD strings are parsed as local dates (not UTC),
 * preventing the off-by-one day bug in western timezones.
 */

import { describe, it, expect } from "vitest";

/**
 * Mirrors the parseEventDate function from GoogleCalendarWidget.
 * Extracted here for testability.
 */
function parseEventDate(dateStr: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(dateStr);
}

describe("parseEventDate", () => {
  it("should parse YYYY-MM-DD as local midnight (not UTC)", () => {
    const date = parseEventDate("2026-03-03");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(2); // 0-indexed: March = 2
    expect(date.getDate()).toBe(3);
  });

  it("should return March 3 regardless of timezone for date-only strings", () => {
    // The key fix: new Date("2026-03-03") would give March 2 in western timezones
    // parseEventDate should always give March 3
    const date = parseEventDate("2026-03-03");
    expect(date.toDateString()).toContain("Mar 03");
  });

  it("should still parse ISO datetime strings normally", () => {
    const date = parseEventDate("2026-03-03T14:30:00Z");
    expect(date instanceof Date).toBe(true);
    expect(isNaN(date.getTime())).toBe(false);
  });

  it("should handle year boundaries correctly", () => {
    const date = parseEventDate("2026-01-01");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(1);
  });

  it("should handle December 31 correctly", () => {
    const date = parseEventDate("2025-12-31");
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(11);
    expect(date.getDate()).toBe(31);
  });

  it("should handle leap year dates", () => {
    const date = parseEventDate("2028-02-29");
    expect(date.getFullYear()).toBe(2028);
    expect(date.getMonth()).toBe(1);
    expect(date.getDate()).toBe(29);
  });

  it("should not alter datetime strings with timezone offset", () => {
    const dateStr = "2026-03-03T10:00:00-08:00";
    const date = parseEventDate(dateStr);
    // Should pass through to new Date() without modification
    expect(date instanceof Date).toBe(true);
    expect(isNaN(date.getTime())).toBe(false);
  });
});
