import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { formatTime12h, getDueDateInfo, getSourceBadges } from "@/lib/task-utils";
import type { Task } from "@/lib/types";

describe("formatTime12h", () => {
  it("converts midnight to 12:00 AM", () => {
    expect(formatTime12h("00:00")).toBe("12:00 AM");
  });

  it("converts noon to 12:00 PM", () => {
    expect(formatTime12h("12:00")).toBe("12:00 PM");
  });

  it("converts morning time correctly", () => {
    expect(formatTime12h("09:30")).toBe("9:30 AM");
  });

  it("converts afternoon time correctly", () => {
    expect(formatTime12h("14:45")).toBe("2:45 PM");
  });

  it("converts 23:59 to 11:59 PM", () => {
    expect(formatTime12h("23:59")).toBe("11:59 PM");
  });

  it("converts 1:00 to 1:00 AM", () => {
    expect(formatTime12h("01:00")).toBe("1:00 AM");
  });

  it("converts 13:00 to 1:00 PM", () => {
    expect(formatTime12h("13:00")).toBe("1:00 PM");
  });
});

describe("getDueDateInfo", () => {
  beforeEach(() => {
    // Fix "today" to 2025-03-15 for deterministic tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-03-15T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null when dueDate is null", () => {
    expect(getDueDateInfo(null, null)).toBeNull();
  });

  it("returns 'Today' with blue class for today's date", () => {
    const result = getDueDateInfo("2025-03-15", null);
    expect(result).not.toBeNull();
    expect(result!.dateLabel).toBe("Today");
    expect(result!.className).toBe("text-blue-400");
    expect(result!.timeLabel).toBeNull();
  });

  it("returns 'Tomorrow' with blue class for tomorrow's date", () => {
    const result = getDueDateInfo("2025-03-16", null);
    expect(result).not.toBeNull();
    expect(result!.dateLabel).toBe("Tomorrow");
    expect(result!.className).toBe("text-blue-400");
  });

  it("returns red class for past dates", () => {
    const result = getDueDateInfo("2025-03-10", null);
    expect(result).not.toBeNull();
    expect(result!.className).toBe("text-red-400");
  });

  it("returns blue class for dates within 7 days", () => {
    const result = getDueDateInfo("2025-03-20", null);
    expect(result).not.toBeNull();
    expect(result!.className).toBe("text-blue-400");
  });

  it("returns subtle class for dates beyond 7 days", () => {
    const result = getDueDateInfo("2025-04-01", null);
    expect(result).not.toBeNull();
    expect(result!.className).toBe("text-subtle-foreground");
  });

  it("includes formatted time label when dueTime is provided", () => {
    const result = getDueDateInfo("2025-03-15", "14:30");
    expect(result).not.toBeNull();
    expect(result!.timeLabel).toBe("2:30 PM");
  });

  it("returns null timeLabel when dueTime is null", () => {
    const result = getDueDateInfo("2025-03-20", null);
    expect(result).not.toBeNull();
    expect(result!.timeLabel).toBeNull();
  });
});

describe("getSourceBadges", () => {
  /** Creates a minimal Task object for testing. */
  function makeTask(overrides: Partial<Task> = {}): Task {
    return {
      id: "test-1",
      user_id: "user-1",
      title: "Test task",
      description: "",
      due_date: null,
      due_time: null,
      is_completed: false,
      color: "#0e89d6",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
      source: null,
      external_id: null,
      course_name: null,
      source_url: null,
      points_possible: null,
      is_submitted: false,
      google_event_id: null,
      dismissed_at: null,
      repeat_interval: null,
      repeat_unit: null,
      repeat_end_date: null,
      repeat_end_count: null,
      late_due_date: null,
      completed_at: null,
      tags: [],
      snoozed_until: null,
      sort_order: null,
      due_date_manually_edited_at: null,
      due_time_manually_edited_at: null,
      ...overrides,
    };
  }

  it("returns empty array for task with no source", () => {
    expect(getSourceBadges(makeTask())).toEqual([]);
  });

  it("returns bCourses badge for canvas source", () => {
    const badges = getSourceBadges(makeTask({ source: "canvas" }));
    expect(badges).toHaveLength(1);
    expect(badges[0].label).toBe("bCourses");
  });

  it("returns Pensieve badge for pensieve source", () => {
    const badges = getSourceBadges(makeTask({ source: "pensieve" }));
    expect(badges).toHaveLength(1);
    expect(badges[0].label).toBe("Pensive");
  });

  it("returns Gradescope badge for gradescope source", () => {
    const badges = getSourceBadges(makeTask({ source: "gradescope" }));
    expect(badges).toHaveLength(1);
    expect(badges[0].label).toBe("Gradescope");
  });

  it("includes Submitted badge when is_submitted is true", () => {
    const badges = getSourceBadges(makeTask({ source: "canvas", is_submitted: true }));
    expect(badges).toHaveLength(2);
    expect(badges[1].label).toBe("Submitted");
  });

  it("includes late due badge when late_due_date is set", () => {
    const badges = getSourceBadges(makeTask({ late_due_date: "2025-04-10" }));
    expect(badges).toHaveLength(1);
    expect(badges[0].label).toContain("Late due");
  });
});

describe("getDueDateInfo relative wording", () => {
  /** Fixed "now": Mon Aug 31 2026, 9am. */
  const NOW = new Date(2026, 7, 31, 9, 0, 0);

  /** Formats a date offset from NOW as a YYYY-MM-DD string. */
  function isoOffset(days: number): string {
    const d = new Date(NOW);
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps Today and Tomorrow as words", () => {
    expect(getDueDateInfo(isoOffset(0), null)?.dateLabel).toBe("Today");
    expect(getDueDateInfo(isoOffset(1), null)?.dateLabel).toBe("Tomorrow");
  });

  it("counts days for the rest of the week", () => {
    expect(getDueDateInfo(isoOffset(2), null)?.dateLabel).toBe("In 2 days");
    expect(getDueDateInfo(isoOffset(3), null)?.dateLabel).toBe("In 3 days");
    expect(getDueDateInfo(isoOffset(7), null)?.dateLabel).toBe("In 7 days");
  });

  it("switches to a date past a week", () => {
    // The count stops being useful once it is long enough to need a calendar.
    expect(getDueDateInfo(isoOffset(8), null)?.dateLabel).toBe("Sep 8");
    expect(getDueDateInfo(isoOffset(30), null)?.dateLabel).toBe("Sep 30");
  });

  it("still counts overdue days in the other direction", () => {
    expect(getDueDateInfo(isoOffset(-1), null)?.dateLabel).toBe("Overdue 1 day");
    expect(getDueDateInfo(isoOffset(-4), null)?.dateLabel).toBe("Overdue 4 days");
  });

  it("keeps the time alongside a counted day", () => {
    expect(getDueDateInfo(isoOffset(3), "17:00")?.timeLabel).toBe("5:00 PM");
  });

  it("never says 'In 1 days'", () => {
    // The singular case is covered by Tomorrow, so the plural is always right.
    for (let d = 2; d <= 7; d++) {
      expect(getDueDateInfo(isoOffset(d), null)?.dateLabel).not.toContain("1 days");
    }
  });
});
