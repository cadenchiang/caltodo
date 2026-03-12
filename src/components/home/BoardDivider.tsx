"use client";

/**
 * Editable board divider line between description and widget grid.
 * Supports: show/hide toggle, inline text, color, thickness.
 * When hidden in view mode: invisible. On hover in edit mode: shows "Add divider" button.
 * When visible: displays line with optional centered text.
 *
 * @param color - CSS color for the divider (empty = theme default)
 * @param thickness - Line thickness in pixels (1-64)
 * @param text - Optional text centered on the divider line
 * @param visible - Whether the divider is visible
 * @param editMode - Whether the dashboard is in edit mode
 * @param onChange - Callback with updated divider config
 */

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Plus } from "lucide-react";
import ColorPickerPanel from "@/components/ui/ColorPickerPanel";
import { useTheme } from "@/contexts/ThemeContext";

interface BoardDividerProps {
  color: string;
  thickness: number;
  text: string;
  visible: boolean;
  editMode: boolean;
  onChange: (color: string, thickness: number, text: string, visible: boolean) => void;
}

export default function BoardDivider({
  color,
  thickness,
  text,
  visible,
  editMode,
  onChange,
}: BoardDividerProps) {
  const { colorTheme } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [draftColor, setDraftColor] = useState(color);
  const [draftThickness, setDraftThickness] = useState(thickness);
  const [draftText, setDraftText] = useState(text);
  const [hovered, setHovered] = useState(false);

  /** Sync drafts when props change externally. */
  useEffect(() => {
    setDraftColor(color);
    setDraftThickness(thickness);
    setDraftText(text);
  }, [color, thickness, text]);

  /** Saves the draft and closes the modal. */
  function handleSave() {
    onChange(draftColor, draftThickness, draftText, visible);
    setModalOpen(false);
  }

  const displayColor = colorTheme ? undefined : (color || undefined);

  // Hidden state: show add button on hover in edit mode
  if (!visible) {
    if (!editMode) return null;
    return (
      <div
        className="mx-6 md:mx-10 mb-2 flex items-center justify-center h-4"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          onClick={() => onChange(color, thickness, text, true)}
          className={`flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-all ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <Plus size={12} />
          Add divider
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Divider line with optional text */}
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
          {text ? (
            /* Divider with centered text */
            <div className="flex items-center gap-3">
              <div
                className={`flex-1 ${displayColor ? "" : "border-t border-foreground/8"}`}
                style={{
                  ...(displayColor
                    ? { backgroundColor: displayColor, height: `${thickness}px` }
                    : { borderTopWidth: `${thickness}px` }),
                }}
              />
              <span
                className="text-xs font-medium text-muted-foreground shrink-0 px-1"
                style={displayColor ? { color: displayColor } : undefined}
              >
                {text}
              </span>
              <div
                className={`flex-1 ${displayColor ? "" : "border-t border-foreground/8"}`}
                style={{
                  ...(displayColor
                    ? { backgroundColor: displayColor, height: `${thickness}px` }
                    : { borderTopWidth: `${thickness}px` }),
                }}
              />
            </div>
          ) : (
            /* Plain divider line */
            <div
              className={displayColor ? "" : "border-t border-foreground/8"}
              style={{
                ...(displayColor
                  ? { backgroundColor: displayColor, height: `${thickness}px` }
                  : { borderTopWidth: `${thickness}px` }),
              }}
            />
          )}
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
            <div className="relative bg-popover rounded-2xl shadow-xl border border-border w-full w-[calc(100%-2rem)] max-w-sm animate-announce-card-in overflow-hidden">
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

              {/* Text */}
              <div className="px-4 pb-3">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Text</label>
                <input
                  type="text"
                  placeholder="Optional label"
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Color — hidden when a color theme is active */}
              {!colorTheme && (
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
              )}

              {/* Thickness — slider + numeric display */}
              <div className="px-4 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Thickness</label>
                  <span className="text-xs tabular-nums text-muted-foreground">{draftThickness}px</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={64}
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
                  {draftText ? (
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-1" style={{ height: `${draftThickness}px`, backgroundColor: draftColor || "var(--foreground)", opacity: draftColor ? 1 : 0.08 }} />
                      <span className="text-xs font-medium text-muted-foreground shrink-0" style={draftColor ? { color: draftColor } : undefined}>{draftText}</span>
                      <div className="flex-1" style={{ height: `${draftThickness}px`, backgroundColor: draftColor || "var(--foreground)", opacity: draftColor ? 1 : 0.08 }} />
                    </div>
                  ) : (
                    <div
                      className="w-full"
                      style={{
                        height: `${draftThickness}px`,
                        backgroundColor: draftColor || "var(--foreground)",
                        opacity: draftColor ? 1 : 0.08,
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between p-4 pt-2">
                <button
                  onClick={() => { onChange(color, thickness, text, false); setModalOpen(false); }}
                  className="px-3 py-1.5 text-sm rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors"
                >
                  Remove Divider
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setDraftColor(color);
                      setDraftThickness(thickness);
                      setDraftText(text);
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
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
