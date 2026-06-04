import { describe, it, expect } from "vitest";
import {
  FOCUS_SESSION_KEY,
  WIDGET_POMO_KEY,
  activePomodoroRemaining,
  formatClock,
  remainingFromFocusSession,
  remainingFromWidgetState,
} from "@/lib/pomodoro-title";

const NOW = 1_750_000_000_000;

describe("formatClock", () => {
  it("formats minutes and seconds with padding", () => {
    expect(formatClock(1500)).toBe("25:00");
    expect(formatClock(61)).toBe("01:01");
    expect(formatClock(9)).toBe("00:09");
  });

  it("clamps negative values to zero", () => {
    expect(formatClock(-5)).toBe("00:00");
  });
});

describe("remainingFromFocusSession", () => {
  it("computes remaining seconds from endTime while running", () => {
    const raw = JSON.stringify({ running: true, endTime: NOW + 90_000 });
    expect(remainingFromFocusSession(raw, NOW)).toBe(90);
  });

  it("returns null when paused", () => {
    const raw = JSON.stringify({ running: false, endTime: NOW + 90_000 });
    expect(remainingFromFocusSession(raw, NOW)).toBeNull();
  });

  it("returns null when expired, missing, or malformed", () => {
    expect(
      remainingFromFocusSession(JSON.stringify({ running: true, endTime: NOW - 1000 }), NOW),
    ).toBeNull();
    expect(remainingFromFocusSession(null, NOW)).toBeNull();
    expect(remainingFromFocusSession("{not json", NOW)).toBeNull();
    expect(remainingFromFocusSession(JSON.stringify({ running: true }), NOW)).toBeNull();
  });
});

describe("remainingFromWidgetState", () => {
  it("subtracts elapsed time since savedAt while running", () => {
    const raw = JSON.stringify({ running: true, secondsLeft: 300, savedAt: NOW - 60_000 });
    expect(remainingFromWidgetState(raw, NOW)).toBe(240);
  });

  it("returns null when paused, expired, or malformed", () => {
    expect(
      remainingFromWidgetState(
        JSON.stringify({ running: false, secondsLeft: 300, savedAt: NOW }),
        NOW,
      ),
    ).toBeNull();
    expect(
      remainingFromWidgetState(
        JSON.stringify({ running: true, secondsLeft: 30, savedAt: NOW - 60_000 }),
        NOW,
      ),
    ).toBeNull();
    expect(remainingFromWidgetState(null, NOW)).toBeNull();
    expect(remainingFromWidgetState("oops", NOW)).toBeNull();
  });
});

describe("activePomodoroRemaining", () => {
  const store = (entries: Record<string, string>) => (key: string) => entries[key] ?? null;

  it("returns null when no timer is running", () => {
    expect(activePomodoroRemaining(store({}), NOW)).toBeNull();
  });

  it("uses whichever timer is running", () => {
    const read = store({
      [FOCUS_SESSION_KEY]: JSON.stringify({ running: true, endTime: NOW + 120_000 }),
    });
    expect(activePomodoroRemaining(read, NOW)).toBe(120);
  });

  it("prefers the timer closest to finishing when both run", () => {
    const read = store({
      [FOCUS_SESSION_KEY]: JSON.stringify({ running: true, endTime: NOW + 120_000 }),
      [WIDGET_POMO_KEY]: JSON.stringify({ running: true, secondsLeft: 45, savedAt: NOW }),
    });
    expect(activePomodoroRemaining(read, NOW)).toBe(45);
  });
});
