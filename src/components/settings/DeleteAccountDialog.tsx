"use client";

import { useEffect, useState } from "react";
import { UserX } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import TextField from "@/components/ui/TextField";

/** The word the user must type before the confirm button enables. */
export const DELETE_CONFIRM_WORD = "delete";

/**
 * What /api/account/delete removes, in the order it removes it. Listed in
 * the dialog so the user confirms the consequence, not just the verb.
 */
export const DELETED_ITEMS: readonly string[] = [
  "All of your tasks and classes",
  "Every connected platform and your Google Calendar link",
  "Your profile photo and uploads",
  "Any subscription, which is cancelled first",
  "Your sign-in, so the address can be used for a new account",
];

/**
 * Whether the typed gate is met.
 *
 * @param typed - The current input value
 * @returns True when the trimmed, lowercased value equals DELETE_CONFIRM_WORD
 */
export function isDeleteConfirmed(typed: string): boolean {
  return typed.trim().toLowerCase() === DELETE_CONFIRM_WORD;
}

interface DeleteAccountDialogProps {
  /** Whether the dialog is rendered. */
  open: boolean;
  /** True while the delete request is in flight. */
  deleting: boolean;
  /** Called once the user has typed the word and pressed the confirm button. */
  onConfirm: () => void;
  /** Called on Cancel, Escape, or backdrop click. */
  onCancel: () => void;
}

/**
 * Destructive confirmation for account deletion. Lists what is deleted and
 * keeps the confirm button disabled until the user types "delete".
 *
 * @param open - Controls rendering
 * @param deleting - Spinner on confirm; blocks dismissal while true
 * @param onConfirm - Runs the deletion
 * @param onCancel - Dismisses without deleting
 * @remarks The typed value resets every time the dialog opens so a reopened
 *          dialog never starts already unlocked.
 */
export default function DeleteAccountDialog({ open, deleting, onConfirm, onCancel }: DeleteAccountDialogProps) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (open) setTyped("");
  }, [open]);

  return (
    <ConfirmDialog
      open={open}
      title="Delete your account?"
      destructive
      loading={deleting}
      confirmDisabled={!isDeleteConfirmed(typed)}
      confirmLabel="Delete account"
      icon={<UserX size={20} strokeWidth={1.8} />}
      onConfirm={onConfirm}
      onCancel={onCancel}
      body={
        <div className="text-left">
          <p>This cannot be undone. Deleting removes:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {DELETED_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <TextField
            label={`Type "${DELETE_CONFIRM_WORD}" to confirm`}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            disabled={deleting}
            wrapperClassName="mt-4"
          />
        </div>
      }
    />
  );
}
