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

describe("parseDateInput typed formats", () => {
  // Fixed "now" so year-less input resolves deterministically.
  const fakeNow = new Date(2026, 7, 31); // Mon Aug 31, 2026

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fakeNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("expands a two-digit year into this century", () => {
    // date-fns took the digits literally and produced the year 29.
    expect(parseDateInput("1/2/29")).toBe("2029-01-02");
    expect(parseDateInput("12/25/26")).toBe("2026-12-25");
  });

  it("accepts a date with no year at all", () => {
    expect(parseDateInput("9/4")).toBe("2026-09-04");
    expect(parseDateInput("12/31")).toBe("2026-12-31");
  });

  it("rolls a year-less date that has passed into next year", () => {
    // Aug 30 is yesterday, so typing it means next August, not the past.
    expect(parseDateInput("8/30")).toBe("2027-08-30");
    expect(parseDateInput("1/1")).toBe("2027-01-01");
  });

  it("treats a year-less date of today as today", () => {
    expect(parseDateInput("8/31")).toBe("2026-08-31");
  });

  it("accepts ISO input", () => {
    expect(parseDateInput("2029-01-02")).toBe("2029-01-02");
    expect(parseDateInput("2026-9-4")).toBe("2026-09-04");
  });

  it("accepts dots and dashes as separators", () => {
    expect(parseDateInput("1.2.2029")).toBe("2029-01-02");
    expect(parseDateInput("1-2-2029")).toBe("2029-01-02");
  });

  it("understands today and tomorrow", () => {
    expect(parseDateInput("today")).toBe("2026-08-31");
    expect(parseDateInput("Tomorrow")).toBe("2026-09-01");
    expect(parseDateInput("  TODAY  ")).toBe("2026-08-31");
  });

  it("rejects impossible dates instead of rolling them over", () => {
    // A naive Date(2026, 1, 31) silently becomes March 3.
    expect(parseDateInput("2/31")).toBeNull();
    expect(parseDateInput("2/30/2026")).toBeNull();
    expect(parseDateInput("13/5")).toBeNull();
    expect(parseDateInput("0/5")).toBeNull();
    expect(parseDateInput("5/0")).toBeNull();
  });

  it("accepts a real leap day and rejects a fake one", () => {
    expect(parseDateInput("2/29/2028")).toBe("2028-02-29");
    expect(parseDateInput("2/29/2027")).toBeNull();
  });

  it("still rejects nonsense", () => {
    for (const bad of ["garbage", "//", "1/", "1/2/3/4", "-5"]) {
      expect(parseDateInput(bad)).toBeNull();
    }
  });

  it("keeps month-name input working", () => {
    expect(parseDateInput("Sep 4")).toBe("2026-09-04");
    expect(parseDateInput("September 4")).toBe("2026-09-04");
    expect(parseDateInput("Sep 4, 2026")).toBe("2026-09-04");
  });
});
