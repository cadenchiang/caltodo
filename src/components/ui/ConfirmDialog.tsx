"use client";

import { useRef, type ReactNode } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export interface ConfirmDialogProps {
  /** Whether the dialog is rendered. */
  open: boolean;
  /** Question being asked, in sentence case ("Sign out of your account?"). */
  title: string;
  /** Consequence or context under the title. */
  body?: ReactNode;
  /** Confirm button label. Defaults to "Confirm". */
  confirmLabel?: string;
  /** Cancel button label. Defaults to "Cancel". */
  cancelLabel?: string;
  /** Paints the confirm button red and moves initial focus to Cancel. */
  destructive?: boolean;
  /** Shows a spinner on confirm and blocks every way of dismissing. */
  loading?: boolean;
  /** Optional icon shown above the title (44px circle). */
  icon?: ReactNode;
  /** Called when the user confirms. */
  onConfirm: () => void;
  /** Called on cancel, Escape, or backdrop click. */
  onCancel: () => void;
}

/**
 * Two-choice confirmation built on Modal. Centered text, stacked full-width
 * buttons, no close button, so the user must pick an answer.
 *
 * @param destructive - Red confirm; focus starts on Cancel so Enter is safe
 * @param loading - Confirm shows a spinner; cancel, Escape and backdrop are disabled
 * @remarks Initial focus lands on Confirm for non-destructive prompts so a
 *          keyboard user can accept with Enter.
 */
export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onCancel}
      size="sm"
      hideClose
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      initialFocusRef={destructive ? cancelRef : confirmRef}
      aria-label={title}
      className="text-center"
    >
      {icon && (
        <div className="mx-auto mb-3 w-11 h-11 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      )}
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {body && <div className="mt-2 text-sm text-muted-foreground leading-snug">{body}</div>}
      <div className="mt-5 flex flex-col gap-2">
        <Button
          ref={confirmRef}
          variant={destructive ? "destructive-filled" : "primary"}
          loading={loading}
          onClick={onConfirm}
          className="w-full"
        >
          {confirmLabel}
        </Button>
        <Button
          ref={cancelRef}
          variant="secondary"
          disabled={loading}
          onClick={onCancel}
          className="w-full"
        >
          {cancelLabel}
        </Button>
      </div>
    </Modal>
  );
}
