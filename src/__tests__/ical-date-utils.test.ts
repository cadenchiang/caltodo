/**
 * Tests for shared iCal date/time parsing utilities.
 * Verifies TZID-aware timezone conversion and edge cases.
 */

import { describe, it, expect } from "vitest";
import { parseDueDateWithTzid, extractPropertyWithTzid } from "@/lib/ical-date-utils";

describe("parseDueDateWithTzid", () => {
  it("should parse UTC datetime (Z suffix) without TZID", () => {
    expect(parseDueDateWithTzid("20260320T235900Z", null)).toBe(
      "2026-03-20T23:59:00Z"
    );
  });

  it("should parse datetime without Z and no TZID as UTC (legacy)", () => {
    expect(parseDueDateWithTzid("20260320T235900", null)).toBe(
      "2026-03-20T23:59:00Z"
    );
  });

  it("should parse DATE-only format", () => {
    expect(parseDueDateWithTzid("20260320", null)).toBe(
      "2026-03-20T00:00:00Z"
    );
  });

  it("should convert America/Los_Angeles TZID to UTC (PDT, UTC-7)", () => {
    // March 20, 2026 is after DST starts (March 8), so PDT (UTC-7)
    const result = parseDueDateWithTzid(
      "20260320T235900",
      "America/Los_Angeles"
    );
    expect(result).toBe("2026-03-21T06:59:00Z");
  });

  it("should convert America/New_York TZID to UTC (EDT, UTC-4)", () => {
    // March 20, 2026 is after DST starts, so EDT (UTC-4)
    const result = parseDueDateWithTzid(
      "20260320T235900",
      "America/New_York"
    );
    expect(result).toBe("2026-03-21T03:59:00Z");
  });

  it("should convert PST (winter, UTC-8) correctly", () => {
    // January 15, 2026 — before DST, so PST (UTC-8)
    const result = parseDueDateWithTzid(
      "20260115T235900",
      "America/Los_Angeles"
    );
    expect(result).toBe("2026-01-16T07:59:00Z");
  });

  it("should ignore TZID when Z suffix is present", () => {
    // Z means UTC regardless of TZID
    expect(
      parseDueDateWithTzid("20260320T235900Z", "America/Los_Angeles")
    ).toBe("2026-03-20T23:59:00Z");
  });

  it("should return null for null input", () => {
    expect(parseDueDateWithTzid(null, null)).toBeNull();
  });

  it("should return null for unparseable input", () => {
    expect(parseDueDateWithTzid("not-a-date", null)).toBeNull();
  });

  it("should ignore TZID for DATE-only format", () => {
    expect(parseDueDateWithTzid("20260320", "America/Los_Angeles")).toBe(
      "2026-03-20T00:00:00Z"
    );
  });
});

describe("extractPropertyWithTzid", () => {
  it("should extract value without TZID", () => {
    const block = "DTSTART:20260320T235900Z\nSUMMARY:Test";
    const result = extractPropertyWithTzid(block, "DTSTART");
    expect(result).toEqual({ value: "20260320T235900Z", tzid: null });
  });

  it("should extract value with TZID parameter", () => {
    const block =
      "DTSTART;TZID=America/Los_Angeles:20260320T235900\nSUMMARY:Test";
    const result = extractPropertyWithTzid(block, "DTSTART");
    expect(result).toEqual({
      value: "20260320T235900",
      tzid: "America/Los_Angeles",
    });
  });

  it("should extract TZID with VALUE=DATE-TIME parameter", () => {
    const block =
      "DTEND;TZID=America/New_York;VALUE=DATE-TIME:20260320T235900\nSUMMARY:Test";
    const result = extractPropertyWithTzid(block, "DTEND");
    expect(result).toEqual({
      value: "20260320T235900",
      tzid: "America/New_York",
    });
  });

  it("should return null for missing property", () => {
    const block = "SUMMARY:Test\nUID:abc123";
    expect(extractPropertyWithTzid(block, "DTSTART")).toBeNull();
  });

  it("should handle VALUE=DATE without TZID", () => {
    const block = "DTSTART;VALUE=DATE:20260320\nSUMMARY:Test";
    const result = extractPropertyWithTzid(block, "DTSTART");
    expect(result).toEqual({ value: "20260320", tzid: null });
  });
});
