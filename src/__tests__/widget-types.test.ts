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
  it("should contain all 9 widget types", () => {
    const expectedTypes: WidgetType[] = [
      "recent-chat",
      "tasks-today",
      "clock",
      "image",
      "class-progress",
      "google-calendar",
      "notes",
      "weather",
      "cal-chat",
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
  it("should return 5 default widgets", () => {
    const { widgets } = getDefaultLayout();
    expect(widgets).toHaveLength(5);
  });

  it("should include tasks-today, notes, clock, weather, and class-progress", () => {
    const { widgets } = getDefaultLayout();
    const types = widgets.map((w) => w.type).sort();
    expect(types).toEqual(["class-progress", "clock", "notes", "tasks-today", "weather"]);
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
