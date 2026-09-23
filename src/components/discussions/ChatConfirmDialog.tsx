"use client";

import { useId, useRef } from "react";
import { Loader2 } from "lucide-react";
import ChatModal from "./ChatModal";

/**
 * Props for ChatConfirmDialog.
 *
 * @param open - Whether the dialog is shown
 * @param title - Question being asked, e.g. "Hide this chat?"
 * @param description - One or two sentences explaining the consequence
 * @param confirmLabel - Text of the affirmative button
 * @param cancelLabel - Text of the cancel button (default "Cancel")
 * @param destructive - Styles the confirm button red
 * @param loading - Disables both buttons and shows a spinner on confirm
 * @param onConfirm - Called when the user confirms
 * @param onCancel - Called on cancel, backdrop click, or Escape
 */
export interface ChatConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Two-button confirmation dialog built on ChatModal. Replaces the four
 * bespoke confirm recipes the chat used to carry (leave, unsend, report,
 * window.confirm). Initial focus lands on Cancel so a stray Enter never
 * confirms a destructive action.
 *
 * Interim home for the shared ConfirmDialog primitive; migrates onto
 * src/components/ui/ConfirmDialog.tsx after the design-system merge.
 */
export default function ChatConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ChatConfirmDialogProps) {
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const confirmClass = destructive
    ? "px-4 py-2 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    : "px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";

  return (
    <ChatModal
      open={open}
      onClose={loading ? () => {} : onCancel}
      title={title}
      size="sm"
      initialFocusRef={cancelRef}
      describedBy={descriptionId}
      dismissible={!loading}
      footer={
        <>
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} className={confirmClass} aria-busy={loading}>
            {loading && <Loader2 size={14} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p id={descriptionId} className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </ChatModal>
  );
}
