"use client";

import { UserCircle2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { AUTH } from "@/lib/copy";

interface Props {
  /** Whether the modal is visible. */
  open: boolean;
  /** Called when the user confirms sign out. */
  onConfirm: () => void;
  /** Called when the user cancels (clicks Cancel, backdrop, or presses Escape). */
  onCancel: () => void;
  /** When true, the confirm button shows a loading state and dismissal is blocked. */
  signingOut?: boolean;
}

/**
 * Confirmation shown before signing the user out. A thin wrapper over
 * ConfirmDialog so the copy lives in one place (src/lib/copy.ts).
 *
 * @param open - Controls visibility
 * @param onConfirm - Fires when "Sign out" is clicked
 * @param onCancel - Fires on Cancel, backdrop click, or Escape
 * @param signingOut - Spinner state for the confirm button
 */
export default function SignOutConfirmModal({ open, onConfirm, onCancel, signingOut = false }: Props) {
  return (
    <ConfirmDialog
      open={open}
      title={AUTH.signOutConfirmTitle}
      body={AUTH.signOutConfirmBody}
      confirmLabel={AUTH.signOut}
      destructive
      loading={signingOut}
      icon={<UserCircle2 size={20} strokeWidth={1.8} />}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
