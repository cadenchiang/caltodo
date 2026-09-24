"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { ThemePreference } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

/** Segment definitions for the 3-position theme toggle. */
const SEGMENTS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "auto", label: "Auto", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
];

/**
 * Visible label for a segment. Auto also says what it currently resolves to
 * ("Auto, dark now"), since that is the thing a user checking the toggle
 * wants to know.
 *
 * @param value - The segment's preference
 * @param resolved - The theme currently applied
 * @returns The label text
 */
export function segmentLabel(value: ThemePreference, resolved: "light" | "dark"): string {
  const base = SEGMENTS.find((s) => s.value === value)?.label ?? value;
  return value === "auto" ? `${base} (${resolved} now)` : base;
}

/**
 * 3-segment theme toggle: Light | Auto | Dark, as a radiogroup with visible
 * labels. Painted with tokens (bg-card, border-border, text-foreground,
 * text-muted-foreground) so it follows every color theme instead of a fixed
 * zinc palette.
 *
 * @param className - Optional additional CSS classes
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const { preference, resolvedTheme, setPreference } = useTheme();
  const activeIndex = Math.max(0, SEGMENTS.findIndex((s) => s.value === preference));

  return (
    <div
      role="radiogroup"
      aria-label="Appearance"
      className={cn("relative inline-flex w-full max-w-md rounded-xl p-1 bg-card border border-border", className)}
    >
      <div
        aria-hidden="true"
        className="absolute top-1 bottom-1 left-1 rounded-lg bg-muted transition-transform duration-200 ease-in-out"
        style={{
          width: `calc(${100 / SEGMENTS.length}% - 0.5rem / ${SEGMENTS.length})`,
          transform: `translateX(calc(${activeIndex} * 100%))`,
        }}
      />
      {SEGMENTS.map(({ value, Icon }) => {
        const isActive = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setPreference(value)}
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
            <span className="truncate">{segmentLabel(value, resolvedTheme)}</span>
          </button>
        );
      })}
    </div>
  );
}
