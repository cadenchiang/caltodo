"use client";

/**
 * Reusable pill-toggle segmented control following the ThemeToggle.tsx
 * sliding-indicator pattern. Generic over option values for type safety.
 *
 * @param options - Array of { value, label } segments to render
 * @param value - Currently selected value
 * @param onChange - Callback fired when a segment is clicked
 * @param size - Visual size: "sm" (28px tall) or "md" (32px tall)
 */

import { cn } from "@/lib/utils";

interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "sm",
}: SegmentedControlProps<T>) {
  const activeIndex = options.findIndex((o) => o.value === value);
  const isMd = size === "md";
  const segH = isMd ? "h-8" : "h-7";
  const segPx = isMd ? "px-3" : "px-2.5";
  const textSize = isMd ? "text-sm" : "text-xs";

  return (
    <div
      className={cn(
        "relative inline-flex w-full rounded-lg p-0.5 transition-colors duration-200",
        "bg-muted border border-border"
      )}
    >
      {/* Sliding highlight indicator */}
      <div
        className={cn(
          "absolute top-0.5 left-0.5 rounded-md bg-popover shadow-sm transition-all duration-200 ease-in-out",
          segH
        )}
        style={{
          width: `calc(${100 / options.length}% - 2px)`,
          transform: `translateX(calc(${activeIndex} * 100% + ${activeIndex} * 2px))`,
        }}
        aria-hidden
      />

      {/* Segment buttons */}
      {options.map(({ value: optVal, label }) => {
        const isActive = optVal === value;
        return (
          <button
            key={optVal}
            type="button"
            onClick={() => onChange(optVal)}
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center rounded-md transition-colors duration-150",
              segH,
              segPx,
              textSize,
              "font-medium whitespace-nowrap",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
