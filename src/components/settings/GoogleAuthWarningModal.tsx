"use client";

import { useRef } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { BRAND } from "@/lib/copy";

interface Props {
  /** Whether the modal is visible. */
  open: boolean;
  /** Called when the user clicks "Continue" to proceed with OAuth. */
  onContinue: () => void;
  /** Called when the user cancels. */
  onCancel: () => void;
}

/** The menu label Google shows for an unverified app, with the brand lowercase. */
export const UNSAFE_LINK_LABEL = `Go to ${BRAND} (unsafe)`;

/**
 * Pre-flight notice shown before Google OAuth opens. Built on Modal so it
 * carries the dialog role, focus trap, Escape, and backdrop click. Reads as
 * informational, not alarming.
 *
 * @param open - Controls visibility
 * @param onContinue - Fires when the user clicks "Continue"
 * @param onCancel - Fires on Cancel, Escape, or backdrop click
 */
export default function GoogleAuthWarningModal({ open, onContinue, onCancel }: Props) {
  const continueRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="One quick note"
      description={
        "On the next screen Google may say “Google hasn’t verified this app.” That is expected while our verification is in review. Your data stays private and the connection is secure."
      }
      initialFocusRef={continueRef}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button ref={continueRef} onClick={onContinue}>
            Continue
          </Button>
        </>
      }
    >
      <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground">
        To proceed, tap <span className="font-semibold">Advanced</span>, then{" "}
        <span className="font-semibold">{UNSAFE_LINK_LABEL}</span>.
      </div>
    </Modal>
  );
}
