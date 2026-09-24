"use client";

import { Merge } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { PROVIDER_LABELS } from "@/lib/copy";

export interface GradescopeMergeDialogProps {
  /** Whether the dialog is shown. */
  open: boolean;
  /** Gradescope classes whose course code matches a selected Canvas class. */
  overlapping: ReadonlyArray<{ id: string; name: string }>;
  /** Select the overlapping classes so both sources feed one class. */
  onMerge: () => void;
  /** Dismiss without selecting. */
  onDecline: () => void;
}

/**
 * Asks whether Gradescope classes that match already-selected Canvas classes
 * should be synced together. Built on Modal so it traps focus and closes on
 * Escape like every other dialog.
 *
 * @param open - Render flag
 * @param overlapping - Matching classes to list
 * @param onMerge - Confirm handler
 * @param onDecline - Cancel, Escape, backdrop
 */
export default function GradescopeMergeDialog({ open, overlapping, onMerge, onDecline }: GradescopeMergeDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onDecline}
      size="sm"
      title={`Merge with ${PROVIDER_LABELS.canvas}?`}
      description={`These ${PROVIDER_LABELS.gradescope} classes match classes you already have from ${PROVIDER_LABELS.canvas}. Sync them together?`}
      footer={
        <>
          <Button variant="secondary" onClick={onDecline}>
            No thanks
          </Button>
          <Button onClick={onMerge} leadingIcon={<Merge size={14} />}>
            Merge and select
          </Button>
        </>
      }
    >
      <ul className="rounded-xl border border-border max-h-40 overflow-auto list-none m-0 p-0">
        {overlapping.map((course) => (
          <li key={course.id} className="flex items-center gap-2 px-3 py-2 border-b border-border last:border-0">
            <span className="text-sm text-foreground truncate flex-1 min-w-0">{course.name}</span>
            <Badge variant="success">{PROVIDER_LABELS.gradescope}</Badge>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
