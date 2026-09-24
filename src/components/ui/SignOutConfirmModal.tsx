"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { UserCircle2 } from "lucide-react";

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
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-[calc(100%-2rem)] max-w-sm px-6 pt-7 pb-5 animate-announce-card-in">
        <div className="text-center">
          <div className="mx-auto mb-3 w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <UserCircle2 size={20} strokeWidth={1.8} className="text-muted-foreground" />
          </div>
          <h2 className="text-[17px] font-semibold text-foreground mb-2">
            Log out of your account?
          </h2>
          <p className="text-sm text-muted-foreground leading-snug mb-5 px-2">
            You&rsquo;ll need to log back in to pick up where you left off.
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={onConfirm}
              disabled={signingOut}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#d96b5e] hover:bg-[#cf5a4d] disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {signingOut ? "Logging out..." : "Log out"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={signingOut}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground border border-border hover:bg-accent disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
