"use client";

/**
 * Hook for managing the Home dashboard widget layout.
 * Persists layout to localStorage with SSR-safe hydration.
 * Follows the same stale-while-revalidate pattern as TaskContext.
 *
 * @module useWidgetLayout
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { Layout, LayoutItem, ResponsiveLayouts } from "react-grid-layout";
import {
  type WidgetInstance,
  type WidgetType,
  WIDGET_REGISTRY,
  generateWidgetId,
  getDefaultLayout,
} from "@/lib/widget-types";

/** Set of currently supported widget type strings. */
const SUPPORTED_TYPES = new Set<string>(Object.keys(WIDGET_REGISTRY));

/** localStorage key for persisted widget layout. */
const STORAGE_KEY = "home_widget_layout";

/** Schema version for cache invalidation. */
const SCHEMA_VERSION = 2;

/** Persisted layout data shape. */
interface PersistedLayout {
  version: number;
  widgets: WidgetInstance[];
  layouts: ResponsiveLayouts<string>;
  boardTitle: string;
  coverImageUrl: string;
  boardEmoji: string;
  titleFontFamily: string;
  titleTextColor: string;
}

/**
 * Reads persisted layout from localStorage.
 * Returns null if missing, corrupt, or version-mismatched.
 */
function readPersistedLayout(): PersistedLayout | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed: any = JSON.parse(raw);
    if (!Array.isArray(parsed.widgets) || !parsed.layouts) return null;

    // Migrate v1 → v2: add board metadata with defaults
    if (parsed.version === 1) {
      parsed.version = SCHEMA_VERSION;
      parsed.boardTitle = "My Board";
      parsed.coverImageUrl = "";
      parsed.boardEmoji = "📋";
    }

    // Ensure fields exist for v2 layouts saved before they were added
    if (!parsed.boardEmoji) parsed.boardEmoji = "📋";
    if (!parsed.titleFontFamily) parsed.titleFontFamily = "";
    if (!parsed.titleTextColor) parsed.titleTextColor = "";

    if (parsed.version !== SCHEMA_VERSION) return null;

    // Filter out unsupported/legacy widget types (e.g. removed "calendar", "quick-stats")
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
 * Writes layout to localStorage. Silently fails if unavailable.
 *
 * @param widgets - Current widget instances
 * @param layouts - Current grid layouts per breakpoint
 */
function writePersistedLayout(
  widgets: WidgetInstance[],
  layouts: ResponsiveLayouts<string>,
  boardTitle: string,
  coverImageUrl: string,
  boardEmoji: string,
  titleFontFamily: string = "",
  titleTextColor: string = ""
): void {
  if (typeof window === "undefined") return;
  try {
    const data: PersistedLayout = {
      version: SCHEMA_VERSION,
      widgets,
      layouts,
      boardTitle,
      coverImageUrl,
      boardEmoji,
      titleFontFamily,
      titleTextColor,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — non-critical
  }
}

/**
 * Hook for the Home dashboard widget layout.
 * Hydrates from localStorage after mount to avoid SSR mismatch.
 *
 * @returns Layout state and mutation functions
 */
export function useWidgetLayout() {
  const defaults = getDefaultLayout();
  const [widgets, setWidgets] = useState<WidgetInstance[]>(defaults.widgets);
  const [layouts, setLayoutsState] = useState<ResponsiveLayouts<string>>(defaults.layouts);
  const [boardTitle, setBoardTitleState] = useState("My Board");
  const [coverImageUrl, setCoverImageUrlState] = useState("");
  const [boardEmoji, setBoardEmojiState] = useState("📋");
  const [titleFontFamily, setTitleFontFamilyState] = useState("");
  const [titleTextColor, setTitleTextColorState] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // Refs for board metadata so callbacks can read current values without re-creating
  const boardTitleRef = useRef(boardTitle);
  const coverImageUrlRef = useRef(coverImageUrl);
  const boardEmojiRef = useRef(boardEmoji);
  const titleFontFamilyRef = useRef(titleFontFamily);
  const titleTextColorRef = useRef(titleTextColor);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const persisted = readPersistedLayout();
    if (persisted) {
      setWidgets(persisted.widgets);
      setLayoutsState(persisted.layouts);
      const title = persisted.boardTitle || "My Board";
      const cover = persisted.coverImageUrl || "";
      const emoji = persisted.boardEmoji || "📋";
      setBoardTitleState(title);
      setCoverImageUrlState(cover);
      setBoardEmojiState(emoji);
      const tFont = persisted.titleFontFamily || "";
      const tColor = persisted.titleTextColor || "";
      setTitleFontFamilyState(tFont);
      setTitleTextColorState(tColor);
      boardTitleRef.current = title;
      coverImageUrlRef.current = cover;
      boardEmojiRef.current = emoji;
      titleFontFamilyRef.current = tFont;
      titleTextColorRef.current = tColor;
    }
    setHydrated(true);
  }, []);

  /**
   * Updates layouts from react-grid-layout onLayoutChange callback.
   * Persists to localStorage.
   *
   * @param _currentLayout - Current breakpoint layout (unused)
   * @param allLayouts - All breakpoint layouts
   */
  const setLayouts = useCallback(
    (_currentLayout: Layout, allLayouts: ResponsiveLayouts<string>) => {
      setLayoutsState(allLayouts);
      setWidgets((prev) => {
        writePersistedLayout(prev, allLayouts, boardTitleRef.current, coverImageUrlRef.current, boardEmojiRef.current);
        return prev;
      });
    },
    []
  );

  /**
   * Adds a new widget to the dashboard.
   * Places it at position (0, Infinity) so react-grid-layout auto-places it.
   *
   * @param type - Widget type to add
   * @param config - Optional per-widget configuration
   * @returns The ID of the new widget instance
   */
  const addWidget = useCallback(
    (type: WidgetType, config: Record<string, string> = {}): string => {
      const id = generateWidgetId();
      const reg = WIDGET_REGISTRY[type];
      const newWidget: WidgetInstance = { id, type, config };
      const newLayoutItem: LayoutItem = {
        i: id,
        x: 0,
        y: Infinity,
        w: reg.defaultW,
        h: reg.defaultH,
        minW: reg.minW,
        minH: reg.minH,
      };

      setWidgets((prev) => {
        const updated = [...prev, newWidget];
        setLayoutsState((prevLayouts) => {
          const updatedLayouts: ResponsiveLayouts<string> = {};
          for (const bp of Object.keys(prevLayouts)) {
            const existing = prevLayouts[bp] || [];
            updatedLayouts[bp] = [...existing, newLayoutItem];
          }
          // If no breakpoints exist yet, add to "lg"
          if (Object.keys(updatedLayouts).length === 0) {
            updatedLayouts.lg = [newLayoutItem];
          }
          writePersistedLayout(updated, updatedLayouts, boardTitleRef.current, coverImageUrlRef.current, boardEmojiRef.current);
          return updatedLayouts;
        });
        return updated;
      });

      return id;
    },
    []
  );

  /**
   * Removes a widget from the dashboard.
   *
   * @param id - Widget instance ID to remove
   */
  const removeWidget = useCallback((id: string) => {
    setWidgets((prev) => {
      const updated = prev.filter((w) => w.id !== id);
      setLayoutsState((prevLayouts) => {
        const updatedLayouts: ResponsiveLayouts<string> = {};
        for (const bp of Object.keys(prevLayouts)) {
          const existing = prevLayouts[bp] || [];
          updatedLayouts[bp] = existing.filter((l: LayoutItem) => l.i !== id);
        }
        writePersistedLayout(updated, updatedLayouts, boardTitleRef.current, coverImageUrlRef.current, boardEmojiRef.current);
        return updatedLayouts;
      });
      return updated;
    });
  }, []);

  /**
   * Updates configuration for a specific widget.
   *
   * @param id - Widget instance ID
   * @param config - New configuration to merge
   */
  const updateWidgetConfig = useCallback(
    (id: string, config: Record<string, string>) => {
      setWidgets((prev) => {
        const updated = prev.map((w) =>
          w.id === id ? { ...w, config: { ...w.config, ...config } } : w
        );
        setLayoutsState((prevLayouts) => {
          writePersistedLayout(updated, prevLayouts, boardTitleRef.current, coverImageUrlRef.current, boardEmojiRef.current);
          return prevLayouts;
        });
        return updated;
      });
    },
    []
  );

  /**
   * Merges config into ALL widgets (for "apply font to all" feature).
   *
   * @param config - Config keys to merge into every widget
   */
  const updateAllWidgetConfigs = useCallback(
    (config: Record<string, string>) => {
      setWidgets((prev) => {
        const updated = prev.map((w) => ({
          ...w,
          config: { ...w.config, ...config },
        }));
        setLayoutsState((prevLayouts) => {
          writePersistedLayout(updated, prevLayouts, boardTitleRef.current, coverImageUrlRef.current, boardEmojiRef.current);
          return prevLayouts;
        });
        return updated;
      });
    },
    []
  );

  /**
   * Sets the board title and persists to localStorage.
   *
   * @param title - New board title (max 50 chars)
   */
  const setBoardTitle = useCallback((title: string) => {
    const trimmed = title.slice(0, 50);
    setBoardTitleState(trimmed);
    boardTitleRef.current = trimmed;
    setWidgets((prev) => {
      setLayoutsState((prevLayouts) => {
        writePersistedLayout(prev, prevLayouts, trimmed, coverImageUrlRef.current, boardEmojiRef.current);
        return prevLayouts;
      });
      return prev;
    });
  }, []);

  /**
   * Sets the cover image URL and persists to localStorage.
   *
   * @param url - Public URL of the cover image, or "" to remove
   */
  const setCoverImageUrl = useCallback((url: string) => {
    setCoverImageUrlState(url);
    coverImageUrlRef.current = url;
    setWidgets((prev) => {
      setLayoutsState((prevLayouts) => {
        writePersistedLayout(prev, prevLayouts, boardTitleRef.current, url, boardEmojiRef.current);
        return prevLayouts;
      });
      return prev;
    });
  }, []);

  /**
   * Sets the board emoji icon and persists to localStorage.
   *
   * @param emoji - Single emoji character
   */
  const setBoardEmoji = useCallback((emoji: string) => {
    setBoardEmojiState(emoji);
    boardEmojiRef.current = emoji;
    setWidgets((prev) => {
      setLayoutsState((prevLayouts) => {
        writePersistedLayout(prev, prevLayouts, boardTitleRef.current, coverImageUrlRef.current, emoji);
        return prevLayouts;
      });
      return prev;
    });
  }, []);

  /**
   * Sets the title font and color, then persists.
   *
   * @param fontFamily - CSS font-family string
   * @param textColor - CSS color string
   */
  const setTitleConfig = useCallback((fontFamily: string, textColor: string) => {
    setTitleFontFamilyState(fontFamily);
    setTitleTextColorState(textColor);
    titleFontFamilyRef.current = fontFamily;
    titleTextColorRef.current = textColor;
    setWidgets((prev) => {
      setLayoutsState((prevLayouts) => {
        writePersistedLayout(prev, prevLayouts, boardTitleRef.current, coverImageUrlRef.current, boardEmojiRef.current, fontFamily, textColor);
        return prevLayouts;
      });
      return prev;
    });
  }, []);

  return {
    widgets,
    layouts,
    hydrated,
    boardTitle,
    coverImageUrl,
    boardEmoji,
    titleFontFamily,
    titleTextColor,
    setLayouts,
    addWidget,
    removeWidget,
    updateWidgetConfig,
    updateAllWidgetConfigs,
    setBoardTitle,
    setCoverImageUrl,
    setBoardEmoji,
    setTitleConfig,
  };
}
