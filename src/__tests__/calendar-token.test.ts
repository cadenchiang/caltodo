/**
 * Tests for calendar token generation in calendar-token.ts.
 * Validates token length, hex format, and uniqueness.
 */

import { describe, it, expect } from "vitest";
import { generateCalendarToken } from "@/lib/calendar-token";

describe("generateCalendarToken", () => {
  it("should return a 64-character string", () => {
    const token = generateCalendarToken();
    expect(token).toHaveLength(64);
  });

  it("should return a valid hex string", () => {
    const token = generateCalendarToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("should generate unique tokens on successive calls", () => {
    const token1 = generateCalendarToken();
    const token2 = generateCalendarToken();
    const token3 = generateCalendarToken();
    expect(token1).not.toBe(token2);
    expect(token2).not.toBe(token3);
    expect(token1).not.toBe(token3);
  });

  it("should always produce lowercase hex", () => {
    for (let i = 0; i < 10; i++) {
      const token = generateCalendarToken();
      expect(token).toBe(token.toLowerCase());
    }
  });
});
