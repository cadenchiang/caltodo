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
import { fetchServerLayout, debouncedServerSave } from "@/lib/board-layout-sync";

/** Set of currently supported widget type strings. */
const SUPPORTED_TYPES = new Set<string>(Object.keys(WIDGET_REGISTRY));

/** localStorage key for persisted widget layout. */
const STORAGE_KEY = "home_widget_layout";

/** Schema version for cache invalidation. Bump to reset all users to new defaults. */
const SCHEMA_VERSION = 10;

/** Old lg column count (v2) and new lg column count (v3). */
const OLD_LG_COLS = 6;
const NEW_LG_COLS = 8;

/** Persisted layout data shape. */
interface PersistedLayout {
  version: number;
  widgets: WidgetInstance[];
  layouts: ResponsiveLayouts<string>;
  boardTitle: string;
  boardDescription: string;
  coverImageUrl: string;
  boardEmoji: string;
  iconSize: string;
  titleFontFamily: string;
  titleTextColor: string;
  titleFontSize: string;
  coverHeight: number;
  coverPositionY: number;
  /** Epoch ms timestamp for comparing localStorage vs server freshness. */
  updatedAt: number;
}

/** Default banner height in pixels. */
const DEFAULT_COVER_HEIGHT = 220;

/** Default vertical image position (percentage, 0=top, 100=bottom). */
const DEFAULT_COVER_POSITION_Y = 50;

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
          // Clamp so widget doesn't overflow the grid
          const clampedX = Math.min(newX, NEW_LG_COLS - newW);
          return { ...item, x: Math.max(0, clampedX), w: newW };
        });
      }
    }

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
 * Writes layout to localStorage and triggers a debounced server save.
 * Silently fails if localStorage is unavailable.
 *
 * @param widgets - Current widget instances
 * @param layouts - Current grid layouts per breakpoint
 */
function writePersistedLayout(
  widgets: WidgetInstance[],
  layouts: ResponsiveLayouts<string>,
  boardTitle: string,
  boardDescription: string,
  coverImageUrl: string,
  boardEmoji: string,
  iconSize: string = "md",
  titleFontFamily: string = "",
  titleTextColor: string = "",
  titleFontSize: string = "lg",
  coverHeight: number = DEFAULT_COVER_HEIGHT,
  coverPositionY: number = DEFAULT_COVER_POSITION_Y
): void {
  if (typeof window === "undefined") return;
  const data: PersistedLayout = {
    version: SCHEMA_VERSION,
    widgets,
    layouts,
    boardTitle,
    boardDescription,
    coverImageUrl,
    boardEmoji,
    iconSize,
    titleFontFamily,
    titleTextColor,
    titleFontSize,
    coverHeight,
    coverPositionY,
    updatedAt: Date.now(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — non-critical
  }
  // Fire debounced write to server (500ms batching for rapid changes like dragging)
  debouncedServerSave(data);
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
  const [boardDescription, setBoardDescriptionState] = useState("The secret of getting ahead is getting started.");
  const [coverImageUrl, setCoverImageUrlState] = useState("preset:cal");
  const [boardEmoji, setBoardEmojiState] = useState("\u{1F4D6}");
  const [iconSize, setIconSizeState] = useState("md");
  const [titleFontFamily, setTitleFontFamilyState] = useState("");
  const [titleTextColor, setTitleTextColorState] = useState("");
  const [titleFontSize, setTitleFontSizeState] = useState("lg");
  const [coverHeight, setCoverHeightState] = useState(DEFAULT_COVER_HEIGHT);
  const [coverPositionY, setCoverPositionYState] = useState(DEFAULT_COVER_POSITION_Y);
  const [hydrated, setHydrated] = useState(false);

  // Refs for board metadata so callbacks can read current values without re-creating
  const boardTitleRef = useRef(boardTitle);
  const boardDescriptionRef = useRef(boardDescription);
  const coverImageUrlRef = useRef(coverImageUrl);
  const boardEmojiRef = useRef(boardEmoji);
  const iconSizeRef = useRef(iconSize);
  const titleFontFamilyRef = useRef(titleFontFamily);
  const titleTextColorRef = useRef(titleTextColor);
  const titleFontSizeRef = useRef(titleFontSize);
  const coverHeightRef = useRef(coverHeight);
  const coverPositionYRef = useRef(coverPositionY);

  /**
   * Applies a PersistedLayout to all state + refs.
   * Extracted to avoid duplication between localStorage and server hydration.
   */
  const applyLayout = useCallback((p: PersistedLayout) => {
    setWidgets(p.widgets);
    setLayoutsState(p.layouts);
    const title = p.boardTitle || "My Board";
    const desc = p.boardDescription || "";
    const cover = p.coverImageUrl ?? "preset:cal";
    const emoji = p.boardEmoji || "\u{1F4D6}";
    const iSize = p.iconSize || "md";
    setBoardTitleState(title);
    setBoardDescriptionState(desc);
    setCoverImageUrlState(cover);
    setBoardEmojiState(emoji);
    setIconSizeState(iSize);
    const tFont = p.titleFontFamily || "";
    const tColor = p.titleTextColor || "";
    const tSize = p.titleFontSize || "lg";
    const cHeight = p.coverHeight ?? DEFAULT_COVER_HEIGHT;
    const cPosY = p.coverPositionY ?? DEFAULT_COVER_POSITION_Y;
    setTitleFontFamilyState(tFont);
    setTitleTextColorState(tColor);
    setTitleFontSizeState(tSize);
    setCoverHeightState(cHeight);
    setCoverPositionYState(cPosY);
    boardTitleRef.current = title;
    boardDescriptionRef.current = desc;
    coverImageUrlRef.current = cover;
    boardEmojiRef.current = emoji;
    iconSizeRef.current = iSize;
    titleFontFamilyRef.current = tFont;
    titleTextColorRef.current = tColor;
    titleFontSizeRef.current = tSize;
    coverHeightRef.current = cHeight;
    coverPositionYRef.current = cPosY;
  }, []);

  // Hydrate from localStorage first (instant), then fetch server layout in background
  useEffect(() => {
    const localLayout = readPersistedLayout();
    if (localLayout) {
      applyLayout(localLayout);
    }
    setHydrated(true);

    // Background fetch from server — stale-while-revalidate pattern
    fetchServerLayout().then(({ layout: serverData, updatedAt: serverUpdatedAt }) => {
      if (serverData && serverUpdatedAt) {
        const serverTs = new Date(serverUpdatedAt).getTime();
        const localTs = localLayout?.updatedAt ?? 0;

        if (serverTs > localTs) {
          // Server is newer — update state + localStorage
          const serverLayout = serverData as unknown as PersistedLayout;
          // Preserve current schema version and apply same read validations
          serverLayout.version = SCHEMA_VERSION;
          serverLayout.updatedAt = serverTs;
          applyLayout(serverLayout);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serverLayout));
          } catch {
            // non-critical
          }
        } else if (localLayout && localTs > serverTs) {
          // Local is newer — push to server (covers failed/missed server saves)
          debouncedServerSave(localLayout);
        }
      } else if (!serverData && localLayout) {
        // No server data but localStorage exists — first-time migration to server
        debouncedServerSave(localLayout);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setLayoutsState((prev) => {
        // Bail out if layouts haven't changed — prevents infinite re-render loop
        // where onLayoutChange fires on every render with a new object reference
        if (JSON.stringify(prev) === JSON.stringify(allLayouts)) return prev;
        setWidgets((prevWidgets) => {
          writePersistedLayout(prevWidgets, allLayouts, boardTitleRef.current, boardDescriptionRef.current, coverImageUrlRef.current, boardEmojiRef.current, iconSizeRef.current, titleFontFamilyRef.current, titleTextColorRef.current, titleFontSizeRef.current, coverHeightRef.current, coverPositionYRef.current);
          return prevWidgets;
        });
        return allLayouts;
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
          writePersistedLayout(updated, updatedLayouts, boardTitleRef.current, boardDescriptionRef.current, coverImageUrlRef.current, boardEmojiRef.current, iconSizeRef.current, titleFontFamilyRef.current, titleTextColorRef.current, titleFontSizeRef.current, coverHeightRef.current, coverPositionYRef.current);
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
        writePersistedLayout(updated, updatedLayouts, boardTitleRef.current, boardDescriptionRef.current, coverImageUrlRef.current, boardEmojiRef.current, iconSizeRef.current, titleFontFamilyRef.current, titleTextColorRef.current, titleFontSizeRef.current, coverHeightRef.current, coverPositionYRef.current);
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
          writePersistedLayout(updated, prevLayouts, boardTitleRef.current, boardDescriptionRef.current, coverImageUrlRef.current, boardEmojiRef.current, iconSizeRef.current, titleFontFamilyRef.current, titleTextColorRef.current, titleFontSizeRef.current, coverHeightRef.current, coverPositionYRef.current);
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
          writePersistedLayout(updated, prevLayouts, boardTitleRef.current, boardDescriptionRef.current, coverImageUrlRef.current, boardEmojiRef.current, iconSizeRef.current, titleFontFamilyRef.current, titleTextColorRef.current, titleFontSizeRef.current, coverHeightRef.current, coverPositionYRef.current);
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
        writePersistedLayout(prev, prevLayouts, trimmed, boardDescriptionRef.current, coverImageUrlRef.current, boardEmojiRef.current, iconSizeRef.current, titleFontFamilyRef.current, titleTextColorRef.current, titleFontSizeRef.current, coverHeightRef.current, coverPositionYRef.current);
        return prevLayouts;
      });
      return prev;
    });
  }, []);

  /**
   * Sets the board description and persists to localStorage.
   *
   * @param desc - Board description string (max 200 chars)
   */
  const setBoardDescription = useCallback((desc: string) => {
    const trimmed = desc.slice(0, 200);
    setBoardDescriptionState(trimmed);
    boardDescriptionRef.current = trimmed;
    setWidgets((prev) => {
      setLayoutsState((prevLayouts) => {
        writePersistedLayout(prev, prevLayouts, boardTitleRef.current, trimmed, coverImageUrlRef.current, boardEmojiRef.current, iconSizeRef.current, titleFontFamilyRef.current, titleTextColorRef.current, titleFontSizeRef.current, coverHeightRef.current, coverPositionYRef.current);
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
        writePersistedLayout(prev, prevLayouts, boardTitleRef.current, boardDescriptionRef.current, url, boardEmojiRef.current, iconSizeRef.current, titleFontFamilyRef.current, titleTextColorRef.current, titleFontSizeRef.current, coverHeightRef.current, coverPositionYRef.current);
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
        writePersistedLayout(prev, prevLayouts, boardTitleRef.current, boardDescriptionRef.current, coverImageUrlRef.current, emoji, iconSizeRef.current, titleFontFamilyRef.current, titleTextColorRef.current, titleFontSizeRef.current, coverHeightRef.current, coverPositionYRef.current);
        return prevLayouts;
      });
      return prev;
    });
  }, []);

  /**
   * Sets the board icon size and persists to localStorage.
   *
   * @param size - Icon size value ("sm" | "md" | "lg" | "xl")
   */
  const setIconSize = useCallback((size: string) => {
    setIconSizeState(size);
    iconSizeRef.current = size;
    setWidgets((prev) => {
      setLayoutsState((prevLayouts) => {
        writePersistedLayout(prev, prevLayouts, boardTitleRef.current, boardDescriptionRef.current, coverImageUrlRef.current, boardEmojiRef.current, size, titleFontFamilyRef.current, titleTextColorRef.current, titleFontSizeRef.current, coverHeightRef.current, coverPositionYRef.current);
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
  /**
   * Sets the cover height and vertical position, then persists.
   *
   * @param height - Banner height in px (80–350)
   * @param positionY - Vertical image position percentage (0–100)
   */
  const setCoverConfig = useCallback((height: number, positionY: number) => {
    setCoverHeightState(height);
    setCoverPositionYState(positionY);
    coverHeightRef.current = height;
    coverPositionYRef.current = positionY;
    setWidgets((prev) => {
      setLayoutsState((prevLayouts) => {
        writePersistedLayout(prev, prevLayouts, boardTitleRef.current, boardDescriptionRef.current, coverImageUrlRef.current, boardEmojiRef.current, iconSizeRef.current, titleFontFamilyRef.current, titleTextColorRef.current, titleFontSizeRef.current, height, positionY);
        return prevLayouts;
      });
      return prev;
    });
  }, []);

  const setTitleConfig = useCallback((fontFamily: string, textColor: string, fontSize: string = "lg") => {
    setTitleFontFamilyState(fontFamily);
    setTitleTextColorState(textColor);
    setTitleFontSizeState(fontSize);
    titleFontFamilyRef.current = fontFamily;
    titleTextColorRef.current = textColor;
    titleFontSizeRef.current = fontSize;
    setWidgets((prev) => {
      setLayoutsState((prevLayouts) => {
        writePersistedLayout(prev, prevLayouts, boardTitleRef.current, boardDescriptionRef.current, coverImageUrlRef.current, boardEmojiRef.current, iconSizeRef.current, fontFamily, textColor, fontSize, coverHeightRef.current, coverPositionYRef.current);
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
    boardDescription,
    coverImageUrl,
    boardEmoji,
    iconSize,
    titleFontFamily,
    titleTextColor,
    titleFontSize,
    coverHeight,
    coverPositionY,
    setLayouts,
    addWidget,
    removeWidget,
    updateWidgetConfig,
    updateAllWidgetConfigs,
    setBoardTitle,
    setBoardDescription,
    setCoverImageUrl,
    setBoardEmoji,
    setIconSize,
    setTitleConfig,
    setCoverConfig,
  };
}
