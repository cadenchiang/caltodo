"use client";

/**
 * Portal-based color picker popover. Follows FontPicker.tsx dropdown pattern.
 * Trigger: a small color circle. Dropdown: portaled to document.body with
 * click-outside/Escape dismissal and scroll/resize repositioning.
 *
 * @param label - Label text for the color setting
 * @param value - Current hex color value (empty = default/no color)
 * @param onChange - Callback with new hex value (empty = reset)
 * @param layout - "horizontal" (label left, circle right) or "compact" (label above, circle below)
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import ColorPickerPanel from "@/components/ui/ColorPickerPanel";

interface ColorPickerPopoverProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  layout?: "horizontal" | "compact";
}

export default function ColorPickerPopover({
  label,
  value,
  onChange,
  layout = "horizontal",
}: ColorPickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  /**
   * Compute dropdown position from trigger bounding rect.
   * Aligns left edge to trigger's left, flips above if not enough space below.
   */
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownW = 288; // w-72 = 18rem = 288px
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const pad = 8;
    const gap = 8;

    // Horizontal: align left edge to trigger's left, clamp to viewport
    let left = rect.left;
    left = Math.max(pad, Math.min(left, viewW - dropdownW - pad));

    // Measure actual dropdown height if rendered, else estimate
    const actualH = dropdownRef.current?.offsetHeight ?? 380;

    // Vertical: prefer below trigger, flip above if truly no space
    const spaceBelow = viewH - rect.bottom - gap;
    const spaceAbove = rect.top - gap;

    let top: number;
    if (spaceBelow >= actualH || spaceBelow >= spaceAbove) {
      // Place below
      top = rect.bottom + gap;
    } else {
      // Place above
      top = rect.top - actualH - gap;
      if (top < pad) top = pad;
    }

    setPos({ top, left });
  }, []);

  /** Toggle dropdown open/close. */
  function handleToggle() {
    if (open || isClosing) {
      handleClose();
    } else {
      updatePosition();
      setOpen(true);
      // Re-measure after render to use actual dropdown height
      requestAnimationFrame(() => updatePosition());
    }
  }

  /** Animate close then unmount. */
  function handleClose() {
    if (!open || isClosing) return;
    setIsClosing(true);
  }

  /** Handle exit animation end — unmount dropdown. */
  function handleAnimationEnd() {
    if (isClosing) {
      setOpen(false);
      setIsClosing(false);
    }
  }

  /** Close dropdown when clicking outside trigger or dropdown. */
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      handleClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isClosing]);

  /** Close on Escape key. */
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isClosing]);

  /** Reposition on scroll/resize while open. */
  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  const circleButton = (
    <button
      ref={triggerRef}
      type="button"
      onClick={handleToggle}
      className="relative w-7 h-7 rounded-full overflow-hidden border border-border cursor-pointer transition-transform hover:scale-110 shrink-0"
      aria-label={`Pick ${label} color`}
    >
      <div
        className="w-full h-full"
        style={{ backgroundColor: value || "var(--muted)" }}
      />
    </button>
  );

  const dropdown =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={dropdownRef}
        className={`fixed z-[100] w-72 max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-popover shadow-lg p-3 ${
          isClosing ? "animate-popover-out" : "animate-popover-in"
        }`}
        style={{ top: pos.top, left: pos.left }}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-foreground">{label}</span>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset
            </button>
          )}
        </div>
        <ColorPickerPanel value={value || "#000000"} onChange={onChange} />
      </div>,
      document.body
    );

  if (layout === "compact") {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        {circleButton}
        {dropdown}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {circleButton}
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset
          </button>
        )}
      </div>
      {dropdown}
    </div>
  );
}
