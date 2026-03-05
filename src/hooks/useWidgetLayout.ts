"use client";

/**
 * Hook for managing the Home dashboard widget layout.
 * Server-authoritative with optimistic UI: React state is updated
 * immediately, localStorage serves as a passive cache, and the server
 * is the source of truth with retry + error notification.
 *
 * @module useWidgetLayout
 */

import { useState, useEffect, useCallback, useRef } from "react";
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
  const savedImagesRef = useRef(savedImages);

  /** Instance-level gate: prevents server saves before initial fetch completes. */
  const hydrationCompleteRef = useRef(false);

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
    setWidgets(p.widgets || []);
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
    setCoverHeightState(cHeight);
    setCoverPositionYState(cPosY);
    setSavedImagesState(sImages);
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
        savedImages: overrides.savedImages ?? savedImagesRef.current,
        updatedAt: Date.now(),
      };
      writeLayoutCache(data);
      if (hydrationCompleteRef.current) {
        debouncedServerSave(data);
      }
    },
    []
  );

  // Server-authoritative hydration: localStorage is a read-only cache for
  // instant initial paint. The server is the single source of truth.
  // localStorage never drives saves — only user actions do.
  useEffect(() => {
    hydrationCompleteRef.current = false;

    // Apply cached layout instantly for fast paint while server fetches
    const localLayout = readPersistedLayout();
    if (localLayout) {
      applyLayout(localLayout);
      setHydrated(true);
    }

    fetchServerLayout().then(({ layout: serverData, updatedAt: serverUpdatedAt }) => {
      if (serverData) {
        // Server has data — always apply it (server wins)
        const serverLayout = serverData as unknown as PersistedLayout;
        serverLayout.version = SCHEMA_VERSION;
        serverLayout.updatedAt = serverUpdatedAt
          ? new Date(serverUpdatedAt).getTime()
          : 0;
        applyLayout(serverLayout);
        writeLayoutCache(serverLayout);
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
            writeLayoutCache(incomingLayout);
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
        if (JSON.stringify(prev) === JSON.stringify(allLayouts)) return prev;
        setWidgets((prevWidgets) => {
          persistLayout(prevWidgets, allLayouts);
          return prevWidgets;
        });
        return allLayouts;
      });
    },
    [persistLayout]
  );

  const addWidget = useCallback(
    (type: WidgetType, config: Record<string, string> = {}, position?: { x: number; y: number }): string => {
      const id = generateWidgetId();
      const reg = WIDGET_REGISTRY[type];
      const newWidget: WidgetInstance = { id, type, config };
      const newLayoutItem: LayoutItem = {
        i: id, x: position?.x ?? 0, y: position?.y ?? Infinity,
        w: 2, h: 2, minW: reg.minW, minH: reg.minH,
      };

      setWidgets((prev) => {
        const updated = [...prev, newWidget];
        setLayoutsState((prevLayouts) => {
          const updatedLayouts: ResponsiveLayouts<string> = {};
          for (const bp of Object.keys(prevLayouts)) {
            updatedLayouts[bp] = [...(prevLayouts[bp] || []), newLayoutItem];
          }
          if (Object.keys(updatedLayouts).length === 0) {
            updatedLayouts.lg = [newLayoutItem];
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
    setLayouts, addWidget, removeWidget,
    updateWidgetConfig, updateAllWidgetConfigs,
    setBoardTitle, setBoardDescription, setCoverImageUrl,
    setBoardEmoji, setIconSize, setTitleConfig, setCoverConfig,
    savedImages, addSavedImage,
  };
}
