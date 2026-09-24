"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface ColorConfirmDialogProps {
  open: boolean;
  /** Class whose tasks would be recoloured. */
  courseName: string;
  /** Recolour every task in the class. */
  onAll: () => void;
  /** Recolour only this task. */
  onJustThis: () => void;
  /** Dismiss without saving either. */
  onCancel: () => void;
}

/**
 * Asked when an edit changes a task's colour and the task belongs to a
 * class: apply to the whole class or just this task. Built on Modal so it
 * stacks over the editor with its own Escape and focus trap.
 */
export default function ColorConfirmDialog({ open, courseName, onAll, onJustThis, onCancel }: ColorConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} size="sm" title="Apply color change?" description={<>Apply to all <span className="font-medium text-foreground">{courseName}</span> tasks or just this one?</>}>
      <div className="flex flex-col gap-2">
        <Button variant="secondary" className="w-full" onClick={onAll}>All tasks in {courseName}</Button>
        <Button variant="secondary" className="w-full" onClick={onJustThis}>Just this task</Button>
      </div>
    </Modal>
  );
}
