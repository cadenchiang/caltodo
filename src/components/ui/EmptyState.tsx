import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  /** Lucide icon element (size 24 recommended). Decorative. */
  icon?: ReactNode;
  /** What is empty, in sentence case ("No tasks yet"). */
  title: string;
  /** What the user can do about it. */
  description?: ReactNode;
  /** Optional Button (or link) that resolves the empty state. */
  action?: ReactNode;
  /** Extra classes for the wrapper. */
  className?: string;
}

/**
 * The one empty-state recipe: centered icon in a muted circle, a short title,
 * an optional description, and an optional action.
 *
 * @param icon - Decorative icon shown in a 40px muted circle
 * @param title - One line, sentence case
 * @param description - One or two lines of muted text
 * @param action - Usually a Button
 * @remarks Padding is fixed (py-12 px-6) so every list's empty state lands at
 *          the same height. Wrap in a card if a border is needed.
 */
export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12 px-6", className)}>
      {icon && (
        <div
          className="mb-3 w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
