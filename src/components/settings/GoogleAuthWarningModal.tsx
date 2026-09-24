"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
  /** Whether the modal is visible. */
  open: boolean;
  /** Called when the user clicks "Continue" to proceed with OAuth. */
  onContinue: () => void;
  /** Called when the user cancels. */
  onCancel: () => void;
}

/**
 * Pre-flight notice shown before Google OAuth opens. Styled to match the
 * app's standard popup modal (e.g. the "Request a platform" / Contact modal):
 * compact card, sans-serif title + subtitle, right-aligned Cancel/primary
 * buttons. Reads as informational, not alarming. Portaled to document.body.
 *
 * @param open - Controls visibility
 * @param onContinue - Fires when user clicks "Continue"
 * @param onCancel - Fires when user clicks "Cancel" or backdrop
 */
export default function GoogleAuthWarningModal({
  open,
  onContinue,
  onCancel,
}: Props) {
  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-popover border border-border shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-foreground mb-1">
          One quick note
        </h3>
        <p className="text-xs text-subtle-foreground mb-4">
          On the next screen Google may say &ldquo;Google hasn&rsquo;t verified this
          app.&rdquo; That&rsquo;s expected while our verification is in review — your
          data stays private and the connection is secure.
        </p>

        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground">
          To proceed, tap <span className="font-semibold">Advanced</span>
          <span className="mx-1 opacity-50">→</span>
          <span className="font-semibold">Go to CalTodo (unsafe)</span>.
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="px-4 py-1.5 rounded-lg bg-[#0e89d6] text-white text-sm font-medium hover:bg-[#3D8FE8] transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
