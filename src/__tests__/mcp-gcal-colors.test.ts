/**
 * Tests for Google Calendar color resolution.
 * Covers palette names, plain-color aliases, raw ids, and rejection of
 * anything Google would answer with an opaque 400.
 */

import { describe, it, expect } from "vitest";
import {
  resolveColorId,
  describeColor,
  GCAL_COLOR_NAMES,
  ACCEPTED_COLOR_WORDS,
} from "@/lib/mcp/gcal-colors";

describe("GCAL_COLOR_NAMES", () => {
  it("covers exactly Google's eleven event colors", () => {
    expect(Object.keys(GCAL_COLOR_NAMES)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
    ]);
  });
});

describe("resolveColorId", () => {
  it("resolves each official palette name to its id", () => {
    for (const [id, name] of Object.entries(GCAL_COLOR_NAMES)) {
      expect(resolveColorId(name)).toBe(id);
    }
  });

  it("matches names case-insensitively and ignores whitespace", () => {
    expect(resolveColorId("  peacock  ")).toBe("7");
    expect(resolveColorId("TOMATO")).toBe("11");
  });

  it("resolves plain-color aliases", () => {
    expect(resolveColorId("blue")).toBe("7");
    expect(resolveColorId("red")).toBe("11");
    expect(resolveColorId("green")).toBe("10");
    expect(resolveColorId("purple")).toBe("3");
  });

  it("resolves a multi-word alias", () => {
    expect(resolveColorId("light blue")).toBe("1");
    expect(resolveColorId("dark green")).toBe("10");
  });

  it("passes through a valid raw id", () => {
    expect(resolveColorId("7")).toBe("7");
    expect(resolveColorId("11")).toBe("11");
  });

  it("rejects a numeric id outside the palette", () => {
    expect(() => resolveColorId("0")).toThrow(/1-11/);
    expect(() => resolveColorId("12")).toThrow(/1-11/);
    expect(() => resolveColorId("99")).toThrow(/1-11/);
  });

  it("rejects an unknown color word and lists the valid names", () => {
    expect(() => resolveColorId("chartreuse")).toThrow(/Unknown color/);
    expect(() => resolveColorId("chartreuse")).toThrow(/Peacock/);
  });

  it("rejects an empty or whitespace-only color", () => {
    expect(() => resolveColorId("")).toThrow(/required/);
    expect(() => resolveColorId("   ")).toThrow(/required/);
  });

  it("resolves every word it advertises as accepted", () => {
    for (const word of ACCEPTED_COLOR_WORDS) {
      const id = resolveColorId(word);
      expect(id).not.toBeNull();
      expect(GCAL_COLOR_NAMES[id as string]).toBeDefined();
    }
  });

  it("returns null for the reset words, clearing the event's own color", () => {
    for (const word of ["default", "none", "clear", "reset", "no color"]) {
      expect(resolveColorId(word)).toBeNull();
    }
  });

  it("matches reset words case-insensitively", () => {
    expect(resolveColorId("  Default ")).toBeNull();
  });
});

describe("describeColor", () => {
  it("names a known colorId", () => {
    expect(describeColor("7")).toBe("Peacock");
  });

  it("describes an unset color as the calendar default", () => {
    expect(describeColor(null)).toBe("default (calendar color)");
    expect(describeColor(undefined)).toBe("default (calendar color)");
  });

  it("falls back to the raw id for a color Google added later", () => {
    expect(describeColor("42")).toBe("colorId 42");
  });
});
