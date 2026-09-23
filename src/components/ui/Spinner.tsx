import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Spinner size in pixels. */
export type SpinnerSize = "sm" | "md" | "lg";

export const SPINNER_SIZES: Record<SpinnerSize, number> = { sm: 14, md: 18, lg: 24 };

export interface SpinnerProps {
  /** Pixel preset. Defaults to md (18px). */
  size?: SpinnerSize;
  /** Accessible name announced by screen readers. Defaults to "Loading". */
  "aria-label"?: string;
  /** Extra classes (usually a text color). */
  className?: string;
}

/**
 * Indeterminate spinner. Keeps spinning under prefers-reduced-motion because
 * a stopped spinner reads as a hang (globals.css exempts animate-spin).
 *
 * @param size - sm | md | lg
 * @param aria-label - Name for assistive tech; pass "" only when a sibling already announces loading
 */
export default function Spinner({ size = "md", "aria-label": label = "Loading", className }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={cn("inline-flex", className)}>
      <Loader2 size={SPINNER_SIZES[size]} className="animate-spin" aria-hidden="true" />
    </span>
  );
}
