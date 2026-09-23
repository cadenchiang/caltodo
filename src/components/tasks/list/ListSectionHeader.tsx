"use client";

import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListSectionHeaderProps {
  /** Section name ("Later", "Hidden", "Completed"). */
  label: string;
  /** Item count shown after the label. */
  count: number;
  /** Whether the section body is open. */
  expanded: boolean;
  /** Toggles the section. */
  onToggle: () => void;
  /** Controls on the right (revealed on hover and on keyboard focus). */
  actions?: ReactNode;
  /** Colour class for the count (defaults to subtle). */
  countClassName?: string;
  /** Extra classes for the row. */
  className?: string;
}

/**
 * Collapsible section header for the task list. The toggle is a real button
 * (Enter and Space work, focus ring visible) and any trailing actions show
 * on hover or when anything inside the row has focus.
 *
 * @param label - Section name
 * @param count - Number of items inside
 * @param expanded - Open state, mirrored to aria-expanded
 * @param onToggle - Toggle handler
 * @param actions - Optional trailing controls
 */
export default function ListSectionHeader({
  label,
  count,
  expanded,
  onToggle,
  actions,
  countClassName = "text-subtle-foreground",
  className,
}: ListSectionHeaderProps) {
  return (
    <div
      className={cn(
        "group flex items-center py-2 md:py-2.5 px-1.5 -mx-1.5 rounded-md transition-colors hover:bg-foreground/[0.035] dark:hover:bg-foreground/[0.07] focus-within:bg-foreground/[0.035] dark:focus-within:bg-foreground/[0.07]",
        className
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex items-center flex-1 min-w-0 min-h-11 -my-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronRight
          size={12}
          className={cn(
            "shrink-0 text-secondary-foreground transition-transform duration-200",
            expanded && "rotate-90"
          )}
          aria-hidden="true"
        />
        <span className="text-sm font-semibold text-foreground ml-0.5">{label}</span>
        <span className={cn("text-xs ml-1.5", countClassName)}>{count}</span>
      </button>
      {actions && (
        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
          {actions}
        </div>
      )}
    </div>
  );
}
