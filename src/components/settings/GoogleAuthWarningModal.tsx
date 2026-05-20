"use client";

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
 * Pre-flight notice shown before Google OAuth opens. Restyled to match
 * the landing-page / Notion-style modals used elsewhere in the app:
 * Playfair Display headline, generous spacing, no alarming icons. The
 * goal is to read as informational, not as a warning the user should
 * abort. Portaled to document.body.
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
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in"
        onClick={onCancel}
      />
      <div className="relative bg-popover rounded-2xl border border-border shadow-2xl w-[calc(100%-2rem)] max-w-md p-8 animate-announce-card-in">
        <h2
          className="text-foreground mb-3 leading-tight"
          style={{ fontFamily: "Playfair Display, serif", fontSize: "28px", fontWeight: 600 }}
        >
          One quick note.
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          On the next screen Google may say &ldquo;Google hasn&rsquo;t
          verified this app.&rdquo; That&rsquo;s expected while our
          verification is in review — your data stays private and the
          connection is secure.
        </p>
        <div className="text-sm text-foreground leading-relaxed mb-7 bg-muted/40 rounded-xl px-4 py-3 border border-border/60">
          To proceed: tap{" "}
          <span className="font-semibold">Advanced</span>
          <span className="opacity-50 mx-1">→</span>
          <span className="font-semibold">Go to CalTodo (unsafe)</span>.
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-foreground hover:opacity-90 transition-opacity"
          >
            Continue
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
