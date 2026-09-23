import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Badge tone. count is the red numeric bubble; beta is the small blue tag. */
export type BadgeVariant = "info" | "success" | "warning" | "danger" | "neutral" | "beta" | "count";

/**
 * The single blue tint recipe (info, beta) and the status tints. Light text
 * colors use the 600 step so the chip passes 4.5:1 on its tint; dark uses 400.
 */
export const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  info: "bg-blue-50 text-blue-600 dark:bg-blue-600/40 dark:text-blue-400",
  success: "bg-success-tint text-emerald-600 dark:text-emerald-400",
  warning: "bg-warning-tint text-amber-600 dark:text-amber-400",
  danger: "bg-danger-tint text-red-600 dark:text-red-400",
  neutral: "bg-muted text-muted-foreground",
  beta: "bg-blue-50 text-blue-600 dark:bg-blue-600/40 dark:text-blue-400",
  count: "bg-red-500 text-white min-w-[18px] h-[18px] justify-center px-1 rounded-full font-bold",
};

/** Shared badge chrome: one radius, one text step, one padding. */
export const BADGE_BASE =
  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-3xs font-medium leading-none whitespace-nowrap";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Tone. Defaults to neutral. */
  variant?: BadgeVariant;
  children: ReactNode;
}

/**
 * Small inline label for status, source, or a count.
 *
 * @param variant - info | success | warning | danger | neutral | beta | count
 * @remarks count is the only variant that is rounded-full; every other badge
 *          is rounded-md. Text is sentence case; never uppercase.
 */
export default function Badge({ variant = "neutral", className, children, ...rest }: BadgeProps) {
  return (
    <span className={cn(BADGE_BASE, BADGE_VARIANTS[variant], className)} {...rest}>
      {children}
    </span>
  );
}
