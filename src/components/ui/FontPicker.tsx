"use client";

/**
 * Custom font picker dropdown that renders each option in its own typeface.
 * Groups fonts by category (Sans / Rounded / Serif) with section headers.
 * Dropdown is portaled to document.body to escape modal overflow clipping.
 *
 * @param value - Current font-family CSS value (empty = System Default)
 * @param onChange - Callback with the selected font-family value
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import {
  FONT_OPTIONS,
  FONT_CATEGORY_LABELS,
  SYSTEM_DEFAULT_FONT,
  type FontOption,
} from "@/lib/font-options";

interface FontPickerProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Groups font options by category in display order.
 *
 * @returns Array of [category, options[]] tuples
 */
function groupedFonts(): [FontOption["category"], FontOption[]][] {
  const categories: FontOption["category"][] = ["sans", "rounded", "serif"];
  return categories.map((cat) => [
    cat,
    FONT_OPTIONS.filter((f) => f.category === cat),
  ]);
}

export default function FontPicker({ value, onChange }: FontPickerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  /** Normalize empty string (legacy/unsaved) to the system default value. */
  const normalizedValue = value || SYSTEM_DEFAULT_FONT;
  const currentFont = FONT_OPTIONS.find((f) => f.value === normalizedValue);
  const displayLabel = currentFont?.label || "System Default";

  /** Compute dropdown position from trigger bounding rect. */
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  /** Open dropdown and compute position. */
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

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-input-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
        style={{ fontFamily: normalizedValue }}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 ml-2 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown — portaled to body to escape modal overflow-hidden */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[100] max-h-64 overflow-y-auto rounded-xl border border-border bg-popover shadow-lg py-1"
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
            }}
          >
            {groupedFonts().map(([category, options]) => (
              <div key={category}>
                {/* Section header */}
                <div className="px-3 pt-2 pb-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    {FONT_CATEGORY_LABELS[category]}
                  </span>
                </div>

                {/* Font options */}
                {options.map((font) => {
                  const isSelected = font.value === normalizedValue;
                  return (
                    <button
                      key={font.value || "__default__"}
                      type="button"
                      onClick={() => {
                        onChange(font.value);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                        isSelected
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "text-foreground hover:bg-muted"
                      }`}
                      style={{ fontFamily: font.value || undefined }}
                    >
                      {font.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
