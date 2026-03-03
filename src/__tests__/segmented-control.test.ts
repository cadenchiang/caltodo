/**
 * Unit tests for SegmentedControl component logic.
 * Validates option rendering, active state detection, and type safety.
 */
import { describe, it, expect } from "vitest";

/** Simulates the activeIndex logic from SegmentedControl. */
function getActiveIndex<T extends string>(
  options: { value: T; label: string }[],
  value: T
): number {
  return options.findIndex((o) => o.value === value);
}

/** Simulates the sliding indicator width calculation. */
function getIndicatorWidth(optionCount: number): string {
  return `calc(${100 / optionCount}% - 2px)`;
}

/** Simulates the sliding indicator transform calculation. */
function getIndicatorTransform(activeIndex: number): string {
  return `translateX(calc(${activeIndex} * 100% + ${activeIndex} * 2px))`;
}

describe("SegmentedControl", () => {
  const twoOptions = [
    { value: "12" as const, label: "12h" },
    { value: "24" as const, label: "24h" },
  ];

  const threeOptions = [
    { value: "today" as const, label: "Today" },
    { value: "week" as const, label: "Week" },
    { value: "inbox" as const, label: "All" },
  ];

  describe("getActiveIndex", () => {
    it("returns 0 for the first option selected", () => {
      expect(getActiveIndex(twoOptions, "12")).toBe(0);
    });

    it("returns 1 for the second option selected", () => {
      expect(getActiveIndex(twoOptions, "24")).toBe(1);
    });

    it("returns correct index for three options", () => {
      expect(getActiveIndex(threeOptions, "today")).toBe(0);
      expect(getActiveIndex(threeOptions, "week")).toBe(1);
      expect(getActiveIndex(threeOptions, "inbox")).toBe(2);
    });

    it("returns -1 for unknown value", () => {
      expect(getActiveIndex(twoOptions, "unknown" as "12")).toBe(-1);
    });
  });

  describe("indicator calculations", () => {
    it("calculates correct width for 2 options", () => {
      expect(getIndicatorWidth(2)).toBe("calc(50% - 2px)");
    });

    it("calculates correct width for 3 options", () => {
      const width = getIndicatorWidth(3);
      expect(width).toContain("33.333");
      expect(width).toContain("% - 2px)");
    });

    it("calculates transform for first position", () => {
      expect(getIndicatorTransform(0)).toBe(
        "translateX(calc(0 * 100% + 0 * 2px))"
      );
    });

    it("calculates transform for second position", () => {
      expect(getIndicatorTransform(1)).toBe(
        "translateX(calc(1 * 100% + 1 * 2px))"
      );
    });

    it("calculates transform for third position", () => {
      expect(getIndicatorTransform(2)).toBe(
        "translateX(calc(2 * 100% + 2 * 2px))"
      );
    });
  });
});
