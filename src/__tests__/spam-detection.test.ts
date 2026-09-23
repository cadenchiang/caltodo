/**
 * Tests for the spam detection module.
 * Verifies burst detection, escalating timeouts, strike resets,
 * and correct retryAfter values.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { checkSpam, checkDuplicate, resetSpamState } from "@/lib/spam-detection";

beforeEach(() => {
  resetSpamState();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("checkSpam", () => {
  it("should allow normal message rate", () => {
    const result1 = checkSpam("user-1");
    expect(result1.allowed).toBe(true);
    expect(result1.retryAfter).toBeUndefined();

    // Send another message 3 seconds later
    vi.advanceTimersByTime(3000);
    const result2 = checkSpam("user-1");
    expect(result2.allowed).toBe(true);
  });

  it("should allow up to 4 messages in the burst window", () => {
    for (let i = 0; i < 4; i++) {
      const result = checkSpam("user-2");
      expect(result.allowed).toBe(true);
    }
  });

  it("should block on the 5th message in the burst window (10s)", () => {
    for (let i = 0; i < 4; i++) {
      const result = checkSpam("user-3");
      expect(result.allowed).toBe(true);
    }

    const blocked = checkSpam("user-3");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBe(30); // First strike = 30s
  });

  it("should return correct retryAfter seconds (decreasing over time)", () => {
    // Trigger first timeout
    for (let i = 0; i < 5; i++) {
      checkSpam("user-4");
    }

    // Advance 10 seconds, check remaining time
    vi.advanceTimersByTime(10_000);
    const result = checkSpam("user-4");
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBe(20); // 30 - 10 = 20s remaining
  });

  it("should allow messages again after timeout expires", () => {
    // Trigger timeout
    for (let i = 0; i < 5; i++) {
      checkSpam("user-5");
    }

    // Advance past the 30s timeout
    vi.advanceTimersByTime(31_000);
    const result = checkSpam("user-5");
    expect(result.allowed).toBe(true);
  });

  it("should escalate timeout on second violation (30s → 2min)", () => {
    // First violation
    for (let i = 0; i < 5; i++) {
      checkSpam("user-6");
    }

    // Wait for first timeout to expire
    vi.advanceTimersByTime(31_000);

    // Second burst
    for (let i = 0; i < 5; i++) {
      checkSpam("user-6");
    }

    // Should be 2 minutes now
    const blocked = checkSpam("user-6");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeLessThanOrEqual(120);
    expect(blocked.retryAfter).toBeGreaterThan(60); // More than 1 min
  });

  it("should escalate timeout on third violation (2min → 10min)", () => {
    // First violation
    for (let i = 0; i < 5; i++) {
      checkSpam("user-7");
    }
    vi.advanceTimersByTime(31_000);

    // Second violation
    for (let i = 0; i < 5; i++) {
      checkSpam("user-7");
    }
    vi.advanceTimersByTime(2 * 60_000 + 1000);

    // Third violation
    for (let i = 0; i < 5; i++) {
      checkSpam("user-7");
    }

    const blocked = checkSpam("user-7");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeLessThanOrEqual(600);
    expect(blocked.retryAfter).toBeGreaterThan(120); // More than 2 min
  });

  it("should reset strikes after 30 minutes of no violations", () => {
    // Trigger first violation
    for (let i = 0; i < 5; i++) {
      checkSpam("user-8");
    }
    // Wait for timeout to expire
    vi.advanceTimersByTime(31_000);

    // Wait 30 minutes (strike reset period)
    vi.advanceTimersByTime(30 * 60_000);

    // New burst should be treated as first strike (30s), not second (2min)
    for (let i = 0; i < 5; i++) {
      checkSpam("user-8");
    }

    const blocked = checkSpam("user-8");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBe(30); // Reset to first strike
  });

  it("should track users independently", () => {
    // Trigger timeout for user-A
    for (let i = 0; i < 5; i++) {
      checkSpam("user-A");
    }

    // user-B should not be affected
    const resultB = checkSpam("user-B");
    expect(resultB.allowed).toBe(true);

    // user-A should be blocked
    const resultA = checkSpam("user-A");
    expect(resultA.allowed).toBe(false);
  });

  it("should allow messages after burst window expires without timeout", () => {
    // Send 4 messages (just under threshold)
    for (let i = 0; i < 4; i++) {
      checkSpam("user-9");
    }

    // Wait for burst window to expire (10s)
    vi.advanceTimersByTime(11_000);

    // Should allow messages again — old timestamps pruned
    for (let i = 0; i < 4; i++) {
      const result = checkSpam("user-9");
      expect(result.allowed).toBe(true);
    }
  });
});

describe("checkDuplicate", () => {
  it("should allow the first two identical messages", () => {
    const r1 = checkDuplicate("dup-1", "hello world");
    expect(r1.allowed).toBe(true);

    const r2 = checkDuplicate("dup-1", "hello world");
    expect(r2.allowed).toBe(true);
  });

  it("should allow a third identical message (under threshold of 3)", () => {
    checkDuplicate("dup-2", "same msg");
    checkDuplicate("dup-2", "same msg");

    // 3rd message — the store has 2 entries, which is < 3, so allowed
    const r3 = checkDuplicate("dup-2", "same msg");
    expect(r3.allowed).toBe(true);
  });

  it("should block the 4th identical message within 30s", () => {
    checkDuplicate("dup-3", "spam spam");
    checkDuplicate("dup-3", "spam spam");
    checkDuplicate("dup-3", "spam spam");

    // 4th identical message — store has 3 entries, hits threshold
    const r4 = checkDuplicate("dup-3", "spam spam");
    expect(r4.allowed).toBe(false);
    expect(r4.error).toContain("Duplicate message");
  });

  it("should allow same message after 30s window expires", () => {
    checkDuplicate("dup-4", "repeat me");
    checkDuplicate("dup-4", "repeat me");
    checkDuplicate("dup-4", "repeat me");

    // Advance past the 30s duplicate window
    vi.advanceTimersByTime(31_000);

    const result = checkDuplicate("dup-4", "repeat me");
    expect(result.allowed).toBe(true);
  });

  it("should allow different messages in rapid succession", () => {
    const r1 = checkDuplicate("dup-5", "message one");
    const r2 = checkDuplicate("dup-5", "message two");
    const r3 = checkDuplicate("dup-5", "message three");
    const r4 = checkDuplicate("dup-5", "message four");

    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(true);
    expect(r4.allowed).toBe(true);
  });

  it("should match case-insensitively", () => {
    checkDuplicate("dup-6", "Hello World");
    checkDuplicate("dup-6", "hello world");
    checkDuplicate("dup-6", "HELLO WORLD");

    const r4 = checkDuplicate("dup-6", "hElLo WoRlD");
    expect(r4.allowed).toBe(false);
  });

  it("should collapse whitespace for matching", () => {
    checkDuplicate("dup-7", "hello   world");
    checkDuplicate("dup-7", "hello world");
    checkDuplicate("dup-7", "  hello  world  ");

    const r4 = checkDuplicate("dup-7", "hello\tworld");
    expect(r4.allowed).toBe(false);
  });

  it("should track users independently", () => {
    checkDuplicate("dup-A", "same text");
    checkDuplicate("dup-A", "same text");
    checkDuplicate("dup-A", "same text");

    // dup-B should not be affected by dup-A's history
    const result = checkDuplicate("dup-B", "same text");
    expect(result.allowed).toBe(true);
  });

  it("should clear duplicate state via resetSpamState()", () => {
    checkDuplicate("dup-8", "test msg");
    checkDuplicate("dup-8", "test msg");
    checkDuplicate("dup-8", "test msg");

    resetSpamState("dup-8");

    const result = checkDuplicate("dup-8", "test msg");
    expect(result.allowed).toBe(true);
  });

  it("should clear all duplicate state via resetSpamState()", () => {
    checkDuplicate("dup-9a", "msg");
    checkDuplicate("dup-9a", "msg");
    checkDuplicate("dup-9a", "msg");

    checkDuplicate("dup-9b", "msg");
    checkDuplicate("dup-9b", "msg");
    checkDuplicate("dup-9b", "msg");

    resetSpamState();

    expect(checkDuplicate("dup-9a", "msg").allowed).toBe(true);
    expect(checkDuplicate("dup-9b", "msg").allowed).toBe(true);
  });
});
