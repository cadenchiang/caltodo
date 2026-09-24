"use client";

import type { CSSProperties, ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The one onboarding tile recipe: a bordered card that highlights with the
 * accent when selected and shows a round check on the right. Used by the
 * platform grid and every class picker so the flow has a single idiom.
 */
export const TILE_BASE =
  "flex items-center gap-3 w-full text-left rounded-xl bg-card text-foreground border-2 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-default";

/** Border per state. */
export const TILE_SELECTED = "border-blue-500";
export const TILE_UNSELECTED = "border-transparent hover:border-blue-500/30";

/** Padding per size. sm is the two-column platform grid, md a class row. */
export const TILE_SIZES = {
  sm: "px-2.5 py-2.5",
  md: "px-4 py-3",
} as const;

export interface SelectableTileProps {
  /** Whether the tile is currently selected. Rendered as aria-pressed. */
  selected: boolean;
  /** Toggle handler. */
  onToggle: () => void;
  /** Tile contents (label, logo, badges). */
  children: ReactNode;
  /** Padding step. Defaults to md. */
  size?: keyof typeof TILE_SIZES;
  /** Disables the tile; the check is replaced by `trailing` when given. */
  disabled?: boolean;
  /** Replaces the round check (for a "Coming soon" tag). */
  trailing?: ReactNode;
  /** Extra classes. */
  className?: string;
  /** Inline style, for staggered animation delays. */
  style?: CSSProperties;
}

/**
 * Toggle tile with a visible focus ring and aria-pressed state.
 *
 * @param selected - Current state, exposed as aria-pressed
 * @param onToggle - Called on click
 * @param size - sm (grid) | md (list)
 * @param disabled - Blocks toggling; pairs with `trailing`
 * @param trailing - Custom right-side content instead of the check
 * @remarks A disabled tile paints no border so it reads as inert rather
 *          than unselected.
 */
export default function SelectableTile({
  selected,
  onToggle,
  children,
  size = "md",
  disabled = false,
  trailing,
  className,
  style,
}: SelectableTileProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      style={style}
      className={cn(
        TILE_BASE,
        TILE_SIZES[size],
        disabled ? "border-transparent opacity-55" : selected ? TILE_SELECTED : TILE_UNSELECTED,
        className
      )}
    >
      {children}
      {trailing ?? (
        <span
          aria-hidden="true"
          className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors",
            selected ? "bg-blue-500 text-white" : "border border-muted-foreground/30"
          )}
        >
          {selected && <Check size={12} strokeWidth={3} />}
        </span>
      )}
    </button>
  );
}
