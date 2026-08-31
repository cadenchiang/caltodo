/**
 * Tests for the 12-hour time picker helpers.
 * Covers midnight/noon conversion, typed-input sanitising and clamping,
 * and stepper wraparound.
 */

import { describe, it, expect } from "vitest";
import {
  from24h,
  to24h,
  sanitizeTimeDigits,
  parseHourInput,
  parseMinuteInput,
  stepHour,
  stepMinute,
} from "@/lib/time-input";

describe("from24h", () => {
  it("defaults to 12:00 AM when unset", () => {
    for (const v of [null, undefined, ""]) {
      expect(from24h(v)).toEqual({ hour12: 12, minute: 0, ampm: "AM" });
    }
  });

  it("reads midnight as 12 AM, not 0 AM", () => {
    expect(from24h("00:00")).toEqual({ hour12: 12, minute: 0, ampm: "AM" });
    expect(from24h("00:30")).toEqual({ hour12: 12, minute: 30, ampm: "AM" });
  });

  it("reads noon as 12 PM", () => {
    expect(from24h("12:00")).toEqual({ hour12: 12, minute: 0, ampm: "PM" });
  });

  it("reads morning and afternoon hours", () => {
    expect(from24h("09:05")).toEqual({ hour12: 9, minute: 5, ampm: "AM" });
    expect(from24h("13:45")).toEqual({ hour12: 1, minute: 45, ampm: "PM" });
    expect(from24h("23:59")).toEqual({ hour12: 11, minute: 59, ampm: "PM" });
  });

  it("accepts a single-digit hour", () => {
    expect(from24h("9:05")).toEqual({ hour12: 9, minute: 5, ampm: "AM" });
  });

  it("ignores trailing seconds", () => {
    expect(from24h("13:45:30")).toEqual({ hour12: 1, minute: 45, ampm: "PM" });
  });

  it("falls back to the default on garbage rather than producing NaN", () => {
    for (const v of ["abc", "99:99", "24:00", ":", "12"]) {
      expect(from24h(v)).toEqual({ hour12: 12, minute: 0, ampm: "AM" });
    }
  });
});

describe("to24h", () => {
  it("maps 12 AM to midnight and 12 PM to noon", () => {
    expect(to24h(12, 0, "AM")).toBe("00:00");
    expect(to24h(12, 0, "PM")).toBe("12:00");
  });

  it("maps ordinary hours", () => {
    expect(to24h(9, 5, "AM")).toBe("09:05");
    expect(to24h(1, 45, "PM")).toBe("13:45");
    expect(to24h(11, 59, "PM")).toBe("23:59");
  });

  it("zero-pads both parts", () => {
    expect(to24h(1, 0, "AM")).toBe("01:00");
  });

  it("round-trips every minute of the day", () => {
    for (let h = 0; h < 24; h++) {
      for (const m of [0, 7, 30, 59]) {
        const stored = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        const parts = from24h(stored);
        expect(to24h(parts.hour12, parts.minute, parts.ampm)).toBe(stored);
      }
    }
  });
});

describe("sanitizeTimeDigits", () => {
  it("keeps digits only", () => {
    expect(sanitizeTimeDigits("1a2")).toBe("12");
    expect(sanitizeTimeDigits("--")).toBe("");
  });

  it("caps at two characters", () => {
    expect(sanitizeTimeDigits("1234")).toBe("12");
  });

  it("reduces a pasted time string to leading digits", () => {
    expect(sanitizeTimeDigits("7:30pm")).toBe("73");
  });
});

describe("parseHourInput", () => {
  it("returns null while empty so the field can be cleared", () => {
    expect(parseHourInput("")).toBeNull();
    expect(parseHourInput("abc")).toBeNull();
  });

  it("accepts every valid hour", () => {
    for (let h = 1; h <= 12; h++) {
      expect(parseHourInput(String(h))).toBe(h);
    }
  });

  it("treats a typed 0 as 12", () => {
    expect(parseHourInput("0")).toBe(12);
    expect(parseHourInput("00")).toBe(12);
  });

  it("clamps above 12", () => {
    expect(parseHourInput("13")).toBe(12);
    expect(parseHourInput("99")).toBe(12);
  });

  it("ignores a leading zero", () => {
    expect(parseHourInput("07")).toBe(7);
  });
});

describe("parseMinuteInput", () => {
  it("returns null while empty", () => {
    expect(parseMinuteInput("")).toBeNull();
  });

  it("accepts zero", () => {
    expect(parseMinuteInput("0")).toBe(0);
    expect(parseMinuteInput("00")).toBe(0);
  });

  it("accepts the full range", () => {
    expect(parseMinuteInput("07")).toBe(7);
    expect(parseMinuteInput("59")).toBe(59);
  });

  it("clamps above 59", () => {
    expect(parseMinuteInput("60")).toBe(59);
    expect(parseMinuteInput("95")).toBe(59);
  });
});

describe("steppers", () => {
  it("wraps the hour at both ends", () => {
    expect(stepHour(12, 1)).toBe(1);
    expect(stepHour(1, -1)).toBe(12);
    expect(stepHour(6, 1)).toBe(7);
    expect(stepHour(6, -1)).toBe(5);
  });

  it("wraps the minute at both ends in fives", () => {
    expect(stepMinute(55, 1)).toBe(0);
    expect(stepMinute(0, -1)).toBe(55);
    expect(stepMinute(30, 1)).toBe(35);
    expect(stepMinute(30, -1)).toBe(25);
  });

  it("steps a typed off-grid minute without going out of range", () => {
    // A typed 58 is not on the five-minute grid; stepping up must still wrap.
    expect(stepMinute(58, 1)).toBe(0);
    expect(stepMinute(3, -1)).toBe(0);
    expect(stepMinute(3, 1)).toBe(5);
    expect(stepMinute(59, 1)).toBe(0);
    expect(stepMinute(1, -1)).toBe(0);
  });

  it("never leaves the valid minute range from any starting point", () => {
    for (let m = 0; m < 60; m++) {
      for (const d of [1, -1]) {
        const next = stepMinute(m, d);
        expect(next).toBeGreaterThanOrEqual(0);
        expect(next).toBeLessThanOrEqual(59);
        expect(next % 5).toBe(0);
      }
    }
  });
});
