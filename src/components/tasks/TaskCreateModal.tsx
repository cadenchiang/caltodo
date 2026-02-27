"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronDown, Tag, UserPlus, X } from "lucide-react";
import { format } from "date-fns";
import type { TaskInsert } from "@/lib/types";
import { DEFAULT_TASK_COLOR } from "@/lib/constants";
import { getRepeatLabel } from "@/lib/repeat";
import { useTaskContext } from "@/contexts/TaskContext";
import ColorWheel from "@/components/ui/ColorWheel";
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
 * @param onAdd - Callback with the new task data
 * @param defaultDate - Optional default due_date
 */
interface TaskCreateModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (task: TaskInsert) => void;
  defaultDate?: string | null;
}

/**
 * Portal modal for creating a new task with all fields in one layout:
 * Title, Description, Due Date+Time, Repeat, Color (ColorWheel), Tags, Guests.
 *
 * @param open - Controls modal visibility
 * @param onClose - Close handler
 * @param onAdd - Task creation handler
 * @param defaultDate - Optional pre-filled due date
 */
export default function TaskCreateModal({ open, onClose, onAdd, defaultDate }: TaskCreateModalProps) {
  const { availableTags } = useTaskContext();
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
  const [showGuestPicker, setShowGuestPicker] = useState(false);
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

  // Reset defaultDate when it changes
  useEffect(() => {
    if (open) setDueDate(defaultDate ?? null);
  }, [defaultDate, open]);

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
    setShowGuestPicker(false);
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
   * Validates and submits the task, then closes the modal.
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

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
          <h2 className="text-base font-semibold text-foreground">New Task</h2>
          <button
            onClick={handleClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
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
            className="w-full text-sm text-foreground bg-transparent placeholder-muted-foreground/50 focus:outline-none resize-none border border-input-border rounded-lg px-3 py-2"
            maxLength={2000}
          />

          {/* Due Date + Time */}
          <div className="relative">
            <button
              ref={dateButtonRef}
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                dueDate
                  ? "border-blue-200 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                  : "border-input-border text-muted-foreground hover:bg-accent"
              }`}
            >
              <CalendarDays size={14} />
              {formatDueLabel()}
              <ChevronDown size={12} className="ml-auto" />
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

          {/* Color */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Color</label>
            <ColorWheel value={color} onChange={setColor} />
          </div>

          {/* Tags */}
          <div className="relative">
            <button
              ref={tagButtonRef}
              type="button"
              onClick={() => setShowTagPicker(!showTagPicker)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-input-border text-sm text-muted-foreground hover:bg-accent transition-colors"
            >
              <Tag size={14} />
              {tags.length > 0 ? tags.join(", ") : "Add tags"}
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

          {/* Guests */}
          <div>
            <button
              type="button"
              onClick={() => setShowGuestPicker(!showGuestPicker)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-input-border text-sm text-muted-foreground hover:bg-accent transition-colors"
            >
              <UserPlus size={14} />
              {inviteEmails.length > 0 ? `${inviteEmails.length} guest(s)` : "Invite guests"}
            </button>
            {showGuestPicker && (
              <div className="mt-2">
                <GuestPicker
                  selectedEmails={inviteEmails}
                  onEmailsChange={setInviteEmails}
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 text-sm font-medium rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 transition-colors"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
