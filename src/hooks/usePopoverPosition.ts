"use client";

import { useEffect, useLayoutEffect, useState, type CSSProperties, type RefObject } from "react";

/** Which side of the anchor the panel prefers. It flips when there is no room. */
export type PopoverPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

/** Minimal rect shape so the pure function can be unit tested without a DOM. */
export interface RectLike {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

/** Gap between anchor and panel, and the viewport padding the panel keeps. */
export const POPOVER_GAP = 4;
export const VIEWPORT_PAD = 8;

/**
 * Computes a fixed-position top/left for a panel anchored to a rect, flipping
 * vertically when the preferred side lacks room and clamping horizontally so
 * the panel never leaves the viewport.
 *
 * @param anchor - Bounding rect of the trigger
 * @param panel - Size of the panel
 * @param viewport - Window inner size
 * @param placement - Preferred side and alignment
 * @returns Top and left in viewport pixels
 */
export function computeAnchoredPosition(
  anchor: RectLike,
  panel: { width: number; height: number },
  viewport: { width: number; height: number },
  placement: PopoverPlacement = "bottom-start"
): { top: number; left: number } {
  const preferTop = placement.startsWith("top");
  const alignEnd = placement.endsWith("end");

  const below = anchor.bottom + POPOVER_GAP;
  const above = anchor.top - POPOVER_GAP - panel.height;
  const fitsBelow = below + panel.height <= viewport.height - VIEWPORT_PAD;
  const fitsAbove = above >= VIEWPORT_PAD;

  let top: number;
  if (preferTop) top = fitsAbove || !fitsBelow ? above : below;
  else top = fitsBelow || !fitsAbove ? below : above;
  top = Math.max(VIEWPORT_PAD, Math.min(top, viewport.height - panel.height - VIEWPORT_PAD));

  let left = alignEnd ? anchor.right - panel.width : anchor.left;
  left = Math.max(VIEWPORT_PAD, Math.min(left, viewport.width - panel.width - VIEWPORT_PAD));

  return { top, left };
}

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Positions a fixed panel next to an anchor and keeps it there through
 * scroll (any ancestor, capture phase) and resize.
 *
 * @param open - Only measures while open
 * @param anchorRef - The trigger element
 * @param panelRef - The panel element (measured for size)
 * @param placement - Preferred side and alignment
 * @returns Inline style to spread on the panel, or an empty object when not anchored
 */
export function usePopoverPosition(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null> | undefined,
  panelRef: RefObject<HTMLElement | null>,
  placement: PopoverPlacement = "bottom-start"
): CSSProperties {
  const [style, setStyle] = useState<CSSProperties>({});

  useIsomorphicLayoutEffect(() => {
    if (!open || !anchorRef) return;

    function update() {
      const anchor = anchorRef?.current;
      const panel = panelRef.current;
      if (!anchor || !panel) return;
      const { top, left } = computeAnchoredPosition(
        anchor.getBoundingClientRect(),
        { width: panel.offsetWidth, height: panel.offsetHeight },
        { width: window.innerWidth, height: window.innerHeight },
        placement
      );
      setStyle({ position: "fixed", top, left });
    }

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, anchorRef, panelRef, placement]);

  return anchorRef ? style : {};
}
