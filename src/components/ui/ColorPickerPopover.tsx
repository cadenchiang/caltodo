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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  /** Compute dropdown position from trigger bounding rect. Centers on trigger, clamps to viewport. */
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownW = 288; // w-72 = 18rem = 288px
    const viewW = window.innerWidth;
    // Center dropdown on trigger, then clamp so it stays within viewport
    let left = rect.left + rect.width / 2 - dropdownW / 2;
    left = Math.max(8, Math.min(left, viewW - dropdownW - 8));
    setPos({
      top: rect.bottom + 6,
      left,
    });
  }, []);

  /** Toggle dropdown open/close. */
  function handleToggle() {
    if (!open) updatePosition();
    setOpen((prev) => !prev);
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
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  /** Close on Escape key. */
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

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
        className="fixed z-[100] w-72 rounded-xl border border-border bg-popover shadow-lg p-3"
        style={{ top: pos.top, left: pos.left }}
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
