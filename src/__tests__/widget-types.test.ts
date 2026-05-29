/**
 * Tests for the widget type registry and helpers.
 */

import { describe, it, expect } from "vitest";
import {
  WIDGET_REGISTRY,
  generateWidgetId,
  getDefaultLayout,
  type WidgetType,
} from "@/lib/widget-types";

describe("WIDGET_REGISTRY", () => {
  it("should contain all widget types", () => {
    const expectedTypes: WidgetType[] = [
      "profile",
      "intro",
      "tasks-today",
      "image",
      "class-progress",
      "google-calendar",
      "weather",
      "pomodoro",
      "weekly-heatmap",
      "spotify",
      "daily-reminders",
      "courses",
    ];
    expect(Object.keys(WIDGET_REGISTRY).sort()).toEqual(expectedTypes.sort());
  });

  it("should have valid size constraints for every widget type", () => {
    for (const config of Object.values(WIDGET_REGISTRY)) {
      expect(config.minW).toBeGreaterThan(0);
      expect(config.minH).toBeGreaterThan(0);
      expect(config.maxW).toBeGreaterThanOrEqual(config.minW);
      expect(config.maxH).toBeGreaterThanOrEqual(config.minH);
      expect(config.defaultW).toBeGreaterThanOrEqual(config.minW);
      expect(config.defaultW).toBeLessThanOrEqual(config.maxW);
      expect(config.defaultH).toBeGreaterThanOrEqual(config.minH);
      expect(config.defaultH).toBeLessThanOrEqual(config.maxH);
    }
  });

  it("should have non-empty label and description for every widget type", () => {
    for (const config of Object.values(WIDGET_REGISTRY)) {
      expect(config.label.length).toBeGreaterThan(0);
      expect(config.description.length).toBeGreaterThan(0);
      expect(config.iconName.length).toBeGreaterThan(0);
    }
  });
});

describe("generateWidgetId", () => {
  it("should return a string starting with 'w-'", () => {
    const id = generateWidgetId();
    expect(id).toMatch(/^w-/);
  });

  it("should generate unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateWidgetId()));
    expect(ids.size).toBe(100);
  });
});

describe("getDefaultLayout", () => {
  it("should return the curated starter widget set", () => {
    const { widgets } = getDefaultLayout();
    expect(widgets.length).toBeGreaterThan(0);
    const types = widgets.map((w) => w.type);
    expect(types).toContain("profile");
    expect(types).toContain("spotify");
  });

  it("should return a layout for every breakpoint", () => {
    const { layouts } = getDefaultLayout();
    expect(layouts.lg!.length).toBeGreaterThan(0);
    expect(layouts.md!.length).toBeGreaterThan(0);
    expect(layouts.sm!.length).toBeGreaterThan(0);
  });

  it("should have a layout entry for every widget", () => {
    const { widgets, layouts } = getDefaultLayout();
    const lgLayout = layouts.lg;
    expect(lgLayout).toBeDefined();
    expect(lgLayout!.length).toBe(widgets.length);

    const layoutIds = new Set(lgLayout!.map((l) => l.i));
    for (const widget of widgets) {
      expect(layoutIds.has(widget.id)).toBe(true);
    }
  });

  it("should have valid layout positions", () => {
    const { layouts } = getDefaultLayout();
    for (const item of layouts.lg!) {
      expect(item.x).toBeGreaterThanOrEqual(0);
      expect(item.y).toBeGreaterThanOrEqual(0);
      expect(item.w).toBeGreaterThan(0);
      expect(item.h).toBeGreaterThan(0);
    }
  });
});
