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
import EmojiPicker, { LUCIDE_ICON_MAP, isFilledIcon } from "@/components/home/EmojiPicker";
import { ICON_SIZES } from "@/components/home/emoji-picker-data";
import { useWidgetLayout } from "@/hooks/useWidgetLayout";
import { useToast } from "@/contexts/ToastContext";
import type { WidgetType, WidgetInstance } from "@/lib/widget-types";

export default function HomePage() {
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
    setDividerConfig,
    savedImages,
    addSavedImage,
  } = useWidgetLayout();

  const { showToast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [settingsWidget, setSettingsWidget] = useState<WidgetInstance | null>(null);
  const [settingsWidgetRect, setSettingsWidgetRect] = useState<DOMRect | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  /** Widget type being dragged from gallery (null when not drag-to-placing). */
  const [draggingType, setDraggingType] = useState<WidgetType | null>(null);
  /** Live widget rect for the spotlight overlay (updates on scroll/resize). */
  const [spotlightRect, setSpotlightRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const spotlightRafRef = useRef(0);

  // Listen for tour-controlled edit mode toggle (fired by AppTour click animations)
  useEffect(() => {
    function handleTourEditMode(e: Event) {
      const enabled = (e as CustomEvent).detail === true;
      setEditMode(enabled);
    }
    window.addEventListener("tour-set-edit-mode", handleTourEditMode);
    return () => window.removeEventListener("tour-set-edit-mode", handleTourEditMode);
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

  /** Handles adding a widget from the gallery. */
  const handleAddWidget = useCallback(
    (type: WidgetType) => {
      addWidget(type);
      showToast("Widget added");
    },
    [addWidget, showToast]
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

  /** Called when user drops an external item onto the grid. */
  const handleExternalDrop = useCallback(
    (item: { x: number; y: number }) => {
      if (dropHandledRef.current) return;
      dropHandledRef.current = true;
      setDraggingType((prev) => {
        if (prev) {
          addWidget(prev, {}, { x: item.x, y: item.y });
          showToast("Widget added");
        }
        return null;
      });
    },
    [addWidget, showToast]
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

  // Don't render grid until localStorage is hydrated (avoids layout flash)
  if (!hydrated) {
    return (
      <PageTransition>
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="h-full overflow-hidden -mx-4 md:-mx-10 -mt-4 md:-mt-10 -mb-4 md:-mb-10">
      <div className={`h-full flex flex-col ${isDragging ? "overflow-hidden" : "overflow-y-auto"}`}>
        {/* Cover Image */}
        <BoardCover
          coverImageUrl={coverImageUrl}
          editMode={editMode}
          onChangeCover={(url) => { setCoverImageUrl(url); showToast(url ? "Banner updated" : "Banner removed"); }}
          coverHeight={coverHeight}
          coverPositionY={coverPositionY}
          onChangeCoverConfig={setCoverConfig}
        />

        {/* Header: Emoji + Title + Controls — matches grid container padding */}
        <div className="px-6 md:px-10">
          {/* Board icon — overlaps bottom of cover for Notion effect */}
          <div className="relative mb-2.5" style={{ marginTop: -(( ICON_SIZES.find((s) => s.value === iconSize)?.px ?? 64) / 2) }}>
            <button
              onClick={() => {
                if (editMode) setEmojiPickerOpen((p) => !p);
              }}
              className={`leading-none ${
                editMode ? "cursor-pointer hover:opacity-80 transition-opacity animate-edit-hint" : "cursor-default"
              }`}
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
            <EmojiPicker
              open={emojiPickerOpen}
              onSelect={setBoardEmoji}
              onClose={() => setEmojiPickerOpen(false)}
            />
          </div>

          {/* Title row + controls — controls right-aligned with grid below */}
          <div className="flex items-center justify-between mb-6">
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
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-border bg-white dark:bg-gray-800 text-foreground hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all active:scale-[0.97]"
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

        {/* Board description */}
        <BoardDescription
          description={boardDescription}
          editMode={editMode}
          onDescriptionChange={setBoardDescription}
        />

        {/* Divider */}
        <BoardDivider
          color={dividerColor}
          thickness={dividerThickness}
          editMode={editMode}
          onDividerChange={setDividerConfig}
        />

        {/* Widget Grid (full width) */}
        <div id="widget-grid" className="flex-1 min-h-0 pb-20 md:pb-0">
          <WidgetGrid
            widgets={widgets}
            layouts={layouts}
            editMode={editMode}
            onLayoutChange={setLayouts}
            onRemoveWidget={removeWidget}
            onWidgetSettings={handleWidgetSettings}
            onUpdateWidgetConfig={updateWidgetConfig}
            onDragStart={() => setIsDragging(true)}
            onDragStop={() => setIsDragging(false)}
            selectedWidgetId={settingsWidget?.id}
            acceptDrop={!!draggingType}
            onExternalDrop={handleExternalDrop}
          />
        </div>

        {/* Empty state */}
        {widgets.length === 0 && !editMode && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <p className="text-sm text-muted-foreground mb-3">
              Your dashboard is empty
            </p>
            <button
              onClick={() => {
                setEditMode(true);
                setGalleryOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <Plus size={14} />
              Add Widgets
            </button>
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
