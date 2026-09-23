import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The page-title recipe (heading scale: page > section > modal). */
export const PAGE_TITLE = "text-xl font-bold text-foreground tracking-tight";

export interface PageHeaderProps {
  /** Page title, sentence case. Rendered as the page's h1. */
  title: ReactNode;
  /** Optional muted line under the title. */
  description?: ReactNode;
  /** Right-aligned actions (Buttons, IconButtons). */
  actions?: ReactNode;
  /** Extra classes for the wrapper. */
  className?: string;
}

/**
 * Top-of-page heading row: h1 on the left, actions on the right. One per page.
 *
 * @param title - h1 text (text-xl font-bold)
 * @param description - text-sm text-muted-foreground
 * @param actions - Right slot; wraps under the title on narrow screens
 */
export default function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-wrap items-start justify-between gap-3 mb-6", className)}>
      <div className="min-w-0">
        <h1 className={PAGE_TITLE}>{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}
