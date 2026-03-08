"use client";

/**
 * Reusable color picker panel with preset swatches + saved custom colors.
 * Shows a grid of preset colors, a "+" button to save a custom color via
 * native color input, and a row of user-saved colors from localStorage.
 * Optionally shows an "Apply to all widgets?" prompt after color selection.
 *
 * @param value - Current hex color value
 * @param onChange - Callback fired when color changes
 * @param onApplyToAll - Optional callback to apply color to all widgets
 */

import { useState, useRef, useEffect } from "react";
import { Plus, X, Check, Pipette } from "lucide-react";
import { TASK_COLORS } from "@/lib/constants";
import ColorWheel from "@/components/ui/ColorWheel";

const SAVED_COLORS_KEY = "caltodo_saved_colors";
const MAX_SAVED = 12;

/**
 * Loads saved custom colors from localStorage.
 *
 * @returns Array of hex color strings
 */
function loadSavedColors(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_COLORS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_SAVED) : [];
  } catch { return []; }
}

/**
 * Saves a custom color to localStorage (deduplicates, newest first).
 *
 * @param color - Hex color string to save
 */
function addSavedColor(color: string) {
  try {
    const existing = loadSavedColors();
    const upper = color.toUpperCase();
    const filtered = existing.filter(c => c.toUpperCase() !== upper);
    localStorage.setItem(SAVED_COLORS_KEY, JSON.stringify([color, ...filtered].slice(0, MAX_SAVED)));
  } catch { /* storage unavailable */ }
}

/**
 * Removes a saved color from localStorage.
 *
 * @param color - Hex color string to remove
 */
function removeSavedColor(color: string) {
  try {
    const existing = loadSavedColors();
    const upper = color.toUpperCase();
    localStorage.setItem(SAVED_COLORS_KEY, JSON.stringify(existing.filter(c => c.toUpperCase() !== upper)));
  } catch { /* storage unavailable */ }
}

interface ColorPickerPanelProps {
  /** Current selected hex color. */
  value: string;
  /** Callback fired on color change. */
  onChange: (color: string) => void;
  /** Optional callback to apply color to all widgets. */
  onApplyToAll?: (color: string) => void;
}

export default function ColorPickerPanel({ value, onChange, onApplyToAll }: ColorPickerPanelProps) {
  const [savedColors, setSavedColors] = useState<string[]>([]);
  const [showWheel, setShowWheel] = useState(false);
  const [wheelColor, setWheelColor] = useState(value || "#4285F4");
  const [showApplyPrompt, setShowApplyPrompt] = useState(false);
  const [pendingColor, setPendingColor] = useState("");
  const promptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Load saved colors on mount. */
  useEffect(() => {
    setSavedColors(loadSavedColors());
  }, []);

  /** Clear prompt timer on unmount. */
  useEffect(() => {
    return () => {
      if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
    };
  }, []);

  /**
   * Handles color selection — applies it and optionally shows "apply to all" prompt.
   *
   * @param color - Selected hex color
   */
  function handleColorSelect(color: string) {
    onChange(color);
    if (onApplyToAll) {
      setPendingColor(color);
      setShowApplyPrompt(true);
      if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
      promptTimerRef.current = setTimeout(() => setShowApplyPrompt(false), 4000);
    }
  }

  /**
   * Toggles the color wheel open/closed. Syncs wheel color to current value.
   */
  function handleToggleWheel() {
    if (!showWheel) setWheelColor(value || "#4285F4");
    setShowWheel((prev) => !prev);
  }

  /**
   * Saves the current wheel color to saved colors and selects it.
   */
  function handleSaveWheelColor() {
    addSavedColor(wheelColor);
    setSavedColors(loadSavedColors());
    handleColorSelect(wheelColor);
  }

  /** Whether the browser supports the EyeDropper API. */
  const hasEyeDropper = typeof window !== "undefined" && "EyeDropper" in window;

  /**
   * Opens the native EyeDropper to pick a color from anywhere on screen.
   */
  async function handleEyeDropper() {
    try {
      // Hide all overlays/modals so the eyedropper sees the actual page
      document.body.classList.add("eyedropper-active");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dropper = new (window as any).EyeDropper();
      const result = await dropper.open();
      document.body.classList.remove("eyedropper-active");
      if (result?.sRGBHex) {
        handleColorSelect(result.sRGBHex);
      }
    } catch {
      document.body.classList.remove("eyedropper-active");
    }
  }

  /**
   * Removes a saved color swatch.
   *
   * @param color - Hex color to remove
   * @param e - Mouse event (stopped to prevent selection)
   */
  function handleRemoveSaved(color: string, e: React.MouseEvent) {
    e.stopPropagation();
    removeSavedColor(color);
    setSavedColors(loadSavedColors());
  }

  return (
    <div className="space-y-3">
      {/* Preset swatches */}
      <div className="grid grid-cols-6 gap-2 justify-items-center">
        {TASK_COLORS.map((c) => {
          const isSelected = value.toUpperCase() === c.toUpperCase();
          return (
            <button
              key={c}
              type="button"
              onClick={() => handleColorSelect(c)}
              className={`w-7 h-7 rounded-full transition-all duration-150 cursor-pointer ${
                isSelected
                  ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900 scale-110"
                  : "hover:scale-110"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          );
        })}

        {/* Add custom color — toggles color wheel */}
        <button
          type="button"
          onClick={handleToggleWheel}
          className={`w-7 h-7 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-150 ${
            showWheel ? "border-blue-500 scale-110" : "border-border hover:border-muted-foreground"
          }`}
          aria-label="Add custom color"
        >
          <Plus size={12} className="text-muted-foreground" />
        </button>

        {/* Eyedropper — pick color from screen */}
        {hasEyeDropper && (
          <button
            type="button"
            onClick={handleEyeDropper}
            className="w-7 h-7 rounded-full border-2 border-border flex items-center justify-center cursor-pointer hover:scale-110 hover:border-muted-foreground transition-all duration-150"
            aria-label="Pick color from screen"
          >
            <Pipette size={12} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Color wheel for custom color picking */}
      {showWheel && (
        <div className="flex flex-col items-center gap-2 pt-1">
          <ColorWheel
            value={wheelColor}
            onChange={(c) => {
              setWheelColor(c);
              onChange(c);
            }}
          />
          <button
            type="button"
            onClick={handleSaveWheelColor}
            className="flex items-center gap-1 text-[11px] px-3 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            <Check size={10} />
            Save color
          </button>
        </div>
      )}

      {/* Saved custom colors */}
      {savedColors.length > 0 && (
        <div className="pt-1 border-t border-border">
          <p className="text-[10px] text-muted-foreground mb-1.5">Saved</p>
          <div className="flex flex-wrap gap-2">
            {savedColors.map((c) => {
              const isSelected = value.toUpperCase() === c.toUpperCase();
              return (
                <div key={c} className="relative group">
                  <button
                    type="button"
                    onClick={() => handleColorSelect(c)}
                    className={`w-6 h-6 rounded-full transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-gray-900 scale-110"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Saved color ${c}`}
                  />
                  <button
                    type="button"
                    onClick={(e) => handleRemoveSaved(c, e)}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-popover border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove saved color ${c}`}
                  >
                    <X size={8} className="text-muted-foreground" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Apply to all prompt */}
      {showApplyPrompt && onApplyToAll && (
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border animate-in fade-in duration-200">
          <span className="text-[11px] text-muted-foreground">Apply to all widgets?</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setShowApplyPrompt(false)}
              className="text-[11px] px-2 py-0.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
            >
              No
            </button>
            <button
              type="button"
              onClick={() => {
                onApplyToAll(pendingColor);
                setShowApplyPrompt(false);
              }}
              className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
