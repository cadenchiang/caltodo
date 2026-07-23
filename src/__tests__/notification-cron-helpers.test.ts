/**
 * Unit tests for pure helpers used by the push-reminders cron and the
 * Notifications settings UI. Covers timezone math, body formatting, and
 * label rendering edge cases.
 */

import { describe, expect, it } from "vitest";
import {
  formatBeforeLabel,
  formatLead,
  formatTimeLabel,
  nowInTz,
  parseDueAt,
  tzOffsetMinutes,
  uniqueDays,
} from "@/lib/notifications/cron-helpers";

describe("parseDueAt", () => {
  it("returns null for malformed date", () => {
    expect(parseDueAt("not-a-date", "09:00", "UTC")).toBeNull();
    // Bad month/day passes the regex but fails Date parsing → null.
    expect(parseDueAt("2026-13-40", "09:00", "UTC")).toBeNull();
  });

  it("defaults to end-of-day when time is null", () => {
    const d = parseDueAt("2026-04-15", null, "UTC");
    expect(d).not.toBeNull();
    expect(d!.toISOString()).toBe("2026-04-15T23:59:00.000Z");
  });

  it("interprets wall-clock time in the rule's timezone", () => {
    // 09:00 Los Angeles on April 15 = 16:00 UTC (PDT is UTC-7).
    const d = parseDueAt("2026-04-15", "09:00", "America/Los_Angeles");
    expect(d).not.toBeNull();
    expect(d!.toISOString()).toBe("2026-04-15T16:00:00.000Z");
  });

  it("handles DST correctly (LA spring forward)", () => {
    // March 8 2026 02:00 → 03:00 PDT. A 02:30 wall-clock doesn't exist; we
    // just verify the April date (post-DST) gets the -7 offset.
    const d = parseDueAt("2026-04-15", "12:00", "America/Los_Angeles");
    expect(d!.toISOString()).toBe("2026-04-15T19:00:00.000Z");
  });

  it("accepts HH:MM:SS and truncates seconds", () => {
    const d = parseDueAt("2026-04-15", "09:30:45", "UTC");
    expect(d!.toISOString()).toBe("2026-04-15T09:30:00.000Z");
  });
});

describe("nowInTz", () => {
  it("returns LA date at UTC midnight", () => {
    // 2026-04-15 00:00 UTC = 2026-04-14 17:00 LA
    const result = nowInTz(new Date("2026-04-15T00:00:00Z"), "America/Los_Angeles");
    expect(result.dateIso).toBe("2026-04-14");
    expect(result.hours).toBe(17);
    expect(result.minutes).toBe(0);
  });

  it("returns UTC when TZ is UTC", () => {
    const r = nowInTz(new Date("2026-04-15T14:30:00Z"), "UTC");
    expect(r).toEqual({ hours: 14, minutes: 30, dateIso: "2026-04-15" });
  });
});

describe("tzOffsetMinutes", () => {
  it("returns -420 (UTC-7) for LA in April (PDT)", () => {
    const april = new Date("2026-04-15T12:00:00Z");
    expect(tzOffsetMinutes(april, "America/Los_Angeles")).toBe(-420);
  });

  it("returns 0 for UTC", () => {
    expect(tzOffsetMinutes(new Date("2026-06-15T00:00:00Z"), "UTC")).toBe(0);
  });

  it("returns positive offset for Tokyo", () => {
    // JST is UTC+9 → +540 min
    expect(tzOffsetMinutes(new Date("2026-04-15T12:00:00Z"), "Asia/Tokyo")).toBe(540);
  });
});

describe("uniqueDays", () => {
  it("returns one day when range is within a single UTC day", () => {
    const start = new Date("2026-04-15T01:00:00Z");
    const end = new Date("2026-04-15T22:00:00Z");
    const days = uniqueDays([start, end]);
    // Pads by one day on BOTH sides to catch timezone overflow in either
    // direction (a local due_date can land on the prev or next UTC day).
    expect(days).toContain("2026-04-14");
    expect(days).toContain("2026-04-15");
    expect(days).toContain("2026-04-16");
    expect(days.length).toBe(3);
  });

  it("spans multiple days", () => {
    const start = new Date("2026-04-15T23:00:00Z");
    const end = new Date("2026-04-17T01:00:00Z");
    const days = uniqueDays([start, end]);
    expect(days).toContain("2026-04-15");
    expect(days).toContain("2026-04-16");
    expect(days).toContain("2026-04-17");
  });
});

describe("formatLead", () => {
  it("minutes for <60", () => {
    expect(formatLead(5)).toBe("Due in 5 min");
    expect(formatLead(59)).toBe("Due in 59 min");
  });

  it("'about an hour' for 60-119 min", () => {
    expect(formatLead(60)).toBe("Due in about an hour");
    expect(formatLead(119)).toBe("Due in about an hour");
  });

  it("hours for 2-23h", () => {
    expect(formatLead(120)).toBe("Due in 2 hours");
    expect(formatLead(60 * 23)).toBe("Due in 23 hours");
  });

  it("'tomorrow' for 24-47h", () => {
    expect(formatLead(1440)).toBe("Due tomorrow");
    expect(formatLead(2879)).toBe("Due tomorrow");
  });

  it("days for >=48h", () => {
    expect(formatLead(2880)).toBe("Due in 2 days");
    expect(formatLead(10080)).toBe("Due in 7 days");
  });
});

describe("formatBeforeLabel", () => {
  it("pluralizes correctly", () => {
    expect(formatBeforeLabel(30)).toBe("30 minutes");
    expect(formatBeforeLabel(60)).toBe("1 hour");
    expect(formatBeforeLabel(120)).toBe("2 hours");
    expect(formatBeforeLabel(1440)).toBe("1 day");
    expect(formatBeforeLabel(2880)).toBe("2 days");
    expect(formatBeforeLabel(10080)).toBe("1 week");
    expect(formatBeforeLabel(20160)).toBe("2 weeks");
  });
});

describe("formatTimeLabel", () => {
  it("formats 24h HH:MM as 12h with AM/PM", () => {
    expect(formatTimeLabel("00:00")).toBe("12:00 AM");
    expect(formatTimeLabel("08:00")).toBe("8:00 AM");
    expect(formatTimeLabel("12:00")).toBe("12:00 PM");
    expect(formatTimeLabel("13:30")).toBe("1:30 PM");
    expect(formatTimeLabel("21:00")).toBe("9:00 PM");
    expect(formatTimeLabel("23:59")).toBe("11:59 PM");
  });

  it("returns input unchanged on malformed string", () => {
    expect(formatTimeLabel("not-a-time")).toBe("not-a-time");
  });
});
