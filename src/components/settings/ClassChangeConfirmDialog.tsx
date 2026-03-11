"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";

interface ClassChangeConfirmDialogProps {
  /** Names of classes being added (will trigger sync). */
  addedNames: string[];
  /** Names of classes being removed (tasks will be deleted). */
  removedNames: string[];
  /** Number of existing tasks that will be deleted for removed classes. */
  removedTaskCount: number;
  /** Whether the confirm action is in progress. */
  loading: boolean;
  /** Called when user confirms the changes. */
  onConfirm: () => void;
  /** Called when user cancels the changes. */
  onCancel: () => void;
}

/**
 * Modal confirmation dialog shown when class selections change.
 * Warns about tasks that will be deleted for removed classes
 * and indicates new classes that will be synced.
 * Rendered via portal at z-[9999] to sit above all other UI.
 *
 * @param addedNames - Course names being added
 * @param removedNames - Course names being removed
 * @param removedTaskCount - Count of tasks that will be deleted
 * @param loading - Shows spinner on confirm button while saving
 * @param onConfirm - Confirm callback
 * @param onCancel - Cancel callback
 */
export default function ClassChangeConfirmDialog({
  addedNames,
  removedNames,
  removedTaskCount,
  loading,
  onConfirm,
  onCancel,
}: ClassChangeConfirmDialogProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCancel();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const hasAdded = addedNames.length > 0;
  const hasRemoved = removedNames.length > 0;

  // Determine title and confirm button style
  let title: string;
  let confirmLabel: string;
  let confirmClass: string;

  if (hasRemoved && !hasAdded) {
    title = "Hide classes?";
    confirmLabel = "Hide";
    confirmClass = "bg-gray-900 dark:bg-white dark:text-gray-900";
  } else if (hasAdded && !hasRemoved) {
    title = "Sync new classes?";
    confirmLabel = "Sync";
    confirmClass = "bg-gray-900 dark:bg-white dark:text-gray-900";
  } else {
    title = "Update classes?";
    confirmLabel = "Update";
    confirmClass = "bg-gray-900 dark:bg-white dark:text-gray-900";
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-[calc(100%-2rem)] max-w-sm p-6 animate-modal-in">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            {title}
          </h2>

          <div className="text-sm text-muted-foreground mb-6 space-y-2">
            {hasAdded && (
              <p>
                Sync assignments from{" "}
                <span className="font-medium text-foreground">
                  {addedNames.join(", ")}
                </span>
                .
              </p>
            )}
            {hasRemoved && (
              <p>
                {removedTaskCount > 0
                  ? `Hide ${removedTaskCount === 1 ? "1 task" : `${removedTaskCount} tasks`} from `
                  : "Hide "}
                <span className="font-medium text-foreground">
                  {removedNames.join(", ")}
                </span>
                .
                {removedTaskCount > 0 && " You can bring them back by re-selecting the course."}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 ${confirmClass}`}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {confirmLabel}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="w-full px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer disabled:opacity-60"
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
