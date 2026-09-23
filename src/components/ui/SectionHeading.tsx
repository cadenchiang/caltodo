import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The section-title recipe (heading scale: page > section > modal). */
export const SECTION_TITLE = "text-lg font-semibold text-foreground";

export interface SectionHeadingProps {
  /** Section title, sentence case. Rendered as an h2. */
  title: ReactNode;
  /** Muted description under the title. */
  description?: ReactNode;
  /** Right-aligned actions. */
  actions?: ReactNode;
  /** Extra classes for the wrapper. */
  className?: string;
}

/**
 * Heading for a section within a page. Never uppercase, never gray text for
 * the title itself; the description carries the muted tone.
 *
 * @param title - h2 text (text-lg font-semibold)
 * @param description - text-sm text-muted-foreground
 * @param actions - Right slot
 */
export default function SectionHeading({ title, description, actions, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3 mb-3", className)}>
      <div className="min-w-0">
        <h2 className={SECTION_TITLE}>{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
