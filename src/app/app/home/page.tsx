"use client";

/**
 * Home dashboard page — "Your Board" personal dashboard.
 * Notion-style layout: cover banner → emoji icon → editable title → widget grid.
 * Edit mode toggle: pencil icon (view) / "Done" pill (edit).
 */

import { useState, useCallback, useEffect } from "react";
import { Plus } from "lucide-react";
import PageTransition from "@/components/ui/PageTransition";
import EditToggleButton from "@/components/ui/EditToggleButton";
import WidgetGrid from "@/components/home/WidgetGrid";
import WidgetGalleryModal from "@/components/home/WidgetGalleryModal";
import WidgetSettingsModal from "@/components/home/WidgetSettingsModal";
import BoardCover from "@/components/home/BoardCover";
import BoardTitle from "@/components/home/BoardTitle";
import BoardDescription from "@/components/home/BoardDescription";
import EmojiPicker, { LUCIDE_ICON_MAP, ICON_SIZES } from "@/components/home/EmojiPicker";
import { useWidgetLayout } from "@/hooks/useWidgetLayout";
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
  } = useWidgetLayout();

  const [editMode, setEditMode] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [settingsWidget, setSettingsWidget] = useState<WidgetInstance | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Listen for tour-controlled edit mode toggle (fired by AppTour click animations)
  useEffect(() => {
    function handleTourEditMode(e: Event) {
      const enabled = (e as CustomEvent).detail === true;
      setEditMode(enabled);
    }
    window.addEventListener("tour-set-edit-mode", handleTourEditMode);
    return () => window.removeEventListener("tour-set-edit-mode", handleTourEditMode);
  }, []);

  /** Handles adding a widget from the gallery. */
  const handleAddWidget = useCallback(
    (type: WidgetType) => {
      addWidget(type);
    },
    [addWidget]
  );

  /** Opens settings modal for a specific widget. */
  const handleWidgetSettings = useCallback(
    (id: string) => {
      const widget = widgets.find((w) => w.id === id) || null;
      setSettingsWidget(widget);
    },
    [widgets]
  );

  /** Saves widget config from settings modal. */
  const handleSaveSettings = useCallback(
    (id: string, config: Record<string, string>) => {
      updateWidgetConfig(id, config);
    },
    [updateWidgetConfig]
  );

  /** Applies a font to all widgets and the board title. */
  const handleApplyFontToAll = useCallback(
    (font: string) => {
      updateAllWidgetConfigs({ fontFamily: font });
      setTitleConfig(font, titleTextColor, titleFontSize);
    },
    [updateAllWidgetConfigs, setTitleConfig, titleTextColor, titleFontSize]
  );

  // Don't render grid until localStorage is hydrated (avoids layout flash)
  if (!hydrated) {
    return (
      <PageTransition>
        <div className="h-full flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className={`h-full flex flex-col -mx-4 md:-mx-10 -mt-4 md:-mt-10 -mb-4 md:-mb-10 ${isDragging ? "overflow-hidden" : "overflow-y-auto"}`}>
        {/* Cover Image */}
        <BoardCover
          coverImageUrl={coverImageUrl}
          editMode={editMode}
          onChangeCover={setCoverImageUrl}
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
                editMode ? "cursor-pointer hover:opacity-80 transition-opacity" : "cursor-default"
              }`}
              aria-label="Board icon"
            >
              {(() => {
                const sizePx = ICON_SIZES.find((s) => s.value === iconSize)?.px ?? 64;
                if (boardEmoji.startsWith("lucide:")) {
                  const iconName = boardEmoji.slice(7);
                  const LucideIcon = LUCIDE_ICON_MAP[iconName];
                  if (LucideIcon) {
                    return <LucideIcon size={sizePx} strokeWidth={1.5} className="text-foreground" />;
                  }
                }
                return <span style={{ fontSize: sizePx, lineHeight: 1 }}>{boardEmoji}</span>;
              })()}
            </button>
            <EmojiPicker
              open={emojiPickerOpen}
              onSelect={setBoardEmoji}
              onClose={() => setEmojiPickerOpen(false)}
              paletteColors={[]}
              iconSize={iconSize}
              onSizeChange={setIconSize}
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
        <div className="border-t border-foreground/8 mx-6 md:mx-10 mb-6" />

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
          />
        </div>

        {/* Empty state */}
        {widgets.length === 0 && !editMode && (
          <div className="flex-1 flex flex-col items-center justify-center text-center pb-20">
            <p className="text-muted-foreground mb-3">
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

        {/* Gallery Modal */}
        <WidgetGalleryModal
          open={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          onAdd={handleAddWidget}
        />

        {/* Settings Modal */}
        <WidgetSettingsModal
          open={!!settingsWidget}
          widget={settingsWidget}
          onClose={() => setSettingsWidget(null)}
          onSave={handleSaveSettings}
          onRemove={removeWidget}
          onApplyFontToAll={handleApplyFontToAll}
          onApplyBgResetToAll={() => updateAllWidgetConfigs({ bgColor: "" })}
          onApplyTextColorToAll={(color) => updateAllWidgetConfigs({ textColor: color })}
        />


      </div>
    </PageTransition>
  );
}
