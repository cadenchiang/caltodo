"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { getFocusableElements, trapTabKey } from "./chatFocusTrap";

/**
 * Props for ChatModal.
 *
 * @param open - Whether the dialog is shown
 * @param onClose - Called on backdrop click, the close button, or Escape
 * @param title - Dialog heading; also the accessible name
 * @param children - Body content
 * @param footer - Optional action row rendered below the body
 * @param size - "md" (max-w-md) for standard dialogs, "sm" (max-w-sm) for compact confirms
 * @param initialFocusRef - Element to focus on open; defaults to the first focusable control
 * @param describedBy - id of the element that describes the dialog (aria-describedby)
 * @param dismissible - When false, backdrop click and Escape do nothing (e.g. required consent)
 */
export interface ChatModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md";
  initialFocusRef?: RefObject<HTMLElement | null>;
  describedBy?: string;
  dismissible?: boolean;
}

/**
 * Modal dialog following the UI_STYLE_GUIDE recipe: portal to document.body,
 * solid bg-popover card, backdrop blur, entry animations, close on backdrop
 * click and Escape. Adds what the recipe leaves implicit: role="dialog",
 * aria-modal, a focus trap, initial focus, and focus restoration to the
 * element that opened it. Animations are suppressed under
 * prefers-reduced-motion.
 *
 * Interim home for the shared Modal primitive: a design-system package owns
 * src/components/ui/Modal.tsx and this file migrates onto it after merge.
 */
export default function ChatModal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  initialFocusRef,
  describedBy,
  dismissible = true,
}: ChatModalProps) {
  const titleId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  // Portals need document; render nothing on the server and until mounted.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Initial focus on open, restore on close.
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const card = cardRef.current;
    const target = initialFocusRef?.current ?? (card ? getFocusableElements(card)[0] : null);
    // Defer one frame so the portal has painted before focus moves.
    const frame = requestAnimationFrame(() => (target ?? card)?.focus());
    return () => {
      cancelAnimationFrame(frame);
      restoreFocusRef.current?.focus?.();
    };
  }, [open, initialFocusRef]);

  // Escape closes, Tab stays inside the card.
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (dismissible) {
          e.preventDefault();
          onClose();
        }
        return;
      }
      if (cardRef.current) trapTabKey(e, cardRef.current);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, dismissible]);

  if (!open || !mounted) return null;

  const widthClass = size === "sm" ? "max-w-sm" : "max-w-md";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in motion-reduce:animate-none"
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={`relative bg-popover rounded-2xl shadow-2xl border border-border w-full ${widthClass} mx-4 animate-announce-card-in motion-reduce:animate-none overflow-hidden outline-none max-h-[85vh] flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 id={titleId} className="text-base font-semibold text-foreground">
            {title}
          </h2>
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="p-4 space-y-4 overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 p-4 border-t border-border shrink-0">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  );
}
