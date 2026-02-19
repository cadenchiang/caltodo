/**
 * Tests for repeat end condition logic (shouldSpawnNext).
 * Verifies end-date and end-count gating for recurring tasks.
 */

import { describe, it, expect } from "vitest";
import { shouldSpawnNext } from "@/lib/repeat";

describe("shouldSpawnNext", () => {
  it("returns true when no end conditions are set", () => {
    expect(shouldSpawnNext("2026-03-01", null, null)).toBe(true);
  });

  it("returns true when next date is before end date", () => {
    expect(shouldSpawnNext("2026-02-20", "2026-03-01", null)).toBe(true);
  });

  it("returns true when next date equals end date", () => {
    expect(shouldSpawnNext("2026-03-01", "2026-03-01", null)).toBe(true);
  });

  it("returns false when next date is after end date", () => {
    expect(shouldSpawnNext("2026-03-02", "2026-03-01", null)).toBe(false);
  });

  it("returns true when end count is greater than 1", () => {
    expect(shouldSpawnNext("2026-03-01", null, 5)).toBe(true);
  });

  it("returns true when end count is exactly 2", () => {
    expect(shouldSpawnNext("2026-03-01", null, 2)).toBe(true);
  });

  it("returns false when end count is 1 (last occurrence)", () => {
    expect(shouldSpawnNext("2026-03-01", null, 1)).toBe(false);
  });

  it("returns false when end count is 0", () => {
    expect(shouldSpawnNext("2026-03-01", null, 0)).toBe(false);
  });

  it("handles end date with no end count", () => {
    expect(shouldSpawnNext("2026-06-15", "2026-12-31", null)).toBe(true);
    expect(shouldSpawnNext("2027-01-01", "2026-12-31", null)).toBe(false);
  });

  it("handles end count with no end date", () => {
    expect(shouldSpawnNext("2030-01-01", null, 10)).toBe(true);
    expect(shouldSpawnNext("2030-01-01", null, 1)).toBe(false);
  });
});
