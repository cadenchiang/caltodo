/**
 * Tests for the demo task dates (L11).
 * `toISOString()` renders the UTC day, which in the US evening is already
 * tomorrow, so "today" demo tasks landed a day late. Dates must be local.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { dateOffset, DEMO_TASKS } from "@/lib/demo-tasks";

afterEach(() => {
  vi.useRealTimers();
});

describe("dateOffset", () => {
  it("renders the local calendar day, not the UTC one", () => {
    // 23:30 local on Mar 10. In any zone west of UTC this is Mar 11 in UTC.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 10, 23, 30));
    expect(dateOffset(0)).toBe("2026-03-10");
    expect(dateOffset(1)).toBe("2026-03-11");
  });

  it("offsets across a month boundary", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 31, 12, 0));
    expect(dateOffset(1)).toBe("2026-02-01");
    expect(dateOffset(-31)).toBe("2025-12-31");
  });

  it("zero-pads month and day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 12, 0));
    expect(dateOffset(0)).toBe("2026-01-05");
  });
});

describe("DEMO_TASKS", () => {
  it("all carry a YYYY-MM-DD due date", () => {
    expect(DEMO_TASKS.length).toBeGreaterThan(0);
    for (const task of DEMO_TASKS) {
      expect(task.due_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
