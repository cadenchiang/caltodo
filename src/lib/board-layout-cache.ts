/**
 * localStorage read/write helpers for board layout.
 * localStorage serves as a passive read cache (stale-while-revalidate).
 * The server is the source of truth — this module only caches locally.
 *
 * @module board-layout-cache
 */

import type { LayoutItem } from "react-grid-layout";
import type { WidgetInstance } from "@/lib/widget-types";
import { WIDGET_REGISTRY, type WidgetType } from "@/lib/widget-types";
import {
  STORAGE_KEY,
  SCHEMA_VERSION,
  OLD_LG_COLS,
  NEW_LG_COLS,
  DEFAULT_COVER_HEIGHT,
  DEFAULT_COVER_POSITION_Y,
  type PersistedLayout,
} from "@/lib/board-layout-types";

/** Set of currently supported widget type strings. */
const SUPPORTED_TYPES = new Set<string>(Object.keys(WIDGET_REGISTRY));

/**
 * Reads persisted layout from localStorage.
 * Returns null if missing, corrupt, or version-mismatched.
 * Handles migrations from v1 → v2 → v3 and sanitizes corrupt fields.
 *
 * @returns Parsed PersistedLayout or null if unavailable/invalid
 */
export function readPersistedLayout(): PersistedLayout | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed: any = JSON.parse(raw);
    if (!Array.isArray(parsed.widgets) || !parsed.layouts) return null;

    // Migrate v1 → v2: add board metadata with defaults
    if (parsed.version === 1) {
      parsed.version = 2;
      parsed.boardTitle = "My Board";
      parsed.coverImageUrl = "";
      parsed.boardEmoji = "\u{1F4D6}";
    }

    // Ensure fields exist for v2 layouts saved before they were added
    if (!parsed.boardDescription) parsed.boardDescription = "The secret of getting ahead is getting started.";
    if (!parsed.boardEmoji) parsed.boardEmoji = "\u{1F4D6}";
    if (!parsed.iconSize) parsed.iconSize = "md";

    // Sanitize corrupted boardEmoji — reset to default if it looks like
    // a size label (e.g. "xl", "sm") or other plain ASCII text.
    if (
      parsed.boardEmoji &&
      !parsed.boardEmoji.startsWith("lucide:") &&
      /^[a-zA-Z0-9_-]+$/.test(parsed.boardEmoji)
    ) {
      parsed.boardEmoji = "\u{1F4D6}";
    }

    // Sanitize corrupted boardDescription — reset to default if it looks like a URL
    if (
      typeof parsed.boardDescription === "string" &&
      (parsed.boardDescription.startsWith("http://") ||
        parsed.boardDescription.startsWith("https://"))
    ) {
      parsed.boardDescription = "The secret of getting ahead is getting started.";
    }
    if (!parsed.titleFontFamily) parsed.titleFontFamily = "";
    if (!parsed.titleTextColor) parsed.titleTextColor = "";
    if (!parsed.titleFontSize) parsed.titleFontSize = "lg";
    if (parsed.coverHeight == null) parsed.coverHeight = DEFAULT_COVER_HEIGHT;
    if (parsed.coverPositionY == null) parsed.coverPositionY = DEFAULT_COVER_POSITION_Y;

    // Migrate v2 → v3: scale lg layout positions from 6-col to 8-col grid
    if (parsed.version === 2) {
      parsed.version = 3;
      const lgLayout = parsed.layouts.lg;
      if (Array.isArray(lgLayout)) {
        parsed.layouts.lg = lgLayout.map((item: LayoutItem) => {
          const widgetDef = parsed.widgets.find((w: WidgetInstance) => w.id === item.i);
          const reg = widgetDef ? WIDGET_REGISTRY[widgetDef.type as WidgetType] : null;
          const minW = reg?.minW ?? 1;
          const newW = Math.max(Math.ceil(item.w * NEW_LG_COLS / OLD_LG_COLS), minW);
          const newX = Math.round(item.x * NEW_LG_COLS / OLD_LG_COLS);
          const clampedX = Math.min(newX, NEW_LG_COLS - newW);
          return { ...item, x: Math.max(0, clampedX), w: newW };
        });
      }
    }

    if (parsed.version !== SCHEMA_VERSION) return null;

    // Filter out unsupported/legacy widget types
    const validWidgets = parsed.widgets.filter(
      (w: WidgetInstance) => SUPPORTED_TYPES.has(w.type)
    );
    const removedIds = new Set(
      parsed.widgets
        .filter((w: WidgetInstance) => !SUPPORTED_TYPES.has(w.type))
        .map((w: WidgetInstance) => w.id)
    );
    if (removedIds.size > 0) {
      parsed.widgets = validWidgets;
      for (const bp of Object.keys(parsed.layouts)) {
        parsed.layouts[bp] = (parsed.layouts[bp] || []).filter(
          (l: LayoutItem) => !removedIds.has(l.i)
        );
      }
    }

    return parsed as PersistedLayout;
  } catch {
    return null;
  }
}

/**
 * Writes a PersistedLayout to localStorage as a cache.
 * This is NOT the source of truth — the server is authoritative.
 * Silently fails if localStorage is unavailable or full.
 *
 * @param data - The full PersistedLayout object to cache
 */
export function writeLayoutCache(data: PersistedLayout): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — non-critical
  }
}
