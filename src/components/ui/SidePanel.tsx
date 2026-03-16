"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const SIDE_PANEL_WIDTH = 340;
export const SIDE_PANEL_GAP = 16;
/** Minimum distance from any viewport edge. */
export const SIDE_PANEL_EDGE_PAD = 8;

/**
 * Computes the fixed position for a side panel relative to an anchor rect.
 * Ensures the panel never overflows any viewport edge.
 *
 * @param anchorRect - Bounding rect of the anchor element
 * @param viewportW - Viewport width (window.innerWidth)
 * @param viewportH - Viewport height (window.innerHeight)
 * @param panelH - Measured or estimated panel height
 * @returns { side, top, left } for the panel
 */
export function computeSidePanelPosition(
  anchorRect: { top: number; left: number; right: number; bottom: number },
  viewportW: number,
  viewportH: number,
  panelH: number
): { side: "right" | "left"; top: number; left: number } {
  const side: "right" | "left" =
    anchorRect.right + SIDE_PANEL_GAP + SIDE_PANEL_WIDTH < viewportW ? "right"
    : anchorRect.left - SIDE_PANEL_GAP - SIDE_PANEL_WIDTH > SIDE_PANEL_EDGE_PAD ? "left"
    : "right";

  let left = side === "right"
    ? anchorRect.right + SIDE_PANEL_GAP
    : anchorRect.left - SIDE_PANEL_GAP - SIDE_PANEL_WIDTH;
  left = Math.max(SIDE_PANEL_EDGE_PAD, Math.min(left, viewportW - SIDE_PANEL_WIDTH - SIDE_PANEL_EDGE_PAD));

  let top = anchorRect.top;
  if (top + panelH > viewportH - SIDE_PANEL_EDGE_PAD) top = viewportH - panelH - SIDE_PANEL_EDGE_PAD;
  if (top < SIDE_PANEL_EDGE_PAD) top = SIDE_PANEL_EDGE_PAD;

  return { side, top, left };
}

interface SidePanelProps {
  /** Panel title shown in the header. */
  title: string;
  /** Optional icon shown before the title. */
  icon?: LucideIcon;
  /** Which side the panel slides in from. */
  side?: "right" | "left";
  /** Fixed position style { top, left, width }. */
  position?: { top: number; left: number; width: number };
  /** Called when user closes the panel (X button or animation end). */
  onClose: () => void;
  /** Scrollable body content. */
  children: React.ReactNode;
  /** Optional footer rendered below the scrollable body. */
  footer?: React.ReactNode;
}

/**
 * Reusable fixed-position side panel with header, scrollable body,
 * optional footer, close animation, and mobile bottom sheet fallback.
 * Used by WidgetEditorPanel, FolderAppearanceModal, rename panel, etc.
 *
 * @param title - Panel header title
 * @param icon - Optional LucideIcon before the title
 * @param side - "right" or "left" for slide direction
 * @param position - Fixed { top, left, width } from computeSidePanelPosition
 * @param onClose - Close callback
 * @param children - Scrollable body content
 * @param footer - Optional fixed footer below the body
 */
export default function SidePanel({
  title,
  icon: IconComponent,
  side = "right",
  position,
  onClose,
  children,
  footer,
}: SidePanelProps) {
  const [isClosing, setIsClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  /**
   * Triggers the close animation.
   */
  const triggerClose = useCallback(() => {
    setIsClosing(true);
  }, []);

  /**
   * Calls onClose after the exit animation completes.
   */
  function handleAnimEnd() {
    if (isClosing) onClose();
  }

  const animClass = isClosing
    ? (isMobile ? "animate-editor-sheet-out" : `animate-editor-panel-out-${side}`)
    : (isMobile ? "animate-editor-sheet-in" : `animate-editor-panel-in-${side}`);

  const panelCls = isMobile
    ? `fixed bottom-0 left-0 right-0 z-[52] max-h-[60vh] bg-popover border-t border-border rounded-t-2xl shadow-2xl flex flex-col ${animClass}`
    : `fixed z-[52] bg-popover border border-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh] ${animClass}`;

  const panelStyle = isMobile
    ? { paddingBottom: "env(safe-area-inset-bottom, 0px)" }
    : position;

  return (
    <div
      ref={panelRef}
      className={panelCls}
      style={panelStyle}
      onAnimationEnd={handleAnimEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border shrink-0">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          {IconComponent && (
            <IconComponent size={15} className="text-muted-foreground shrink-0" />
          )}
          {title}
        </h2>
        <button
          onClick={triggerClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      {/* Optional footer */}
      {footer && (
        <div className="shrink-0 border-t border-border">
          {footer}
        </div>
      )}
    </div>
  );
}
