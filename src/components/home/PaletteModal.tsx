"use client";

/**
 * Palette picker modal shown after extracting dominant colors from a banner.
 * Displays color swatches in a row; user selects one to apply to widget text.
 *
 * @param open - Whether the modal is visible
 * @param colors - Array of hex color strings extracted from the banner
 * @param onApply - Callback with the selected hex color
 * @param onSkip - Callback to dismiss without applying
 */

import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Check } from "lucide-react";

interface PaletteModalProps {
  open: boolean;
  colors: string[];
  onApply: (color: string) => void;
  onSkip: () => void;
}

export default function PaletteModal({
  open,
  colors,
  onApply,
  onSkip,
}: PaletteModalProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleApply = useCallback(() => {
    if (selected) {
      onApply(selected);
    }
  }, [selected, onApply]);

  if (!open || colors.length === 0 || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in"
        onClick={onSkip}
      />

      {/* Card */}
      <div className="relative bg-popover rounded-2xl shadow-2xl border border-border w-full max-w-xs mx-4 animate-announce-card-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">
            Match Widget Colors
          </h2>
          <button
            onClick={onSkip}
            className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        {/* Swatches */}
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-3">
            Pick a color from your banner to apply to widget text.
          </p>
          <div className="flex items-center justify-center gap-3">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelected(color)}
                className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                  selected === color
                    ? "border-blue-500 scale-110 shadow-md"
                    : "border-border hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              >
                {selected === color && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check
                      size={16}
                      className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-sm rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleApply}
            disabled={!selected}
            className="px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Apply to Widgets
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
