/**
 * Tests for image widget preset helpers.
 * Validates isImageWidgetPreset detection and resolveImagePreset URL resolution.
 */

import { describe, it, expect } from "vitest";
import {
  isImageWidgetPreset,
  resolveImagePreset,
  IMAGE_WIDGET_PRESETS,
} from "@/lib/image-widget-presets";

describe("isImageWidgetPreset", () => {
  it("returns true for a valid preset reference", () => {
    expect(isImageWidgetPreset("preset:iw1")).toBe(true);
  });

  it("returns true for any preset:-prefixed string", () => {
    expect(isImageWidgetPreset("preset:unknown")).toBe(true);
  });

  it("returns false for a regular URL", () => {
    expect(isImageWidgetPreset("https://example.com/image.jpg")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isImageWidgetPreset("")).toBe(false);
  });

  it("returns false for a string containing preset: but not at start", () => {
    expect(isImageWidgetPreset("notpreset:iw1")).toBe(false);
  });
});

describe("resolveImagePreset", () => {
  it("resolves a valid preset ID to the correct URL", () => {
    const result = resolveImagePreset("preset:iw5");
    const expected = IMAGE_WIDGET_PRESETS.find((p) => p.id === "iw5")!.url;
    expect(result).toBe(expected);
  });

  it("resolves the first preset ID correctly", () => {
    const result = resolveImagePreset("preset:iw1");
    expect(result).toBe(IMAGE_WIDGET_PRESETS[0].url);
  });

  it("resolves the last preset ID correctly", () => {
    const last = IMAGE_WIDGET_PRESETS[IMAGE_WIDGET_PRESETS.length - 1];
    const result = resolveImagePreset(`preset:${last.id}`);
    expect(result).toBe(last.url);
  });

  it("falls back to first preset for an invalid ID", () => {
    const result = resolveImagePreset("preset:invalid");
    expect(result).toBe(IMAGE_WIDGET_PRESETS[0].url);
  });

  it("falls back to first preset for empty ID after prefix", () => {
    const result = resolveImagePreset("preset:");
    expect(result).toBe(IMAGE_WIDGET_PRESETS[0].url);
  });
});

describe("IMAGE_WIDGET_PRESETS", () => {
  it("has 30 presets", () => {
    expect(IMAGE_WIDGET_PRESETS).toHaveLength(30);
  });

  it("all IDs use iw prefix", () => {
    for (const preset of IMAGE_WIDGET_PRESETS) {
      expect(preset.id).toMatch(/^iw\d+$/);
    }
  });

  it("all IDs are unique", () => {
    const ids = IMAGE_WIDGET_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all URLs contain unsplash.com", () => {
    for (const preset of IMAGE_WIDGET_PRESETS) {
      expect(preset.url).toContain("images.unsplash.com");
    }
  });

  it("all URLs use 800x600 crop parameters", () => {
    for (const preset of IMAGE_WIDGET_PRESETS) {
      expect(preset.url).toContain("w=800&h=600&fit=crop");
    }
  });
});
