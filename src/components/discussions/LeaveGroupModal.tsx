"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Props for the LeaveGroupModal component.
 *
 * @param courseName - Display name of the course/group being left
 * @param onConfirm - Async callback invoked when user confirms leaving
 * @param onClose - Callback to dismiss the modal without action
 */
interface LeaveGroupModalProps {
  courseName: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

/**
 * Portal-based confirmation modal for leaving a group chat.
 * Displays a prominent warning that the action is irreversible.
 * Shows a loading state while the leave request is in flight.
 */
export default function LeaveGroupModal({
  courseName,
  onConfirm,
  onClose,
}: LeaveGroupModalProps) {
  const [leaving, setLeaving] = useState(false);
  const [closing, setClosing] = useState(false);

  /**
   * Animates the modal closed then calls onClose.
   */
  const handleClose = useCallback(() => {
    if (leaving) return;
    setClosing(true);
    setTimeout(() => onClose(), 150);
  }, [leaving, onClose]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  /**
   * Handles the leave confirmation with loading state.
   */
  const handleConfirm = useCallback(async () => {
    setLeaving(true);
    await onConfirm();
  }, [onConfirm]);

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-150 ${
        closing ? "opacity-0" : "animate-in fade-in duration-150"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative bg-card rounded-2xl border border-border shadow-2xl w-[380px] max-w-[90vw] overflow-hidden transition-all duration-150 ${
          closing
            ? "scale-95 opacity-0"
            : "animate-in zoom-in-95 fade-in duration-200"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-lg font-bold text-foreground">
            Leave &ldquo;{courseName}&rdquo;?
          </h3>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            You will be removed from this chat and lose access to all messages.{" "}
            <span className="text-red-500 font-semibold">
              You cannot join back ever again.
            </span>
          </p>

          <div className="flex justify-end gap-2.5 mt-6">
            <button
              onClick={handleClose}
              disabled={leaving}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={leaving}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
            >
              {leaving ? "Leaving..." : "Leave Group"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
