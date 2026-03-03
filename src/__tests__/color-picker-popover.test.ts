/**
 * Unit tests for ColorPickerPopover positioning logic.
 * Validates center-aligned dropdown position clamped to viewport edges.
 */
import { describe, it, expect } from "vitest";

const DROPDOWN_W = 288; // w-72 = 18rem = 288px

/**
 * Replicates the updatePosition logic from ColorPickerPopover.
 *
 * @param triggerRect - Bounding rect of the trigger button
 * @param viewportWidth - Window inner width
 * @returns Computed { top, left } for the dropdown
 */
function computePosition(
  triggerRect: { left: number; width: number; bottom: number },
  viewportWidth: number
): { top: number; left: number } {
  let left = triggerRect.left + triggerRect.width / 2 - DROPDOWN_W / 2;
  left = Math.max(8, Math.min(left, viewportWidth - DROPDOWN_W - 8));
  return {
    top: triggerRect.bottom + 6,
    left,
  };
}

describe("ColorPickerPopover positioning", () => {
  it("centers dropdown below trigger in normal viewport", () => {
    const pos = computePosition(
      { left: 200, width: 28, bottom: 100 },
      1024
    );
    expect(pos.top).toBe(106);
    // Center: 200 + 14 - 144 = 70
    expect(pos.left).toBe(70);
  });

  it("clamps to left edge when trigger is near left viewport edge", () => {
    const pos = computePosition(
      { left: 10, width: 28, bottom: 50 },
      1024
    );
    expect(pos.left).toBe(8); // Minimum padding of 8px
  });

  it("clamps to right edge when trigger is near right viewport edge", () => {
    const pos = computePosition(
      { left: 900, width: 28, bottom: 50 },
      960
    );
    // Max: 960 - 288 - 8 = 664
    expect(pos.left).toBe(664);
  });

  it("positions correctly with narrow viewport", () => {
    const pos = computePosition(
      { left: 100, width: 28, bottom: 200 },
      320
    );
    // Centered would be 100+14-144 = -30, clamped to 8
    // But also max is 320-288-8 = 24, so 8 < 24, left = 8
    expect(pos.left).toBe(8);
    expect(pos.top).toBe(206);
  });

  it("handles trigger centered in viewport", () => {
    const pos = computePosition(
      { left: 500, width: 28, bottom: 300 },
      1024
    );
    // Center: 500 + 14 - 144 = 370
    expect(pos.left).toBe(370);
    expect(pos.top).toBe(306);
  });
});
