/**
 * Unit tests for ColorPickerPopover positioning logic.
 * Validates center-aligned dropdown with vertical flip when near viewport bottom.
 */
import { describe, it, expect } from "vitest";

const DROPDOWN_W = 288; // w-72 = 18rem = 288px
const DROPDOWN_H = 380; // approximate max height with color wheel
const PAD = 8;

/**
 * Replicates the updatePosition logic from ColorPickerPopover.
 *
 * @param triggerRect - Bounding rect of the trigger button
 * @param viewportWidth - Window inner width
 * @param viewportHeight - Window inner height
 * @returns Computed { top, left } for the dropdown
 */
function computePosition(
  triggerRect: { left: number; top: number; width: number; bottom: number },
  viewportWidth: number,
  viewportHeight: number
): { top: number; left: number } {
  // Horizontal: center on trigger, clamp to viewport
  let left = triggerRect.left + triggerRect.width / 2 - DROPDOWN_W / 2;
  left = Math.max(PAD, Math.min(left, viewportWidth - DROPDOWN_W - PAD));

  // Vertical: prefer below, flip above if not enough space
  let top: number;
  if (triggerRect.bottom + 6 + DROPDOWN_H > viewportHeight - PAD) {
    top = triggerRect.top - DROPDOWN_H - 6;
    if (top < PAD) top = PAD;
  } else {
    top = triggerRect.bottom + 6;
  }

  return { top, left };
}

describe("ColorPickerPopover positioning", () => {
  it("centers dropdown below trigger in normal viewport", () => {
    const pos = computePosition(
      { left: 200, top: 80, width: 28, bottom: 108 },
      1024,
      900
    );
    expect(pos.top).toBe(114);
    expect(pos.left).toBe(70); // 200 + 14 - 144
  });

  it("clamps to left edge when trigger is near left viewport edge", () => {
    const pos = computePosition(
      { left: 10, top: 30, width: 28, bottom: 58 },
      1024,
      900
    );
    expect(pos.left).toBe(PAD);
  });

  it("clamps to right edge when trigger is near right viewport edge", () => {
    const pos = computePosition(
      { left: 900, top: 30, width: 28, bottom: 58 },
      960,
      900
    );
    expect(pos.left).toBe(664); // 960 - 288 - 8
  });

  it("flips above trigger when not enough space below", () => {
    const pos = computePosition(
      { left: 200, top: 600, width: 28, bottom: 628 },
      1024,
      700
    );
    // Not enough below: 628 + 6 + 380 = 1014 > 692
    // Above: 600 - 380 - 6 = 214
    expect(pos.top).toBe(214);
  });

  it("pins to top when both above and below clip", () => {
    const pos = computePosition(
      { left: 100, top: 100, width: 28, bottom: 128 },
      1024,
      400
    );
    // Below: 128 + 6 + 380 = 514 > 392 → flip above
    // Above: 100 - 380 - 6 = -286 < 8 → pin to 8
    expect(pos.top).toBe(PAD);
  });

  it("positions correctly with narrow viewport", () => {
    const pos = computePosition(
      { left: 100, top: 180, width: 28, bottom: 208 },
      320,
      900
    );
    expect(pos.left).toBe(PAD);
    expect(pos.top).toBe(214);
  });
});
