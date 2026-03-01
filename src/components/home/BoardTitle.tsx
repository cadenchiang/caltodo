"use client";

/**
 * Board title display + click-to-edit modal.
 * View mode: renders as a styled h1.
 * Edit mode: clicking opens a popup modal to edit title, font, and color.
 *
 * @param title - Current board title
 * @param editMode - Whether editing is active
 * @param titleConfig - Font/color config for title styling
 * @param onTitleChange - Callback with new title
 * @param onTitleConfigChange - Callback with font/color config
 */

import { useState, useEffect } from "react";
import { X } from "lucide-react";

/** Available font families. */
const FONT_OPTIONS: { label: string; value: string }[] = [
  { label: "System Default", value: "" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Georgia", value: "'Georgia', serif" },
  { label: "Menlo", value: "'Menlo', monospace" },
  { label: "Helvetica Neue", value: "'Helvetica Neue', sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Palatino", value: "'Palatino Linotype', serif" },
];


interface TitleConfig {
  fontFamily?: string;
  textColor?: string;
}

interface BoardTitleProps {
  title: string;
  editMode: boolean;
  titleConfig?: TitleConfig;
  onTitleChange: (newTitle: string) => void;
  onTitleConfigChange?: (config: TitleConfig) => void;
}

export default function BoardTitle({
  title,
  editMode,
  titleConfig,
  onTitleChange,
  onTitleConfigChange,
}: BoardTitleProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);
  const [localFont, setLocalFont] = useState(titleConfig?.fontFamily || "");
  const [localColor, setLocalColor] = useState(titleConfig?.textColor || "");

  // Sync from props
  useEffect(() => {
    setLocalTitle(title);
    setLocalFont(titleConfig?.fontFamily || "");
    setLocalColor(titleConfig?.textColor || "");
  }, [title, titleConfig]);

  /** Saves all changes and closes modal. */
  function handleSave() {
    const trimmed = localTitle.trim() || "My Board";
    onTitleChange(trimmed);
    onTitleConfigChange?.({ fontFamily: localFont, textColor: localColor });
    setModalOpen(false);
  }

  const titleStyle: React.CSSProperties = {
    fontFamily: titleConfig?.fontFamily || undefined,
    color: titleConfig?.textColor || undefined,
  };

  return (
    <>
      <h1
        className={`text-3xl md:text-4xl font-bold text-foreground ${
          editMode ? "cursor-pointer hover:opacity-70 transition-opacity" : ""
        }`}
        style={titleStyle}
        onClick={() => {
          if (editMode) setModalOpen(true);
        }}
      >
        {title}
      </h1>

      {/* Title editing modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-announce-backdrop-in" onClick={() => setModalOpen(false)} />
          <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-sm mx-4 animate-announce-card-in overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">Edit Title</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Title input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                <input
                  type="text"
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value.slice(0, 50))}
                  maxLength={50}
                  className="w-full px-3 py-2 rounded-lg border border-input-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>

              {/* Font */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Font</label>
                <select
                  value={localFont}
                  onChange={(e) => setLocalFont(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              {/* Color — color wheel + hex input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={localColor || "#000000"}
                    onChange={(e) => setLocalColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={localColor}
                    onChange={(e) => setLocalColor(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 px-3 py-2 rounded-lg border border-input-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                  />
                  {localColor && (
                    <button
                      type="button"
                      onClick={() => setLocalColor("")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div className="p-3 rounded-lg bg-muted">
                <span
                  className="text-xl font-bold"
                  style={{
                    fontFamily: localFont || undefined,
                    color: localColor || undefined,
                  }}
                >
                  {localTitle || "My Board"}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
