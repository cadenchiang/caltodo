"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { ThemePreference } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

/** Segment definitions for the 3-position theme toggle. */
const SEGMENTS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light mode", Icon: Sun },
  { value: "auto", label: "Auto (sunset)", Icon: Monitor },
  { value: "dark", label: "Dark mode", Icon: Moon },
];

/**
 * 3-segment pill theme toggle: Light | Auto | Dark. Painted with the design
 * tokens and `dark:` variants, so it follows the resolved theme from
 * ThemeContext (and the colour theme) instead of a hardcoded zinc/gray pair
 * that flashed light before hydration.
 *
 * @param className - Optional additional CSS classes
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const { preference, setPreference } = useTheme();
  const activeIndex = SEGMENTS.findIndex((s) => s.value === preference);

  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn("theme-toggle relative flex w-fit h-11 md:h-9 rounded-full p-1 border border-border bg-card transition-colors duration-300", className)}
    >
      {/* Sliding highlight indicator. The step is a CSS var rather than an
          inline pixel value so it can follow the wider mobile segments. */}
      <div
        className="theme-toggle-indicator absolute top-1 left-1 h-9 w-11 md:h-7 md:w-8 rounded-full bg-muted dark:bg-white/10 transition-all duration-300 ease-in-out"
        style={{ ["--seg-index" as string]: activeIndex }}
        aria-hidden
      />

      {SEGMENTS.map(({ value, label, Icon }) => {
        const isActive = preference === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setPreference(value)}
            aria-label={label}
            title={label}
            aria-pressed={isActive}
            className="relative z-10 flex h-9 w-11 md:h-7 md:w-8 items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon
              className={cn("h-4 w-4 transition-colors duration-200", isActive ? "text-foreground" : "text-muted-foreground")}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}
