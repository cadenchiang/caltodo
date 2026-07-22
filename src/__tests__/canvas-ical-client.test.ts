/**
 * Tests for Canvas iCal client — verifies parsing of bCourses calendar feeds.
 */

import { describe, it, expect } from "vitest";
import { parseCanvasICalEvents } from "@/lib/canvas-ical-client";

const SAMPLE_ICAL = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20260209T233000Z
DTEND:20260209T233000Z
DTSTAMP:20260209T162800Z
UID:event-assignment-8999055
CLASS:PUBLIC
DESCRIPTION:
SEQUENCE:0
SUMMARY:Attendance-05 [UGBA 101A-LEC-002 SP26]
URL:https://bcourses.berkeley.edu/calendar?event_id=assignment_8999055
END:VEVENT
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260213
DTSTAMP:20260206T075900Z
UID:event-assignment-9000262
CLASS:PUBLIC
DESCRIPTION:
SEQUENCE:0
SUMMARY:Chapter 3 - POOL [UGBA 102A-LEC-001 & 002 SP26]
URL:https://bcourses.berkeley.edu/calendar?event_id=assignment_9000262
END:VEVENT
BEGIN:VEVENT
DTSTART:20260218T233000Z
DTEND:20260218T233000Z
DTSTAMP:20260223T004600Z
UID:event-assignment-9052680
CLASS:PUBLIC
DESCRIPTION:Download and follow the instructions in the assignment file.
SEQUENCE:0
SUMMARY:Assignment #2 - problem and opportunity [Founder Workshop]
URL:https://bcourses.berkeley.edu/calendar?event_id=assignment_9052680
END:VEVENT
BEGIN:VEVENT
DTSTART:20260227T010000Z
DTEND:20260227T010000Z
DTSTAMP:20260226T230000Z
UID:event-assignment-override-354070
CLASS:PUBLIC
DESCRIPTION:
SEQUENCE:0
SUMMARY:Midterm 1 [MELC 175-LEC-001]
URL:https://bcourses.berkeley.edu/calendar?event_id=assignment_9056628
END:VEVENT
END:VCALENDAR`;

describe("parseCanvasICalEvents", () => {
  const events = parseCanvasICalEvents(SAMPLE_ICAL);

  it("should parse all events", () => {
    expect(events).toHaveLength(4);
  });

  it("should extract title and course name from [brackets]", () => {
    expect(events[0].title).toBe("Attendance-05");
    expect(events[0].course_name).toBe("UGBA 101A-LEC-002 SP26");
  });

  it("should extract external_id from UID", () => {
    expect(events[0].external_id).toBe("8999055");
  });

  it("should handle override UIDs", () => {
    expect(events[3].external_id).toBe("354070");
  });

  it("should parse datetime due dates", () => {
    expect(events[0].due_date).toBe("2026-02-09T23:30:00Z");
  });

  it("should parse date-only due dates", () => {
    expect(events[1].due_date).toBe("2026-02-13T12:00:00Z");
  });

  it("should extract source URL", () => {
    expect(events[0].source_url).toContain("bcourses.berkeley.edu");
  });

  it("should extract description when present", () => {
    expect(events[2].description).toContain("Download and follow");
  });

  it("should set is_submitted to false (iCal has no status)", () => {
    events.forEach((e) => {
      expect(e.is_submitted).toBe(false);
    });
  });

  it("should set course_id to canvas-ical", () => {
    events.forEach((e) => {
      expect(e.course_id).toBe("canvas-ical");
    });
  });

  it("should return empty array for empty input", () => {
    expect(parseCanvasICalEvents("")).toEqual([]);
  });

  it("should skip events without UID or SUMMARY", () => {
    const bad = `BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART:20260209T233000Z
END:VEVENT
END:VCALENDAR`;
    expect(parseCanvasICalEvents(bad)).toEqual([]);
  });

  it("should convert TZID-qualified datetimes to UTC", () => {
    const ical = `BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART;TZID=America/Los_Angeles:20260320T235900
DTEND;TZID=America/Los_Angeles:20260320T235900
DTSTAMP:20260320T000000Z
UID:event-assignment-1234567
SUMMARY:Homework 5 [CS 61A SP26]
END:VEVENT
END:VCALENDAR`;
    const events = parseCanvasICalEvents(ical);
    expect(events).toHaveLength(1);
    // March 20, 2026 11:59 PM PDT = March 21, 2026 06:59 AM UTC (PDT is UTC-7)
    expect(events[0].due_date).toBe("2026-03-21T06:59:00Z");
  });

  it("should convert TZID=America/New_York datetimes to UTC", () => {
    const ical = `BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART;TZID=America/New_York:20260320T235900
DTEND;TZID=America/New_York:20260320T235900
DTSTAMP:20260320T000000Z
UID:event-assignment-7654321
SUMMARY:Essay 3 [ENGL 101]
END:VEVENT
END:VCALENDAR`;
    const events = parseCanvasICalEvents(ical);
    expect(events).toHaveLength(1);
    // March 20, 2026 11:59 PM EDT = March 21, 2026 03:59 AM UTC (EDT is UTC-4)
    expect(events[0].due_date).toBe("2026-03-21T03:59:00Z");
  });

  it("should still handle UTC Z-suffixed datetimes correctly", () => {
    const ical = `BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART:20260320T235900Z
DTEND:20260320T235900Z
DTSTAMP:20260320T000000Z
UID:event-assignment-1111111
SUMMARY:Quiz 1 [MATH 53]
END:VEVENT
END:VCALENDAR`;
    const events = parseCanvasICalEvents(ical);
    expect(events).toHaveLength(1);
    expect(events[0].due_date).toBe("2026-03-20T23:59:00Z");
  });
});
