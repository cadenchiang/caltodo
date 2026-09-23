"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import useClickOutside from "@/hooks/useClickOutside";
import { usePopoverPosition, type PopoverPlacement } from "@/hooks/usePopoverPosition";
import { getFocusable, trapTab } from "@/components/ui/useDialog";
import { cn } from "@/lib/utils";

/** Exit transition length; matches the duration-150 class on the panel. */
const EXIT_MS = 150;

/** The one popover surface recipe: solid, bordered, elevated, never translucent. */
export const POPOVER_SURFACE = "bg-popover rounded-xl border border-border shadow-lg";

export interface PopoverProps {
  /** Whether the popover is visible. */
  open: boolean;
  /** Called on Escape, outside click, or focus leaving via Tab. */
  onClose: () => void;
  children: ReactNode;
  /**
   * Positioning classes (for example "absolute left-0 top-full mt-1 z-dropdown").
   * Ignored for position when anchorRef is set, since the panel is then fixed.
   */
  className?: string;
  /** Trigger element, excluded from outside-click detection and refocused on close. */
  triggerRef?: RefObject<HTMLElement | null>;
  /**
   * When set, the panel is position: fixed next to this element and follows
   * it through scroll and resize. Use for panels inside scroll containers.
   */
  anchorRef?: RefObject<HTMLElement | null>;
  /** Preferred side when anchored. Defaults to bottom-start. */
  placement?: PopoverPlacement;
  /** Semantic role. menu for a list of commands, dialog (default) for pickers and forms. */
  role?: "dialog" | "menu";
  /** Accessible name for the panel. */
  "aria-label"?: string;
  /** Skip moving focus into the panel on open (for hover-driven panels). */
  autoFocus?: boolean;
}

/**
 * Anchored floating panel. Always paints the solid bg-popover surface, closes
 * on Escape and outside click, moves focus inside on open, traps Tab, and
 * returns focus to the trigger on close. Animates in and out with a short
 * fade and scale.
 *
 * @param open - Visibility
 * @param onClose - Dismiss callback
 * @param className - Positioning classes when not anchored
 * @param triggerRef - Trigger button (click-outside exclusion and focus restore)
 * @param anchorRef - Fixed-position anchor that survives scroll and resize
 * @param role - dialog | menu
 * @remarks The existing prop API (open, onClose, children, className,
 *          triggerRef) is unchanged; anchorRef, placement, role, aria-label
 *          and autoFocus are additive.
 */
export default function Popover({
  open,
  onClose,
  children,
  className = "",
  triggerRef,
  anchorRef,
  placement = "bottom-start",
  role = "dialog",
  "aria-label": ariaLabel,
  autoFocus = true,
}: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const excludeRefs = triggerRef ? [triggerRef] : undefined;
  useClickOutside(ref, onClose, open, excludeRefs);
  const anchoredStyle = usePopoverPosition(open && mounted, anchorRef, ref, placement);

  // Mount, then flip visible on the next frames so the CSS transition runs.
  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    const timer = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(timer);
  }, [open]);

  // Keyboard: Escape closes, Tab stays inside. Focus moves in on open and back
  // to the trigger on close.
  useEffect(() => {
    if (!open || !mounted) return;
    const node = ref.current;
    if (!node) return;
    const opener = (triggerRef?.current ?? document.activeElement) as HTMLElement | null;

    if (autoFocus) {
      const first = getFocusable(node)[0] ?? node;
      first.focus({ preventScroll: true });
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
      } else if (event.key === "Tab" && node) {
        trapTab(event, node);
      }
    }
    node.addEventListener("keydown", onKeyDown);
    return () => {
      node.removeEventListener("keydown", onKeyDown);
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [open, mounted, triggerRef, autoFocus]);

  if (!mounted) return null;

  return (
    <div
      ref={ref}
      role={role}
      aria-label={ariaLabel}
      tabIndex={-1}
      style={anchoredStyle}
      className={cn(
        POPOVER_SURFACE,
        "focus:outline-none transition-all duration-150 ease-out",
        visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-1",
        anchorRef && "z-dropdown",
        className
      )}
    >
      {children}
    </div>
  );
}
