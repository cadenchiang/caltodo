/**
 * Tests for iCal feed generation utilities in ical.ts.
 * Validates RFC 5545 escaping, line folding, date formatting,
 * VCALENDAR structure, CRLF endings, and task filtering.
 */

import { describe, it, expect } from "vitest";
import { escapeICalText, foldLine, formatICalDate, generateICalFeed } from "@/lib/ical";
import type { Task } from "@/lib/types";

/**
 * Creates a minimal Task object for testing.
 *
 * @param overrides - Partial Task fields to override defaults
 * @returns A complete Task object
 */
function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "test-uuid-1234",
    user_id: "user-uuid",
    title: "Test Assignment",
    description: "",
    due_date: "2026-02-15",
    is_completed: false,
    color: "#EF4444",
    created_at: "2026-02-10T00:00:00Z",
    updated_at: "2026-02-10T00:00:00Z",
    source: null,
    external_id: null,
    course_name: null,
    source_url: null,
    points_possible: null,
    is_submitted: false,
    ...overrides,
  };
}

describe("escapeICalText", () => {
  it("should escape backslashes", () => {
    expect(escapeICalText("path\\to\\file")).toBe("path\\\\to\\\\file");
  });

  it("should escape semicolons", () => {
    expect(escapeICalText("item1;item2")).toBe("item1\\;item2");
  });

  it("should escape commas", () => {
    expect(escapeICalText("one, two, three")).toBe("one\\, two\\, three");
  });

  it("should escape newlines", () => {
    expect(escapeICalText("line1\nline2")).toBe("line1\\nline2");
  });

  it("should escape Windows-style newlines", () => {
    expect(escapeICalText("line1\r\nline2")).toBe("line1\\nline2");
  });

  it("should handle combined special characters", () => {
    expect(escapeICalText("a\\b;c,d\ne")).toBe("a\\\\b\\;c\\,d\\ne");
  });

  it("should return empty string for empty input", () => {
    expect(escapeICalText("")).toBe("");
  });

  it("should leave plain text unchanged", () => {
    expect(escapeICalText("Hello World")).toBe("Hello World");
  });
});

describe("foldLine", () => {
  it("should not fold lines under 75 octets", () => {
    const short = "SUMMARY:Short text";
    expect(foldLine(short)).toBe(short);
  });

  it("should fold lines exceeding 75 octets", () => {
    const long = "DESCRIPTION:" + "x".repeat(80);
    const folded = foldLine(long);
    const lines = folded.split("\r\n");
    expect(lines.length).toBeGreaterThan(1);
    // Continuation lines must start with space
    for (let i = 1; i < lines.length; i++) {
      expect(lines[i][0]).toBe(" ");
    }
  });

  it("should keep first line at most 75 octets", () => {
    const long = "SUMMARY:" + "a".repeat(100);
    const folded = foldLine(long);
    const firstLine = folded.split("\r\n")[0];
    expect(Buffer.byteLength(firstLine, "utf-8")).toBeLessThanOrEqual(75);
  });

  it("should keep continuation lines at most 75 octets (including leading space)", () => {
    const long = "DESCRIPTION:" + "b".repeat(200);
    const folded = foldLine(long);
    const lines = folded.split("\r\n");
    for (const line of lines) {
      expect(Buffer.byteLength(line, "utf-8")).toBeLessThanOrEqual(75);
    }
  });
});

describe("formatICalDate", () => {
  it("should convert YYYY-MM-DD to YYYYMMDD", () => {
    expect(formatICalDate("2026-02-15")).toBe("20260215");
  });

  it("should handle single-digit months and days", () => {
    expect(formatICalDate("2026-01-05")).toBe("20260105");
  });

  it("should handle year boundary dates", () => {
    expect(formatICalDate("2025-12-31")).toBe("20251231");
  });
});

describe("generateICalFeed", () => {
  it("should produce valid VCALENDAR wrapper", () => {
    const feed = generateICalFeed([]);
    expect(feed).toContain("BEGIN:VCALENDAR");
    expect(feed).toContain("END:VCALENDAR");
    expect(feed).toContain("VERSION:2.0");
    expect(feed).toContain("METHOD:PUBLISH");
  });

  it("should use CRLF line endings throughout", () => {
    const feed = generateICalFeed([makeTask()]);
    // Split on CRLF and check there are no bare LFs
    const withoutCRLF = feed.replace(/\r\n/g, "");
    expect(withoutCRLF).not.toContain("\n");
    expect(withoutCRLF).not.toContain("\r");
  });

  it("should create a VEVENT for a task with due_date", () => {
    const feed = generateICalFeed([makeTask()]);
    expect(feed).toContain("BEGIN:VEVENT");
    expect(feed).toContain("END:VEVENT");
    expect(feed).toContain("DTSTART;VALUE=DATE:20260215");
    expect(feed).toContain("DTEND;VALUE=DATE:20260215");
  });

  it("should skip tasks without due_date", () => {
    const taskNoDue = makeTask({ due_date: null });
    const feed = generateICalFeed([taskNoDue]);
    expect(feed).not.toContain("BEGIN:VEVENT");
    expect(feed).not.toContain("END:VEVENT");
  });

  it("should include course_name in SUMMARY when present", () => {
    const task = makeTask({
      course_name: "CS 61A",
      title: "Homework 1",
    });
    const feed = generateICalFeed([task]);
    expect(feed).toContain("[CS 61A] Homework 1");
  });

  it("should use plain title as SUMMARY when no course_name", () => {
    const task = makeTask({ course_name: null, title: "My Task" });
    const feed = generateICalFeed([task]);
    expect(feed).toContain("SUMMARY:My Task");
  });

  it("should include source_url in DESCRIPTION when present", () => {
    const task = makeTask({ source_url: "https://example.com/hw1" });
    const feed = generateICalFeed([task]);
    expect(feed).toContain("Link: https://example.com/hw1");
  });

  it("should include points_possible in DESCRIPTION when present", () => {
    const task = makeTask({ points_possible: 100 });
    const feed = generateICalFeed([task]);
    expect(feed).toContain("Points: 100");
  });

  it("should include completion status in DESCRIPTION", () => {
    const pending = generateICalFeed([makeTask({ is_completed: false })]);
    expect(pending).toContain("Status: Pending");

    const completed = generateICalFeed([makeTask({ is_completed: true })]);
    expect(completed).toContain("Status: Completed");
  });

  it("should include CATEGORIES for sourced tasks", () => {
    const canvasTask = makeTask({ source: "canvas" });
    const feed = generateICalFeed([canvasTask]);
    expect(feed).toContain("CATEGORIES:canvas");
  });

  it("should set UID using task id", () => {
    const task = makeTask({ id: "abc-123" });
    const feed = generateICalFeed([task]);
    expect(feed).toContain("UID:abc-123@toodoocal");
  });

  it("should set TRANSP to TRANSPARENT for all events", () => {
    const feed = generateICalFeed([makeTask()]);
    expect(feed).toContain("TRANSP:TRANSPARENT");
  });

  it("should accept custom calendar name", () => {
    const feed = generateICalFeed([], "My Cal");
    expect(feed).toContain("X-WR-CALNAME:My Cal");
    expect(feed).toContain("PRODID:-//My Cal//EN");
  });

  it("should handle multiple tasks", () => {
    const tasks = [
      makeTask({ id: "task-1", title: "Task 1", due_date: "2026-03-01" }),
      makeTask({ id: "task-2", title: "Task 2", due_date: "2026-03-02" }),
      makeTask({ id: "task-3", title: "Task 3", due_date: null }),
    ];
    const feed = generateICalFeed(tasks);
    // Two VEVENTs (third has no due_date)
    const eventCount = (feed.match(/BEGIN:VEVENT/g) || []).length;
    expect(eventCount).toBe(2);
  });
});
