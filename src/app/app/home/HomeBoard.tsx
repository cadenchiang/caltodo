"use client";

/**
 * Home dashboard page — "Your Board" personal dashboard.
 * Notion-style layout: cover banner → emoji icon → editable title → widget grid.
 * Edit mode toggle: pencil icon (view) / "Done" pill (edit).
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import PageTransition from "@/components/ui/PageTransition";
import EditToggleButton from "@/components/ui/EditToggleButton";
import WidgetGrid from "@/components/home/WidgetGrid";
import WidgetGalleryModal from "@/components/home/WidgetGalleryModal";
import WidgetEditorPanel from "@/components/home/WidgetEditorPanel";
import BoardCover from "@/components/home/BoardCover";
import BoardTitle from "@/components/home/BoardTitle";
import BoardDescription from "@/components/home/BoardDescription";
import BoardDivider from "@/components/home/BoardDivider";
// Import the icon-map helpers from the lightweight data module directly.
import { LUCIDE_ICON_MAP, isFilledIcon, ICON_SIZES } from "@/components/home/emoji-picker-data";
// EmojiPicker statically pulls in the ~432KB @emoji-mart/data dataset, so load
// it lazily (client-only, no SSR) — it only mounts when the user opens it in
// edit mode, keeping the first-load /app/home bundle light.
import dynamic from "next/dynamic";
const EmojiPicker = dynamic(() => import("@/components/home/EmojiPicker"), { ssr: false });
import { useWidgetLayout } from "@/hooks/useWidgetLayout";
import { useToast } from "@/contexts/ToastContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { STORAGE_KEY, TEMPLATE_USER_ID } from "@/lib/board-layout-types";
import { WIDGET_REGISTRY, getDefaultLayout, type WidgetType, type WidgetInstance } from "@/lib/widget-types";

/** One-time seed flag — bump suffix to re-seed the template user's board. */
const TEMPLATE_SEED_FLAG = "caltodo_template_board_seeded_v6";

/**
 * @param embedded When true, skip the outer -mx/-my negative margins that
 * normally escape the parent <main>'s padding. Used by BoardLockedScreen
 * which applies its own escape on a wrapper — without this flag the two
 * sets of negative margins compound and push content off the viewport.
 */
interface HomeBoardProps {
  embedded?: boolean;
}

export default function HomeBoard({ embedded = false }: HomeBoardProps = {}) {
  const escapeMargins = embedded
    ? ""
    : "-mx-4 md:-mx-10 -mt-4 md:-mt-10 -mb-4 md:-mb-10";
  const {
    widgets,
    layouts,
    hydrated,
    boardTitle,
    boardDescription,
    coverImageUrl,
    boardEmoji,
    iconSize,
    setLayouts,
    markInteracted,
    addWidget,
    removeWidget,
    updateWidgetConfig,
    updateAllWidgetConfigs,
    setBoardTitle,
    setBoardDescription,
    setCoverImageUrl,
    setBoardEmoji,
    setIconSize,
    titleFontFamily,
    titleTextColor,
    titleFontSize,
    coverHeight,
    coverPositionY,
    setTitleConfig,
    setCoverConfig,
    dividerColor,
    dividerThickness,
    dividerText,
    dividerVisible,
    setDividerConfig,
    savedImages,
    addSavedImage,
  } = useWidgetLayout();

  const { colorTheme } = useTheme();
  const { showToast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [settingsWidget, setSettingsWidget] = useState<WidgetInstance | null>(null);
  const [settingsWidgetRect, setSettingsWidgetRect] = useState<DOMRect | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  /** Widget type being dragged from gallery (null when not drag-to-placing). */
  const [draggingType, setDraggingType] = useState<WidgetType | null>(null);
  /** Live widget rect for the spotlight overlay (updates on scroll/resize). */
  const [spotlightRect, setSpotlightRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const spotlightRafRef = useRef(0);

  // When a color theme is activated, permanently clear custom widget/title/divider colors
  const prevThemeRef = useRef(colorTheme);
  useEffect(() => {
    if (colorTheme && colorTheme !== prevThemeRef.current && hydrated) {
      updateAllWidgetConfigs({ textColor: "", bgColor: "", accentColor: "" });
      setTitleConfig(titleFontFamily, "", titleFontSize);
      setDividerConfig("", dividerThickness, dividerText, dividerVisible);
    }
    prevThemeRef.current = colorTheme;
  }, [colorTheme, hydrated, updateAllWidgetConfigs, setTitleConfig, setDividerConfig, titleFontFamily, titleFontSize, dividerThickness, dividerText, dividerVisible]);

  // Listen for tour-controlled edit mode toggle (fired by AppTour click animations)
  useEffect(() => {
    function handleTourEditMode(e: Event) {
      const enabled = (e as CustomEvent).detail === true;
      setEditMode(enabled);
    }
    window.addEventListener("tour-set-edit-mode", handleTourEditMode);
    return () => window.removeEventListener("tour-set-edit-mode", handleTourEditMode);
  }, []);

  /**
   * One-time seed for the template owner's board. PUTs the Jerrod-style
   * default layout straight into Supabase via /api/board-layout, then
   * busts the local cache and reloads. Gated by user_id match against
   * TEMPLATE_USER_ID and a localStorage flag so it never runs for
   * non-template users or fires twice.
   *
   * Bumping TEMPLATE_SEED_FLAG suffix re-seeds for the next design pass.
   */
  useEffect(() => {
    let cancelled = false;
    async function maybeSeed() {
      try {
        if (typeof window === "undefined") return;
        if (localStorage.getItem(TEMPLATE_SEED_FLAG)) return;

        const user = await getCurrentUser();
        if (cancelled || !user) return;
        if (user.id !== TEMPLATE_USER_ID) {
          localStorage.setItem(TEMPLATE_SEED_FLAG, "skipped");
          return;
        }

        const defaults = getDefaultLayout();
        const payload = {
          widgets: defaults.widgets,
          layouts: defaults.layouts,
          // PersistedLayout shape includes a few extra fields; the API
          // only requires widgets[] + layouts{}, the rest are merged
          // by the client on read. Send minimal shape.
        };
        const res = await fetch("/api/board-layout", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) return;
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(TEMPLATE_SEED_FLAG, "seeded");
        window.location.reload();
      } catch {
        /* non-critical — user can re-run manually */
      }
    }
    maybeSeed();
    return () => { cancelled = true; };
  }, []);

  // Track selected widget position for spotlight overlay.
  useEffect(() => {
    if (!settingsWidget) { setSpotlightRect(null); return; }
    function updateSpotlight() {
      const el = document.querySelector(`[data-widget-id="${settingsWidget!.id}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        setSpotlightRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      }
      spotlightRafRef.current = requestAnimationFrame(updateSpotlight);
    }
    updateSpotlight();
    return () => cancelAnimationFrame(spotlightRafRef.current);
  }, [settingsWidget]);

  /**
   * Returns true if the board has room for a new widget anywhere in
   * the visible grid — not just at the bottom. Walks every cell in
   * the MAX_ROWS × COLS area and checks if a w×h block could land
   * there without colliding with existing widgets. The previous
   * "bottom + defaultH" math falsely rejected widgets when there was
   * empty space in the middle of the layout (e.g. a sparse top row).
   *
   * Uses the same effective footprint as addWidget (2×2 floor) so the
   * yes/no answer matches what would actually get placed.
   */
  const hasRoomFor = useCallback(
    (type: WidgetType): boolean => {
      const MAX_ROWS = 8;
      const COLS = 8;
      const def = WIDGET_REGISTRY[type];
      if (!def) return true;
      const w = Math.max(2, def.minW, def.defaultW);
      const h = Math.max(2, def.minH, def.defaultH);
      const items = layouts.lg ?? [];
      for (let y = 0; y + h <= MAX_ROWS; y++) {
        for (let x = 0; x + w <= COLS; x++) {
          const collides = items.some((it) => {
            const ix = it.x ?? 0, iy = it.y ?? 0, iw = it.w ?? 1, ih = it.h ?? 1;
            return !(x + w <= ix || ix + iw <= x || y + h <= iy || iy + ih <= y);
          });
          if (!collides) return true;
        }
      }
      return false;
    },
    [layouts]
  );

  /** Handles adding a widget from the gallery. Rejects with a popup
   *  notification when the board is out of room. */
  const handleAddWidget = useCallback(
    (type: WidgetType) => {
      if (!hasRoomFor(type)) {
        showToast("No space — remove a widget first");
        return;
      }
      addWidget(type);
      showToast("Widget added");
    },
    [addWidget, showToast, hasRoomFor]
  );

  /** Ref to prevent double-add from both onDrop and dragend firing. */
  const dropHandledRef = useRef(false);

  /** Called when user starts dragging a widget card from the gallery. */
  const handleGalleryDragStart = useCallback(
    (type: WidgetType) => {
      dropHandledRef.current = false;
      setDraggingType(type);
      // Hide modal visually but keep it mounted so the drag source element
      // stays in the DOM — removing it cancels the browser drag operation.
      setGalleryOpen(false);
    },
    []
  );

  /** Called when user drops an external item onto the grid. Same
   *  capacity check as click-to-add so drag-from-gallery also respects
   *  the MAX_ROWS cap. */
  const handleExternalDrop = useCallback(
    (item: { x: number; y: number }) => {
      if (dropHandledRef.current) return;
      dropHandledRef.current = true;
      setDraggingType((prev) => {
        if (prev) {
          if (!hasRoomFor(prev)) {
            showToast("No space — remove a widget first");
          } else {
            addWidget(prev, {}, { x: item.x, y: item.y });
            showToast("Widget added");
          }
        }
        return null;
      });
    },
    [addWidget, showToast, hasRoomFor]
  );

  // Fallback: if drag ends outside the grid, still add the widget at bottom
  useEffect(() => {
    if (!draggingType) return;
    function handleDragEnd() {
      if (dropHandledRef.current) {
        // Already handled by onDrop — just clean up
        setDraggingType(null);
        return;
      }
      dropHandledRef.current = true;
      setDraggingType((prev) => {
        if (prev) {
          addWidget(prev);
          showToast("Widget added");
        }
        return null;
      });
    }
    window.addEventListener("dragend", handleDragEnd);
    return () => window.removeEventListener("dragend", handleDragEnd);
  }, [draggingType, addWidget, showToast]);

  /** Opens editor panel for a specific widget with its bounding rect. */
  const handleWidgetSettings = useCallback(
    (id: string, rect: DOMRect) => {
      const widget = widgets.find((w) => w.id === id) || null;
      setSettingsWidget(widget);
      setSettingsWidgetRect(rect);
    },
    [widgets]
  );

  /** Applies a font to all widgets and the board title. */
  const handleApplyFontToAll = useCallback(
    (font: string) => {
      updateAllWidgetConfigs({ fontFamily: font });
      setTitleConfig(font, titleTextColor, titleFontSize);
      showToast("Font applied to all widgets");
    },
    [updateAllWidgetConfigs, setTitleConfig, titleTextColor, titleFontSize, showToast]
  );

  // Don't render grid until localStorage is hydrated (avoids layout flash).
  // Show a ghost skeleton matching the board layout so first paint has shape.
  //
  // Embedded inside BoardLockedScreen, render nothing during the unhydrated
  // window: the paywall card sits on top with a translucent backdrop, and a
  // skeleton bleeding through would read as "the app is still loading"
  // instead of "you're paywalled". The paywall is what the user should see
  // on first paint; the blurred real board only matters once it's actually
  // there to blur.
  if (!hydrated) {
    if (embedded) return null;
    return (
      <PageTransition>
        <div className={`h-full overflow-hidden ${escapeMargins}`}>
          <div className="h-40 w-full bg-muted animate-pulse" />
          <div className="px-6 md:px-10 pt-6 space-y-3">
            <div className="h-14 w-14 rounded-lg bg-muted animate-pulse" />
            <div className="h-8 w-1/3 rounded bg-muted animate-pulse" />
          </div>
          <div className="px-6 md:px-10 pt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className={`h-full overflow-hidden ${escapeMargins}`}>
      <div
        className={`relative h-full flex flex-col board-wallpaper ${isDragging ? "overflow-hidden" : "overflow-y-auto"}`}
      >
        {/* Cover banner — full-bleed image at the very top (Notion-style). */}
        <BoardCover
          coverImageUrl={coverImageUrl}
          editMode={editMode}
          onChangeCover={(url) => { setCoverImageUrl(url); showToast(url ? "Banner updated" : "Banner removed"); }}
          coverHeight={coverHeight}
          coverPositionY={coverPositionY}
          onChangeCoverConfig={setCoverConfig}
        />

        {/* Header: emoji icon overlapping the cover, then the title row with
            the Add Widget / edit controls right-aligned to the grid edge. */}
        <div className="px-6 md:px-10 shrink-0">
          {/* Board icon — overlaps the bottom of the cover for the Notion look */}
          <div className="relative mb-2.5" style={{ marginTop: -(((ICON_SIZES.find((s) => s.value === iconSize)?.px ?? 64) / 2)) }}>
            <button
              onClick={() => { if (editMode) setEmojiPickerOpen((p) => !p); }}
              className={`leading-none ${editMode ? "cursor-pointer hover:opacity-80 transition-opacity animate-edit-hint" : "cursor-default"}`}
              aria-label="Board icon"
            >
              {(() => {
                const sizePx = ICON_SIZES.find((s) => s.value === iconSize)?.px ?? 64;
                if (boardEmoji.startsWith("lucide:")) {
                  const iconName = boardEmoji.slice(7);
                  const LucideIcon = LUCIDE_ICON_MAP[iconName];
                  if (LucideIcon) {
                    return <LucideIcon size={sizePx} strokeWidth={1.5} fill={isFilledIcon(iconName) ? "currentColor" : "none"} className="text-foreground" />;
                  }
                }
                return <span style={{ fontSize: sizePx, lineHeight: 1 }}>{boardEmoji}</span>;
              })()}
            </button>
            {emojiPickerOpen && (
              <EmojiPicker
                open={emojiPickerOpen}
                onSelect={setBoardEmoji}
                onClose={() => setEmojiPickerOpen(false)}
              />
            )}
          </div>

          {/* Title row + controls */}
          <div className="flex items-center justify-between mb-4">
            <BoardTitle
              title={boardTitle}
              editMode={editMode}
              titleConfig={{ fontFamily: titleFontFamily, textColor: titleTextColor, fontSize: titleFontSize }}
              onTitleChange={setBoardTitle}
              onTitleConfigChange={(cfg) => setTitleConfig(cfg.fontFamily || "", cfg.textColor || "", cfg.fontSize || "lg")}
            />
            <div className="flex items-center gap-2.5 shrink-0">
              {editMode && (
                <button
                  id="add-widget-btn"
                  onClick={() => setGalleryOpen(true)}
                  style={{ height: 30 }}
                  className="flex items-center gap-1.5 px-3.5 text-sm font-semibold rounded-xl border border-border bg-white/85 dark:bg-gray-800/85 backdrop-blur-md text-foreground hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-colors"
                >
                  <Plus size={14} />
                  Add Widget
                </button>
              )}
              <EditToggleButton
                id="edit-toggle-btn"
                editing={editMode}
                onToggle={() => setEditMode((prev) => !prev)}
              />
            </div>
          </div>
        </div>

        {/* Widget Grid — sits below the Notion header on the wallpaper. */}
        <div id="widget-grid" className="flex-1 min-h-0 pb-20 md:pb-0">
          <WidgetGrid
            widgets={widgets}
            layouts={layouts}
            editMode={editMode}
            onLayoutChange={setLayouts}
            onRemoveWidget={removeWidget}
            onWidgetSettings={handleWidgetSettings}
            onUpdateWidgetConfig={updateWidgetConfig}
            onDragStart={() => { markInteracted(); setIsDragging(true); }}
            onDragStop={() => setIsDragging(false)}
            onResizeStart={markInteracted}
            selectedWidgetId={settingsWidget?.id}
            acceptDrop={!!draggingType}
            onExternalDrop={handleExternalDrop}
          />
        </div>

        {/* Empty state — absolutely positioned and centered over the
            board area so it sits in the visual middle regardless of
            sibling flex children. Wrapped in a squircle card with the
            same chrome as the widgets so it reads as a placeholder
            tile. */}
        {widgets.length === 0 && !editMode && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto board-widget-card flex flex-col items-center justify-center text-center px-10 py-10 max-w-md">
              <p className="text-base font-semibold text-foreground mb-1.5">
                Make this dashboard yours
              </p>
              <p className="text-sm text-muted-foreground mb-5">
                Add widgets to track upcoming work, calendar, weather, and more. Drag them anywhere on the board.
              </p>
              <button
                onClick={() => {
                  setEditMode(true);
                  setGalleryOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-blue-500 text-white hover:bg-blue-500/90 transition-colors"
              >
                <Plus size={14} />
                Add Widgets
              </button>
            </div>
          </div>
        )}

        {/* Gallery Modal — stays mounted (but invisible) during drag so
            the browser doesn't cancel the drag operation when the source
            element unmounts. */}
        <div className={draggingType && !galleryOpen ? "invisible fixed inset-0 pointer-events-none" : ""}>
          <WidgetGalleryModal
            open={galleryOpen || !!draggingType}
            onClose={() => setGalleryOpen(false)}
            onAdd={handleAddWidget}
            onDragStart={handleGalleryDragStart}
          />
        </div>

        {/* Backdrop: click catcher (transparent) + spotlight over selected widget */}
        {settingsWidget && (
          <>
            {/* Full-screen click catcher — closes editor on click outside */}
            <div
              className="fixed inset-0 z-[39]"
              onClick={() => setSettingsWidget(null)}
            />
            {/* Spotlight: positioned over the selected widget with a massive box-shadow
                that dims everything except the widget area */}
            {spotlightRect && (
              <div
                className="fixed z-40 rounded-md pointer-events-none"
                style={{
                  top: spotlightRect.top,
                  left: spotlightRect.left,
                  width: spotlightRect.width,
                  height: spotlightRect.height,
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.4)",
                }}
              />
            )}
          </>
        )}

        {/* Inline Editor Panel */}
        {settingsWidget && settingsWidgetRect && (
          <WidgetEditorPanel
            widget={settingsWidget}
            widgetRect={settingsWidgetRect}
            onClose={() => setSettingsWidget(null)}
            onUpdateConfig={updateWidgetConfig}
            onRemove={(id) => { removeWidget(id); showToast("Widget removed"); }}
            onApplyFontToAll={handleApplyFontToAll}
            onApplyBgResetToAll={() => { updateAllWidgetConfigs({ bgColor: "" }); showToast("Background reset on all widgets"); }}
            onApplyTextColorToAll={(color) => { updateAllWidgetConfigs({ textColor: color }); showToast("Text color applied to all widgets"); }}
            onApplyBorderToAll={(value) => { updateAllWidgetConfigs({ widgetBorder: value }); showToast(`Border ${value === "false" ? "hidden" : "shown"} on all widgets`); }}
            onApplyAccentToAll={(color) => { updateAllWidgetConfigs({ accentColor: color }); showToast("Accent color applied to all widgets"); }}
            savedImages={savedImages}
            onAddSavedImage={addSavedImage}
          />
        )}

      </div>
      </div>
    </PageTransition>
  );
}
