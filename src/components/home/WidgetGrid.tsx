"use client";

/**
 * Responsive grid layout wrapper for Home dashboard widgets.
 * Uses react-grid-layout v2 with responsive breakpoints.
 * Drag, resize, and compaction toggled by editMode prop.
 *
 * @param widgets - Array of widget instances to render
 * @param layouts - Grid layouts per breakpoint
 * @param editMode - Whether editing is active
 * @param onLayoutChange - Callback when layout changes
 * @param onRemoveWidget - Callback to remove a widget
 * @param onWidgetSettings - Callback to open widget settings (receives id + DOMRect)
 * @param onUpdateWidgetConfig - Callback to update a widget's inline config
 * @param selectedWidgetId - ID of widget currently being edited (gets z-41)
 */

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveGridLayout,
  useContainerWidth,
  verticalCompactor,
} from "react-grid-layout";
import type { Layout, LayoutItem, ResponsiveLayouts } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import type { WidgetInstance } from "@/lib/widget-types";
import WidgetContainer from "@/components/home/WidgetContainer";

/** Breakpoint column mapping: lg=8, md=4, sm=2. */
const COLS = { lg: 8, md: 4, sm: 2 };

/** Breakpoint pixel thresholds (lg lowered so laptops with sidebar still get 8 cols). */
const BREAKPOINTS = { lg: 996, md: 768, sm: 0 };

/** Row height in pixels. */
const ROW_HEIGHT = 120;

/** Gap between grid items [horizontal, vertical]. */
const MARGIN: readonly [number, number] = [16, 16];

interface WidgetGridProps {
  widgets: WidgetInstance[];
  layouts: ResponsiveLayouts<string>;
  editMode: boolean;
  onLayoutChange: (currentLayout: Layout, allLayouts: ResponsiveLayouts<string>) => void;
  onRemoveWidget: (id: string) => void;
  onWidgetSettings: (id: string, rect: DOMRect) => void;
  onUpdateWidgetConfig?: (id: string, config: Record<string, string>) => void;
  /** Called when a widget drag starts (to disable parent scroll). */
  onDragStart?: () => void;
  /** Called when a widget drag ends (to re-enable parent scroll). */
  onDragStop?: () => void;
  /** ID of the widget currently open in the editor panel. */
  selectedWidgetId?: string | null;
  /** Whether to accept external drops (drag-from-gallery). */
  acceptDrop?: boolean;
  /** Called when an external item is dropped onto the grid. */
  onExternalDrop?: (item: LayoutItem, e: Event) => void;
}

export default function WidgetGrid({
  widgets,
  layouts,
  editMode,
  onLayoutChange,
  onRemoveWidget,
  onWidgetSettings,
  onUpdateWidgetConfig,
  onDragStart,
  onDragStop,
  selectedWidgetId,
  acceptDrop,
  onExternalDrop,
}: WidgetGridProps) {
  const { width, containerRef, mounted } = useContainerWidth({
    measureBeforeMount: false,
    initialWidth: 1280,
  });

  /**
   * Track whether the initial grid render is complete.
   * On mount, react-grid-layout positions items from (0,0) to their targets,
   * causing a visible slide. We disable CSS transitions until a frame after
   * mount, then add `widget-grid-ready` so drag/resize still animates smoothly.
   */
  const [gridReady, setGridReady] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    const rafId = requestAnimationFrame(() => {
      setGridReady(true);
    });
    return () => cancelAnimationFrame(rafId);
  }, [mounted]);

  /** Memoize widget grid items to prevent unnecessary re-renders. */
  const gridItems = useMemo(
    () =>
      widgets.map((widget) => (
        <div
          key={widget.id}
          className={`relative ${widget.id === selectedWidgetId ? "z-[41]" : ""}`}
        >
          <WidgetContainer
            widget={widget}
            editMode={editMode}
            onRemove={onRemoveWidget}
            onSettings={onWidgetSettings}
            onUpdateConfig={onUpdateWidgetConfig}
            isSelected={widget.id === selectedWidgetId}
          />
        </div>
      )),
    [widgets, editMode, onRemoveWidget, onWidgetSettings, onUpdateWidgetConfig, selectedWidgetId]
  );

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-300 px-6 md:px-10${gridReady ? " widget-grid-ready" : ""}`}
    >
      {mounted && (
        <ResponsiveGridLayout
          className="layout"
          width={width}
          layouts={layouts}
          breakpoints={BREAKPOINTS}
          cols={COLS}
          rowHeight={ROW_HEIGHT}
          margin={MARGIN}
          containerPadding={[0, 0]}
          dragConfig={{ enabled: editMode, cancel: ".no-drag" }}
          resizeConfig={{ enabled: editMode, handles: ["se", "sw", "ne", "nw"] }}
          dropConfig={{ enabled: !!acceptDrop, defaultItem: { w: 2, h: 2 } }}
          onDrop={(_layout, item, e) => { if (item) onExternalDrop?.(item, e); }}
          onDropDragOver={() => ({ w: 2, h: 2 })}
          compactor={verticalCompactor}
          onLayoutChange={onLayoutChange}
          onDragStart={onDragStart}
          onDragStop={onDragStop}
        >
          {gridItems}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}
