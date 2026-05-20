"use client";

/**
 * Shared UI primitives for dashboard widgets.
 * Ensures consistent styling across all widget types following Notion-style design:
 * - Warm grays, minimal chrome, no borders
 * - Standardized padding (p-4), header (text-xs font-semibold), spacing (mb-2)
 * - Reusable empty state, header, and progress bar components
 *
 * @module WidgetPrimitives
 */

import type { ReactNode } from "react";

/**
 * Standard widget shell with consistent padding and overflow handling.
 * All widgets should wrap their content in this component.
 *
 * @param children - Widget content
 * @param className - Additional classes to apply
 * @param centered - If true, centers content vertically and horizontally
 */
export function WidgetShell({
  children,
  className = "",
  centered = false,
}: {
  children: ReactNode;
  className?: string;
  centered?: boolean;
}) {
  return (
    <div
      className={`h-full w-full flex flex-col p-3 overflow-hidden ${
        centered ? "items-center justify-center text-center" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Standard widget header row with title and optional right-side content.
 * Uses text-xs font-semibold with mb-2 spacing.
 *
 * @param title - Header text
 * @param right - Optional content rendered on the right side (counts, buttons, etc.)
 */
export function WidgetHeader({
  title,
  right,
}: {
  title: string;
  right?: ReactNode;
}) {
  return (
    <div className="widget-header flex items-center justify-between mb-3 shrink-0" style={{ color: "var(--widget-text-color, var(--foreground))" }}>
      <h3 className="text-sm font-bold tracking-tight" style={{ color: "inherit" }}>{title}</h3>
      {right && (
        <div className="flex items-center gap-1.5 shrink-0 text-sm font-semibold" style={{ color: "inherit" }}>{right}</div>
      )}
    </div>
  );
}

/**
 * Standard empty state for widgets with no data.
 * Centered icon + message pattern.
 *
 * @param icon - Lucide icon component or ReactNode to display
 * @param message - Description text
 * @param action - Optional action button/link
 */
export function WidgetEmptyState({
  icon,
  message,
  action,
}: {
  icon: ReactNode;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center text-foreground">
      <div className="mb-3 [&>svg]:w-7 [&>svg]:h-7">{icon}</div>
      <p className="text-sm font-semibold tracking-tight">{message}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/**
 * Thin horizontal progress bar with configurable color.
 * Matches Notion's minimal progress indicator style.
 *
 * @param pct - Percentage filled (0-100)
 * @param accentColor - Fill color (defaults to theme accent)
 * @param className - Additional classes for the wrapper
 */
export function WidgetProgressBar({
  pct,
  accentColor,
  className = "",
}: {
  pct: number;
  accentColor?: string;
  className?: string;
}) {
  return (
    <div className={`w-full h-1 rounded-full bg-muted overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${Math.min(100, Math.max(0, pct))}%`,
          backgroundColor: accentColor || "var(--color-blue-500, #0e89d6)",
        }}
      />
    </div>
  );
}

/**
 * Muted stat label used for secondary info (counts, percentages).
 * Standardized font size and color.
 *
 * @param children - Text content
 * @param tabular - If true, uses tabular-nums for aligned digits
 */
export function WidgetStat({
  children,
  tabular = true,
}: {
  children: ReactNode;
  tabular?: boolean;
}) {
  return (
    <span className={`text-xs text-foreground ${tabular ? "tabular-nums" : ""}`}>
      {children}
    </span>
  );
}
