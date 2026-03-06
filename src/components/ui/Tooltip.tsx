"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  /** Text to display in the tooltip. */
  label: string;
  /** Element that triggers the tooltip on hover. */
  children: React.ReactNode;
  /** Preferred position relative to the trigger. Defaults to "top". Auto-flips if clipped. */
  position?: "top" | "bottom";
  /** Delay in ms before tooltip appears. Defaults to 500. */
  delay?: number;
}

/**
 * Lightweight tooltip that appears after a configurable delay on hover.
 * Uses createPortal to render at document.body level, avoiding overflow clipping.
 * Auto-flips from top to bottom when near the viewport edge.
 * Continuously tracks trigger position via RAF to prevent stale coordinates.
 *
 * @param label - Tooltip text
 * @param children - Trigger element
 * @param position - "top" (default) or "bottom"; auto-flips if insufficient space
 * @param delay - Milliseconds before showing (default 500)
 */
export default function Tooltip({
  label,
  children,
  position = "top",
  delay = 500,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number>(0);
  const triggerRef = useRef<HTMLDivElement>(null);

  /** Compute tooltip position from trigger bounding rect. */
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipHeight = 28;
    const gap = 6;

    const preferTop = position === "top";
    const spaceAbove = rect.top;
    const needsFlip = preferTop && spaceAbove < tooltipHeight + gap;

    const top = needsFlip || !preferTop
      ? rect.bottom + gap
      : rect.top - tooltipHeight - gap;
    const left = rect.left + rect.width / 2;

    setCoords({ top, left });
  }, [position]);

  /** RAF loop that keeps the tooltip anchored to the trigger while visible. */
  useEffect(() => {
    if (!visible) return;
    let running = true;
    function tick() {
      if (!running) return;
      updatePosition();
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [visible, updatePosition]);

  const handleEnter = useCallback(() => {
    timerRef.current = setTimeout(() => {
      updatePosition();
      setVisible(true);
    }, delay);
  }, [delay, updatePosition]);

  const handleLeave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
    setCoords(null);
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        className="relative inline-flex"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {children}
      </div>
      {visible && coords && createPortal(
        <div
          role="tooltip"
          className="fixed px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap pointer-events-none z-[99999]"
          style={{
            top: coords.top,
            left: coords.left,
            transform: "translateX(-50%)",
          }}
        >
          {label}
        </div>,
        document.body
      )}
    </>
  );
}
