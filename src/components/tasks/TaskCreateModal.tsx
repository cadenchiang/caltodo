"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays, Palette, Tag, X, AlignLeft, Trash2, Plus,
} from "lucide-react";
import { format } from "date-fns";
import type { Task, TaskInsert, TaskUpdate } from "@/lib/types";
import { TASK_COLORS, DEFAULT_TASK_COLOR, getMiffyColor } from "@/lib/constants";
import { getRepeatLabel } from "@/lib/repeat";
import { useTaskContext } from "@/contexts/TaskContext";
import { useTheme } from "@/contexts/ThemeContext";
import DatePicker from "./DatePicker";
import ColorWheel from "@/components/ui/ColorWheel";

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
 * @param onDelete - Callback for deleting the task (edit mode)
 */
interface TaskCreateModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (task: TaskInsert) => void;
  defaultDate?: string | null;
  editTask?: Task | null;
  onSave?: (id: string, updates: TaskUpdate) => void;
  onDelete?: (id: string) => void;
  /** Optional: called when user chooses to apply a color change to all tasks in a class. */
  onSaveColorForClass?: (courseName: string, color: string) => void;
}

/**
 * Portal modal for creating or editing a task.
 * Google Calendar style layout with icon+label rows, generous spacing,
 * and consistent typography. Portal-renders pickers to avoid overflow clipping.
 *
 * @param props - See TaskCreateModalProps
 */
export default function TaskCreateModal({
  open, onClose, onAdd, defaultDate, editTask, onSave, onDelete, onSaveColorForClass,
}: TaskCreateModalProps) {
  const { availableTags } = useTaskContext();
  const { colorTheme } = useTheme();
  const isMiffy = colorTheme === "miffy";
  const isEditMode = !!editTask;

  const [title, setTitle] = useState("");
  const [showColorConfirm, setShowColorConfirm] = useState(false);
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(defaultDate ?? null);
  const [dueTime, setDueTime] = useState<string | null>(null);
  const [color, setColor] = useState<string>(DEFAULT_TASK_COLOR);
  const [tags, setTags] = useState<string[]>([]);
  const [repeatInterval, setRepeatInterval] = useState<number | null>(null);
  const [repeatUnit, setRepeatUnit] = useState<RepeatUnit | null>(null);
  const [repeatEndDate, setRepeatEndDate] = useState<string | null>(null);
  const [repeatEndCount, setRepeatEndCount] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [closing, setClosing] = useState(false);
  const [datePickerPos, setDatePickerPos] = useState({ top: 0, left: 0 });

  // Inline tag dropdown state
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [tagDropdownPos, setTagDropdownPos] = useState({ top: 0, left: 0 });

  // Color wheel popover state
  const [showColorWheel, setShowColorWheel] = useState(false);
  const [colorWheelPos, setColorWheelPos] = useState({ top: 0, left: 0 });

  const titleRef = useRef<HTMLInputElement>(null);
  const dateRowRef = useRef<HTMLButtonElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const tagAddRef = useRef<HTMLButtonElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const tagSearchRef = useRef<HTMLInputElement>(null);
  const colorWheelBtnRef = useRef<HTMLButtonElement>(null);
  const colorWheelRef = useRef<HTMLDivElement>(null);

  // Auto-focus title when modal opens
  useEffect(() => {
    if (open) setTimeout(() => titleRef.current?.focus(), 100);
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
    setShowDatePicker(false);
    setShowTagDropdown(false);
    setShowColorWheel(false);
    setShowColorConfirm(false);
    setTagSearch("");
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
   * Builds the current edit updates object.
   */
  function buildUpdates(): TaskUpdate {
    return {
      title: title.trim(),
      description: description.trim(),
      due_date: dueDate,
      due_time: dueTime,
      color,
      tags,
      repeat_interval: repeatInterval,
      repeat_unit: repeatUnit,
      repeat_end_date: repeatEndDate,
      repeat_end_count: repeatEndCount,
    };
  }

  /**
   * Validates and submits the task (create or edit), then closes.
   * In edit mode, if color changed and task has a course_name, shows
   * a confirmation dialog asking whether to apply to all class tasks.
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    if (isEditMode && editTask && onSave) {
      // Check if color changed and task belongs to a class
      const colorChanged = color.toUpperCase() !== editTask.color.toUpperCase();
      if (colorChanged && editTask.course_name && onSaveColorForClass) {
        setShowColorConfirm(true);
        return;
      }
      onSave(editTask.id, buildUpdates());
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
      });
    }

    handleClose();
  }

  /**
   * Saves only this task's color (from confirmation dialog).
   */
  function handleColorConfirmJustThis() {
    if (editTask && onSave) {
      onSave(editTask.id, buildUpdates());
    }
    setShowColorConfirm(false);
    handleClose();
  }

  /**
   * Saves this task and applies color to all tasks in the same class.
   */
  function handleColorConfirmAll() {
    if (editTask && onSave && onSaveColorForClass && editTask.course_name) {
      onSave(editTask.id, buildUpdates());
      onSaveColorForClass(editTask.course_name, color);
    }
    setShowColorConfirm(false);
    handleClose();
  }

  /**
   * Handles delete button click in edit mode.
   */
  function handleDelete() {
    if (editTask && onDelete) {
      onDelete(editTask.id);
      handleClose();
    }
  }

  /**
   * Computes fixed-position coordinates for a portal dropdown relative to a trigger.
   * Flips above the trigger if it would overflow the viewport bottom.
   *
   * @param el - The trigger element
   * @param dropdownHeight - Estimated dropdown height in px
   * @returns Position with top and left
   */
  const computePortalPos = useCallback(
    (el: HTMLElement | null, dropdownHeight: number) => {
      if (!el) return { top: 0, left: 0 };
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const top = spaceBelow < dropdownHeight
        ? rect.top - dropdownHeight - 4
        : rect.bottom + 4;
      return { top, left: rect.left };
    },
    []
  );

  /**
   * Toggles the date picker portal and computes its position.
   */
  function toggleDatePicker() {
    if (showDatePicker) {
      setShowDatePicker(false);
      return;
    }
    setShowTagDropdown(false);
    setDatePickerPos(computePortalPos(dateRowRef.current, 420));
    setShowDatePicker(true);
  }

  /**
   * Opens the inline tag dropdown, portaled to body.
   */
  function openTagDropdown() {
    if (showTagDropdown) {
      setShowTagDropdown(false);
      return;
    }
    setShowDatePicker(false);
    setTagDropdownPos(computePortalPos(tagAddRef.current, 220));
    setShowTagDropdown(true);
    setTagSearch("");
    setTimeout(() => tagSearchRef.current?.focus(), 50);
  }

  // -- Inline tag helpers --
  const selectedLower = tags.map((t) => t.toLowerCase());
  const unselectedTags = availableTags.filter(
    (t) => !selectedLower.includes(t.toLowerCase())
  );
  const filteredTagSuggestions = tagSearch.trim()
    ? unselectedTags.filter((t) =>
        t.toLowerCase().includes(tagSearch.toLowerCase())
      )
    : unselectedTags;

  /**
   * Adds a tag (case-insensitive duplicate check).
   *
   * @param tag - Tag string to add
   */
  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (!trimmed || selectedLower.includes(trimmed.toLowerCase())) return;
    setTags([...tags, trimmed]);
    setTagSearch("");
  }

  /**
   * Removes a tag from the selection.
   *
   * @param tag - Tag to remove
   */
  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  // Click-outside handler for portaled pickers
  useEffect(() => {
    if (!showDatePicker && !showTagDropdown && !showColorWheel) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        showDatePicker &&
        datePickerRef.current && !datePickerRef.current.contains(target) &&
        dateRowRef.current && !dateRowRef.current.contains(target)
      ) {
        setShowDatePicker(false);
      }
      if (
        showTagDropdown &&
        tagDropdownRef.current && !tagDropdownRef.current.contains(target) &&
        tagAddRef.current && !tagAddRef.current.contains(target)
      ) {
        setShowTagDropdown(false);
      }
      if (
        showColorWheel &&
        colorWheelRef.current && !colorWheelRef.current.contains(target) &&
        colorWheelBtnRef.current && !colorWheelBtnRef.current.contains(target)
      ) {
        setShowColorWheel(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDatePicker, showTagDropdown, showColorWheel]);

  if (!open) return null;

  /**
   * Formats the due date for the date row label.
   *
   * @returns Formatted string like "Mar 3 at 11:00" or "Set date"
   */
  function formatDueLabel(): string {
    if (!dueDate) return "Set date";
    const d = new Date(dueDate + "T00:00:00");
    let label = format(d, "EEEE, MMMM d");
    if (dueTime) label += `  ${dueTime}`;
    return label;
  }

  /**
   * Formats the repeat sub-label for the date row.
   *
   * @returns Repeat description or "Does not repeat"
   */
  function formatRepeatSub(): string {
    if (repeatInterval && repeatUnit) {
      return getRepeatLabel(repeatInterval, repeatUnit);
    }
    return "Does not repeat";
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity duration-150 ${
        closing ? "opacity-0" : "animate-in fade-in duration-150"
      }`}
      onMouseDown={(e) => {
        // Only close when clicking the backdrop itself, not portaled children
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={`relative bg-card rounded-2xl border border-border shadow-2xl w-[540px] max-w-[95vw] max-h-[90vh] overflow-y-auto transition-all duration-150 ${
          closing
            ? "scale-95 opacity-0"
            : "animate-in zoom-in-95 fade-in duration-200"
        }`}
        onMouseDown={(e) => {
          const target = e.target as Node;
          if (showTagDropdown && tagAddRef.current && !tagAddRef.current.contains(target)) {
            setShowTagDropdown(false);
          }
          if (showDatePicker && dateRowRef.current && !dateRowRef.current.contains(target)) {
            setShowDatePicker(false);
          }
          if (showColorWheel && colorWheelBtnRef.current && !colorWheelBtnRef.current.contains(target)) {
            setShowColorWheel(false);
          }
          e.stopPropagation();
        }}
      >
        {/* Close button — top right */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors duration-150 cursor-pointer z-10"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <form onSubmit={handleSubmit} className="pt-8 pb-4">
          {/* ── Title — aligned with row text (past icon+gap) ── */}
          <div className="pl-[60px] pr-6 pb-2">
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add title"
              className="w-full text-[22px] text-foreground bg-transparent placeholder-muted-foreground/60 focus:outline-none border-b-2 border-transparent focus:border-blue-500 transition-colors duration-200 pb-2 pr-8"
              maxLength={200}
            />
          </div>

          {/* ── Rows ── */}
          <div className="px-2">
            {/* Date row */}
            <button
              ref={dateRowRef}
              type="button"
              onClick={toggleDatePicker}
              className="w-full flex items-start gap-4 px-4 py-4 rounded-xl text-left transition-colors duration-150 hover:bg-accent/60 active:scale-[0.99] cursor-pointer"
            >
              <CalendarDays
                size={20}
                className="shrink-0 mt-0.5 text-muted-foreground"
              />
              <div className="min-w-0">
                <span
                  className={`text-sm leading-snug ${
                    dueDate ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {formatDueLabel()}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatRepeatSub()}
                </p>
              </div>
            </button>

            {/* Color row */}
            <div className="flex items-center gap-4 px-4 py-4">
              <Palette
                size={20}
                className="shrink-0 text-muted-foreground"
              />
              <div className="flex items-center gap-2 flex-wrap">
                {TASK_COLORS.map((c) => {
                  const displayColor = isMiffy ? getMiffyColor(c) : c;
                  const isSelected =
                    color.toUpperCase() === c.toUpperCase();
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900 scale-110"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: displayColor }}
                      aria-label={`Color ${c}`}
                    />
                  );
                })}
                {/* Rainbow color wheel button */}
                <button
                  ref={colorWheelBtnRef}
                  type="button"
                  onClick={() => {
                    if (showColorWheel) {
                      setShowColorWheel(false);
                      return;
                    }
                    setShowDatePicker(false);
                    setShowTagDropdown(false);
                    setColorWheelPos(
                      computePortalPos(colorWheelBtnRef.current, 300)
                    );
                    setShowColorWheel(true);
                  }}
                  className="w-6 h-6 rounded-full transition-all duration-150 cursor-pointer hover:scale-110 border border-border/50"
                  style={{
                    background:
                      "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                  }}
                  aria-label="Custom color"
                />
              </div>
            </div>

            {/* Tags row */}
            <div className="flex items-start gap-4 px-4 py-4">
              <Tag
                size={20}
                className="shrink-0 mt-0.5 text-muted-foreground"
              />
              <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 max-w-[240px]"
                  >
                    <span className="truncate">{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                      aria-label={`Remove ${tag}`}
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <button
                  ref={tagAddRef}
                  type="button"
                  onClick={openTagDropdown}
                  className={`inline-flex items-center gap-1 text-sm transition-colors duration-150 cursor-pointer ${
                    tags.length > 0
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {tags.length === 0 && "Add tags"}
                  {tags.length > 0 && (
                    <>
                      <Plus size={12} />
                      <span className="text-xs">Tag</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Description row */}
            <div className="flex items-start gap-4 px-4 py-4">
              <AlignLeft
                size={20}
                className="shrink-0 mt-0.5 text-muted-foreground"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description"
                rows={2}
                className="flex-1 text-sm text-foreground bg-transparent placeholder-muted-foreground/60 focus:outline-none resize-none leading-relaxed"
                maxLength={2000}
              />
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between px-6 pt-5 mt-3 border-t border-border">
            <div>
              {isEditMode && onDelete && editTask && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors duration-150 active:scale-[0.97] cursor-pointer"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors duration-150 active:scale-[0.97] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-6 py-2 text-sm font-medium rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.97] cursor-pointer"
              >
                {isEditMode ? "Save" : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Portaled DatePicker ── */}
      {showDatePicker &&
        createPortal(
          <div
            ref={datePickerRef}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: datePickerPos.top,
              left: datePickerPos.left,
              zIndex: 10000,
            }}
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
          </div>,
          document.body
        )}

      {/* ── Portaled Tag Dropdown ── */}
      {showTagDropdown &&
        createPortal(
          <div
            ref={tagDropdownRef}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: tagDropdownPos.top,
              left: tagDropdownPos.left,
              zIndex: 10000,
            }}
          >
            <div className="w-52 bg-popover rounded-xl shadow-2xl border border-border py-1.5 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
              {/* Search input */}
              <div className="px-2.5 pb-1.5">
                <input
                  ref={tagSearchRef}
                  type="text"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (tagSearch.trim()) {
                        addTag(tagSearch);
                        setShowTagDropdown(false);
                      }
                    }
                    if (e.key === "Escape") setShowTagDropdown(false);
                  }}
                  placeholder="Search or add tag..."
                  className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Suggestions */}
              {filteredTagSuggestions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    addTag(tag);
                    setShowTagDropdown(false);
                  }}
                  className="w-full text-left px-4 py-1.5 text-sm text-foreground hover:bg-accent transition-colors truncate"
                >
                  {tag}
                </button>
              ))}

              {/* Add custom tag */}
              {tagSearch.trim() &&
                !availableTags.some(
                  (t) =>
                    t.toLowerCase() === tagSearch.trim().toLowerCase()
                ) && (
                  <button
                    type="button"
                    onClick={() => {
                      addTag(tagSearch);
                      setShowTagDropdown(false);
                    }}
                    className="w-full text-left px-4 py-1.5 text-sm text-blue-500 hover:bg-accent transition-colors"
                  >
                    Add &ldquo;{tagSearch.trim()}&rdquo;
                  </button>
                )}

              {/* Empty state */}
              {filteredTagSuggestions.length === 0 && !tagSearch.trim() && (
                <p className="px-4 py-2 text-sm text-muted-foreground">
                  No tags yet. Type to create one.
                </p>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* ── Portaled Color Wheel ── */}
      {showColorWheel &&
        createPortal(
          <div
            ref={colorWheelRef}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: colorWheelPos.top,
              left: colorWheelPos.left,
              zIndex: 10000,
            }}
          >
            <div className="bg-popover rounded-xl shadow-2xl border border-border p-3 animate-in fade-in zoom-in-95 duration-100">
              <ColorWheel
                value={color}
                onChange={(c) => setColor(c)}
              />
            </div>
          </div>,
          document.body
        )}

      {/* ── Color change confirmation dialog ── */}
      {showColorConfirm && editTask?.course_name &&
        createPortal(
          <div
            className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/40"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setShowColorConfirm(false);
            }}
          >
            <div
              className="bg-popover rounded-2xl border border-border shadow-2xl w-[340px] max-w-[90vw] p-5 animate-in zoom-in-95 fade-in duration-150"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <p className="text-sm font-semibold text-foreground mb-1">Apply color change?</p>
              <p className="text-sm text-muted-foreground mb-5">
                Apply to all <span className="font-medium text-foreground">{editTask.course_name}</span> tasks or just this one?
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleColorConfirmAll}
                  className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  All {editTask.course_name} tasks
                </button>
                <button
                  type="button"
                  onClick={handleColorConfirmJustThis}
                  className="w-full px-4 py-2.5 text-sm font-medium rounded-xl text-foreground hover:bg-accent border border-border transition-colors cursor-pointer"
                >
                  Just this task
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>,
    document.body
  );
}
