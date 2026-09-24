"use client";

import type { Task, TaskUpdate } from "@/lib/types";
import TaskCreateModal from "@/components/tasks/TaskCreateModal";
import TaskPreviewPopover from "@/components/tasks/TaskPreviewPopover";

interface InboxTaskOverlaysProps {
  /** Task shown in the preview popover, if any. */
  previewTask: Task | null;
  /** Anchor rect for the preview popover. */
  previewRect: DOMRect | null;
  /** Task open in the full edit modal, if any. */
  modalTask: Task | null;
  onClosePreview: () => void;
  /** Moves a task from the preview into the edit modal. */
  onOpenModal: (task: Task) => void;
  onCloseModal: () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void | Promise<void>;
  onSave: (id: string, updates: TaskUpdate) => void | Promise<unknown>;
  onSaveColorForClass: (courseName: string, color: string) => void | Promise<void>;
}

/**
 * The preview popover (first click on a board card, or a row on mobile) and
 * the full edit modal it hands off to. One instance serves both the list
 * and the board so the page holds a single pair of task/rect states.
 *
 * @param props - InboxTaskOverlaysProps
 */
export default function InboxTaskOverlays({
  previewTask,
  previewRect,
  modalTask,
  onClosePreview,
  onOpenModal,
  onCloseModal,
  onToggle,
  onDelete,
  onSave,
  onSaveColorForClass,
}: InboxTaskOverlaysProps) {
  return (
    <>
      {previewTask && previewRect && (
        <TaskPreviewPopover
          task={previewTask}
          anchorRect={previewRect}
          onClose={onClosePreview}
          onEdit={(task) => {
            onClosePreview();
            onOpenModal(task);
          }}
          onDelete={async (id) => {
            await onDelete(id);
            onClosePreview();
          }}
          onToggle={onToggle}
        />
      )}
      <TaskCreateModal
        open={!!modalTask}
        onClose={onCloseModal}
        onAdd={() => {}}
        editTask={modalTask}
        onSave={(id, updates) => { onSave(id, updates); }}
        onDelete={async (id) => {
          await onDelete(id);
          onCloseModal();
        }}
        onSaveColorForClass={(courseName, color) => { onSaveColorForClass(courseName, color); }}
      />
    </>
  );
}
