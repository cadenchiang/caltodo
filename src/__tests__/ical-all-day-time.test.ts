/**
 * Regression tests for all-day assignments claiming a due time.
 *
 * Canvas exports most assignments as date-only VEVENTs. The parser anchors
 * those at noon UTC so the calendar day survives timezone conversion, but the
 * sync engine then read a clock time off that anchor, so every such
 * assignment showed "5:00 AM" to a Pacific user (12:00 UTC) and a different
 * wrong hour to everyone else.
 */

import { describe, it, expect } from "vitest";
import { isDateOnlyValue, parseDueDateWithTzid } from "@/lib/ical-date-utils";
import { parseCanvasICalEvents } from "@/lib/canvas-ical-client";
import { parseBrightspaceEvents } from "@/lib/brightspace-client";
import { toLocalDateString, toLocalTimeString } from "@/lib/sync-engine";

/** Builds a minimal Canvas VEVENT with the given DTSTART line. */
function canvasEvent(dtstartLine: string, extra = ""): string {
  return [
    "BEGIN:VCALENDAR",
    "BEGIN:VEVENT",
    "UID:event-assignment-9107040",
    dtstartLine,
    "SUMMARY:Week 2 Section - Time Value of Money\\, Sept 4 [UGBA 103-LEC-001 FA26]",
    extra,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

describe("isDateOnlyValue", () => {
  it("recognises the RFC 5545 date form", () => {
    expect(isDateOnlyValue("20260903")).toBe(true);
  });

  it("tolerates surrounding whitespace", () => {
    expect(isDateOnlyValue(" 20260903 ")).toBe(true);
  });

  it("rejects datetimes, empties, and nonsense", () => {
    for (const v of ["20260903T140000Z", "20260903T140000", "2026090", "", null, undefined]) {
      expect(isDateOnlyValue(v)).toBe(false);
    }
  });
});

describe("Canvas date-only assignments", () => {
  // The exact shape bCourses emits, doubled VALUE=DATE parameter and all.
  const DATE_ONLY = "DTSTART;VALUE=DATE;VALUE=DATE:20260903";

  it("flags a date-only event as all-day", () => {
    const [a] = parseCanvasICalEvents(canvasEvent(DATE_ONLY));
    expect(a.due_is_all_day).toBe(true);
  });

  it("keeps the calendar day the feed stated", () => {
    const [a] = parseCanvasICalEvents(canvasEvent(DATE_ONLY));
    expect(toLocalDateString(a.due_date, "America/Los_Angeles")).toBe("2026-09-03");
    expect(toLocalDateString(a.due_date, "America/New_York")).toBe("2026-09-03");
    expect(toLocalDateString(a.due_date, "Asia/Tokyo")).toBe("2026-09-03");
  });

  it("stores no time for it", () => {
    const [a] = parseCanvasICalEvents(canvasEvent(DATE_ONLY));
    const dueTime = a.due_is_all_day
      ? null
      : toLocalTimeString(a.due_date, "America/Los_Angeles");
    expect(dueTime).toBeNull();
  });

  it("would otherwise have shown 5:00 AM in Pacific", () => {
    // Pins the bug being fixed: the noon-UTC anchor really does read as 05:00
    // Pacific, so the flag is what prevents it, not luck in the anchor value.
    const [a] = parseCanvasICalEvents(canvasEvent(DATE_ONLY));
    expect(toLocalTimeString(a.due_date, "America/Los_Angeles")).toBe("05:00");
    expect(toLocalTimeString(a.due_date, "America/Chicago")).toBe("07:00");
  });

  it("leaves timed events alone", () => {
    const [a] = parseCanvasICalEvents(
      canvasEvent("DTSTART:20260828T140000Z", "DTEND:20260828T140000Z")
    );
    expect(a.due_is_all_day).toBe(false);
    expect(toLocalTimeString(a.due_date, "America/Chicago")).toBe("09:00");
    expect(toLocalDateString(a.due_date, "America/Chicago")).toBe("2026-08-28");
  });

  it("treats a date-only DTEND fallback as all-day too", () => {
    // DTEND is exclusive for all-day events, so the parser falls back to
    // DTSTART; that fallback value is still date-only.
    const [a] = parseCanvasICalEvents(
      canvasEvent("DTSTART;VALUE=DATE:20260903", "DTEND;VALUE=DATE:20260904")
    );
    expect(a.due_is_all_day).toBe(true);
    expect(toLocalDateString(a.due_date, "America/Los_Angeles")).toBe("2026-09-03");
  });
});

describe("Brightspace date-only assignments", () => {
  it("flags them the same way", () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "BEGIN:VEVENT",
      "UID:brightspace-1",
      "DTSTART;VALUE=DATE:20260903",
      "SUMMARY:Essay Draft",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const [a] = parseBrightspaceEvents(ics);
    expect(a.due_is_all_day).toBe(true);
  });
});

describe("parseDueDateWithTzid anchoring", () => {
  it("still anchors date-only values at noon UTC", () => {
    expect(parseDueDateWithTzid("20260903", null)).toBe("2026-09-03T12:00:00Z");
  });
});
