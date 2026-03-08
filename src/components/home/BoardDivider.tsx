"use client";

/**
 * Editable board divider line between description and widget grid.
 * In edit mode: pulses with animate-edit-hint, click opens editor modal
 * for color (using shared ColorPickerPanel) and thickness (slider, 1-24px).
 * In view mode: static line.
 *
 * @param color - CSS color for the divider (empty = theme default)
 * @param thickness - Line thickness in pixels (1-24)
 * @param editMode - Whether the dashboard is in edit mode
 * @param onDividerChange - Callback with updated color and thickness
 */

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import ColorPickerPanel from "@/components/ui/ColorPickerPanel";

interface BoardDividerProps {
  color: string;
  thickness: number;
  editMode: boolean;
  onDividerChange: (color: string, thickness: number) => void;
}

export default function BoardDivider({
  color,
  thickness,
  editMode,
  onDividerChange,
}: BoardDividerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [draftColor, setDraftColor] = useState(color);
  const [draftThickness, setDraftThickness] = useState(thickness);

  /** Sync drafts when props change externally. */
  useEffect(() => {
    setDraftColor(color);
    setDraftThickness(thickness);
  }, [color, thickness]);

  /** Saves the draft and closes the modal. */
  function handleSave() {
    onDividerChange(draftColor, draftThickness);
    setModalOpen(false);
  }

  /** Resolves the display color — falls back to theme default. */
  const displayColor = color || undefined;

  return (
    <>
      {/* Divider line */}
      <div className="mx-6 md:mx-10 mb-6">
        <button
          type="button"
          onClick={() => {
            if (editMode) setModalOpen(true);
          }}
          className={`w-full rounded-sm transition-all ${
            editMode
              ? "cursor-pointer hover:opacity-60 transition-opacity animate-edit-hint py-1.5 -my-1.5"
              : "cursor-default py-0"
          }`}
          aria-label="Board divider"
        >
          <div
            className={displayColor ? "" : "border-t border-foreground/8"}
            style={{
              ...(displayColor
                ? { backgroundColor: displayColor, height: `${thickness}px` }
                : { borderTopWidth: `${thickness}px` }),
            }}
          />
        </button>
      </div>

      {/* Edit modal — portaled to body */}
      {modalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40 animate-announce-backdrop-in"
              onClick={handleSave}
            />
            <div className="relative bg-popover rounded-2xl shadow-xl border border-border w-full max-w-sm mx-4 animate-announce-card-in overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 pb-2">
                <h2 className="text-base font-semibold text-foreground">
                  Divider Style
                </h2>
                <button
                  onClick={handleSave}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Color — uses shared ColorPickerPanel */}
              <div className="px-4 pb-3">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Color</label>
                <ColorPickerPanel
                  value={draftColor || "#888888"}
                  onChange={setDraftColor}
                />
                {draftColor && (
                  <button
                    type="button"
                    onClick={() => setDraftColor("")}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors mt-2"
                  >
                    Reset to default
                  </button>
                )}
              </div>

              {/* Thickness — slider + numeric display */}
              <div className="px-4 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Thickness</label>
                  <span className="text-xs tabular-nums text-muted-foreground">{draftThickness}px</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={24}
                  step={1}
                  value={draftThickness}
                  onChange={(e) => setDraftThickness(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              {/* Preview */}
              <div className="px-4 pb-3">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Preview</label>
                <div className="rounded-lg bg-muted/50 p-4 flex items-center justify-center">
                  <div
                    className="w-full"
                    style={{
                      height: `${draftThickness}px`,
                      backgroundColor: draftColor || "var(--foreground)",
                      opacity: draftColor ? 1 : 0.08,
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 p-4 pt-2">
                <button
                  onClick={() => {
                    setDraftColor(color);
                    setDraftThickness(thickness);
                    setModalOpen(false);
                  }}
                  className="px-3 py-1.5 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
