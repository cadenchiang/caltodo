/**
 * Tests for the phrasing under each MCP key in settings.
 *
 * These are pure functions of a timestamp and the clock, so the clock is faked
 * and the boundaries are checked directly: the minute/hour/day handovers, the
 * point where a relative age becomes a date, and an expiry that has already
 * passed.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { timeAgo, expiryLabel, keyUsageLine } from "@/lib/mcp/key-format";

/** Fixed "now" for every case below. */
const NOW = new Date("2026-09-02T12:00:00Z");

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** An ISO stamp `ms` milliseconds before NOW. */
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();

/** An ISO stamp `ms` milliseconds after NOW. */
const ahead = (ms: number) => new Date(NOW.getTime() + ms).toISOString();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => vi.useRealTimers());

describe("timeAgo", () => {
  it("uses the fallback when the event never happened", () => {
    expect(timeAgo(null, "never")).toBe("never");
    expect(timeAgo(null, "—")).toBe("—");
  });

  it("reads under a minute as just now", () => {
    expect(timeAgo(ago(0), "never")).toBe("just now");
    expect(timeAgo(ago(59_000), "never")).toBe("just now");
  });

  it("counts minutes up to the hour", () => {
    expect(timeAgo(ago(MINUTE), "never")).toBe("1m ago");
    expect(timeAgo(ago(59 * MINUTE), "never")).toBe("59m ago");
  });

  it("counts hours up to the day", () => {
    expect(timeAgo(ago(HOUR), "never")).toBe("1h ago");
    expect(timeAgo(ago(23 * HOUR), "never")).toBe("23h ago");
  });

  it("counts days up to a month", () => {
    expect(timeAgo(ago(DAY), "never")).toBe("1d ago");
    expect(timeAgo(ago(29 * DAY), "never")).toBe("29d ago");
  });

  it("switches to a date beyond a month", () => {
    // Locale-dependent, so this asserts the shape rather than exact words:
    // anything but a relative count.
    expect(timeAgo(ago(40 * DAY), "never")).not.toMatch(/ago$/);
  });

  it("does not show a negative count for a future stamp", () => {
    // Server and browser clocks disagree by seconds, so a key used a moment
    // ago can arrive stamped slightly ahead.
    expect(timeAgo(ahead(30_000), "never")).toBe("just now");
  });
});

describe("expiryLabel", () => {
  it("says so when a key never expires", () => {
    expect(expiryLabel(null)).toBe("never expires");
  });

  it("reports a lapsed key as expired", () => {
    expect(expiryLabel(ago(1))).toBe("expired");
    expect(expiryLabel(ago(30 * DAY))).toBe("expired");
  });

  it("treats the exact expiry instant as expired", () => {
    // findKeyOwner rejects on `<= now`, so the label has to agree or a dead
    // key would read as live for its final millisecond.
    expect(expiryLabel(NOW.toISOString())).toBe("expired");
  });

  it("names tomorrow rather than counting one day", () => {
    expect(expiryLabel(ahead(DAY))).toBe("expires tomorrow");
  });

  it("counts days in the near term", () => {
    expect(expiryLabel(ahead(7 * DAY))).toBe("expires in 7d");
    expect(expiryLabel(ahead(44 * DAY))).toBe("expires in 44d");
  });

  it("switches to a date further out", () => {
    expect(expiryLabel(ahead(90 * DAY))).toMatch(/^expires /);
    expect(expiryLabel(ahead(90 * DAY))).not.toMatch(/expires in \d+d$/);
  });
});

describe("keyUsageLine", () => {
  it("joins last use and expiry into the one line under a key", () => {
    expect(keyUsageLine(ago(HOUR), null)).toBe("used 1h ago · never expires");
  });

  it("says never for a key that has not been used", () => {
    expect(keyUsageLine(null, ahead(7 * DAY))).toBe("used never · expires in 7d");
  });
});
