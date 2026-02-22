"use client";

import { useState, useRef } from "react";
import { Plus, CalendarDays, Tag } from "lucide-react";
import { format } from "date-fns";
import type { TaskInsert } from "@/lib/types";
import { TASK_COLORS, DEFAULT_TASK_COLOR } from "@/lib/constants";
import { getRepeatLabel } from "@/lib/repeat";
import { useTaskContext } from "@/contexts/TaskContext";
import DatePicker from "./DatePicker";
import TagPicker from "./TagPicker";
import Popover from "@/components/ui/Popover";

type RepeatUnit = "day" | "week" | "month";

interface TaskAddFormProps {
  onAdd: (task: TaskInsert) => void;
  defaultDate?: string | null;
  placeholder?: string;
}

/**
 * Inline input for adding tasks with gradient border on focus.
 * Calendar and color icons are hidden until the input is focused.
 * The date picker includes the repeat section (no separate repeat popover).
 * Type and press Enter to save.
 *
 * @param onAdd - Callback with the new task data
 * @param defaultDate - Optional default due_date for the task
 * @param placeholder - Optional placeholder text
 */
export default function TaskAddForm({ onAdd, defaultDate, placeholder }: TaskAddFormProps) {
  const { availableTags } = useTaskContext();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(defaultDate ?? null);
  const [dueTime, setDueTime] = useState<string | null>(null);
  const [color, setColor] = useState<string>(DEFAULT_TASK_COLOR);
  const [tags, setTags] = useState<string[]>([]);
  const [repeatInterval, setRepeatInterval] = useState<number | null>(null);
  const [repeatUnit, setRepeatUnit] = useState<RepeatUnit | null>(null);
  const [repeatEndDate, setRepeatEndDate] = useState<string | null>(null);
  const [repeatEndCount, setRepeatEndCount] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const tagButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * Returns today's date as YYYY-MM-DD string.
   */
  function getTodayStr(): string {
    return format(new Date(), "yyyy-MM-dd");
  }

  /**
   * Returns tomorrow's date as YYYY-MM-DD string.
   */
  function getTomorrowStr(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return format(d, "yyyy-MM-dd");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    onAdd({
      title: trimmed,
      due_date: dueDate,
      due_time: dueTime,
      color,
      tags: tags.length > 0 ? tags : undefined,
      repeat_interval: repeatInterval,
      repeat_unit: repeatUnit,
      repeat_end_date: repeatEndDate,
      repeat_end_count: repeatEndCount,
    });

    setTitle("");
    setDueDate(defaultDate ?? null);
    setDueTime(null);
    setColor(DEFAULT_TASK_COLOR);
    setTags([]);
    setRepeatInterval(null);
    setRepeatUnit(null);
    setRepeatEndDate(null);
    setRepeatEndCount(null);
    setShowDatePicker(false);
    setShowColorPicker(false);
    setShowTagPicker(false);
    inputRef.current?.focus();
  }

  function handleBlur(e: React.FocusEvent) {
    // Only unfocus if the new focus target is outside the container
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setFocused(false);
      setShowDatePicker(false);
      setShowColorPicker(false);
      setShowTagPicker(false);
    }
  }

  /**
   * Formats a 24-hour time string "HH:MM" to 12-hour format "h:mm AM/PM".
   */
  function formatTime12h(time24: string): string {
    const [hourStr, minute] = time24.split(":");
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minute} ${ampm}`;
  }

  /**
   * Handles repeat changes from the DatePicker.
   * When Daily is selected and date is null or tomorrow, auto-set to today.
   */
  function handleRepeatChange(interval: number | null, unit: RepeatUnit | null) {
    setRepeatInterval(interval);
    setRepeatUnit(unit);

    // Clear end conditions when repeat is cleared
    if (!interval || !unit) {
      setRepeatEndDate(null);
      setRepeatEndCount(null);
    }

    // Daily repeat → auto-set date to today if unset or set to tomorrow
    if (interval === 1 && unit === "day") {
      if (!dueDate || dueDate === getTomorrowStr()) {
        setDueDate(getTodayStr());
      }
    }
  }

  /**
   * Builds a unified badge label combining date and repeat info.
   * E.g. "Feb 20 · Daily" or "Tomorrow · Weekly"
   */
  function getBadgeLabel(): string | null {
    const parts: string[] = [];

    if (dueDate) {
      const todayStr = getTodayStr();
      const tomorrowStr = getTomorrowStr();
      if (dueDate === todayStr) {
        parts.push("Today");
      } else if (dueDate === tomorrowStr) {
        parts.push("Tomorrow");
      } else {
        parts.push(format(new Date(dueDate + "T00:00:00"), "MMM d"));
      }
      if (dueTime) {
        parts[parts.length - 1] += ` ${formatTime12h(dueTime)}`;
      }
    }

    if (repeatInterval && repeatUnit) {
      parts.push(getRepeatLabel(repeatInterval, repeatUnit));
    }

    return parts.length > 0 ? parts.join(" · ") : null;
  }

  const badgeLabel = getBadgeLabel();

  return (
    <div id="tour-add-task" className="relative mx-4 mt-1 mb-3" ref={containerRef} onBlur={handleBlur}>
      <form
        onSubmit={handleSubmit}
        className={`flex items-center gap-2 px-4 h-10 rounded-xl transition-all duration-200 border ${
          focused
            ? "border-blue-400 shadow-[0_0_0_1px_rgba(59,130,246,0.3)] bg-card"
            : "border-transparent bg-muted/60"
        }`}
      >
        <Plus size={16} className={`shrink-0 transition-colors ${focused ? "text-blue-400" : "text-gray-500 dark:text-subtle-foreground"}`} />
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder ?? "Add task. Press Enter to save."}
          className="flex-1 text-sm bg-transparent text-foreground placeholder-gray-500 dark:placeholder-muted-foreground focus:outline-none"
        />

        {/* Unified date+repeat badge */}
        {badgeLabel && (
          <span className="text-xs text-foreground bg-muted px-2 py-0.5 rounded-md shrink-0 border border-border">
            {badgeLabel}
          </span>
        )}

        {/* Tag badges */}
        {tags.length > 0 && (
          <span className="text-[10px] text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded shrink-0">
            {tags.length === 1 ? tags[0] : `${tags.length} tags`}
          </span>
        )}

        {/* Icons only visible when focused */}
        {focused && (
          <>
            {/* Tag icon */}
            <button
              ref={tagButtonRef}
              type="button"
              onClick={() => {
                setShowTagPicker(!showTagPicker);
                setShowDatePicker(false);
                setShowColorPicker(false);
              }}
              className={`p-1.5 rounded-lg hover:bg-accent transition-colors shrink-0 ${
                tags.length > 0 ? "text-blue-500" : "text-subtle-foreground hover:text-blue-500"
              }`}
              aria-label="Add tags"
            >
              <Tag size={14} />
            </button>

            {/* Color indicator dot */}
            <button
              ref={colorButtonRef}
              type="button"
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowDatePicker(false);
                setShowTagPicker(false);
              }}
              className="p-1 shrink-0 rounded-lg hover:bg-accent transition-colors"
              aria-label="Pick color"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
            </button>

            {/* Calendar icon — opens unified date+repeat picker */}
            <button
              ref={dateButtonRef}
              type="button"
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                setShowColorPicker(false);
                setShowTagPicker(false);
              }}
              className="p-1.5 text-subtle-foreground hover:text-blue-500 rounded-lg hover:bg-accent transition-colors shrink-0"
            >
              <CalendarDays size={16} />
            </button>
          </>
        )}
      </form>

      {/* Unified date+repeat picker popup */}
      <Popover
        open={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        triggerRef={dateButtonRef}
        className="absolute right-2 top-full mt-1 z-20"
      >
        <DatePicker
          value={dueDate}
          timeValue={dueTime}
          onChange={(date) => {
            setDueDate(date);
            inputRef.current?.focus();
          }}
          onTimeChange={(time) => {
            setDueTime(time);
          }}
          repeatInterval={repeatInterval}
          repeatUnit={repeatUnit}
          onRepeatChange={handleRepeatChange}
          repeatEndDate={repeatEndDate}
          repeatEndCount={repeatEndCount}
          onRepeatEndChange={(endDate, endCount) => {
            setRepeatEndDate(endDate);
            setRepeatEndCount(endCount);
          }}
        />
      </Popover>

      {/* Color picker popup */}
      <Popover
        open={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        triggerRef={colorButtonRef}
        className="absolute right-12 top-full mt-1 z-20"
      >
        <div className="bg-card rounded-xl shadow-2xl border border-border p-3">
          <div className="flex gap-2">
            {TASK_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setColor(c);
                  setShowColorPicker(false);
                  inputRef.current?.focus();
                }}
                className={`w-6 h-6 rounded-full transition-all ${
                  color === c ? "scale-125" : "hover:scale-110"
                }`}
                style={{
                  backgroundColor: c,
                  boxShadow: color === c ? `0 0 0 2px white, 0 0 0 3.5px ${c}` : "none",
                }}
              />
            ))}
          </div>
        </div>
      </Popover>

      {/* Tag picker popup */}
      <Popover
        open={showTagPicker}
        onClose={() => setShowTagPicker(false)}
        triggerRef={tagButtonRef}
        className="absolute right-2 top-full mt-1 z-20"
      >
        <div className="bg-card rounded-xl shadow-2xl border border-border p-3 w-52">
          <TagPicker
            selectedTags={tags}
            availableTags={availableTags}
            onChange={setTags}
          />
        </div>
      </Popover>
    </div>
  );
}
