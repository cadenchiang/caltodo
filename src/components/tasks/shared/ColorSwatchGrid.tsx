"use client";

import { Check } from "lucide-react";
import { TASK_COLORS, getTaskColorName, getThemeColor } from "@/lib/constants";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface ColorSwatchGridProps {
  /** Currently selected colour (hex as stored), if any. */
  value?: string | null;
  /** Receives the palette hex (as stored, not the theme-mapped shade). */
  onSelect: (hex: string) => void;
  /** Swatch diameter class. Defaults to w-6 h-6. */
  swatchClassName?: string;
  /** Grid layout class. Defaults to a five-column grid. */
  className?: string;
}

/**
 * The one palette grid. Every swatch is painted through getThemeColor so a
 * Miffy user sees the pink the colour will actually render as, and every
 * swatch is named ("Blue") for assistive tech.
 *
 * @param value - Selected hex, marked with a check
 * @param onSelect - Receives the stored hex of the chosen swatch
 */
export default function ColorSwatchGrid({ value, onSelect, swatchClassName = "w-6 h-6", className }: ColorSwatchGridProps) {
  const { colorTheme } = useTheme();
  return (
    <div className={cn("grid grid-cols-5 gap-1.5", className)} role="group" aria-label="Task color">
      {TASK_COLORS.map((c) => {
        const selected = !!value && value.toUpperCase() === c.toUpperCase();
        return (
          <button
            key={c}
            type="button"
            onClick={() => onSelect(c)}
            aria-label={getTaskColorName(c)}
            aria-pressed={selected}
            title={getTaskColorName(c)}
            className={cn(
              "rounded-full flex items-center justify-center ring-offset-2 ring-offset-popover transition-shadow hover:ring-2 hover:ring-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected && "ring-2 ring-foreground/40",
              swatchClassName
            )}
            style={{ backgroundColor: getThemeColor(c, colorTheme) }}
          >
            {selected && <Check size={12} className="text-white" strokeWidth={3} aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}
