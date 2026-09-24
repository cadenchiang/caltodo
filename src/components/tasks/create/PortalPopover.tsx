"use client";

import { createPortal } from "react-dom";
import Popover, { type PopoverProps } from "@/components/ui/Popover";

/**
 * Popover rendered into document.body. The task editor's card keeps a
 * transform after its entrance animation, which would make a fixed-position
 * panel inside it position against the card instead of the viewport, so
 * the pickers are portaled out and anchored to their row by anchorRef.
 *
 * @param props - Same as Popover; anchorRef is required so the panel can
 *                find its row from outside the card
 */
export default function PortalPopover(props: PopoverProps & { anchorRef: NonNullable<PopoverProps["anchorRef"]> }) {
  if (typeof document === "undefined") return null;
  return createPortal(<Popover {...props} className={`z-tooltip ${props.className ?? ""}`} />, document.body);
}
