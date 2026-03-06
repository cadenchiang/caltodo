"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface MarqueeState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface UseMarqueeSelectionOptions {
  /** Ref to the scrollable container element. */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Called with the set of IDs intersecting the marquee. */
  onSelectionChange: (ids: Set<string>) => void;
  /** Current selection — used for additive (Shift) mode. */
  existingSelection?: Set<string>;
  /** Data attribute to query selectable items. Defaults to "data-note-id". */
  dataAttribute?: string;
}

/**
 * Hook for macOS-style drag-to-select (marquee) over note cards.
 *
 * Listens for mousedown on the container (ignoring clicks on [data-note-id]
 * elements), tracks a selection rectangle, and reports which note IDs
 * intersect it.
 *
 * @param options - Container ref, selection callback, and existing selection
 * @returns marqueeStyle for the overlay div, and isSelecting flag
 */
export function useMarqueeSelection({
  containerRef,
  onSelectionChange,
  existingSelection = new Set(),
  dataAttribute = "data-note-id",
}: UseMarqueeSelectionOptions) {
  const [marquee, setMarquee] = useState<MarqueeState | null>(null);
  const isSelectingRef = useRef(false);

  /** Compute the CSS rect from two corner points relative to the container. */
  function getRect(m: MarqueeState) {
    const left = Math.min(m.startX, m.currentX);
    const top = Math.min(m.startY, m.currentY);
    const width = Math.abs(m.currentX - m.startX);
    const height = Math.abs(m.currentY - m.startY);
    return { left, top, width, height };
  }

  /** Check if two rectangles overlap. */
  function rectsIntersect(
    a: { left: number; top: number; width: number; height: number },
    b: { left: number; top: number; width: number; height: number },
  ) {
    return (
      a.left < b.left + b.width &&
      a.left + a.width > b.left &&
      a.top < b.top + b.height &&
      a.top + a.height > b.top
    );
  }

  /** Find all selectable elements intersecting the marquee rect. */
  const findIntersecting = useCallback(
    (m: MarqueeState): Set<string> => {
      const container = containerRef.current;
      if (!container) return new Set();

      const containerRect = container.getBoundingClientRect();
      const selRect = getRect(m);

      const ids = new Set<string>();
      const selector = `[${dataAttribute}]`;
      const elements = container.querySelectorAll<HTMLElement>(selector);
      elements.forEach((el) => {
        const elRect = el.getBoundingClientRect();
        const rel = {
          left: elRect.left - containerRect.left,
          top: elRect.top - containerRect.top,
          width: elRect.width,
          height: elRect.height,
        };
        if (rectsIntersect(selRect, rel)) {
          const id = el.getAttribute(dataAttribute);
          if (id) ids.add(id);
        }
      });
      return ids;
    },
    [containerRef, dataAttribute],
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only left-click
      if (e.button !== 0) return;
      // Ignore if the click started on a selectable item
      const target = e.target as HTMLElement;
      if (target.closest(`[${dataAttribute}]`)) return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      isSelectingRef.current = true;
      setMarquee({ startX: x, startY: y, currentX: x, currentY: y });
    },
    [containerRef],
  );

  useEffect(() => {
    if (!marquee) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isSelectingRef.current) return;
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const updated = { ...marquee, currentX: x, currentY: y };
      setMarquee(updated);

      const intersecting = findIntersecting(updated);
      if (e.shiftKey && existingSelection.size > 0) {
        const merged = new Set(existingSelection);
        intersecting.forEach((id) => merged.add(id));
        onSelectionChange(merged);
      } else {
        onSelectionChange(intersecting);
      }
    };

    const handleMouseUp = () => {
      isSelectingRef.current = false;
      setMarquee(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [marquee, containerRef, findIntersecting, onSelectionChange, existingSelection]);

  const marqueeStyle: React.CSSProperties | null = marquee
    ? (() => {
        const r = getRect(marquee);
        return {
          position: "absolute" as const,
          left: r.left,
          top: r.top,
          width: r.width,
          height: r.height,
          pointerEvents: "none" as const,
        };
      })()
    : null;

  return { marqueeStyle, isSelecting: !!marquee, onMouseDown };
}
