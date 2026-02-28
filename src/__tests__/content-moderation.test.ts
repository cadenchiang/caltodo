/**
 * Tests for the content moderation module.
 * Verifies n-word blocking with leet speak, spacing, and repetition evasion,
 * and absence of false positives on clean text including other profanity.
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

  it("should allow other profanity (only n-word is blocked)", () => {
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
});
