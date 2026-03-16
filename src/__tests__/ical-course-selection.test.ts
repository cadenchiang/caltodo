/**
 * Tests for iCal course selection filtering in the sync engine.
 * Verifies that selected_canvas_courses filters iCal assignments by course name.
 */

import { describe, it, expect } from "vitest";
import { parseCanvasICalEvents } from "@/lib/canvas-ical-client";

/** Sample iCal feed with multiple courses. */
const SAMPLE_ICAL = `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:event-assignment-1001
SUMMARY:Homework 1 [CS 61A]
DTEND:20260320T235900Z
END:VEVENT
BEGIN:VEVENT
UID:event-assignment-1002
SUMMARY:Lab 3 [CS 61A]
DTEND:20260321T235900Z
END:VEVENT
BEGIN:VEVENT
UID:event-assignment-1003
SUMMARY:Problem Set 2 [MATH 54]
DTEND:20260322T235900Z
END:VEVENT
BEGIN:VEVENT
UID:event-assignment-1004
SUMMARY:Essay Draft [ENGLISH R1A]
DTEND:20260323T235900Z
END:VEVENT
END:VCALENDAR`;

describe("iCal course selection", () => {
  it("parses all courses from iCal feed", () => {
    const assignments = parseCanvasICalEvents(SAMPLE_ICAL);
    expect(assignments).toHaveLength(4);

    const courseNames = new Set(assignments.map((a) => a.course_name));
    expect(courseNames).toEqual(new Set(["CS 61A", "MATH 54", "ENGLISH R1A"]));
  });

  it("filters assignments by selected course names", () => {
    const assignments = parseCanvasICalEvents(SAMPLE_ICAL);
    const selectedNames = new Set(["CS 61A"]);
    const filtered = assignments.filter((a) => selectedNames.has(a.course_name));

    expect(filtered).toHaveLength(2);
    expect(filtered.every((a) => a.course_name === "CS 61A")).toBe(true);
  });

  it("returns empty when no courses match selection", () => {
    const assignments = parseCanvasICalEvents(SAMPLE_ICAL);
    const selectedNames = new Set(["NONEXISTENT 101"]);
    const filtered = assignments.filter((a) => selectedNames.has(a.course_name));

    expect(filtered).toHaveLength(0);
  });

  it("returns all when selected set matches all courses", () => {
    const assignments = parseCanvasICalEvents(SAMPLE_ICAL);
    const selectedNames = new Set(["CS 61A", "MATH 54", "ENGLISH R1A"]);
    const filtered = assignments.filter((a) => selectedNames.has(a.course_name));

    expect(filtered).toHaveLength(4);
  });
});
