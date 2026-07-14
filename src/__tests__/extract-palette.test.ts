/**
 * Tests for the extract-palette utility functions.
 * Tests pure functions that don't require browser Canvas/Image APIs.
 */

import { describe, it, expect } from "vitest";
import {
  rgbToHex,
  colorDistance,
  isBoringColor,
  quantizePixels,
} from "@/lib/extract-palette";

describe("rgbToHex", () => {
  it("should convert black to #000000", () => {
    expect(rgbToHex(0, 0, 0)).toBe("#000000");
  });

  it("should convert white to #ffffff", () => {
    expect(rgbToHex(255, 255, 255)).toBe("#ffffff");
  });

  it("should convert a typical color correctly", () => {
    // (59, 130, 246) === 0x3b82f6. (A prior brand-color find/replace had
    // wrongly rewritten this expected literal to the new brand hex.)
    expect(rgbToHex(59, 130, 246)).toBe("#3b82f6");
  });

  it("should pad single-digit hex values with leading zero", () => {
    expect(rgbToHex(0, 15, 1)).toBe("#000f01");
  });

  it("should round fractional values", () => {
    expect(rgbToHex(128.7, 64.2, 0)).toBe("#814000");
  });
});

describe("colorDistance", () => {
  it("should return 0 for identical colors", () => {
    expect(colorDistance([100, 100, 100], [100, 100, 100])).toBe(0);
  });

  it("should return correct distance for black and white", () => {
    const dist = colorDistance([0, 0, 0], [255, 255, 255]);
    expect(dist).toBeCloseTo(Math.sqrt(3 * 255 * 255), 1);
  });

  it("should return correct distance for simple case", () => {
    const dist = colorDistance([0, 0, 0], [3, 4, 0]);
    expect(dist).toBe(5);
  });

  it("should be symmetric", () => {
    const a: [number, number, number] = [50, 100, 200];
    const b: [number, number, number] = [200, 50, 100];
    expect(colorDistance(a, b)).toBe(colorDistance(b, a));
  });
});

describe("isBoringColor", () => {
  it("should flag pure black as boring", () => {
    expect(isBoringColor(0, 0, 0)).toBe(true);
  });

  it("should flag pure white as boring", () => {
    expect(isBoringColor(255, 255, 255)).toBe(true);
  });

  it("should flag near-white colors as boring", () => {
    expect(isBoringColor(240, 240, 240)).toBe(true);
  });

  it("should flag near-black colors as boring", () => {
    expect(isBoringColor(15, 15, 15)).toBe(true);
  });

  it("should allow mid-tone colors", () => {
    expect(isBoringColor(100, 150, 200)).toBe(false);
  });

  it("should allow saturated colors", () => {
    expect(isBoringColor(59, 130, 246)).toBe(false);
  });
});

describe("quantizePixels", () => {
  /**
   * Creates a fake RGBA pixel array filled with a single color.
   *
   * @param r - Red channel
   * @param g - Green channel
   * @param b - Blue channel
   * @param pixelCount - Number of pixels to create
   * @returns Uint8ClampedArray of RGBA data
   */
  function makePixels(
    colors: [number, number, number][],
    countsPerColor: number[]
  ): Uint8ClampedArray {
    const totalPixels = countsPerColor.reduce((a, b) => a + b, 0);
    const arr = new Uint8ClampedArray(totalPixels * 4);
    let offset = 0;
    for (let ci = 0; ci < colors.length; ci++) {
      const [r, g, b] = colors[ci];
      for (let i = 0; i < countsPerColor[ci]; i++) {
        arr[offset] = r;
        arr[offset + 1] = g;
        arr[offset + 2] = b;
        arr[offset + 3] = 255; // fully opaque
        offset += 4;
      }
    }
    return arr;
  }

  it("should return empty array for all-white pixels", () => {
    const pixels = makePixels([[255, 255, 255]], [100]);
    const result = quantizePixels(pixels, 5);
    expect(result).toHaveLength(0);
  });

  it("should return empty array for all-black pixels", () => {
    const pixels = makePixels([[0, 0, 0]], [100]);
    const result = quantizePixels(pixels, 5);
    expect(result).toHaveLength(0);
  });

  it("should return empty array for all-transparent pixels", () => {
    const arr = new Uint8ClampedArray(400);
    // All zeros = transparent black
    const result = quantizePixels(arr, 5);
    expect(result).toHaveLength(0);
  });

  it("should extract a single dominant color", () => {
    const pixels = makePixels([[59, 130, 246]], [500]);
    const result = quantizePixels(pixels, 5);
    expect(result.length).toBeGreaterThanOrEqual(1);
    // Should be close to the input color (within quantization rounding)
    const [r, g, b] = result[0];
    expect(r).toBeCloseTo(59, -1);
    expect(g).toBeCloseTo(130, -1);
    expect(b).toBeCloseTo(246, -1);
  });

  it("should extract multiple distinct colors", () => {
    const pixels = makePixels(
      [
        [200, 50, 50],   // red
        [50, 200, 50],   // green
        [50, 50, 200],   // blue
      ],
      [200, 200, 200]
    );
    const result = quantizePixels(pixels, 5);
    expect(result.length).toBe(3);
  });

  it("should respect the count limit", () => {
    const pixels = makePixels(
      [
        [200, 50, 50],
        [50, 200, 50],
        [50, 50, 200],
        [200, 200, 50],
        [200, 50, 200],
      ],
      [100, 100, 100, 100, 100]
    );
    const result = quantizePixels(pixels, 3);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it("should sort by frequency (most common first)", () => {
    const pixels = makePixels(
      [
        [50, 50, 200],   // blue — less common
        [200, 50, 50],   // red — most common
      ],
      [100, 500]
    );
    const result = quantizePixels(pixels, 5);
    expect(result.length).toBeGreaterThanOrEqual(2);
    // First color should be closer to red (the dominant one)
    const [r1] = result[0];
    expect(r1).toBeGreaterThan(150);
  });

  it("should deduplicate similar colors", () => {
    // Two very similar blues should collapse into one
    const pixels = makePixels(
      [
        [50, 50, 200],
        [55, 52, 205],
      ],
      [300, 300]
    );
    const result = quantizePixels(pixels, 5);
    expect(result.length).toBe(1);
  });
});
