"use client";

/**
 * Hook for managing the Home dashboard widget layout.
 * Server-authoritative with optimistic UI: React state is updated
 * immediately, localStorage serves as a passive cache, and the server
 * is the source of truth with retry + error notification.
 *
 * @module useWidgetLayout
 */

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import type { Layout, LayoutItem, ResponsiveLayouts } from "react-grid-layout";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  type WidgetInstance,
  type WidgetType,
  WIDGET_REGISTRY,
  generateWidgetId,
  getDefaultLayout,
} from "@/lib/widget-types";
import {
  fetchServerLayout,
  debouncedServerSave,
  registerSaveErrorHandler,
  shouldPersistLayoutChange,
} from "@/lib/board-layout-sync";
import { readPersistedLayout, writeLayoutCache } from "@/lib/board-layout-cache";
import {
  SCHEMA_VERSION,
  DEFAULT_COVER_HEIGHT,
  DEFAULT_COVER_POSITION_Y,
  type PersistedLayout,
} from "@/lib/board-layout-types";
import { createClient } from "@/lib/supabase/client";
import { ensureRealtimeAuth } from "@/lib/supabase/realtime-auth";
import { useToast } from "@/contexts/ToastContext";

/**
 * Hook for the Home dashboard widget layout.
 * Hydrates from localStorage after mount, then fetches server data.
 * Server always wins on hydration (stale-while-revalidate pattern).
 *
 * @returns Layout state and mutation functions
 */
export function useWidgetLayout() {
  const defaults = getDefaultLayout();
  const [widgets, setWidgets] = useState<WidgetInstance[]>(defaults.widgets);
  const [layouts, setLayoutsState] = useState<ResponsiveLayouts<string>>(defaults.layouts);
  const [boardTitle, setBoardTitleState] = useState("My Board");
  const [boardDescription, setBoardDescriptionState] = useState("Tap the edit button to start customizing your board.");
  const [coverImageUrl, setCoverImageUrlState] = useState("");
  const [boardEmoji, setBoardEmojiState] = useState("\u{1F4D6}");
  const [iconSize, setIconSizeState] = useState("md");
  const [titleFontFamily, setTitleFontFamilyState] = useState("");
  const [titleTextColor, setTitleTextColorState] = useState("");
  const [titleFontSize, setTitleFontSizeState] = useState("lg");
  const [coverHeight, setCoverHeightState] = useState(DEFAULT_COVER_HEIGHT);
  const [coverPositionY, setCoverPositionYState] = useState(DEFAULT_COVER_POSITION_Y);
  const [dividerColor, setDividerColorState] = useState("");
  const [dividerThickness, setDividerThicknessState] = useState(1);
  const [dividerText, setDividerTextState] = useState("");
  const [dividerVisible, setDividerVisibleState] = useState(true);
  const [savedImages, setSavedImagesState] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Refs for board metadata so callbacks read current values without re-creating
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
  const dividerColorRef = useRef(dividerColor);
  const dividerThicknessRef = useRef(dividerThickness);
  const dividerTextRef = useRef(dividerText);
  const dividerVisibleRef = useRef(dividerVisible);
  const savedImagesRef = useRef(savedImages);

  /** Instance-level gate: prevents server saves before initial fetch completes. */
  const hydrationCompleteRef = useRef(false);

  /**
   * Tracks whether the user has made a genuine edit (drag, resize, add,
   * remove, or any explicit board change) this session. Stays false on
   * plain view/load so the automatic onLayoutChange that react-grid-layout
   * fires on mount never persists a copy of the template-fallback layout.
   * Without this, simply opening the board would write a frozen snapshot,
   * detaching the user from future template updates. Once true, the
   * layout-change path persists normally.
   */
  const interactedRef = useRef(false);

  /** Current Supabase user id, stored in cache envelope for debuggability. Null until the async auth lookup resolves. */
  const userIdRef = useRef<string | null>(null);

  // Register toast error handler for save failures
  const { showToast } = useToast();
  useEffect(() => {
    registerSaveErrorHandler(() => {
      showToast("Board changes couldn't be saved. They're saved locally.");
    });
    return () => registerSaveErrorHandler(null);
  }, [showToast]);

  /**
   * Applies a PersistedLayout to all state + refs.
   * Extracted to avoid duplication between localStorage and server hydration.
   */
  const applyLayout = useCallback((p: PersistedLayout) => {
    // Filter out retired widget types (e.g. clock) from any persisted
    // layout so users whose saved board still references them don't see
    // a broken / empty card at the bottom of the dashboard. Layout
    // entries pointing at removed IDs become orphans and are ignored by
    // react-grid-layout. Cast through string because the retired types
    // are no longer in WidgetType's union.
    const RETIRED = new Set<string>(["clock"]);
    const clean = (p.widgets || []).filter((w) => !RETIRED.has(w.type as unknown as string));
    setWidgets(clean);
    setLayoutsState(p.layouts || { lg: [], md: [], sm: [] });
    const title = p.boardTitle || "My Board";
    const desc = p.boardDescription || "";
    const cover = p.coverImageUrl ?? "";
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
    const sImages = p.savedImages || [];
    const dColor = p.dividerColor || "";
    const dThick = p.dividerThickness ?? 1;
    const dText = p.dividerText || "";
    const dVisible = p.dividerVisible ?? true;
    setCoverHeightState(cHeight);
    setCoverPositionYState(cPosY);
    setSavedImagesState(sImages);
    setDividerColorState(dColor);
    setDividerThicknessState(dThick);
    setDividerTextState(dText);
    setDividerVisibleState(dVisible);
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
    savedImagesRef.current = sImages;
    dividerColorRef.current = dColor;
    dividerThicknessRef.current = dThick;
    dividerTextRef.current = dText;
    dividerVisibleRef.current = dVisible;
  }, []);

  /**
   * Builds a PersistedLayout from widgets + layouts + optional overrides,
   * writes to localStorage cache, and triggers debounced server save.
   * Overrides win over current ref values — callers pass only changed fields.
   *
   * @param w - Current widget instances
   * @param l - Current grid layouts per breakpoint
   * @param overrides - Partial fields to override (e.g. { boardTitle: "New" })
   */
  const persistLayout = useCallback(
    (w: WidgetInstance[], l: ResponsiveLayouts<string>, overrides: Partial<PersistedLayout> = {}) => {
      const data: PersistedLayout = {
        version: SCHEMA_VERSION,
        widgets: w,
        layouts: l,
        boardTitle: overrides.boardTitle ?? boardTitleRef.current,
        boardDescription: overrides.boardDescription ?? boardDescriptionRef.current,
        coverImageUrl: overrides.coverImageUrl ?? coverImageUrlRef.current,
        boardEmoji: overrides.boardEmoji ?? boardEmojiRef.current,
        iconSize: overrides.iconSize ?? iconSizeRef.current,
        titleFontFamily: overrides.titleFontFamily ?? titleFontFamilyRef.current,
        titleTextColor: overrides.titleTextColor ?? titleTextColorRef.current,
        titleFontSize: overrides.titleFontSize ?? titleFontSizeRef.current,
        coverHeight: overrides.coverHeight ?? coverHeightRef.current,
        coverPositionY: overrides.coverPositionY ?? coverPositionYRef.current,
        dividerColor: overrides.dividerColor ?? dividerColorRef.current,
        dividerThickness: overrides.dividerThickness ?? dividerThicknessRef.current,
        dividerText: overrides.dividerText ?? dividerTextRef.current,
        dividerVisible: overrides.dividerVisible ?? dividerVisibleRef.current,
        savedImages: overrides.savedImages ?? savedImagesRef.current,
        updatedAt: Date.now(),
      };
      // Any call to persistLayout is a deliberate edit (add/remove/title/
      // drag-driven save), so mark the session as interacted. This keeps the
      // onLayoutChange auto-fire path persisting once real editing begins.
      interactedRef.current = true;
      writeLayoutCache(data, userIdRef.current ?? undefined);
      if (hydrationCompleteRef.current) {
        debouncedServerSave(data);
      }
    },
    []
  );

  /**
   * Marks that the user has begun a genuine grid interaction (drag/resize
   * start). Call from the grid's drag/resize start handlers so the
   * subsequent onLayoutChange persists the result. No-op once already set.
   */
  const markInteracted = useCallback(() => {
    interactedRef.current = true;
  }, []);

  // Server-authoritative hydration with instant cache paint.
  //
  // Uses useLayoutEffect so the synchronous cache read + applyLayout +
  // setHydrated(true) commits BEFORE the browser paints. On repeat
  // visits this eliminates the skeleton flash entirely. The async
  // server fetch still runs after paint and overwrites cached state
  // if the server has newer data (server always wins).
  useLayoutEffect(() => {
    hydrationCompleteRef.current = false;

    // Instant paint from cache (returns null on first visit / version bump)
    const localLayout = readPersistedLayout();
    if (localLayout) {
      applyLayout(localLayout);
    }
    // Paint immediately either way — with the cached layout if present,
    // otherwise the default board (already in state) — so a first-time or
    // just-onboarded user lands on the board instead of a pulsing skeleton
    // while the server layout loads. The fetch below reconciles (server wins).
    setHydrated(true);

    fetchServerLayout().then(({ layout: serverData, updatedAt: serverUpdatedAt }) => {
      if (serverData) {
        // Server has data — always apply it (server wins)
        const serverLayout = serverData as unknown as PersistedLayout;
        serverLayout.version = SCHEMA_VERSION;
        serverLayout.updatedAt = serverUpdatedAt
          ? new Date(serverUpdatedAt).getTime()
          : 0;
        applyLayout(serverLayout);
        writeLayoutCache(serverLayout, userIdRef.current ?? undefined);
      }
      // If server has no data, keep defaults in state but do NOT save
      // them to the server. Only explicit user actions trigger saves.

      setHydrated(true);
      hydrationCompleteRef.current = true;
    }).catch(() => {
      // Show UI even on failure
      setHydrated(true);
      hydrationCompleteRef.current = true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime subscription — sync layout changes from other devices
  useEffect(() => {
    const supabase = createClient();
    let channel: RealtimeChannel | null = null;

    async function subscribe() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Capture user id so subsequent cache writes tag the envelope.
      userIdRef.current = user.id;

      await ensureRealtimeAuth(supabase);

      channel = supabase
        .channel("board-layout-sync")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "board_layouts",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (!hydrationCompleteRef.current) return;

            const incoming = payload.new as {
              layout?: Record<string, unknown>;
              updated_at?: string;
            };
            if (!incoming.layout) return;

            const incomingLayout = incoming.layout as unknown as PersistedLayout;
            const incomingTs = incomingLayout.updatedAt ?? 0;

            // Echo suppression: skip if this is our own save echoing back
            const currentLocal = readPersistedLayout();
            const currentLocalTs = currentLocal?.updatedAt ?? 0;
            if (incomingTs <= currentLocalTs) return;

            // Incoming layout is newer (from another device) — apply it
            incomingLayout.version = SCHEMA_VERSION;
            applyLayout(incomingLayout);
            writeLayoutCache(incomingLayout, userIdRef.current ?? undefined);
          }
        )
        .subscribe();
    }

    subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLayouts = useCallback(
    (_currentLayout: Layout, allLayouts: ResponsiveLayouts<string>) => {
      setLayoutsState((prev) => {
        if (prev === allLayouts) return prev;
        // Always update local state so the grid renders, but only persist
        // once hydration is done AND the user has genuinely interacted.
        // react-grid-layout fires onLayoutChange automatically on mount;
        // persisting that would write a frozen copy of the template-fallback
        // layout and detach the user from future template updates.
        if (shouldPersistLayoutChange(hydrationCompleteRef.current, interactedRef.current)) {
          setWidgets((prevWidgets) => {
            persistLayout(prevWidgets, allLayouts);
            return prevWidgets;
          });
        }
        return allLayouts;
      });
    },
    [persistLayout]
  );

  /**
   * Adds a new widget and places it in the first empty slot that fits
   * within the fixed-row board (MAX_ROWS = 6 at the lg breakpoint).
   * Uses each widget type's registry-defined default size instead of
   * a hardcoded 2×2 — fixes the "page went on forever" bug where new
   * widgets were placed at y: Infinity and react-grid-layout grew the
   * container past the viewport.
   *
   * The caller (HomeBoard.handleAddWidget) already checks hasRoomFor
   * before invoking this; we still defensively clamp here so a missed
   * check can't blow the layout up.
   */
  const addWidget = useCallback(
    (type: WidgetType, config: Record<string, string> = {}, position?: { x: number; y: number }): string => {
      const id = generateWidgetId();
      const reg = WIDGET_REGISTRY[type];
      const newWidget: WidgetInstance = { id, type, config };
      const MAX_ROWS = 8;
      const COLS = { lg: 8, md: 4, sm: 2 } as const;
      // Enforce a 2×2 floor when a user adds a new widget via the
      // gallery — single-cell tiles read as cramped on the dashboard.
      // The preset default layout (getDefaultLayout) can still place
      // banner-style widgets at h=1; that path doesn't go through here.
      const w = Math.max(2, reg.minW, reg.defaultW);
      const h = Math.max(2, reg.minH, reg.defaultH);

      setWidgets((prev) => {
        const updated = [...prev, newWidget];
        setLayoutsState((prevLayouts) => {
          const updatedLayouts: ResponsiveLayouts<string> = {};
          for (const bp of Object.keys(prevLayouts)) {
            const cols = (COLS as Record<string, number>)[bp] ?? 8;
            const items = prevLayouts[bp] ?? [];
            /**
             * Walk rows top-to-bottom, columns left-to-right. The first
             * w×h block with no overlap against existing items AND
             * whose bottom edge is still <= MAX_ROWS wins. Falls back
             * to (0, max(0, MAX_ROWS - h)) so the new widget is at
             * least visible if hasRoomFor was bypassed.
             */
            let placedX = 0;
            let placedY = Math.max(0, MAX_ROWS - h);
            outer: for (let y = 0; y + h <= MAX_ROWS; y++) {
              for (let x = 0; x + w <= cols; x++) {
                const collides = items.some((it) => {
                  const ix = it.x ?? 0, iy = it.y ?? 0, iw = it.w ?? 1, ih = it.h ?? 1;
                  return !(x + w <= ix || ix + iw <= x || y + h <= iy || iy + ih <= y);
                });
                if (!collides) {
                  placedX = x;
                  placedY = y;
                  break outer;
                }
              }
            }

            // Position override (drag-from-gallery drop) still respected
            // but clamped to the board cap.
            if (position) {
              placedX = Math.max(0, Math.min(cols - w, position.x));
              placedY = Math.max(0, Math.min(MAX_ROWS - h, position.y));
            }

            const newItem: LayoutItem = {
              i: id, x: placedX, y: placedY,
              w, h, minW: reg.minW, minH: reg.minH,
            };
            updatedLayouts[bp] = [...items, newItem];
          }
          if (Object.keys(updatedLayouts).length === 0) {
            updatedLayouts.lg = [{ i: id, x: 0, y: 0, w, h, minW: reg.minW, minH: reg.minH }];
          }
          persistLayout(updated, updatedLayouts);
          return updatedLayouts;
        });
        return updated;
      });

      return id;
    },
    [persistLayout]
  );

  const removeWidget = useCallback((id: string) => {
    setWidgets((prev) => {
      const updated = prev.filter((w) => w.id !== id);
      setLayoutsState((prevLayouts) => {
        const updatedLayouts: ResponsiveLayouts<string> = {};
        for (const bp of Object.keys(prevLayouts)) {
          updatedLayouts[bp] = (prevLayouts[bp] || []).filter((l: LayoutItem) => l.i !== id);
        }
        persistLayout(updated, updatedLayouts);
        return updatedLayouts;
      });
      return updated;
    });
  }, [persistLayout]);

  const updateWidgetConfig = useCallback(
    (id: string, config: Record<string, string>) => {
      setWidgets((prev) => {
        const updated = prev.map((w) =>
          w.id === id ? { ...w, config: { ...w.config, ...config } } : w
        );
        setLayoutsState((prevLayouts) => {
          persistLayout(updated, prevLayouts);
          return prevLayouts;
        });
        return updated;
      });
    },
    [persistLayout]
  );

  const updateAllWidgetConfigs = useCallback(
    (config: Record<string, string>) => {
      setWidgets((prev) => {
        const updated = prev.map((w) => ({ ...w, config: { ...w.config, ...config } }));
        setLayoutsState((prevLayouts) => {
          persistLayout(updated, prevLayouts);
          return prevLayouts;
        });
        return updated;
      });
    },
    [persistLayout]
  );

  const setBoardTitle = useCallback((title: string) => {
    const trimmed = title.slice(0, 50);
    setBoardTitleState(trimmed);
    boardTitleRef.current = trimmed;
    setWidgets((prev) => {
      setLayoutsState((prevLayouts) => {
        persistLayout(prev, prevLayouts, { boardTitle: trimmed });
        return prevLayouts;
      });
      return prev;
    });
  }, [persistLayout]);

  const setBoardDescription = useCallback((desc: string) => {
    const trimmed = desc.slice(0, 200);
    setBoardDescriptionState(trimmed);
    boardDescriptionRef.current = trimmed;
    setWidgets((prev) => {
      setLayoutsState((prevLayouts) => {
        persistLayout(prev, prevLayouts, { boardDescription: trimmed });
        return prevLayouts;
      });
      return prev;
    });
  }, [persistLayout]);

  const setCoverImageUrl = useCallback((url: string) => {
    setCoverImageUrlState(url);
    coverImageUrlRef.current = url;
    setWidgets((prev) => {
      setLayoutsState((prevLayouts) => {
        persistLayout(prev, prevLayouts, { coverImageUrl: url });
        return prevLayouts;
      });
      return prev;
    });
  }, [persistLayout]);

  const setBoardEmoji = useCallback((emoji: string) => {
    setBoardEmojiState(emoji);
    boardEmojiRef.current = emoji;
    setWidgets((prev) => {
      setLayoutsState((prevLayouts) => {
        persistLayout(prev, prevLayouts, { boardEmoji: emoji });
        return prevLayouts;
      });
      return prev;
    });
  }, [persistLayout]);

  const setIconSize = useCallback((size: string) => {
    setIconSizeState(size);
    iconSizeRef.current = size;
    setWidgets((prev) => {
      setLayoutsState((prevLayouts) => {
        persistLayout(prev, prevLayouts, { iconSize: size });
        return prevLayouts;
      });
      return prev;
    });
  }, [persistLayout]);

  const setCoverConfig = useCallback((height: number, positionY: number) => {
    setCoverHeightState(height);
    setCoverPositionYState(positionY);
    coverHeightRef.current = height;
    coverPositionYRef.current = positionY;
    setWidgets((prev) => {
      setLayoutsState((prevLayouts) => {
        persistLayout(prev, prevLayouts, { coverHeight: height, coverPositionY: positionY });
        return prevLayouts;
      });
      return prev;
    });
  }, [persistLayout]);

  const setTitleConfig = useCallback((fontFamily: string, textColor: string, fontSize: string = "lg") => {
    setTitleFontFamilyState(fontFamily);
    setTitleTextColorState(textColor);
    setTitleFontSizeState(fontSize);
    titleFontFamilyRef.current = fontFamily;
    titleTextColorRef.current = textColor;
    titleFontSizeRef.current = fontSize;
    setWidgets((prev) => {
      setLayoutsState((prevLayouts) => {
        persistLayout(prev, prevLayouts, { titleFontFamily: fontFamily, titleTextColor: textColor, titleFontSize: fontSize });
        return prevLayouts;
      });
      return prev;
    });
  }, [persistLayout]);

  /**
   * Updates the divider color and thickness, persisting to storage.
   *
   * @param color - CSS color string (empty = default theme color)
   * @param thickness - Pixel thickness (1-6)
   */
  const setDividerConfig = useCallback((color: string, thickness: number, text?: string, visible?: boolean) => {
    setDividerColorState(color);
    setDividerThicknessState(thickness);
    if (text !== undefined) { setDividerTextState(text); dividerTextRef.current = text; }
    if (visible !== undefined) { setDividerVisibleState(visible); dividerVisibleRef.current = visible; }
    dividerColorRef.current = color;
    dividerThicknessRef.current = thickness;
    setWidgets((prev) => {
      setLayoutsState((prevLayouts) => {
        persistLayout(prev, prevLayouts, {
          dividerColor: color, dividerThickness: thickness,
          ...(text !== undefined ? { dividerText: text } : {}),
          ...(visible !== undefined ? { dividerVisible: visible } : {}),
        });
        return prevLayouts;
      });
      return prev;
    });
  }, [persistLayout]);

  const addSavedImage = useCallback((url: string) => {
    setSavedImagesState((prev) => {
      const deduped = prev.filter((u) => u !== url);
      const updated = [url, ...deduped].slice(0, 20);
      savedImagesRef.current = updated;
      setWidgets((prevWidgets) => {
        setLayoutsState((prevLayouts) => {
          persistLayout(prevWidgets, prevLayouts, { savedImages: updated });
          return prevLayouts;
        });
        return prevWidgets;
      });
      return updated;
    });
  }, [persistLayout]);

  return {
    widgets, layouts, hydrated,
    boardTitle, boardDescription, coverImageUrl, boardEmoji, iconSize,
    titleFontFamily, titleTextColor, titleFontSize,
    coverHeight, coverPositionY,
    dividerColor, dividerThickness, dividerText, dividerVisible,
    setLayouts, markInteracted, addWidget, removeWidget,
    updateWidgetConfig, updateAllWidgetConfigs,
    setBoardTitle, setBoardDescription, setCoverImageUrl,
    setBoardEmoji, setIconSize, setTitleConfig, setCoverConfig,
    setDividerConfig,
    savedImages, addSavedImage,
  };
}
