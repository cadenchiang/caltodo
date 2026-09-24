"use client";

import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/button-recipe";

// Re-exported so existing call sites keep importing from Button; the recipes
// live in button-recipe.ts so server components can use buttonClasses too.
export { BUTTON_BASE, BUTTON_SIZES, BUTTON_VARIANTS, buttonClasses } from "@/components/ui/button-recipe";
export type { ButtonSize, ButtonVariant } from "@/components/ui/button-recipe";

/** Spinner size that matches each button size. */
const SPINNER_SIZE: Record<ButtonSize, number> = { sm: 12, md: 14, lg: 16 };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual role. Defaults to primary. */
  variant?: ButtonVariant;
  /** Control size. Defaults to md. */
  size?: ButtonSize;
  /**
   * Shows a spinner, sets aria-busy, and disables the button.
   * The label stays rendered so the button keeps its width.
   */
  loading?: boolean;
  /** Icon rendered before the label. Hidden from assistive tech. */
  leadingIcon?: ReactNode;
  /** Forwarded to the native button (React 19 ref-as-prop). */
  ref?: Ref<HTMLButtonElement>;
  children?: ReactNode;
}

/**
 * The one button component. Wraps a native `<button>` with the design-system
 * recipes so call sites never hand-write color, radius, or focus classes.
 *
 * @param variant - primary | inverted | secondary | ghost | destructive | destructive-filled | pill
 * @param size - sm | md | lg
 * @param loading - Spinner + aria-busy + disabled
 * @param leadingIcon - Optional icon before the label
 * @param type - Defaults to "button" so buttons inside forms do not submit by accident
 * @remarks Icon-only buttons belong in IconButton, which requires aria-label.
 */
export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leadingIcon,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <Loader2 size={SPINNER_SIZE[size]} className="animate-spin shrink-0" aria-hidden="true" />
      ) : leadingIcon ? (
        <span className="shrink-0 inline-flex" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      {children}
    </button>
  );
}
