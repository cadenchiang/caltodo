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
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import FontPicker from "@/components/ui/FontPicker";


/** Title size options with display labels and Tailwind classes. */
const TITLE_SIZES: { label: string; value: string; className: string }[] = [
  { label: "S", value: "sm", className: "text-xl md:text-2xl" },
  { label: "M", value: "md", className: "text-2xl md:text-3xl" },
  { label: "L", value: "lg", className: "text-3xl md:text-4xl" },
  { label: "XL", value: "xl", className: "text-4xl md:text-5xl" },
];

interface TitleConfig {
  fontFamily?: string;
  textColor?: string;
  fontSize?: string;
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
  const [localSize, setLocalSize] = useState(titleConfig?.fontSize || "lg");

  // Sync from props
  useEffect(() => {
    setLocalTitle(title);
    setLocalFont(titleConfig?.fontFamily || "");
    setLocalColor(titleConfig?.textColor || "");
    setLocalSize(titleConfig?.fontSize || "lg");
  }, [title, titleConfig]);

  /** Saves all changes and closes modal. */
  function handleSave() {
    const trimmed = localTitle.trim() || "My Board";
    onTitleChange(trimmed);
    onTitleConfigChange?.({ fontFamily: localFont, textColor: localColor, fontSize: localSize });
    setModalOpen(false);
  }

  /** Use system font when no custom font is configured. */
  const titleStyle: React.CSSProperties = {
    fontFamily: titleConfig?.fontFamily || undefined,
    color: titleConfig?.textColor || undefined,
  };

  const sizeClass = TITLE_SIZES.find((s) => s.value === (titleConfig?.fontSize || "lg"))?.className ?? "text-3xl md:text-4xl";

  return (
    <>
      <h1
        className={`${sizeClass} font-bold text-foreground ${
          editMode ? "cursor-pointer hover:opacity-70 transition-opacity animate-edit-hint" : ""
        }`}
        style={titleStyle}
        onClick={() => {
          if (editMode) setModalOpen(true);
        }}
      >
        {title}
      </h1>

      {/* Title editing modal — portaled to body to avoid clipping */}
      {modalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in" onClick={() => setModalOpen(false)} />
          <div className="relative bg-popover rounded-2xl shadow-2xl border border-border w-full max-w-md mx-4 animate-announce-card-in overflow-hidden">
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
                <FontPicker value={localFont} onChange={setLocalFont} />
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Size</label>
                <div className="flex gap-1.5">
                  {TITLE_SIZES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setLocalSize(s.value)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        localSize === s.value
                          ? "bg-blue-500 text-white"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
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
              <div className="p-3 rounded-lg bg-muted overflow-hidden">
                <span
                  className={`${TITLE_SIZES.find((s) => s.value === localSize)?.className ?? "text-3xl"} font-bold block truncate`}
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
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors">
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
