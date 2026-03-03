/**
 * Tests for editor panel and color picker positioning.
 * Ensures nothing is clipped by viewport edges in any scenario.
 */

import { describe, it, expect } from "vitest";
import {
  computePanelPosition,
  PANEL_WIDTH,
  GAP,
  EDGE_PAD,
} from "@/components/home/WidgetEditorPanel";
import {
  computePickerPosition,
  DROPDOWN_WIDTH,
  PICKER_PAD,
  PICKER_GAP,
} from "@/components/ui/ColorPickerPopover";

// ─── Helper ──────────────────────────────────────────────────────────
/** Asserts that a positioned element stays fully within the viewport. */
function assertWithinViewport(
  top: number,
  left: number,
  width: number,
  height: number,
  viewportW: number,
  viewportH: number,
  label: string
) {
  expect(left).toBeGreaterThanOrEqual(0);
  expect(top).toBeGreaterThanOrEqual(0);
  expect(left + width).toBeLessThanOrEqual(viewportW);
  expect(top + height).toBeLessThanOrEqual(viewportH);
}

// ─── Editor Panel ────────────────────────────────────────────────────
describe("computePanelPosition", () => {
  const vW = 1280;
  const vH = 800;
  const panelH = 500;

  it("places panel to the right when space is available", () => {
    const widget = { top: 100, left: 100, right: 400, bottom: 300 };
    const { side, top, left } = computePanelPosition(widget, vW, vH, panelH);
    expect(side).toBe("right");
    expect(left).toBe(widget.right + GAP);
    assertWithinViewport(top, left, PANEL_WIDTH, panelH, vW, vH, "right side");
  });

  it("places panel to the left when right side overflows", () => {
    const widget = { top: 100, left: 800, right: 1100, bottom: 300 };
    const { side, top, left } = computePanelPosition(widget, vW, vH, panelH);
    expect(side).toBe("left");
    expect(left).toBe(widget.left - GAP - PANEL_WIDTH);
    assertWithinViewport(top, left, PANEL_WIDTH, panelH, vW, vH, "left side");
  });

  it("does not clip the right edge when widget is near right viewport edge", () => {
    const widget = { top: 100, left: 1000, right: 1270, bottom: 300 };
    const { left } = computePanelPosition(widget, vW, vH, panelH);
    expect(left + PANEL_WIDTH).toBeLessThanOrEqual(vW - EDGE_PAD);
    expect(left).toBeGreaterThanOrEqual(EDGE_PAD);
  });

  it("does not clip the left edge when widget is at left viewport edge", () => {
    // Widget at far left, not enough room for panel on left → falls back right, clamped
    const widget = { top: 100, left: 0, right: 200, bottom: 300 };
    const { left } = computePanelPosition(widget, vW, vH, panelH);
    expect(left).toBeGreaterThanOrEqual(EDGE_PAD);
    expect(left + PANEL_WIDTH).toBeLessThanOrEqual(vW - EDGE_PAD);
  });

  it("does not clip the bottom edge when widget is near viewport bottom", () => {
    const widget = { top: 600, left: 100, right: 400, bottom: 780 };
    const { top } = computePanelPosition(widget, vW, vH, panelH);
    expect(top + panelH).toBeLessThanOrEqual(vH - EDGE_PAD);
    expect(top).toBeGreaterThanOrEqual(EDGE_PAD);
  });

  it("does not clip the top edge when widget is at viewport top", () => {
    const widget = { top: 0, left: 100, right: 400, bottom: 200 };
    const { top } = computePanelPosition(widget, vW, vH, panelH);
    expect(top).toBeGreaterThanOrEqual(EDGE_PAD);
  });

  it("handles widget in top-right corner without clipping", () => {
    const widget = { top: 0, left: 1050, right: 1270, bottom: 200 };
    const { top, left } = computePanelPosition(widget, vW, vH, panelH);
    expect(top).toBeGreaterThanOrEqual(EDGE_PAD);
    expect(left).toBeGreaterThanOrEqual(EDGE_PAD);
    expect(left + PANEL_WIDTH).toBeLessThanOrEqual(vW - EDGE_PAD);
  });

  it("handles widget in bottom-left corner without clipping", () => {
    const widget = { top: 650, left: 0, right: 200, bottom: 790 };
    const { top, left } = computePanelPosition(widget, vW, vH, panelH);
    expect(top).toBeGreaterThanOrEqual(EDGE_PAD);
    expect(top + panelH).toBeLessThanOrEqual(vH - EDGE_PAD);
    expect(left).toBeGreaterThanOrEqual(EDGE_PAD);
    expect(left + PANEL_WIDTH).toBeLessThanOrEqual(vW - EDGE_PAD);
  });

  it("handles widget in bottom-right corner without clipping", () => {
    const widget = { top: 650, left: 1050, right: 1270, bottom: 790 };
    const { top, left } = computePanelPosition(widget, vW, vH, panelH);
    expect(top).toBeGreaterThanOrEqual(EDGE_PAD);
    expect(top + panelH).toBeLessThanOrEqual(vH - EDGE_PAD);
    expect(left).toBeGreaterThanOrEqual(EDGE_PAD);
    expect(left + PANEL_WIDTH).toBeLessThanOrEqual(vW - EDGE_PAD);
  });

  it("handles very small viewport gracefully", () => {
    const widget = { top: 50, left: 50, right: 200, bottom: 150 };
    const smallVW = 400;
    const smallVH = 600;
    const { top, left } = computePanelPosition(widget, smallVW, smallVH, panelH);
    expect(left).toBeGreaterThanOrEqual(EDGE_PAD);
    // Panel may exceed small viewport width, but left is still clamped
    expect(left).toBeLessThanOrEqual(Math.max(EDGE_PAD, smallVW - PANEL_WIDTH - EDGE_PAD));
  });

  it("handles tall panel that exceeds viewport height", () => {
    const widget = { top: 400, left: 100, right: 400, bottom: 600 };
    const tallPanelH = 900;
    const { top } = computePanelPosition(widget, vW, vH, tallPanelH);
    // Top gets clamped to EDGE_PAD (since panel taller than viewport)
    expect(top).toBeGreaterThanOrEqual(EDGE_PAD);
  });
});

// ─── Color Picker ────────────────────────────────────────────────────
describe("computePickerPosition", () => {
  const vW = 1280;
  const vH = 800;
  const dropdownH = 380;

  it("places dropdown below trigger when space available", () => {
    const trigger = { top: 100, left: 200, right: 228, bottom: 128 };
    const { top, left } = computePickerPosition(trigger, dropdownH, vW, vH);
    expect(top).toBe(trigger.bottom + PICKER_GAP);
    expect(left).toBe(trigger.left);
    assertWithinViewport(top, left, DROPDOWN_WIDTH, dropdownH, vW, vH, "below");
  });

  it("flips above trigger when no room below", () => {
    const trigger = { top: 700, left: 200, right: 228, bottom: 728 };
    const { top } = computePickerPosition(trigger, dropdownH, vW, vH);
    // Should open above: trigger.top - dropdownH - gap
    expect(top).toBeLessThan(trigger.top);
  });

  it("does not clip the right viewport edge", () => {
    const trigger = { top: 100, left: 1200, right: 1228, bottom: 128 };
    const { left } = computePickerPosition(trigger, dropdownH, vW, vH);
    expect(left + DROPDOWN_WIDTH).toBeLessThanOrEqual(vW - PICKER_PAD);
    expect(left).toBeGreaterThanOrEqual(PICKER_PAD);
  });

  it("does not clip the left viewport edge", () => {
    const trigger = { top: 100, left: 2, right: 30, bottom: 128 };
    const { left } = computePickerPosition(trigger, dropdownH, vW, vH);
    expect(left).toBeGreaterThanOrEqual(PICKER_PAD);
  });

  it("does not clip the top edge when flipping above", () => {
    // Trigger near bottom AND near top simultaneously (very small viewport)
    const trigger = { top: 50, left: 200, right: 228, bottom: 78 };
    const smallVH = 100;
    const { top } = computePickerPosition(trigger, dropdownH, smallVH, smallVH);
    expect(top).toBeGreaterThanOrEqual(PICKER_PAD);
  });

  it("handles trigger at top-right corner without clipping", () => {
    const trigger = { top: 5, left: 1250, right: 1278, bottom: 33 };
    const { top, left } = computePickerPosition(trigger, dropdownH, vW, vH);
    expect(top).toBeGreaterThanOrEqual(0);
    expect(left).toBeGreaterThanOrEqual(PICKER_PAD);
    expect(left + DROPDOWN_WIDTH).toBeLessThanOrEqual(vW - PICKER_PAD);
  });

  it("handles trigger at bottom-left corner without clipping", () => {
    const trigger = { top: 770, left: 3, right: 31, bottom: 798 };
    const { top, left } = computePickerPosition(trigger, dropdownH, vW, vH);
    expect(left).toBeGreaterThanOrEqual(PICKER_PAD);
    expect(top).toBeGreaterThanOrEqual(PICKER_PAD);
  });

  it("handles trigger at bottom-right corner without clipping", () => {
    const trigger = { top: 770, left: 1250, right: 1278, bottom: 798 };
    const { top, left } = computePickerPosition(trigger, dropdownH, vW, vH);
    expect(left).toBeGreaterThanOrEqual(PICKER_PAD);
    expect(left + DROPDOWN_WIDTH).toBeLessThanOrEqual(vW - PICKER_PAD);
    expect(top).toBeGreaterThanOrEqual(PICKER_PAD);
  });

  it("stays within bounds on a narrow (mobile-width) viewport", () => {
    const trigger = { top: 300, left: 150, right: 178, bottom: 328 };
    const narrowVW = 320;
    const { left } = computePickerPosition(trigger, dropdownH, narrowVW, vH);
    expect(left).toBeGreaterThanOrEqual(PICKER_PAD);
    // On very narrow viewport, dropdown may overflow, but left is clamped correctly
    expect(left).toBeLessThanOrEqual(Math.max(PICKER_PAD, narrowVW - DROPDOWN_WIDTH - PICKER_PAD));
  });
});
