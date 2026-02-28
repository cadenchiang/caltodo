"use client";

import { useState, useCallback, useEffect } from "react";
import { Undo2 } from "lucide-react";

/**
 * Props for the unsend confirmation modal.
 *
 * @param open - Whether the modal is visible
 * @param onConfirm - Called when the user confirms unsending
 * @param onCancel - Called when the user cancels
 */
interface UnsendConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation modal shown before unsending a chat message.
 * Uses subtle fade + scale animations for a smooth, non-jarring feel.
 * Prevents accidental unsends by requiring an explicit confirm action.
 *
 * @param open - Controls visibility
 * @param onConfirm - Fires when user clicks "Unsend"
 * @param onCancel - Fires when user clicks "Cancel" or backdrop
 */
export default function UnsendConfirmModal({
  open,
  onConfirm,
  onCancel,
}: UnsendConfirmModalProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Sync visibility with open prop
  useEffect(() => {
    if (open) {
      setVisible(true);
      setExiting(false);
    }
  }, [open]);

  /**
   * Triggers the exit animation, then fires the callback after it completes.
   *
   * @param callback - onConfirm or onCancel to fire after animation
   */
  const animateOut = useCallback(
    (callback: () => void) => {
      setExiting(true);
      setTimeout(() => {
        setVisible(false);
        setExiting(false);
        callback();
      }, 180);
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    animateOut(onConfirm);
  }, [animateOut, onConfirm]);

  const handleCancel = useCallback(() => {
    animateOut(onCancel);
  }, [animateOut, onCancel]);

  // Close on Escape key
  useEffect(() => {
    if (!visible) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleCancel();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [visible, handleCancel]);

  if (!visible) return null;

  const backdropClass = exiting
    ? "animate-unsend-backdrop-out"
    : "animate-unsend-backdrop-in";

  const cardClass = exiting
    ? "animate-unsend-card-out"
    : "animate-unsend-card-in";

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] ${backdropClass}`}
      onClick={handleCancel}
    >
      <div
        className={`bg-popover rounded-2xl border border-border shadow-xl w-full max-w-[320px] mx-4 p-5 ${cardClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <Undo2 size={18} className="text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-foreground text-center mb-1.5">
          Unsend message?
        </h3>

        {/* Description */}
        <p className="text-[13px] text-muted-foreground text-center leading-snug mb-5">
          This will remove the message for everyone, but people may have already
          seen it. Unsent messages may still be stored if the message was
          reported.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleConfirm}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-xl text-[13px] font-medium hover:bg-red-600 transition-colors cursor-pointer"
          >
            Unsend
          </button>
          <button
            onClick={handleCancel}
            className="w-full px-4 py-2 bg-muted text-foreground rounded-xl text-[13px] font-medium hover:bg-accent transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
