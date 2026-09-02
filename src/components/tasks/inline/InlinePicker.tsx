"use client";

/**
 * A field in the detail panel that opens a popover to be changed.
 *
 * Shares the hover affordance with the text fields so every editable thing in
 * the panel behaves the same way, and handles the popover mechanics the date,
 * class, and tag fields all need: anchor, click-outside, and Escape.
 */

import { useRef, useState, type ReactNode } from "react";
import InlineField from "./InlineField";
import Popover from "@/components/ui/Popover";

interface InlinePickerProps {
  /** Read-only content of the field. */
  children: ReactNode;
  /** Popover content. Receives a callback that closes the popover. */
  render: (close: () => void) => ReactNode;
  /** Accessible name, e.g. "Change due date". */
  label: string;
  /** Extra classes for the popover panel, mainly width. */
  panelClassName?: string;
  /** Extra classes for the anchor, mainly alignment offsets. */
  className?: string;
}

/**
 * Renders a field that opens a popover when clicked.
 *
 * @param children - What the field shows when closed
 * @param render - Popover body, given a close callback
 * @param label - Accessible name
 * @param panelClassName - Extra classes for the popover panel
 * @param className - Extra classes for the anchor
 * @remarks The anchor is `relative` and `inline-block` so the popover lines up
 *          with the field rather than the panel edge, and so the hover tint
 *          hugs the content instead of spanning the full column.
 */
export default function InlinePicker({
  children,
  render,
  label,
  panelClassName = "",
  className = "",
}: InlinePickerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`relative inline-block max-w-full ${className}`} ref={triggerRef}>
      <InlineField label={label} cursor="pointer" onActivate={() => setOpen((v) => !v)}>
        {children}
      </InlineField>

      <Popover
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
        className={`absolute left-0 top-full mt-1 z-50 ${panelClassName}`}
      >
        {render(() => setOpen(false))}
      </Popover>
    </div>
  );
}
