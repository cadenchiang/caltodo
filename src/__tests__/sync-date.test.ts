/**
 * Tests for timezone-aware date/time conversion helpers in sync-engine.
 * Verifies that toLocalDateString and toLocalTimeString correctly convert
 * UTC ISO strings to local date/time strings, preventing off-by-one bugs.
 */

import { describe, it, expect } from "vitest";
import { toLocalDateString, toLocalTimeString } from "@/lib/sync-engine";

describe("toLocalDateString", () => {
  it("should convert UTC midnight+7:59 to previous day in PST", () => {
    // 7:59 AM UTC on Feb 14 = 11:59 PM PST on Feb 13
    const result = toLocalDateString("2026-02-14T07:59:00Z", "America/Los_Angeles");
    expect(result).toBe("2026-02-13");
  });

  it("should convert UTC 8:00 AM to same day in PST (midnight PST)", () => {
    // 8:00 AM UTC on Feb 14 = 12:00 AM PST on Feb 14
    const result = toLocalDateString("2026-02-14T08:00:00Z", "America/Los_Angeles");
    expect(result).toBe("2026-02-14");
  });

  it("should handle Eastern timezone correctly", () => {
    // 4:59 AM UTC on Feb 14 = 11:59 PM EST on Feb 13
    const result = toLocalDateString("2026-02-14T04:59:00Z", "America/New_York");
    expect(result).toBe("2026-02-13");
  });

  it("should return null for null input", () => {
    expect(toLocalDateString(null, "America/Los_Angeles")).toBeNull();
  });

  it("should return null for invalid ISO string", () => {
    expect(toLocalDateString("not-a-date", "America/Los_Angeles")).toBeNull();
  });
});

describe("toLocalTimeString", () => {
  it("should convert UTC 7:59 AM to 23:59 in PST", () => {
    // 7:59 AM UTC = 11:59 PM PST = 23:59
    const result = toLocalTimeString("2026-02-14T07:59:00Z", "America/Los_Angeles");
    expect(result).toBe("23:59");
  });

  it("should convert UTC 8:00 AM to 00:00 in PST", () => {
    // 8:00 AM UTC = 12:00 AM PST = 00:00
    const result = toLocalTimeString("2026-02-14T08:00:00Z", "America/Los_Angeles");
    expect(result).toBe("00:00");
  });

  it("should convert UTC noon to 04:00 in PST", () => {
    // 12:00 PM UTC = 4:00 AM PST
    const result = toLocalTimeString("2026-02-14T12:00:00Z", "America/Los_Angeles");
    expect(result).toBe("04:00");
  });

  it("should return null for null input", () => {
    expect(toLocalTimeString(null, "America/Los_Angeles")).toBeNull();
  });

  it("should return null for invalid ISO string", () => {
    expect(toLocalTimeString("not-a-date", "America/Los_Angeles")).toBeNull();
  });
});
