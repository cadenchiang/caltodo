/**
 * Tests for the shared relative-date helpers and DueDatePill.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { getDueDateInfo, getRelativeDateLabel, getUrgencyClass } from "@/lib/task-utils";

const NOW = new Date(2026, 8, 23, 15, 30); // Wed Sep 23 2026, mid-afternoon

describe("getRelativeDateLabel", () => {
  it("labels today, tomorrow, and the week ahead as distances", () => {
    expect(getRelativeDateLabel("2026-09-23", NOW)).toEqual({ label: "Today", diffDays: 0, urgency: "soon" });
    expect(getRelativeDateLabel("2026-09-24", NOW)).toEqual({ label: "Tomorrow", diffDays: 1, urgency: "soon" });
    expect(getRelativeDateLabel("2026-09-26", NOW)).toEqual({ label: "In 3 days", diffDays: 3, urgency: "soon" });
    expect(getRelativeDateLabel("2026-09-30", NOW).label).toBe("In 7 days");
  });

  it("labels anything past a week as a calendar date", () => {
    expect(getRelativeDateLabel("2026-10-01", NOW)).toEqual({ label: "Oct 1", diffDays: 8, urgency: "later" });
  });

  it("counts overdue days with singular and plural forms", () => {
    expect(getRelativeDateLabel("2026-09-22", NOW)).toEqual({ label: "Overdue 1 day", diffDays: -1, urgency: "overdue" });
    expect(getRelativeDateLabel("2026-09-20", NOW).label).toBe("Overdue 3 days");
  });

  it("ignores the time of day of the reference date", () => {
    const lateNight = new Date(2026, 8, 23, 23, 59);
    expect(getRelativeDateLabel("2026-09-24", lateNight).label).toBe("Tomorrow");
  });
});

describe("getUrgencyClass", () => {
  it("uses 600 in light and 400 in dark so chips pass 4.5:1", () => {
    expect(getUrgencyClass("overdue")).toBe("text-red-600 dark:text-red-400");
    expect(getUrgencyClass("soon")).toBe("text-blue-600 dark:text-blue-400");
    expect(getUrgencyClass("later")).toBe("text-subtle-foreground");
  });

  it("mutes completed tasks regardless of urgency", () => {
    expect(getUrgencyClass("overdue", true)).toBe("text-muted-foreground");
  });
});

describe("getDueDateInfo stays label-compatible", () => {
  it("produces the same wording as getRelativeDateLabel", () => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    expect(getDueDateInfo(iso, "09:00")).toEqual({ dateLabel: "Today", timeLabel: "9:00 AM", className: "text-blue-600 dark:text-blue-400" });
  });
});

describe("DueDatePill", () => {
  const src = readFileSync(path.resolve(__dirname, "../components/ui/DueDatePill.tsx"), "utf8");

  it("uses the shared helpers and the caption text step", () => {
    expect(src).toContain("getRelativeDateLabel(dueDate, now)");
    expect(src).toContain("getUrgencyClass(urgency, isCompleted)");
    expect(src).toContain("text-2xs");
  });

  it("drops the time on overdue tasks and marks up the date semantically", () => {
    expect(src).toContain('dueTime && urgency !== "overdue"');
    expect(src).toContain("<time dateTime={dueDate}>");
  });
});
