"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { ThemePreference } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

/** Segment definitions for the 3-position theme toggle. */
const SEGMENTS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light mode", Icon: Sun },
  { value: "auto", label: "Auto (system)", Icon: Monitor },
  { value: "dark", label: "Dark mode", Icon: Moon },
];

/**
 * 3-segment pill theme toggle: Light | Auto | Dark.
 * Each segment is an accessible button with an icon.
 * A sliding highlight indicator animates between positions.
 *
 * @param className - Optional additional CSS classes
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const { preference, resolvedTheme, setPreference } = useTheme();
  const isDark = resolvedTheme === "dark";

  const activeIndex = SEGMENTS.findIndex((s) => s.value === preference);

  return (
    <div
      className={cn(
        "relative flex h-8 w-24 rounded-full p-1 transition-colors duration-300",
        isDark
          ? "bg-zinc-950 border border-zinc-800"
          : "bg-white border border-zinc-200",
        className
      )}
    >
      {/* Sliding highlight indicator */}
      <div
        className={cn(
          "absolute top-1 h-6 w-6 rounded-full transition-all duration-300 ease-in-out",
          isDark ? "bg-zinc-800" : "bg-gray-200"
        )}
        style={{
          transform: `translateX(${activeIndex * 28}px)`,
        }}
        aria-hidden
      />

      {/* Segment buttons */}
      {SEGMENTS.map(({ value, label, Icon }) => {
        const isActive = preference === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setPreference(value)}
            aria-label={label}
            aria-pressed={isActive}
            className={cn(
              "relative z-10 flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            )}
          >
            <Icon
              className={cn(
                "h-3.5 w-3.5 transition-colors duration-200",
                isActive
                  ? isDark
                    ? "text-white"
                    : "text-gray-700"
                  : isDark
                    ? "text-zinc-500"
                    : "text-gray-400"
              )}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}
