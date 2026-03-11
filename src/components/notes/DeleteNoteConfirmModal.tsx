"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
  /** Whether the modal is visible. */
  open: boolean;
  /** Number of notes to be deleted. */
  noteCount: number;
  /** Called when the user confirms deletion. */
  onConfirm: () => void;
  /** Called when the user cancels. */
  onCancel: () => void;
}

/**
 * Centered confirmation modal for note deletion.
 * Portaled to document.body at z-[9999] with backdrop blur.
 * Matches the DeleteFolderConfirmModal pattern.
 *
 * @param open - Controls visibility
 * @param noteCount - Number of notes being deleted
 * @param onConfirm - Fires when "Delete" is clicked
 * @param onCancel - Fires when "Cancel" is clicked or backdrop is clicked
 */
export default function DeleteNoteConfirmModal({
  open,
  noteCount,
  onConfirm,
  onCancel,
}: Props) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in"
        onClick={onCancel}
      />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-[calc(100%-2rem)] max-w-sm p-6 animate-announce-card-in">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Delete {noteCount === 1 ? "note" : "notes"}?
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {noteCount === 1
              ? "This note will be moved to Recently Deleted."
              : `${noteCount} notes will be moved to Recently Deleted.`}
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={onConfirm}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all cursor-pointer"
            >
              Delete
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
