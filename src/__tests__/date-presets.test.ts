/**
 * Tests for the date picker's quick-select presets.
 * Time is frozen per case so weekday-relative presets are deterministic.
 */

import { describe, it, expect } from "vitest";
import { getDatePresets } from "@/lib/date-presets";

/** Reads one preset's resolved date by label. */
function dateFor(now: Date, label: string): string {
  const preset = getDatePresets(now).find((p) => p.label === label);
  if (!preset) throw new Error(`No preset labelled ${label}`);
  return preset.date;
}

describe("getDatePresets", () => {
  it("returns the four presets in display order", () => {
    expect(getDatePresets(new Date(2026, 7, 31)).map((p) => p.label)).toEqual([
      "Today",
      "Tomorrow",
      "This weekend",
      "Next week",
    ]);
  });

  it("resolves Today and Tomorrow", () => {
    const now = new Date(2026, 7, 31, 14, 30); // Mon Aug 31 2026, mid-afternoon
    expect(dateFor(now, "Today")).toBe("2026-08-31");
    expect(dateFor(now, "Tomorrow")).toBe("2026-09-01");
  });

  it("ignores the time of day", () => {
    // 11:59pm must still resolve Today to that same calendar day.
    expect(dateFor(new Date(2026, 7, 31, 23, 59), "Today")).toBe("2026-08-31");
  });

  it("crosses a month boundary", () => {
    expect(dateFor(new Date(2026, 7, 31), "Tomorrow")).toBe("2026-09-01");
  });

  it("crosses a year boundary", () => {
    expect(dateFor(new Date(2026, 11, 31), "Tomorrow")).toBe("2027-01-01");
  });

  it("points This weekend at the coming Saturday", () => {
    // Mon Aug 31 2026 -> Sat Sep 5.
    expect(dateFor(new Date(2026, 7, 31), "This weekend")).toBe("2026-09-05");
  });

  it("points This weekend at tomorrow when today is Friday", () => {
    const friday = new Date(2026, 8, 4);
    expect(friday.getDay()).toBe(5);
    expect(dateFor(friday, "This weekend")).toBe("2026-09-05");
    expect(dateFor(friday, "Tomorrow")).toBe("2026-09-05");
  });

  it("skips to the following Saturday when today is Saturday", () => {
    // A preset that resolves to the day already shown would be a no-op tap.
    const saturday = new Date(2026, 8, 5);
    expect(saturday.getDay()).toBe(6);
    expect(dateFor(saturday, "This weekend")).toBe("2026-09-12");
  });

  it("points Next week at the coming Monday", () => {
    // Tue Sep 1 2026 -> Mon Sep 7.
    expect(dateFor(new Date(2026, 8, 1), "Next week")).toBe("2026-09-07");
  });

  it("skips a full week when today is Monday", () => {
    const monday = new Date(2026, 7, 31);
    expect(monday.getDay()).toBe(1);
    expect(dateFor(monday, "Next week")).toBe("2026-09-07");
  });

  it("resolves Next week from a Sunday to the very next day", () => {
    const sunday = new Date(2026, 8, 6);
    expect(sunday.getDay()).toBe(0);
    expect(dateFor(sunday, "Next week")).toBe("2026-09-07");
  });

  it("never resolves a preset into the past", () => {
    for (let i = 0; i < 14; i++) {
      const now = new Date(2026, 7, 24 + i);
      for (const p of getDatePresets(now)) {
        expect(p.date >= dateFor(now, "Today")).toBe(true);
      }
    }
  });

  it("defaults to the current date when called with no argument", () => {
    const presets = getDatePresets();
    expect(presets[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
