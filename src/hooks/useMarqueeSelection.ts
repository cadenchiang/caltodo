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

/** Minimum drag distance (px) before a mousedown becomes a marquee. */
const DRAG_THRESHOLD = 5;

/**
 * Hook for macOS-style drag-to-select (marquee) over selectable items.
 *
 * Starts a marquee when the user drags beyond a small threshold from any
 * empty space in the container. Tracks a selection rectangle and reports
 * which item IDs intersect it.
 *
 * @param options - Container ref, selection callback, and existing selection
 * @returns marqueeStyle for the overlay div, isSelecting flag, and onMouseDown handler
 */
export function useMarqueeSelection({
  containerRef,
  onSelectionChange,
  existingSelection = new Set(),
  dataAttribute = "data-note-id",
}: UseMarqueeSelectionOptions) {
  const [marquee, setMarquee] = useState<MarqueeState | null>(null);
  const isSelectingRef = useRef(false);
  const pendingRef = useRef<{ clientX: number; clientY: number; containerX: number; containerY: number } | null>(null);

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
          left: elRect.left - containerRect.left + container.scrollLeft,
          top: elRect.top - containerRect.top + container.scrollTop,
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
      if (e.button !== 0) return;
      // Ignore clicks on buttons/inputs/interactive elements (but allow on cards)
      const target = e.target as HTMLElement;
      if (target.closest("button, input, textarea, a, [role='button']")) return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left + container.scrollLeft;
      const y = e.clientY - rect.top + container.scrollTop;

      // Store pending start — only becomes a marquee after dragging past threshold
      pendingRef.current = { clientX: e.clientX, clientY: e.clientY, containerX: x, containerY: y };
    },
    [containerRef],
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      // Check if we need to promote a pending mousedown into an active marquee
      if (pendingRef.current && !isSelectingRef.current) {
        const dx = e.clientX - pendingRef.current.clientX;
        const dy = e.clientY - pendingRef.current.clientY;
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;

        // Threshold exceeded — start the marquee
        isSelectingRef.current = true;
        const p = pendingRef.current;
        setMarquee({ startX: p.containerX, startY: p.containerY, currentX: p.containerX, currentY: p.containerY });
      }

      if (!isSelectingRef.current) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left + container.scrollLeft;
      const y = e.clientY - rect.top + container.scrollTop;

      setMarquee((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, currentX: x, currentY: y };

        const intersecting = findIntersecting(updated);
        if (e.shiftKey && existingSelection.size > 0) {
          const merged = new Set(existingSelection);
          intersecting.forEach((id) => merged.add(id));
          onSelectionChange(merged);
        } else {
          onSelectionChange(intersecting);
        }

        return updated;
      });
    };

    const handleMouseUp = () => {
      pendingRef.current = null;
      if (isSelectingRef.current) {
        isSelectingRef.current = false;
        setMarquee(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [containerRef, findIntersecting, onSelectionChange, existingSelection]);

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
