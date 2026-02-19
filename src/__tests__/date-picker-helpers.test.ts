/**
 * Tests for the parseDateInput helper function used by DatePicker.
 * Verifies parsing of various user-typed date formats.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseDateInput } from "@/lib/date-helpers";

describe("parseDateInput", () => {
  // Fix "now" to 2026-02-18 so tests are deterministic
  const fakeNow = new Date(2026, 1, 18); // Feb 18, 2026

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fakeNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null for empty string", () => {
    expect(parseDateInput("")).toBeNull();
    expect(parseDateInput("   ")).toBeNull();
  });

  it("parses MM/DD/YYYY format", () => {
    expect(parseDateInput("02/25/2026")).toBe("2026-02-25");
    expect(parseDateInput("12/31/2026")).toBe("2026-12-31");
  });

  it("parses M/D/YYYY format (no leading zeros)", () => {
    expect(parseDateInput("2/5/2026")).toBe("2026-02-05");
    expect(parseDateInput("3/1/2027")).toBe("2027-03-01");
  });

  it("parses MM-DD-YYYY format", () => {
    expect(parseDateInput("02-25-2026")).toBe("2026-02-25");
    expect(parseDateInput("12-31-2026")).toBe("2026-12-31");
  });

  it("parses 'MMM d' (e.g. 'Feb 25') — defaults to current/next year", () => {
    // Feb 25 is in the future relative to Feb 18
    expect(parseDateInput("Feb 25")).toBe("2026-02-25");
  });

  it("parses 'MMM d' with past date — rolls to next year", () => {
    // Feb 10 has already passed relative to Feb 18
    expect(parseDateInput("Feb 10")).toBe("2027-02-10");
  });

  it("parses 'MMMM d' (e.g. 'February 25')", () => {
    expect(parseDateInput("February 25")).toBe("2026-02-25");
  });

  it("parses 'MMM d, yyyy' (e.g. 'Feb 25, 2027')", () => {
    expect(parseDateInput("Feb 25, 2027")).toBe("2027-02-25");
  });

  it("parses 'MMMM d, yyyy' (e.g. 'March 1, 2027')", () => {
    expect(parseDateInput("March 1, 2027")).toBe("2027-03-01");
  });

  it("returns null for completely invalid input", () => {
    expect(parseDateInput("not a date")).toBeNull();
    expect(parseDateInput("hello world")).toBeNull();
    expect(parseDateInput("abc123")).toBeNull();
  });

  it("handles whitespace trimming", () => {
    expect(parseDateInput("  02/25/2026  ")).toBe("2026-02-25");
    expect(parseDateInput("  Feb 25  ")).toBe("2026-02-25");
  });
});
