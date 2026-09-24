"use client";

import { useState, useRef } from "react";
import { AlignLeft, Plus, CalendarDays, ChevronDown, Tag, UserPlus } from "lucide-react";
import { format } from "date-fns";
import type { TaskInsert } from "@/lib/types";
import { DEFAULT_TASK_COLOR } from "@/lib/constants";
import ColorWheel from "@/components/ui/ColorWheel";
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
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const tagButtonRef = useRef<HTMLButtonElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

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
    setShowColorPicker(false);
    setShowTagPicker(false);
    setShowMoreMenu(false);
    setShowGuestPicker(false);
    setShowDescription(false);
    inputRef.current?.focus();
  }

  function handleBlur(e: React.FocusEvent) {
    // Only unfocus if the new focus target is outside the container
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setFocused(false);
      setShowDatePicker(false);
      setShowColorPicker(false);
      setShowTagPicker(false);
      setShowMoreMenu(false);
      setShowGuestPicker(false);
      setShowDescription(false);
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
    <div className="relative mx-4 mt-1 mb-3" ref={containerRef} onBlur={handleBlur}>
      <form
        onSubmit={handleSubmit}
        className={`flex items-center gap-2 px-4 h-10 rounded-xl transition-all duration-200 border ${
          focused
            ? "border-blue-400 shadow-[0_0_0_1px_color-mix(in_srgb,var(--ring),transparent_70%)] bg-card"
            : "border-transparent bg-muted"
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
                setShowMoreMenu(false);
              }}
              className="p-1.5 text-subtle-foreground hover:text-blue-500 rounded-lg hover:bg-accent transition-colors shrink-0"
            >
              <CalendarDays size={16} />
            </button>

            {/* More options dropdown trigger */}
            <button
              ref={moreButtonRef}
              type="button"
              onClick={() => {
                setShowMoreMenu(!showMoreMenu);
                setShowDatePicker(false);
                setShowColorPicker(false);
                setShowTagPicker(false);
              }}
              className="p-1 text-subtle-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors shrink-0"
              aria-label="More options"
            >
              <ChevronDown size={16} />
            </button>
          </>
        )}

      </form>

      {/* Description textarea (collapsible) */}
      {showDescription && focused && (
        <div className="px-4 pb-2 pt-1">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            className="w-full text-sm bg-muted/50 text-foreground placeholder-muted-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none border border-border min-h-[60px]"
            rows={2}
          />
        </div>
      )}

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
          <ColorWheel
            value={color}
            onChange={(c) => {
              setColor(c);
              setShowColorPicker(false);
              inputRef.current?.focus();
            }}
          />
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

      {/* More options dropdown */}
      <Popover
        open={showMoreMenu}
        onClose={() => setShowMoreMenu(false)}
        triggerRef={moreButtonRef}
        className="absolute right-2 top-full mt-1 z-20"
      >
        <div className="bg-card rounded-xl shadow-2xl border border-border py-1 min-w-[160px]">
          <button
            type="button"
            onClick={() => {
              setShowMoreMenu(false);
              setShowDescription(!showDescription);
            }}
            className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <AlignLeft size={14} />
            {showDescription ? "Hide description" : "Add description"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowMoreMenu(false);
              setShowGuestPicker(!showGuestPicker);
            }}
            className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <UserPlus size={14} />
            {showGuestPicker ? "Hide guests" : "Add guests"}
          </button>
        </div>
      </Popover>
    </div>
  );
}
