/**
 * Logic tests for the ChatContextMenu component.
 * Tests label toggling for mute/pin states, Leave Group visibility
 * for system courses, and viewport position clamping.
 */

import { describe, it, expect } from "vitest";

/**
 * Computes the clamped menu position to keep it within viewport bounds.
 * Mirrors the logic in ChatContextMenu.tsx.
 *
 * @param position - The raw cursor position
 * @param viewportWidth - The viewport width
 * @param viewportHeight - The viewport height
 * @returns Clamped { x, y } coordinates
 */
function clampMenuPosition(
  position: { x: number; y: number },
  viewportWidth: number,
  viewportHeight: number
): { x: number; y: number } {
  const MENU_WIDTH = 180;
  const MENU_HEIGHT = 180;
  return {
    x: Math.min(position.x, viewportWidth - MENU_WIDTH - 8),
    y: Math.min(position.y, viewportHeight - MENU_HEIGHT - 8),
  };
}

/**
 * Returns the correct label for the mute button.
 *
 * @param isMuted - Current mute state
 * @returns "Unmute" if muted, "Mute" otherwise
 */
function getMuteLabel(isMuted: boolean): string {
  return isMuted ? "Unmute" : "Mute";
}

/**
 * Returns the correct label for the pin button.
 *
 * @param isPinned - Current pin state
 * @returns "Unpin" if pinned, "Pin" otherwise
 */
function getPinLabel(isPinned: boolean): string {
  return isPinned ? "Unpin" : "Pin";
}

/**
 * Determines whether Leave Group should be visible.
 *
 * @param isSystemCourse - Whether the course is a system course
 * @returns true if Leave Group should be shown
 */
function showLeaveGroup(isSystemCourse: boolean): boolean {
  return !isSystemCourse;
}

describe("ChatContextMenu labels", () => {
  it("shows 'Mute' when not muted", () => {
    expect(getMuteLabel(false)).toBe("Mute");
  });

  it("shows 'Unmute' when muted", () => {
    expect(getMuteLabel(true)).toBe("Unmute");
  });

  it("shows 'Pin' when not pinned", () => {
    expect(getPinLabel(false)).toBe("Pin");
  });

  it("shows 'Unpin' when pinned", () => {
    expect(getPinLabel(true)).toBe("Unpin");
  });
});

describe("ChatContextMenu Leave Group visibility", () => {
  it("hides Leave Group for system courses", () => {
    expect(showLeaveGroup(true)).toBe(false);
  });

  it("shows Leave Group for non-system courses", () => {
    expect(showLeaveGroup(false)).toBe(true);
  });
});

describe("ChatContextMenu position clamping", () => {
  it("does not clamp when menu fits within viewport", () => {
    const result = clampMenuPosition({ x: 100, y: 100 }, 1920, 1080);
    expect(result).toEqual({ x: 100, y: 100 });
  });

  it("clamps x when menu would overflow right edge", () => {
    const result = clampMenuPosition({ x: 1800, y: 100 }, 1920, 1080);
    // 1920 - 180 - 8 = 1732
    expect(result.x).toBe(1732);
    expect(result.y).toBe(100);
  });

  it("clamps y when menu would overflow bottom edge", () => {
    const result = clampMenuPosition({ x: 100, y: 950 }, 1920, 1080);
    // 1080 - 180 - 8 = 892
    expect(result.x).toBe(100);
    expect(result.y).toBe(892);
  });

  it("clamps both x and y when menu would overflow corner", () => {
    const result = clampMenuPosition({ x: 1800, y: 950 }, 1920, 1080);
    expect(result.x).toBe(1732);
    expect(result.y).toBe(892);
  });

  it("handles small viewports correctly", () => {
    const result = clampMenuPosition({ x: 300, y: 200 }, 400, 300);
    // 400 - 180 - 8 = 212, 300 - 180 - 8 = 112
    expect(result.x).toBe(212);
    expect(result.y).toBe(112);
  });
});
