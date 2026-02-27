"use client";

import { useState, useEffect, useRef } from "react";

const RECENT_COLORS_KEY = "caltodo_recent_colors";
const MAX_RECENT = 6;

/**
 * Props for the ColorWheel component.
 *
 * @param value - Current selected hex color
 * @param onChange - Callback when a color is selected
 */
interface ColorWheelProps {
  value: string;
  onChange: (color: string) => void;
}

/**
 * Loads recently used custom colors from localStorage.
 *
 * @returns Array of hex color strings (most recent first)
 */
function loadRecentColors(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_COLORS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

/**
 * Saves a color to the recent colors list in localStorage.
 * Deduplicates and keeps only the most recent MAX_RECENT entries.
 *
 * @param color - Hex color string to save
 */
function saveRecentColor(color: string) {
  try {
    const existing = loadRecentColors();
    const upper = color.toUpperCase();
    const filtered = existing.filter((c) => c.toUpperCase() !== upper);
    const updated = [color, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(updated));
  } catch {
    // Storage unavailable
  }
}

/**
 * Color picker component using native <input type="color"> for full custom
 * color selection, with a row of recently used colors saved to localStorage.
 *
 * @param value - Current hex color value
 * @param onChange - Callback fired when a new color is selected
 */
export default function ColorWheel({ value, onChange }: ColorWheelProps) {
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecentColors(loadRecentColors());
  }, []);

  /**
   * Handles native color input change. Saves to recents and triggers onChange.
   */
  function handleColorChange(newColor: string) {
    onChange(newColor);
    saveRecentColor(newColor);
    setRecentColors(loadRecentColors());
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Current color + native picker trigger */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-8 h-8 rounded-full border-2 border-border cursor-pointer transition-transform hover:scale-110"
          style={{ backgroundColor: value }}
          title="Pick a custom color"
        />
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={(e) => handleColorChange(e.target.value)}
          className="sr-only"
        />
        <span className="text-xs text-muted-foreground font-mono uppercase">
          {value}
        </span>
      </div>

      {/* Recent colors row */}
      {recentColors.length > 0 && (
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">Recent</p>
          <div className="flex gap-1.5">
            {recentColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onChange(c);
                  saveRecentColor(c);
                  setRecentColors(loadRecentColors());
                }}
                className={`w-5 h-5 rounded-full transition-all ${
                  value.toUpperCase() === c.toUpperCase() ? "scale-125" : "hover:scale-110"
                }`}
                style={{
                  backgroundColor: c,
                  boxShadow:
                    value.toUpperCase() === c.toUpperCase()
                      ? `0 0 0 2px white, 0 0 0 3px ${c}`
                      : "none",
                }}
                title={c}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
