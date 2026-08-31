/**
 * Tests for the detail panel's due-date label.
 * The panel sits beside the task list, so near dates must read the same way
 * there as they do in the list.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getDetailDateInfo } from "@/lib/task-utils";

/** Fixed "now" so relative labels are deterministic: Mon Aug 31 2026, 9am. */
const NOW = new Date(2026, 7, 31, 9, 0, 0);

/** Formats a date offset from NOW as the YYYY-MM-DD the helper expects. */
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

describe("getDetailDateInfo", () => {
  it("returns null without a due date", () => {
    expect(getDetailDateInfo(null, null, false)).toBeNull();
    expect(getDetailDateInfo(null, "17:00", false)).toBeNull();
  });

  it("says Today rather than the full date", () => {
    const info = getDetailDateInfo(isoOffset(0), null, false);
    expect(info?.dateLabel).toBe("Today");
  });

  it("says Tomorrow rather than the full date", () => {
    expect(getDetailDateInfo(isoOffset(1), null, false)?.dateLabel).toBe("Tomorrow");
  });

  it("counts the days within a week, matching the list", () => {
    expect(getDetailDateInfo(isoOffset(3), null, false)?.dateLabel).toBe("In 3 days");
    expect(getDetailDateInfo(isoOffset(7), null, false)?.dateLabel).toBe("In 7 days");
  });

  it("keeps the long form past a week", () => {
    // Eight days on is Tue Sep 8 2026.
    expect(getDetailDateInfo(isoOffset(8), null, false)?.dateLabel).toBe("Tue, Sep 8, 2026");
  });

  it("keeps the long form well into the future", () => {
    expect(getDetailDateInfo("2026-12-25", null, false)?.dateLabel).toBe("Fri, Dec 25, 2026");
  });

  it("reports overdue with a day count", () => {
    expect(getDetailDateInfo(isoOffset(-1), null, false)?.dateLabel).toBe("Overdue 1 day");
    expect(getDetailDateInfo(isoOffset(-3), null, false)?.dateLabel).toBe("Overdue 3 days");
  });

  it("drops the clock time on an overdue task", () => {
    expect(getDetailDateInfo(isoOffset(-1), "17:00", false)?.timeLabel).toBeNull();
  });

  it("keeps the clock time on a task still due", () => {
    expect(getDetailDateInfo(isoOffset(0), "17:00", false)?.timeLabel).toBe("5:00 PM");
  });

  it("shows no time when the task has none", () => {
    // All-day synced assignments store no due_time; the pill must not invent one.
    expect(getDetailDateInfo(isoOffset(0), null, false)?.timeLabel).toBeNull();
  });

  it("never calls a completed task overdue", () => {
    const info = getDetailDateInfo(isoOffset(-5), null, true);
    expect(info?.dateLabel).not.toContain("Overdue");
    expect(info?.dateLabel).toBe("Wed, Aug 26, 2026");
  });

  it("mutes the colour for a completed task", () => {
    expect(getDetailDateInfo(isoOffset(0), null, true)?.className).toBe("text-muted-foreground");
  });

  it("pairs a relative label with the calendar date", () => {
    // "In 3 days" says how much runway is left; the date says which day to
    // put in a calendar. The wide panel has room for both.
    const info = getDetailDateInfo(isoOffset(3), null, false);
    expect(info?.dateLabel).toBe("In 3 days");
    expect(info?.exactDate).toBe("Thu, Sep 3, 2026");
  });

  it("pairs Today and Tomorrow with the date too", () => {
    expect(getDetailDateInfo(isoOffset(0), null, false)?.exactDate).toBe("Mon, Aug 31, 2026");
    expect(getDetailDateInfo(isoOffset(1), null, false)?.exactDate).toBe("Tue, Sep 1, 2026");
  });

  it("pairs an overdue label with the date it was due", () => {
    expect(getDetailDateInfo(isoOffset(-1), null, false)?.exactDate).toBe("Sun, Aug 30, 2026");
  });

  it("omits the extra date when the label already is the date", () => {
    // Otherwise the pill would read "Tue, Sep 8, 2026 Tue, Sep 8, 2026".
    expect(getDetailDateInfo(isoOffset(8), null, false)?.exactDate).toBeNull();
    expect(getDetailDateInfo("2026-12-25", null, false)?.exactDate).toBeNull();
  });

  it("colours an overdue task red and a due one blue", () => {
    expect(getDetailDateInfo(isoOffset(-1), null, false)?.className).toContain("red");
    expect(getDetailDateInfo(isoOffset(0), null, false)?.className).toContain("blue");
  });
});
