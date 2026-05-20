"use client";

/**
 * Collapsible settings section — bold title with chevron, expands on
 * click. Default-collapsed so the settings panel reads as a tight list
 * of sections instead of a wall of controls.
 *
 * @param title - Bold section header text
 * @param defaultOpen - Whether the section starts expanded (default false)
 * @param hint - Optional small text shown next to the title (e.g. current value)
 * @param children - Section body rendered when expanded
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  defaultOpen = false,
  hint,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-foreground/[0.06] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-2.5 group"
        aria-expanded={open}
      >
        <span className="text-sm font-bold text-foreground tracking-tight">
          {title}
        </span>
        <span className="flex items-center gap-2 text-xs text-foreground">
          {hint && <span className="truncate max-w-[140px]">{hint}</span>}
          <ChevronDown
            size={14}
            strokeWidth={2.25}
            className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}
