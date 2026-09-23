"use client";

import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";

/** Visual box of an icon-only button. */
export type IconButtonSize = "sm" | "md" | "lg";

/** Fill treatment. ghost is the default chrome button, secondary is bordered. */
export type IconButtonVariant = "ghost" | "secondary" | "inverted";

/** Visual box per size (the painted circle or square). */
export const ICON_BUTTON_SIZES: Record<IconButtonSize, string> = {
  sm: "w-7 h-7",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

/**
 * Negative margins that cancel the touch-target growth, so enlarging the hit
 * area to 44px on coarse pointers does not push neighbours. sm grows 16px
 * (28 to 44), md grows 12px, lg grows 4px; each side absorbs half.
 */
const BLEED_BY_SIZE: Record<IconButtonSize, string> = {
  sm: "pointer-coarse:-m-2",
  md: "pointer-coarse:-m-1.5",
  lg: "pointer-coarse:-m-0.5",
};

/** Minimum 44px hit area on touch devices (WCAG 2.5.8). */
export const TOUCH_TARGET = "pointer-coarse:min-h-11 pointer-coarse:min-w-11";

export const ICON_BUTTON_VARIANTS: Record<IconButtonVariant, string> = {
  ghost: "text-muted-foreground hover:text-foreground hover:bg-muted",
  secondary: "border border-border bg-card text-foreground hover:bg-accent shadow-sm dark:shadow-none",
  inverted:
    "bg-gray-900 text-white hover:bg-gray-800 shadow-sm dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 dark:shadow-none",
};

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> {
  /** Accessible name. Required: an icon alone has no name for screen readers. */
  "aria-label": string;
  /** The icon element (lucide, size 16 for md, 14 for sm). */
  children: ReactNode;
  /** Visual box size. Defaults to md (32px). */
  size?: IconButtonSize;
  /** Fill treatment. Defaults to ghost. */
  variant?: IconButtonVariant;
  /** Round (default) or rounded-square box. */
  shape?: "round" | "square";
  /**
   * When true, the touch-target growth is cancelled with negative margins so
   * the button keeps its visual footprint inside tight toolbars.
   */
  bleed?: boolean;
  /** Forwarded to the native button (React 19 ref-as-prop). */
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Icon-only button with a mandatory accessible name and a 44px hit area on
 * touch devices. Use for close buttons, toolbar actions, and row actions.
 *
 * @param aria-label - Required accessible name
 * @param size - sm (28px) | md (32px) | lg (40px)
 * @param variant - ghost | secondary | inverted
 * @param shape - round (rounded-full) | square (rounded-lg)
 * @param bleed - Cancel touch-target growth with negative margins
 * @remarks The icon child is hidden from assistive tech; the label carries the name.
 */
export default function IconButton({
  size = "md",
  variant = "ghost",
  shape = "round",
  bleed = false,
  className,
  children,
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center shrink-0 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        shape === "round" ? "rounded-full" : "rounded-lg",
        ICON_BUTTON_SIZES[size],
        TOUCH_TARGET,
        bleed && BLEED_BY_SIZE[size],
        ICON_BUTTON_VARIANTS[variant],
        className
      )}
      {...rest}
    >
      <span className="inline-flex" aria-hidden="true">
        {children}
      </span>
    </button>
  );
}
