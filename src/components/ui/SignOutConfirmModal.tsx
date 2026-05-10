"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
  /** Whether the modal is visible. */
  open: boolean;
  /** Called when the user confirms sign out. */
  onConfirm: () => void;
  /** Called when the user cancels (clicks Cancel, backdrop, or presses Escape). */
  onCancel: () => void;
  /** When true, the confirm button shows a loading state and is disabled. */
  signingOut?: boolean;
}

/**
 * Centered confirmation modal shown before signing the user out.
 * Portaled to document.body at z-[9999] with backdrop blur. Replaces the
 * older "click twice to confirm" inline pattern.
 *
 * @param open - Controls visibility
 * @param onConfirm - Fires when "Sign out" is clicked
 * @param onCancel - Fires when "Cancel" is clicked, backdrop is clicked, or Escape pressed
 * @param signingOut - Optional spinner state for the confirm button
 */
export default function SignOutConfirmModal({
  open,
  onConfirm,
  onCancel,
  signingOut = false,
}: Props) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !signingOut) onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel, signingOut]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in"
        onClick={signingOut ? undefined : onCancel}
      />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-[calc(100%-2rem)] max-w-sm p-6 animate-announce-card-in">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Sign out?
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            You&rsquo;ll need to sign in again to pick up where you left off.
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={onConfirm}
              disabled={signingOut}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={signingOut}
              className="w-full px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
