/**
 * Button class recipes, kept out of the "use client" Button module so server
 * components (landing pages, the 404 page) can style a Link like a Button
 * without importing client code.
 */
import { cn } from "@/lib/utils";

/** Visual role of a button. See UI_STYLE_GUIDE.md for when to use each. */
export type ButtonVariant =
  | "primary"
  | "inverted"
  | "secondary"
  | "ghost"
  | "destructive"
  | "destructive-filled"
  | "pill";

/** Control height step. md is the default for dialogs and forms. */
export type ButtonSize = "sm" | "md" | "lg";

/** Classes shared by every variant: layout, focus ring, disabled state. */
export const BUTTON_BASE =
  "inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap select-none cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

/** Per-variant color recipe. Every entry is the single source for that idiom. */
export const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "rounded-lg bg-blue-500 text-white hover:bg-blue-600",
  inverted:
    "rounded-lg bg-gray-900 text-white hover:bg-gray-800 shadow-sm dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 dark:shadow-none",
  secondary: "rounded-lg border border-border bg-card text-foreground hover:bg-accent",
  ghost: "rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted",
  destructive: "rounded-lg text-red-500 hover:bg-red-500/10",
  "destructive-filled": "rounded-lg bg-red-500 text-white hover:bg-red-600",
  pill:
    "rounded-full border border-border bg-card text-foreground hover:bg-accent shadow-sm dark:shadow-none active:scale-[0.97] transition-all",
};

/** Per-size padding and text step. */
export const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-sm",
};

/**
 * Builds the className for a button-shaped element.
 * Use this for links (`<a>`, `<Link>`) that must look like a Button.
 *
 * @param variant - Visual role (default "primary")
 * @param size - Control size (default "md")
 * @param className - Extra classes merged last (tailwind-merge resolves conflicts)
 * @returns The merged className string
 */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string
): string {
  return cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className);
}
