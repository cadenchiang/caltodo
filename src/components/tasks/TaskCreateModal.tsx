"use client";

import { useRef, useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import type { Task, TaskInsert, TaskUpdate } from "@/lib/types";
import { useToast } from "@/contexts/ToastContext";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { ACTIONS } from "@/lib/copy";
import CustomRecurrenceModal from "./CustomRecurrenceModal";
import TaskFormRows, { type PickerKey } from "./create/TaskFormRows";
import TaskFormPickers from "./create/TaskFormPickers";
import ColorConfirmDialog from "./create/ColorConfirmDialog";
import { buildTaskInsert, buildTaskUpdates, useTaskForm } from "./create/useTaskForm";

/**
 * Props for the TaskCreateModal component.
 *
 * @param open - Whether the modal is visible
 * @param onClose - Callback to close the modal
 * @param onAdd - Receives the new task (create mode); may return the insert promise
 * @param defaultDate - Optional default due_date (create mode)
 * @param editTask - When provided, modal enters edit mode with fields pre-filled
 * @param onSave - Callback for saving edits (edit mode)
 * @param onDelete - Callback for deleting the task (edit mode)
 */
interface TaskCreateModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * Receives the new task. May return the insert promise (true on success,
   * false when rolled back) so the success toast waits for the write.
   */
  onAdd: (task: TaskInsert) => void | Promise<boolean | void>;
  defaultDate?: string | null;
  /** Pre-fill due time in "HH:MM" 24h format (from time grid double-click). */
  defaultTime?: string | null;
  /** Pre-fill the course/class name. */
  defaultCourseName?: string | null;
  editTask?: Task | null;
  onSave?: (id: string, updates: TaskUpdate) => void;
  onDelete?: (id: string) => void;
  /** Optional: called when user chooses to apply a color change to all tasks in a class. */
  onSaveColorForClass?: (courseName: string, color: string) => void;
  /** When provided, shows a Task/Event toggle at the top. */
  createTypeToggle?: React.ReactNode;
  /**
   * Kept for the calendar overlay mode's toggle. The dialog is built on
   * Modal, which unmounts when closed, so this no longer keeps it mounted.
   */
  keepMounted?: boolean;
}

/**
 * Dialog for creating or editing a task, built on the Modal primitive
 * (dialog role, focus trap, Escape, scroll lock, one entrance animation).
 * Fields live in TaskFormRows, pickers in TaskFormPickers, state in
 * useTaskForm. Submit is guarded against a double fire.
 *
 * @param props - See TaskCreateModalProps
 */
export default function TaskCreateModal({
  open, onClose, onAdd, defaultDate, defaultTime, defaultCourseName, editTask, onSave, onDelete, onSaveColorForClass, createTypeToggle,
}: TaskCreateModalProps) {
  const { showToast } = useToast();
  const isEditMode = !!editTask;
  const { form, set, reset } = useTaskForm(open, editTask, { defaultDate, defaultTime, defaultCourseName });
  const [openPicker, setOpenPicker] = useState<PickerKey>(null);
  const [showCustomRecurrence, setShowCustomRecurrence] = useState(false);
  const [showColorConfirm, setShowColorConfirm] = useState(false);
  const submittingRef = useRef(false);

  const refs = {
    title: useRef<HTMLInputElement>(null),
    color: useRef<HTMLButtonElement>(null),
    course: useRef<HTMLButtonElement>(null),
    date: useRef<HTMLButtonElement>(null),
    time: useRef<HTMLButtonElement>(null),
    repeat: useRef<HTMLButtonElement>(null),
    tags: useRef<HTMLButtonElement>(null),
  };

  /** Closes the dialog and clears the form and any open picker. */
  function handleClose() {
    setOpenPicker(null);
    setShowColorConfirm(false);
    setShowCustomRecurrence(false);
    onClose();
    reset();
  }

  /** Opens a picker, or closes it when it is already open. */
  function togglePicker(picker: PickerKey) {
    setOpenPicker((current) => (current === picker ? null : picker));
  }

  /**
   * Validates and submits (create or edit), then closes. A colour change on
   * a class task asks whether to apply it to the whole class first.
   */
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;
    const trimmed = form.title.trim();
    if (!trimmed) return;

    if (isEditMode && editTask && onSave) {
      const colorChanged = form.color.toUpperCase() !== editTask.color.toUpperCase();
      if (colorChanged && form.courseName && onSaveColorForClass) {
        setShowColorConfirm(true);
        return;
      }
      // updateTask announces the edit ("Due date changed" + Undo); a second
      // generic "Task updated" here would stack on top of it.
      submittingRef.current = true;
      onSave(editTask.id, buildTaskUpdates(form));
    } else {
      submittingRef.current = true;
      const result = onAdd(buildTaskInsert(form));
      // Announce only once the insert has resolved; a failed insert already
      // shows its own error toast from TaskContext, so a "Task created" here
      // would contradict it.
      Promise.resolve(result).then((inserted) => {
        if (inserted !== false) showToast("Task created");
      });
    }
    submittingRef.current = false;
    handleClose();
  }

  /** Saves this task's colour only (from the confirm dialog). */
  function handleColorConfirmJustThis() {
    if (editTask && onSave) onSave(editTask.id, buildTaskUpdates(form));
    handleClose();
  }

  /** Saves this task and applies its colour to the whole class. */
  function handleColorConfirmAll() {
    if (editTask && onSave && onSaveColorForClass && form.courseName) {
      onSave(editTask.id, buildTaskUpdates(form));
      onSaveColorForClass(form.courseName, form.color);
    }
    handleClose();
  }

  /** Deletes the task being edited (single click; the toast carries Undo). */
  function handleDelete() {
    if (editTask && onDelete) {
      onDelete(editTask.id);
      handleClose();
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        size="lg"
        aria-label={isEditMode ? "Edit task" : "New task"}
        initialFocusRef={refs.title}
        bodyClassName="-mx-6"
        className="w-[540px] max-w-[95vw]"
      >
        <form id="task-form" onSubmit={handleSubmit} className="pt-6">
          {createTypeToggle && !isEditMode && <div className="px-6 pb-5">{createTypeToggle}</div>}
          <TaskFormRows form={form} set={set} source={editTask?.source} onToggle={togglePicker} openPicker={openPicker} refs={refs} />
          <div className="flex items-center justify-between px-6 pt-5 mt-3 border-t border-border">
            <div>
              {isEditMode && onDelete && editTask && (
                <Button variant="destructive" size="md" leadingIcon={<Trash2 size={15} />} onClick={handleDelete}>
                  {ACTIONS.delete}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handleClose}>{ACTIONS.cancel}</Button>
              <Button type="submit" disabled={!form.title.trim()}>{ACTIONS.save}</Button>
            </div>
          </div>
        </form>
      </Modal>

      {open && (
        <TaskFormPickers form={form} set={set} openPicker={openPicker} onClose={() => setOpenPicker(null)} onCustomRepeat={() => setShowCustomRecurrence(true)} refs={refs} />
      )}

      <CustomRecurrenceModal
        open={showCustomRecurrence}
        onClose={() => setShowCustomRecurrence(false)}
        interval={form.repeatInterval}
        unit={form.repeatUnit}
        repeatEndDate={form.repeatEndDate}
        repeatEndCount={form.repeatEndCount}
        onDone={(interval, unit, endDate, endCount) => {
          set("repeatInterval", interval);
          set("repeatUnit", unit);
          set("repeatEndDate", endDate);
          set("repeatEndCount", endCount);
          setShowCustomRecurrence(false);
        }}
      />

      {form.courseName && (
        <ColorConfirmDialog
          open={showColorConfirm}
          courseName={form.courseName}
          onAll={handleColorConfirmAll}
          onJustThis={handleColorConfirmJustThis}
          onCancel={() => setShowColorConfirm(false)}
        />
      )}
    </>
  );
}
