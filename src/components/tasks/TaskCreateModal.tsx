"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Palette, Tag, X } from "lucide-react";
import { format } from "date-fns";
import type { Task, TaskInsert, TaskUpdate } from "@/lib/types";
import { TASK_COLORS, DEFAULT_TASK_COLOR, getMiffyColor } from "@/lib/constants";
import { getRepeatLabel } from "@/lib/repeat";
import { useTaskContext } from "@/contexts/TaskContext";
import { useTheme } from "@/contexts/ThemeContext";
import DatePicker from "./DatePicker";
import TagPicker from "./TagPicker";
import GuestPicker from "./GuestPicker";
import Popover from "@/components/ui/Popover";

type RepeatUnit = "day" | "week" | "month";

/**
 * Props for the TaskCreateModal component.
 *
 * @param open - Whether the modal is visible
 * @param onClose - Callback to close the modal
 * @param onAdd - Callback with the new task data (create mode)
 * @param defaultDate - Optional default due_date (create mode)
 * @param editTask - When provided, modal enters edit mode with fields pre-filled
 * @param onSave - Callback for saving edits (edit mode)
 */
interface TaskCreateModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (task: TaskInsert) => void;
  defaultDate?: string | null;
  editTask?: Task | null;
  onSave?: (id: string, updates: TaskUpdate) => void;
}

/**
 * Portal modal for creating or editing a task.
 * In create mode: all fields start empty (or with defaultDate).
 * In edit mode: fields pre-fill from editTask, submit calls onSave.
 *
 * @param open - Controls modal visibility
 * @param onClose - Close handler
 * @param onAdd - Task creation handler
 * @param defaultDate - Optional pre-filled due date (create mode)
 * @param editTask - Task to edit (edit mode)
 * @param onSave - Save handler (edit mode)
 */
export default function TaskCreateModal({
  open, onClose, onAdd, defaultDate, editTask, onSave,
}: TaskCreateModalProps) {
  const { availableTags } = useTaskContext();
  const { colorTheme } = useTheme();
  const isMiffy = colorTheme === "miffy";
  const isEditMode = !!editTask;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(defaultDate ?? null);
  const [dueTime, setDueTime] = useState<string | null>(null);
  const [color, setColor] = useState<string>(DEFAULT_TASK_COLOR);
  const [tags, setTags] = useState<string[]>([]);
  const [repeatInterval, setRepeatInterval] = useState<number | null>(null);
  const [repeatUnit, setRepeatUnit] = useState<RepeatUnit | null>(null);
  const [repeatEndDate, setRepeatEndDate] = useState<string | null>(null);
  const [repeatEndCount, setRepeatEndCount] = useState<number | null>(null);
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [closing, setClosing] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const tagButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-focus title when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [open]);

  // Set defaultDate in create mode
  useEffect(() => {
    if (open && !editTask) setDueDate(defaultDate ?? null);
  }, [defaultDate, open, editTask]);

  // Pre-fill fields in edit mode
  useEffect(() => {
    if (open && editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description || "");
      setDueDate(editTask.due_date);
      setDueTime(editTask.due_time);
      setColor(editTask.color);
      setTags(editTask.tags ?? []);
      setRepeatInterval(editTask.repeat_interval);
      setRepeatUnit(editTask.repeat_unit);
      setRepeatEndDate(editTask.repeat_end_date);
      setRepeatEndCount(editTask.repeat_end_count);
      setInviteEmails([]);
    }
  }, [open, editTask]);

  /**
   * Resets all form fields to their initial state.
   */
  function resetForm() {
    setTitle("");
    setDescription("");
    setDueDate(defaultDate ?? null);
    setDueTime(null);
    setColor(DEFAULT_TASK_COLOR);
    setTags([]);
    setRepeatInterval(null);
    setRepeatUnit(null);
    setRepeatEndDate(null);
    setRepeatEndCount(null);
    setInviteEmails([]);
    setShowDatePicker(false);
    setShowTagPicker(false);
  }

  /**
   * Animates the modal closed, then calls onClose.
   */
  function handleClose() {
    setClosing(true);
    setTimeout(() => {
      onClose();
      setClosing(false);
      resetForm();
    }, 150);
  }

  /**
   * Validates and submits the task (create or edit), then closes.
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    if (isEditMode && editTask && onSave) {
      onSave(editTask.id, {
        title: trimmed,
        description: description.trim(),
        due_date: dueDate,
        due_time: dueTime,
        color,
        tags,
        repeat_interval: repeatInterval,
        repeat_unit: repeatUnit,
        repeat_end_date: repeatEndDate,
        repeat_end_count: repeatEndCount,
      });
    } else {
      onAdd({
        title: trimmed,
        description: description.trim() || undefined,
        due_date: dueDate,
        due_time: dueTime,
        color,
        tags: tags.length > 0 ? tags : undefined,
        repeat_interval: repeatInterval,
        repeat_unit: repeatUnit,
        repeat_end_date: repeatEndDate,
        repeat_end_count: repeatEndCount,
        inviteEmails: inviteEmails.length > 0 ? inviteEmails : undefined,
      });
    }

    handleClose();
  }

  if (!open) return null;

  /**
   * Formats the due date for display in the date button.
   */
  function formatDueLabel(): string {
    if (!dueDate) return "Set date";
    const d = new Date(dueDate + "T00:00:00");
    let label = format(d, "MMM d");
    if (dueTime) label += ` at ${dueTime}`;
    if (repeatInterval && repeatUnit) {
      label += ` · ${getRepeatLabel(repeatInterval, repeatUnit)}`;
    }
    return label;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-150 ${
        closing ? "opacity-0" : "animate-in fade-in duration-150"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative bg-card rounded-2xl border border-border shadow-2xl w-[480px] max-w-[95vw] max-h-[90vh] overflow-y-auto transition-all duration-150 ${
          closing ? "scale-95 opacity-0" : "animate-in zoom-in-95 fade-in duration-200"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-base font-semibold text-foreground">
            {isEditMode ? "Edit Task" : "New Task"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-5">
          {/* Title */}
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full text-lg font-medium text-foreground bg-transparent placeholder-muted-foreground/50 focus:outline-none"
            maxLength={200}
          />

          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            rows={2}
            className="w-full text-sm text-foreground bg-transparent placeholder-muted-foreground/50 focus:outline-none resize-none border border-input-border rounded-lg px-3 py-2 mt-3"
            maxLength={2000}
          />

          {/* Action rows — consistent icon + text layout */}
          <div className="mt-4 space-y-0.5">
            {/* Date */}
            <div className="relative">
              <button
                ref={dateButtonRef}
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm transition-colors hover:bg-accent ${
                  dueDate ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <CalendarDays size={16} className="shrink-0 text-muted-foreground" />
                <span>{formatDueLabel()}</span>
              </button>
              <Popover
                open={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                triggerRef={dateButtonRef}
                className="absolute left-0 top-full mt-1 z-20"
              >
                <DatePicker
                  value={dueDate}
                  onChange={(date) => {
                    setDueDate(date);
                    setShowDatePicker(false);
                  }}
                  timeValue={dueTime}
                  onTimeChange={setDueTime}
                  repeatInterval={repeatInterval}
                  repeatUnit={repeatUnit}
                  onRepeatChange={(interval, unit) => {
                    setRepeatInterval(interval);
                    setRepeatUnit(unit);
                  }}
                  repeatEndDate={repeatEndDate}
                  repeatEndCount={repeatEndCount}
                  onRepeatEndChange={(endDate, endCount) => {
                    setRepeatEndDate(endDate);
                    setRepeatEndCount(endCount);
                  }}
                />
              </Popover>
            </div>

            {/* Color — inline swatches using TASK_COLORS */}
            <div className="flex items-center gap-3 px-2 py-2">
              <Palette size={16} className="shrink-0 text-muted-foreground" />
              <div className="flex items-center gap-1.5">
                {TASK_COLORS.map((c) => {
                  const displayColor = isMiffy ? getMiffyColor(c) : c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-5 h-5 rounded-full transition-all ${
                        color.toUpperCase() === c.toUpperCase()
                          ? "ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-gray-900 scale-110"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: displayColor }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Tags */}
            <div className="relative">
              <button
                ref={tagButtonRef}
                type="button"
                onClick={() => setShowTagPicker(!showTagPicker)}
                className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm transition-colors hover:bg-accent ${
                  tags.length > 0 ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <Tag size={16} className="shrink-0 text-muted-foreground" />
                <span>{tags.length > 0 ? tags.join(", ") : "Add tags"}</span>
              </button>
              <Popover
                open={showTagPicker}
                onClose={() => setShowTagPicker(false)}
                triggerRef={tagButtonRef}
                className="absolute left-0 top-full mt-1 z-20"
              >
                <TagPicker
                  selectedTags={tags}
                  onChange={setTags}
                  availableTags={availableTags}
                />
              </Popover>
            </div>

            {/* Send assignment — only shown in create mode */}
            {!isEditMode && (
              <GuestPicker
                selectedEmails={inviteEmails}
                onEmailsChange={setInviteEmails}
              />
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 text-sm font-medium rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 transition-colors"
            >
              {isEditMode ? "Save" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
