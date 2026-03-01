"use client";

/**
 * Home dashboard page — "Your Board" personal dashboard.
 * Notion-style layout: cover banner → emoji icon → editable title → widget grid.
 * Edit mode toggle: pencil icon (view) / "Done" pill (edit).
 */

import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import PageTransition from "@/components/ui/PageTransition";
import EditToggleButton from "@/components/ui/EditToggleButton";
import WidgetGrid from "@/components/home/WidgetGrid";
import WidgetGalleryModal from "@/components/home/WidgetGalleryModal";
import WidgetSettingsModal from "@/components/home/WidgetSettingsModal";
import BoardCover from "@/components/home/BoardCover";
import BoardTitle from "@/components/home/BoardTitle";
import EmojiPicker from "@/components/home/EmojiPicker";
import { useWidgetLayout } from "@/hooks/useWidgetLayout";
import type { WidgetType, WidgetInstance } from "@/lib/widget-types";

export default function HomePage() {
  const {
    widgets,
    layouts,
    hydrated,
    boardTitle,
    coverImageUrl,
    boardEmoji,
    setLayouts,
    addWidget,
    removeWidget,
    updateWidgetConfig,
    updateAllWidgetConfigs,
    setBoardTitle,
    setCoverImageUrl,
    setBoardEmoji,
    titleFontFamily,
    titleTextColor,
    setTitleConfig,
  } = useWidgetLayout();

  const [editMode, setEditMode] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [settingsWidget, setSettingsWidget] = useState<WidgetInstance | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

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

  /** Applies a font to all widgets. */
  const handleApplyFontToAll = useCallback(
    (font: string) => {
      updateAllWidgetConfigs({ fontFamily: font });
    },
    [updateAllWidgetConfigs]
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
      <div className="h-full flex flex-col overflow-y-auto -mx-4 md:-mx-10 -mt-4 md:-mt-10">
        {/* Cover Image */}
        <BoardCover
          coverImageUrl={coverImageUrl}
          editMode={editMode}
          onChangeCover={setCoverImageUrl}
        />

        {/* Header: Emoji + Title + Controls — px matches grid padding + grid margin */}
        <div className="px-10 md:px-[56px]">
          {/* Emoji icon — overlaps bottom of cover for Notion effect */}
          <div className="relative -mt-7 mb-5">
            <button
              onClick={() => {
                if (editMode) setEmojiPickerOpen((p) => !p);
              }}
              className={`text-5xl leading-none ${
                editMode ? "cursor-pointer hover:opacity-80 transition-opacity" : "cursor-default"
              }`}
              aria-label="Board icon"
            >
              {boardEmoji}
            </button>
            <EmojiPicker
              open={emojiPickerOpen}
              onSelect={setBoardEmoji}
              onClose={() => setEmojiPickerOpen(false)}
            />
          </div>

          {/* Title row + controls — controls right-aligned with grid below */}
          <div className="flex items-center justify-between mb-4">
            <BoardTitle
              title={boardTitle}
              editMode={editMode}
              titleConfig={{ fontFamily: titleFontFamily, textColor: titleTextColor }}
              onTitleChange={setBoardTitle}
              onTitleConfigChange={(cfg) => setTitleConfig(cfg.fontFamily || "", cfg.textColor || "")}
            />

            <div className="flex items-center gap-2 shrink-0">
              {editMode && (
                <button
                  onClick={() => setGalleryOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                >
                  <Plus size={14} />
                  Add Widget
                </button>
              )}

              <EditToggleButton
                editing={editMode}
                onToggle={() => setEditMode((prev) => !prev)}
              />
            </div>
          </div>
        </div>

        {/* Widget Grid (full width) */}
        <div className="flex-1 min-h-0 pb-20">
          <WidgetGrid
            widgets={widgets}
            layouts={layouts}
            editMode={editMode}
            onLayoutChange={setLayouts}
            onRemoveWidget={removeWidget}
            onWidgetSettings={handleWidgetSettings}
            onUpdateWidgetConfig={updateWidgetConfig}
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
        />
      </div>
    </PageTransition>
  );
}
