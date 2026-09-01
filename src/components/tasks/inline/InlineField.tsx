"use client";

/**
 * Activation shell for an editable field in the task detail panel.
 *
 * The panel has no edit button and no highlight box: the only affordance is
 * the cursor, so text reads as text and nothing tints, shifts, or reflows
 * under the pointer. Keyboard users still get a focus ring, which is the one
 * outline that has to stay for the field to be reachable without a mouse.
 */

import type { ReactNode } from "react";

interface InlineFieldProps {
  /** Field content, or the placeholder when empty. */
  children: ReactNode;
  /** Starts editing. */
  onActivate: () => void;
  /** Cursor shown on hover: text for free text, pointer for pickers. */
  cursor?: "text" | "pointer";
  /** Extra classes for the hover target. */
  className?: string;
  /** Accessible name, e.g. "Edit title". */
  label: string;
}

/**
 * Wraps a read-only field so it reads and behaves as editable.
 *
 * @param children - What the field currently shows
 * @param onActivate - Called on click, Enter, or Space
 * @param cursor - Pointer shape on hover
 * @param className - Extra classes
 * @param label - Accessible name for the control
 * @remarks Rendered as a div with a button role rather than a real button:
 *          the description field contains links, and a button may not have
 *          interactive descendants. Keyboard activation is wired by hand to
 *          keep what a button would have given for free. Carries no padding
 *          or margin of its own so the text sits exactly where it would
 *          without the wrapper, and so the row icons can line up against it.
 */
export default function InlineField({
  children,
  onActivate,
  cursor = "text",
  className = "",
  label,
}: InlineFieldProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onActivate}
      onKeyDown={(e) => {
        // Let clicks on a link inside the field do their own thing.
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
      className={`rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
        cursor === "text" ? "cursor-text" : "cursor-pointer"
      } ${className}`}
    >
      {children}
    </div>
  );
}
