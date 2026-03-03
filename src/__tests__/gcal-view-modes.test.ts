/**
 * Unit tests for getTimeRange with all view modes including new day-count modes.
 * Verifies correct date offset for each ViewMode value.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getTimeRange,
  type ViewMode,
} from "@/components/home/widgets/GoogleCalendarWidget";

describe("getTimeRange", () => {
  /** Pin Date.now() to 2026-03-02T12:00:00Z for deterministic tests. */
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-02T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Helper to compute expected day offset from start of local day.
   *
   * @param mode - ViewMode to test
   * @returns Expected number of days between timeMin and timeMax
   */
  function getDayOffset(mode: ViewMode): number {
    const { timeMin, timeMax } = getTimeRange(mode);
    const start = new Date(timeMin);
    const end = new Date(timeMax);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  it("today mode spans 1 day", () => {
    expect(getDayOffset("today")).toBe(1);
  });

  it("2day mode spans 2 days", () => {
    expect(getDayOffset("2day")).toBe(2);
  });

  it("3day mode spans 3 days", () => {
    expect(getDayOffset("3day")).toBe(3);
  });

  it("4day mode spans 4 days", () => {
    expect(getDayOffset("4day")).toBe(4);
  });

  it("5day mode spans 5 days", () => {
    expect(getDayOffset("5day")).toBe(5);
  });

  it("week mode spans 7 days", () => {
    expect(getDayOffset("week")).toBe(7);
  });

  it("month mode spans 30 days", () => {
    expect(getDayOffset("month")).toBe(30);
  });

  it("timeMin starts at midnight of current local day", () => {
    const { timeMin } = getTimeRange("today");
    const start = new Date(timeMin);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
  });

  it("returns valid ISO strings", () => {
    const modes: ViewMode[] = ["today", "2day", "3day", "4day", "5day", "week", "month"];
    for (const mode of modes) {
      const { timeMin, timeMax } = getTimeRange(mode);
      expect(new Date(timeMin).toISOString()).toBe(timeMin);
      expect(new Date(timeMax).toISOString()).toBe(timeMax);
    }
  });
});
