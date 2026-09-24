"use client";

import { useState } from "react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useToast } from "@/contexts/ToastContext";
import DatePicker, { TimePicker } from "../DatePicker";
import RepeatPicker from "../RepeatPicker";
import ColorWheel from "@/components/ui/ColorWheel";
import ColorSwatchGrid from "../shared/ColorSwatchGrid";
import PortalPopover from "./PortalPopover";
import SearchListPicker from "./SearchListPicker";
import type { PickerKey, TaskFormRowsProps } from "./TaskFormRows";
import type { TaskFormState } from "./useTaskForm";

export interface TaskFormPickersProps {
  form: TaskFormState;
  set: <K extends keyof TaskFormState>(key: K, value: TaskFormState[K]) => void;
  openPicker: PickerKey;
  onClose: () => void;
  /** Opens the custom recurrence dialog. */
  onCustomRepeat: () => void;
  refs: TaskFormRowsProps["refs"];
}

/**
 * The task editor's pickers, one portaled Popover each: colour swatches
 * (with a wheel for a custom colour), class, date, time, repeat and tags.
 * Every popover closes on Escape and outside click and returns focus to the
 * row that opened it.
 */
export default function TaskFormPickers({ form, set, openPicker, onClose, onCustomRepeat, refs }: TaskFormPickersProps) {
  const { availableTags, availableCourses, courseColors, deleteTag, deleteCourse } = useTaskContext();
  const { showToast } = useToast();
  const [showWheel, setShowWheel] = useState(false);

  /** Selects a class and adopts its colour. */
  function selectCourse(name: string | null) {
    set("courseName", name);
    if (name) {
      const classColor = courseColors.get(name);
      if (classColor) set("color", classColor);
    }
    onClose();
  }

  /** Adds a tag (case-insensitive duplicate check). */
  function addTag(tag: string | null) {
    const trimmed = tag?.trim() ?? "";
    if (trimmed && !form.tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) set("tags", [...form.tags, trimmed]);
    onClose();
  }

  /** Removes a tag from every task, and from this form. */
  async function handleDeleteTag(tag: string) {
    set("tags", form.tags.filter((t) => t.toLowerCase() !== tag.toLowerCase()));
    const count = await deleteTag(tag);
    showToast(count > 0 ? `Removed "${tag}" from ${count} ${count === 1 ? "task" : "tasks"}` : `Removed "${tag}"`);
  }

  /** Clears a class from every task, and from this form. */
  async function handleDeleteCourse(name: string) {
    if (form.courseName === name) set("courseName", null);
    const count = await deleteCourse(name);
    showToast(count > 0 ? `Removed "${name}" from ${count} ${count === 1 ? "task" : "tasks"}` : `Removed "${name}"`);
  }

  const selectedLower = form.tags.map((t) => t.toLowerCase());
  const unselectedTags = availableTags.filter((t) => !selectedLower.includes(t.toLowerCase()));

  return (
    <>
      <PortalPopover open={openPicker === "color"} onClose={() => { setShowWheel(false); onClose(); }} anchorRef={refs.color} triggerRef={refs.color} aria-label="Task color" className="p-3">
        {showWheel ? (
          <ColorWheel value={form.color} onChange={(c) => set("color", c)} />
        ) : (
          <div className="space-y-2">
            <ColorSwatchGrid value={form.color} swatchClassName="w-7 h-7" onSelect={(c) => { set("color", c); onClose(); }} />
            <button type="button" onClick={() => setShowWheel(true)} className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <img src="/color-wheel.svg" alt="" className="w-5 h-5 rounded-full" draggable={false} />
              Custom color
            </button>
          </div>
        )}
      </PortalPopover>

      <PortalPopover open={openPicker === "course"} onClose={onClose} anchorRef={refs.course} triggerRef={refs.course} aria-label="Class">
        <SearchListPicker
          label="Class"
          options={availableCourses}
          selected={form.courseName}
          placeholder="Search or add class..."
          emptyText="No classes yet. Type to create one."
          deleteHint="Remove this class from all tasks"
          noneLabel="None"
          onSelect={selectCourse}
          onDelete={handleDeleteCourse}
        />
      </PortalPopover>

      <PortalPopover open={openPicker === "date"} onClose={onClose} anchorRef={refs.date} triggerRef={refs.date} aria-label="Due date" autoFocus={false}>
        <DatePicker value={form.dueDate} onChange={(date) => set("dueDate", date)} onPick={onClose} />
      </PortalPopover>

      <PortalPopover open={openPicker === "time"} onClose={onClose} anchorRef={refs.time} triggerRef={refs.time} aria-label="Due time" className="p-3">
        <TimePicker value={form.dueTime} onChange={(t) => set("dueTime", t)} />
      </PortalPopover>

      <PortalPopover open={openPicker === "repeat"} onClose={onClose} anchorRef={refs.repeat} triggerRef={refs.repeat} aria-label="Repeat">
        <RepeatPicker
          interval={form.repeatInterval}
          unit={form.repeatUnit}
          dueDate={form.dueDate}
          onChange={(interval, unit) => { set("repeatInterval", interval); set("repeatUnit", unit); onClose(); }}
          onCustom={() => { onClose(); onCustomRepeat(); }}
        />
      </PortalPopover>

      <PortalPopover open={openPicker === "tags"} onClose={onClose} anchorRef={refs.tags} triggerRef={refs.tags} aria-label="Tags">
        <SearchListPicker
          label="Tags"
          options={unselectedTags}
          placeholder="Search or add tag..."
          emptyText="No tags yet. Type to create one."
          deleteHint="Remove this tag everywhere"
          onSelect={addTag}
          onDelete={handleDeleteTag}
        />
      </PortalPopover>
    </>
  );
}
