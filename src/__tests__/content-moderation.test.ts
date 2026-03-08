/**
 * Tests for the content moderation module.
 * Verifies slur blocking (n-word, "faggot") with leet speak, spacing,
 * and repetition evasion, and absence of false positives on clean text.
 */

import { describe, it, expect } from "vitest";
import { containsBlockedContent, normalizeText } from "@/lib/content-moderation";

describe("normalizeText", () => {
  it("should lowercase input", () => {
    expect(normalizeText("HELLO")).toBe("hello");
  });

  it("should strip zero-width characters", () => {
    expect(normalizeText("he\u200Bllo")).toBe("hello");
    expect(normalizeText("he\uFEFFllo")).toBe("hello");
  });

  it("should strip combining diacritical marks via NFD normalization", () => {
    // n̄ (n + combining macron) → n
    expect(normalizeText("n\u0304igger")).toBe("nigger");
    // ñ (precomposed) → n after NFD decomposition
    expect(normalizeText("ñigger")).toBe("nigger");
  });
});

describe("containsBlockedContent", () => {
  it("should block the n-word (hard r)", () => {
    expect(containsBlockedContent("nigger")).toBe(true);
  });

  it("should block the n-word (soft a)", () => {
    expect(containsBlockedContent("nigga")).toBe(true);
  });

  it("should block within sentences", () => {
    expect(containsBlockedContent("you are a nigger")).toBe(true);
    expect(containsBlockedContent("hey nigga what's up")).toBe(true);
  });

  it("should be case insensitive", () => {
    expect(containsBlockedContent("NIGGER")).toBe(true);
    expect(containsBlockedContent("Nigga")).toBe(true);
    expect(containsBlockedContent("NiGgEr")).toBe(true);
  });

  it("should block leet speak variants", () => {
    expect(containsBlockedContent("n1gger")).toBe(true);
    expect(containsBlockedContent("n1gg3r")).toBe(true);
    expect(containsBlockedContent("n!gga")).toBe(true);
    expect(containsBlockedContent("n1gg@")).toBe(true);
  });

  it("should block spaced-out evasion", () => {
    expect(containsBlockedContent("n i g g e r")).toBe(true);
    expect(containsBlockedContent("n i g g a")).toBe(true);
    expect(containsBlockedContent("n.i.g.g.e.r")).toBe(true);
  });

  it("should block repeated character evasion", () => {
    expect(containsBlockedContent("niggger")).toBe(true);
    expect(containsBlockedContent("nigggga")).toBe(true);
    expect(containsBlockedContent("niiiigger")).toBe(true);
  });

  it("should block faggot", () => {
    expect(containsBlockedContent("faggot")).toBe(true);
    expect(containsBlockedContent("FAGGOT")).toBe(true);
    expect(containsBlockedContent("you are a faggot")).toBe(true);
  });

  it("should block faggot leet speak variants", () => {
    expect(containsBlockedContent("f@gg0t")).toBe(true);
    expect(containsBlockedContent("f4gg07")).toBe(true);
  });

  it("should block faggot spaced-out evasion", () => {
    expect(containsBlockedContent("f a g g o t")).toBe(true);
    expect(containsBlockedContent("f.a.g.g.o.t")).toBe(true);
  });

  it("should block faggot repeated character evasion", () => {
    expect(containsBlockedContent("fagggot")).toBe(true);
    expect(containsBlockedContent("faaggot")).toBe(true);
  });

  it("should not false-positive on faggot substrings", () => {
    expect(containsBlockedContent("fagotto")).toBe(false);
  });

  it("should allow other profanity (only slurs are blocked)", () => {
    expect(containsBlockedContent("fuck")).toBe(false);
    expect(containsBlockedContent("shit")).toBe(false);
    expect(containsBlockedContent("damn")).toBe(false);
    expect(containsBlockedContent("bitch")).toBe(false);
    expect(containsBlockedContent("asshole")).toBe(false);
  });

  it("should allow clean text without false positives", () => {
    expect(containsBlockedContent("hello world")).toBe(false);
    expect(containsBlockedContent("class")).toBe(false);
    expect(containsBlockedContent("assignment due tomorrow")).toBe(false);
    expect(containsBlockedContent("night")).toBe(false);
    expect(containsBlockedContent("bigger")).toBe(false);
    expect(containsBlockedContent("trigger")).toBe(false);
    expect(containsBlockedContent("digging")).toBe(false);
  });

  it("should allow empty and whitespace-only input", () => {
    expect(containsBlockedContent("")).toBe(false);
    expect(containsBlockedContent("   ")).toBe(false);
  });

  it("should block Unicode combining character bypass attempts", () => {
    // n with combining macron: n̄igger
    expect(containsBlockedContent("n\u0304igger")).toBe(true);
    // precomposed ñ decomposes to n + combining tilde
    expect(containsBlockedContent("ñigger")).toBe(true);
  });

  it("should handle very long input without crashing", () => {
    const longText = "a".repeat(100_000);
    expect(containsBlockedContent(longText)).toBe(false);
  });

  it("should handle special characters without false positives", () => {
    expect(containsBlockedContent("@#$%^&*()")).toBe(false);
    expect(containsBlockedContent("🔥🎉💯")).toBe(false);
  });
});
