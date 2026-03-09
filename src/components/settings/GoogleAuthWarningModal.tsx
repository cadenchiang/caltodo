"use client";

import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

interface Props {
  /** Whether the modal is visible. */
  open: boolean;
  /** Called when the user clicks "Continue" to proceed with OAuth. */
  onContinue: () => void;
  /** Called when the user cancels. */
  onCancel: () => void;
}

/**
 * Warning modal shown before Google Calendar OAuth flow.
 * Explains Google's "unverified app" screen so users don't abandon the flow.
 * Portaled to document.body, matching DeleteFolderConfirmModal pattern.
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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl max-w-sm mx-4 p-6 animate-modal-in">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-amber-500" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Google Verification Notice
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            You may see a warning that says &quot;Google hasn&apos;t verified
            this app.&quot; This is normal — Google&apos;s verification process
            takes time. Your data is safe.
          </p>
          <div className="text-sm text-muted-foreground mb-6 leading-relaxed bg-muted/50 rounded-xl px-4 py-3 border border-border/50">
            Click <span className="font-medium text-foreground">Advanced</span>{" "}
            → <span className="font-medium text-foreground">Go to CalTodo (unsafe)</span>{" "}
            to continue.
          </div>
          <div className="space-y-2">
            <button
              type="button"
              onClick={onContinue}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-all cursor-pointer"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
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
