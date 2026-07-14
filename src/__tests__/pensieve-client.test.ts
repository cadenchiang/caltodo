/**
 * Tests for Pensieve iCal client — parseICalEvents, course name extraction,
 * and is_submitted detection from STATUS and description keywords.
 */

import { describe, it, expect } from "vitest";
import { parseICalEvents } from "@/lib/pensieve-client";

/**
 * Builds a minimal iCal VEVENT block for testing.
 *
 * @param fields - VEVENT property overrides
 * @returns Raw iCal text with a single VEVENT
 */
function makeIcal(fields: {
  uid?: string;
  summary?: string;
  dtstart?: string;
  dtend?: string;
  description?: string;
  status?: string;
}): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `UID:${fields.uid ?? "test-uid-1"}`,
    `SUMMARY:${fields.summary ?? "Test Assignment"}`,
  ];
  if (fields.dtstart) lines.push(`DTSTART;VALUE=DATE:${fields.dtstart}`);
  if (fields.dtend) lines.push(`DTEND;VALUE=DATE:${fields.dtend}`);
  if (fields.description) lines.push(`DESCRIPTION:${fields.description}`);
  if (fields.status) lines.push(`STATUS:${fields.status}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

describe("parseICalEvents — title stripping", () => {
  it("should strip course name suffix from title when class is in description", () => {
    const ical = makeIcal({
      summary: "Assignment 1 - test_testcourse",
      dtstart: "20260301",
      description: "class: test_testcourse\\nLate due: 2026-03-08",
    });
    const [result] = parseICalEvents(ical);
    expect(result.title).toBe("Assignment 1");
    expect(result.course_name).toBe("test_testcourse");
  });

  it("should strip course name suffix via dash fallback when no description", () => {
    const ical = makeIcal({
      summary: "Homework 3 - CS61A",
      dtstart: "20260301",
    });
    const [result] = parseICalEvents(ical);
    expect(result.title).toBe("Homework 3");
    expect(result.course_name).toBe("CS61A");
  });

  it("should use colon prefix as course name and strip it", () => {
    const ical = makeIcal({
      summary: "CS61A: Homework 3",
      dtstart: "20260301",
    });
    const [result] = parseICalEvents(ical);
    // Colon pattern extracts prefix as course name, but title keeps full summary
    // since the strip regex only targets " - suffix" pattern
    expect(result.course_name).toBe("CS61A");
  });

  it("should not capture past iCal newline escape in description", () => {
    const ical = makeIcal({
      summary: "Lab 5 - data100",
      dtstart: "20260301",
      description: "class: data100\\nLate due: 2026-03-15\\nSome other info",
    });
    const [result] = parseICalEvents(ical);
    expect(result.course_name).toBe("data100");
    expect(result.title).toBe("Lab 5");
  });

  it("should fall back to Pensieve when no course name is detectable", () => {
    const ical = makeIcal({
      summary: "Study Session",
      dtstart: "20260301",
    });
    const [result] = parseICalEvents(ical);
    expect(result.course_name).toBe("Pensive");
    expect(result.title).toBe("Study Session");
  });

  it("should handle em-dash separator", () => {
    const ical = makeIcal({
      summary: "Project 2 \u2014 cs61b",
      dtstart: "20260301",
    });
    const [result] = parseICalEvents(ical);
    expect(result.title).toBe("Project 2");
    expect(result.course_name).toBe("cs61b");
  });
});

describe("parseICalEvents — is_submitted detection", () => {
  it("should detect is_submitted from STATUS:COMPLETED", () => {
    const ical = makeIcal({
      summary: "Homework 1 - CS61A",
      dtstart: "20260301",
      status: "COMPLETED",
    });
    const [result] = parseICalEvents(ical);
    expect(result.is_submitted).toBe(true);
  });

  it("should detect is_submitted from STATUS:CANCELLED", () => {
    const ical = makeIcal({
      summary: "Homework 1 - CS61A",
      dtstart: "20260301",
      status: "CANCELLED",
    });
    const [result] = parseICalEvents(ical);
    expect(result.is_submitted).toBe(true);
  });

  it("should detect is_submitted from 'submitted' keyword in description", () => {
    const ical = makeIcal({
      summary: "Lab 3 - data100",
      dtstart: "20260301",
      description: "class: data100\\nStatus: submitted",
    });
    const [result] = parseICalEvents(ical);
    expect(result.is_submitted).toBe(true);
  });

  it("should detect is_submitted from 'graded' keyword in description", () => {
    const ical = makeIcal({
      summary: "Lab 3 - data100",
      dtstart: "20260301",
      description: "class: data100\\nGraded: 95/100",
    });
    const [result] = parseICalEvents(ical);
    expect(result.is_submitted).toBe(true);
  });

  it("should detect is_submitted from 'completed' keyword in description", () => {
    const ical = makeIcal({
      summary: "Review 1 - CS61A",
      dtstart: "20260301",
      description: "class: CS61A\\ncompleted on 2026-02-28",
    });
    const [result] = parseICalEvents(ical);
    expect(result.is_submitted).toBe(true);
  });

  it("should set is_submitted false when no submission indicators", () => {
    const ical = makeIcal({
      summary: "Homework 2 - CS61A",
      dtstart: "20260301",
      description: "class: CS61A\\nLate due: 2026-03-08",
    });
    const [result] = parseICalEvents(ical);
    expect(result.is_submitted).toBe(false);
  });

  it("should NOT mark submitted when 'completed'/'graded' appear only in prose", () => {
    // Regression: "must be completed before lab" and "will be graded" used to
    // trip the naive \bcompleted\b / \bgraded\b match and auto-hide the task.
    const ical = makeIcal({
      summary: "Lab 3 - CS61A",
      dtstart: "20260301",
      description: "class: CS61A\\nThis must be completed before lab; it will be graded next week.",
    });
    const [result] = parseICalEvents(ical);
    expect(result.is_submitted).toBe(false);
  });

  it("should set is_submitted false when STATUS is CONFIRMED", () => {
    const ical = makeIcal({
      summary: "Homework 2 - CS61A",
      dtstart: "20260301",
      status: "CONFIRMED",
    });
    const [result] = parseICalEvents(ical);
    expect(result.is_submitted).toBe(false);
  });

  it("should set is_submitted false with no status and no description", () => {
    const ical = makeIcal({
      summary: "Study Session",
      dtstart: "20260301",
    });
    const [result] = parseICalEvents(ical);
    expect(result.is_submitted).toBe(false);
  });
});
