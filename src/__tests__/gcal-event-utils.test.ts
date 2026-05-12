/**
 * Tests for shared Google Calendar event utilities.
 * Validates date parsing, color resolution, time formatting, and hex conversion.
 */

import { describe, it, expect } from "vitest";
import {
  parseEventDate,
  hexToRgba,
  formatTimeCompact,
  getEventColor,
  formatEventTime,
  getEventDateKey,
  GCAL_COLORS,
} from "@/lib/gcal/event-utils";

describe("parseEventDate", () => {
  it("should parse YYYY-MM-DD as local midnight", () => {
    const d = parseEventDate("2026-03-15");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(2); // March = 2
    expect(d.getDate()).toBe(15);
    expect(d.getHours()).toBe(0);
  });

  it("should parse ISO datetime string", () => {
    const d = parseEventDate("2026-03-15T14:30:00-08:00");
    expect(d.getFullYear()).toBe(2026);
    // Exact hour depends on local timezone; just verify it parsed
    expect(d instanceof Date).toBe(true);
    expect(isNaN(d.getTime())).toBe(false);
  });

  it("should handle timezone-aware ISO strings", () => {
    const d = parseEventDate("2026-03-15T00:00:00Z");
    expect(isNaN(d.getTime())).toBe(false);
  });
});

describe("hexToRgba", () => {
  it("should convert hex with # to rgba", () => {
    expect(hexToRgba("#0e89d6", 0.5)).toBe("rgba(59, 130, 246, 0.5)");
  });

  it("should convert hex without # to rgba", () => {
    expect(hexToRgba("ff0000", 1)).toBe("rgba(255, 0, 0, 1)");
  });

  it("should handle zero opacity", () => {
    expect(hexToRgba("#000000", 0)).toBe("rgba(0, 0, 0, 0)");
  });
});

describe("formatTimeCompact", () => {
  it("should format midnight as 12a", () => {
    expect(formatTimeCompact("00:00")).toBe("12a");
  });

  it("should format 1pm as 1p", () => {
    expect(formatTimeCompact("13:00")).toBe("1p");
  });

  it("should format 1:30pm as 1:30p", () => {
    expect(formatTimeCompact("13:30")).toBe("1:30p");
  });

  it("should format 9am as 9a", () => {
    expect(formatTimeCompact("09:00")).toBe("9a");
  });

  it("should format noon as 12p", () => {
    expect(formatTimeCompact("12:00")).toBe("12p");
  });

  it("should format 11:59pm as 11:59p", () => {
    expect(formatTimeCompact("23:59")).toBe("11:59p");
  });
});

describe("getEventColor", () => {
  it("should return GCAL_COLORS color when colorId is present", () => {
    expect(getEventColor("1")).toBe(GCAL_COLORS["1"]);
  });

  it("should fall back to calendar color when colorId is null", () => {
    expect(getEventColor(null, "#FF0000")).toBe("#FF0000");
  });

  it("should fall back to default when both are missing", () => {
    expect(getEventColor(null)).toBe("#3F51B5");
  });

  it("should use custom fallback", () => {
    expect(getEventColor(null, undefined, "#123456")).toBe("#123456");
  });

  it("should use theme default when colorTheme is set and no colorId/calendarColor", () => {
    expect(getEventColor(null, undefined, undefined, "miffy")).toBe("#e8729a");
    expect(getEventColor(null, undefined, undefined, "nord")).toBe("#5e81ac");
  });

  it("should prefer colorId over theme default", () => {
    expect(getEventColor("1", undefined, undefined, "miffy")).toBe(GCAL_COLORS["1"]);
  });

  it("should prefer calendarColor over theme default", () => {
    expect(getEventColor(null, "#FF0000", undefined, "miffy")).toBe("#FF0000");
  });
});

describe("formatEventTime", () => {
  it("should return 'All day' for all-day events", () => {
    expect(formatEventTime("2026-03-15", true)).toBe("All day");
  });

  it("should format timed events", () => {
    // Create a known time
    const date = new Date(2026, 2, 15, 14, 30);
    const result = formatEventTime(date.toISOString(), false);
    expect(result).toBe("2:30pm");
  });

  it("should format midnight as 12am", () => {
    const date = new Date(2026, 2, 15, 0, 0);
    const result = formatEventTime(date.toISOString(), false);
    expect(result).toBe("12am");
  });
});

describe("getEventDateKey", () => {
  it("should return YYYY-MM-DD for date-only strings", () => {
    expect(getEventDateKey("2026-03-15")).toBe("2026-03-15");
  });

  it("should extract date from ISO datetime", () => {
    const date = new Date(2026, 2, 15, 14, 30);
    expect(getEventDateKey(date.toISOString())).toBe("2026-03-15");
  });
});
