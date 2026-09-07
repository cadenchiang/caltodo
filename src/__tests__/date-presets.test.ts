/**
 * Tests for the date picker's quick-select presets.
 * Time is frozen per case so the resolved dates are deterministic.
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
  it("returns the two presets in display order", () => {
    expect(getDatePresets(new Date(2026, 7, 31)).map((p) => p.label)).toEqual([
      "Today",
      "Tomorrow",
    ]);
  });

  it("no longer offers the weekday-relative presets", () => {
    const labels = getDatePresets(new Date(2026, 7, 31)).map((p) => p.label);
    expect(labels).not.toContain("This weekend");
    expect(labels).not.toContain("Next week");
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
