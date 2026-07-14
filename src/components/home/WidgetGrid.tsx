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

import { useCallback, useEffect, useMemo, useState } from "react";
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

/** Hard ceiling on rows — matches MAX_ROWS in HomeBoard / useWidgetLayout.
 *  react-grid-layout's `maxRows` prop refuses moves/resizes that would
 *  push the grid past this number of rows, so widgets can never resize
 *  off the visible board. */
const MAX_ROWS = 8;

/** Breakpoint pixel thresholds (lg lowered so laptops with sidebar still get 8 cols). */
const BREAKPOINTS = { lg: 996, md: 768, sm: 0 };

/** Target number of rows that should fit inside the visible board
 *  area. Combined with the dynamic container height below, this gives
 *  every row roughly `(containerHeight - paddings) / TARGET_ROWS` px
 *  so the grid always fills the viewport without page scroll. Matches
 *  the MAX_ROWS cap enforced in HomeBoard.hasRoomFor. */
const TARGET_ROWS = 8;

/** Floor row height in pixels so the board doesn't collapse to nothing
 *  on very short windows. */
const MIN_ROW_HEIGHT = 56;

/** Gap between grid items [horizontal, vertical]. Tight tiling so the
 *  wallpaper background only peeks through between cards — the cards
 *  read as a connected mosaic, like an iPhone home screen. */
const MARGIN: readonly [number, number] = [12, 12];

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
  /** Called when a widget resize starts (to mark genuine interaction). */
  onResizeStart?: () => void;
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
  onResizeStart,
  selectedWidgetId,
  acceptDrop,
  onExternalDrop,
}: WidgetGridProps) {
  const { width, containerRef, mounted } = useContainerWidth({
    measureBeforeMount: false,
    initialWidth: 1280,
  });

  /**
   * Available height for the grid. Measured from the PARENT of the
   * grid container — that parent is the `flex-1 min-h-0` wrapper from
   * HomeBoard, so its height reflects whatever vertical space the
   * board area actually has. Measuring `containerRef.current` itself
   * would loop: the grid sizes to its content (rowHeight × rows), so
   * `clientHeight` of containerRef just gives back the grid's own
   * height. That circular read was pinning rows to MIN_ROW_HEIGHT.
   */
  const [availableHeight, setAvailableHeight] = useState(720);
  useEffect(() => {
    const el = containerRef.current;
    const parent = el?.parentElement;
    if (!parent) return;
    const update = () => setAvailableHeight(parent.clientHeight || 720);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [containerRef]);

  /**
   * Per-row height: spread the available height across TARGET_ROWS,
   * subtracting the vertical gutters PLUS a small safety margin so
   * sub-pixel rounding / react-grid-layout's internal padding never
   * pushes the grid one pixel below the viewport. Floor at
   * MIN_ROW_HEIGHT to avoid pathologically tiny rows on short windows.
   */
  const rowHeight = useMemo(() => {
    const gutters = MARGIN[1] * (TARGET_ROWS + 1);
    const SAFETY = 8;
    const h = Math.floor((availableHeight - gutters - SAFETY) / TARGET_ROWS);
    return Math.max(MIN_ROW_HEIGHT, h);
  }, [availableHeight]);

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

  /**
   * Sanitize incoming layouts before handing them to react-grid-layout.
   * Each item must:
   *   - have minW/minH ≥ 2 so resize handles refuse to shrink past 2×2
   *   - have maxW capped to the breakpoint's column count and maxH
   *     capped to MAX_ROWS so resize handles refuse to grow past the
   *     visible board edges
   *   - have w/h actually clamped into those bounds (handles historical
   *     saved layouts that exceed today's limits)
   *   - have x/y clamped so the resulting rect stays inside the grid
   *
   * After clamping, run a vertical compaction pass: items are sorted
   * by (y, x) and each is pushed up to the first non-colliding row.
   * This is the "smart rerender" — if a saved layout overflows the
   * board (e.g. MAX_ROWS shrunk after the layout was saved), gaps get
   * collapsed automatically instead of the bottom widgets clipping.
   */
  const clampedLayouts = useMemo<ResponsiveLayouts<string>>(() => {
    const out: ResponsiveLayouts<string> = {};
    for (const bp of Object.keys(layouts)) {
      const cols = (COLS as Record<string, number>)[bp] ?? 8;

      // First pass: clamp individual items.
      const items = (layouts[bp] ?? []).map((it) => {
        const minW = Math.min(cols, Math.max(2, it.minW ?? 2));
        const minH = Math.min(MAX_ROWS, Math.max(2, it.minH ?? 2));
        const maxW = cols;
        const maxH = MAX_ROWS;
        const w = Math.min(maxW, Math.max(minW, it.w ?? 2));
        const h = Math.min(maxH, Math.max(minH, it.h ?? 2));
        const x = Math.min(cols - w, Math.max(0, it.x ?? 0));
        const y = Math.min(MAX_ROWS - h, Math.max(0, it.y ?? 0));
        return { ...it, x, y, w, h, minW, minH, maxW, maxH };
      });

      // Second pass: vertical compaction. Iterate items in (y, x)
      // order; for each, walk up the column from y=0 and place it at
      // the first row that doesn't collide with already-placed
      // items.
      items.sort((a, b) => (a.y - b.y) || (a.x - b.x));
      const placed: typeof items = [];
      for (const it of items) {
        let y = 0;
        while (true) {
          const collides = placed.some((p) => {
            return !(
              it.x + it.w <= p.x ||
              p.x + p.w <= it.x ||
              y + it.h <= p.y ||
              p.y + p.h <= y
            );
          });
          if (!collides) break;
          y++;
        }
        // Cap final y so a tall widget can't push past MAX_ROWS.
        const cappedY = Math.min(MAX_ROWS - it.h, y);
        placed.push({ ...it, y: cappedY });
      }
      out[bp] = placed;
    }
    return out;
  }, [layouts]);

  /**
   * Intercept every layout change react-grid-layout fires (drag, resize,
   * swap, compact). For each breakpoint:
   *   1. Clamp items into [0, cols] × [0, MAX_ROWS] with min 2×2
   *   2. Run a vertical compaction pass (same algo as clampedLayouts)
   *   3. Pass the post-compaction layouts up
   *
   * If a user drags a widget below row MAX_ROWS the compactor pulls it
   * back into the visible board. Resize handles already refuse to grow
   * past maxH/maxW via the clamp pass, but if anything slips through
   * (e.g. a swap that bumps a neighbor down), this hook catches it.
   */
  const handleLayoutChange = useCallback(
    (current: Layout, all: ResponsiveLayouts<string>) => {
      const safe: ResponsiveLayouts<string> = {};
      for (const bp of Object.keys(all)) {
        const cols = (COLS as Record<string, number>)[bp] ?? 8;
        const items = (all[bp] ?? []).map((it) => {
          const minW = Math.min(cols, Math.max(2, it.minW ?? 2));
          const minH = Math.min(MAX_ROWS, Math.max(2, it.minH ?? 2));
          const w = Math.min(cols, Math.max(minW, it.w ?? 2));
          const h = Math.min(MAX_ROWS, Math.max(minH, it.h ?? 2));
          const x = Math.min(cols - w, Math.max(0, it.x ?? 0));
          const y = Math.min(MAX_ROWS - h, Math.max(0, it.y ?? 0));
          return { ...it, x, y, w, h, minW, minH, maxW: cols, maxH: MAX_ROWS };
        });

        items.sort((a, b) => (a.y - b.y) || (a.x - b.x));
        const placed: typeof items = [];
        for (const it of items) {
          let y = 0;
          while (true) {
            const collides = placed.some((p) => {
              return !(
                it.x + it.w <= p.x ||
                p.x + p.w <= it.x ||
                y + it.h <= p.y ||
                p.y + p.h <= y
              );
            });
            if (!collides) break;
            y++;
          }
          placed.push({ ...it, y: Math.min(MAX_ROWS - it.h, y) });
        }
        safe[bp] = placed;
      }
      onLayoutChange(current, safe);
    },
    [onLayoutChange]
  );

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
      className={`h-full overflow-hidden px-6 md:px-10${gridReady ? " widget-grid-ready" : ""}`}
    >
      {mounted && (
        <ResponsiveGridLayout
          className="layout"
          width={width}
          layouts={clampedLayouts}
          breakpoints={BREAKPOINTS}
          cols={COLS}
          rowHeight={rowHeight}
          margin={MARGIN}
          containerPadding={[0, 0]}
          maxRows={MAX_ROWS}
          dragConfig={{ enabled: editMode, cancel: ".no-drag" }}
          resizeConfig={{ enabled: editMode, handles: ["se", "sw", "ne", "nw"] }}
          dropConfig={{ enabled: !!acceptDrop, defaultItem: { w: 2, h: 2 } }}
          onDrop={(_layout, item, e) => { if (item) onExternalDrop?.(item, e); }}
          onDropDragOver={() => ({ w: 2, h: 2 })}
          compactor={verticalCompactor}
          onLayoutChange={handleLayoutChange}
          onDragStart={onDragStart}
          onDragStop={onDragStop}
          onResizeStart={onResizeStart}
        >
          {gridItems}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}
