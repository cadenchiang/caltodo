"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, CalendarDays, ChevronDown, Tag, UserPlus } from "lucide-react";
import { format } from "date-fns";
import type { TaskInsert } from "@/lib/types";
import { TASK_COLORS, DEFAULT_TASK_COLOR } from "@/lib/constants";
import { getRepeatLabel } from "@/lib/repeat";
import { useTaskContext } from "@/contexts/TaskContext";
import DatePicker from "./DatePicker";
import TagPicker from "./TagPicker";
import GuestPicker from "./GuestPicker";
import Popover from "@/components/ui/Popover";

type RepeatUnit = "day" | "week" | "month";

interface BoardTaskAddFormProps {
  onAdd: (task: TaskInsert) => void;
  onCancel: () => void;
  /** Column course name — auto-sets course_name and tag when not "General". */
  courseName?: string;
}

/**
 * Card-style inline task add form for the board view.
 * Renders as a rounded card with blue border, matching the board card style.
 * Includes date/time picker, color picker, tags, and repeat settings.
 *
 * @param onAdd - Callback with the new task data
 * @param onCancel - Callback when form is dismissed (blur outside)
 */
export default function BoardTaskAddForm({ onAdd, onCancel, courseName }: BoardTaskAddFormProps) {
  const { availableTags } = useTaskContext();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [dueTime, setDueTime] = useState<string | null>(null);
  const [color, setColor] = useState<string>(DEFAULT_TASK_COLOR);
  const [tags, setTags] = useState<string[]>([]);
  const [repeatInterval, setRepeatInterval] = useState<number | null>(null);
  const [repeatUnit, setRepeatUnit] = useState<RepeatUnit | null>(null);
  const [repeatEndDate, setRepeatEndDate] = useState<string | null>(null);
  const [repeatEndCount, setRepeatEndCount] = useState<number | null>(null);
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const tagButtonRef = useRef<HTMLButtonElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /** Returns today's date as YYYY-MM-DD string. */
  function getTodayStr(): string {
    return format(new Date(), "yyyy-MM-dd");
  }

  /** Returns tomorrow's date as YYYY-MM-DD string. */
  function getTomorrowStr(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return format(d, "yyyy-MM-dd");
  }

  /** Submits the task if title is non-empty, then resets form state. */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    // Auto-include the column's course name as a tag if not already present
    const effectiveTags = [...tags];
    if (courseName && courseName !== "General" && !effectiveTags.includes(courseName)) {
      effectiveTags.push(courseName);
    }

    onAdd({
      title: trimmed,
      due_date: dueDate,
      due_time: dueTime,
      color,
      course_name: courseName && courseName !== "General" ? courseName : undefined,
      tags: effectiveTags.length > 0 ? effectiveTags : undefined,
      repeat_interval: repeatInterval,
      repeat_unit: repeatUnit,
      repeat_end_date: repeatEndDate,
      repeat_end_count: repeatEndCount,
      inviteEmails: inviteEmails.length > 0 ? inviteEmails : undefined,
    });
  }

  /** Cancels form when focus leaves the container entirely. */
  function handleBlur(e: React.FocusEvent) {
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      onCancel();
    }
  }

  /**
   * Formats a 24-hour time string "HH:MM" to 12-hour format "h:mm AM/PM".
   *
   * @param time24 - Time in "HH:MM" format
   * @returns Formatted 12-hour time string
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
   * When Daily is selected and date is null or tomorrow, auto-sets to today.
   *
   * @param interval - Repeat interval or null to clear
   * @param unit - Repeat unit or null to clear
   */
  function handleRepeatChange(interval: number | null, unit: RepeatUnit | null) {
    setRepeatInterval(interval);
    setRepeatUnit(unit);

    if (!interval || !unit) {
      setRepeatEndDate(null);
      setRepeatEndCount(null);
    }

    if (interval === 1 && unit === "day") {
      if (!dueDate || dueDate === getTomorrowStr()) {
        setDueDate(getTodayStr());
      }
    }
  }

  /**
   * Builds a unified badge label combining date, time, and repeat info.
   * E.g. "Feb 20 3:00 PM · Daily" or "Today · Weekly"
   *
   * @returns Combined badge label or null if no date/repeat set
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
    <div ref={containerRef} onBlur={handleBlur} className="relative">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border-2 border-blue-400 bg-card px-3.5 py-2.5 flex items-center gap-2 shadow-sm"
      >
        <Plus size={16} className="shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel();
          }}
          placeholder="Add task"
          className="flex-1 text-sm bg-transparent text-foreground placeholder-muted-foreground focus:outline-none min-w-0"
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
            tags.length > 0 ? "text-blue-500" : "text-muted-foreground hover:text-blue-500"
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

        {/* Calendar icon — opens unified date+time+repeat picker */}
        <button
          ref={dateButtonRef}
          type="button"
          onClick={() => {
            setShowDatePicker(!showDatePicker);
            setShowColorPicker(false);
            setShowTagPicker(false);
          }}
          className="p-1.5 text-muted-foreground hover:text-blue-500 rounded-lg hover:bg-accent transition-colors shrink-0"
          aria-label="Pick date"
        >
          <CalendarDays size={16} />
        </button>

        {/* More options dropdown */}
        <button
          ref={moreButtonRef}
          type="button"
          onClick={() => {
            setShowMoreMenu(!showMoreMenu);
            setShowDatePicker(false);
            setShowColorPicker(false);
            setShowTagPicker(false);
          }}
          className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors shrink-0"
          aria-label="More options"
        >
          <ChevronDown size={16} />
        </button>
      </form>

      {/* Guest email chips below the form */}
      {inviteEmails.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5 px-1">
          {inviteEmails.map((email) => (
            <span
              key={email}
              className="inline-flex items-center gap-1 text-[11px] font-medium pl-2 pr-1 py-0.5 rounded-full border border-border bg-muted/50 text-foreground"
            >
              <span className="truncate max-w-[120px]">{email}</span>
              <button
                type="button"
                onClick={() => setInviteEmails((prev) => prev.filter((e) => e !== email))}
                className="text-muted-foreground hover:text-red-500 transition-colors p-0.5"
              >
                <span className="sr-only">Remove {email}</span>
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Unified date+time+repeat picker popup */}
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

      {/* More options dropdown */}
      <Popover
        open={showMoreMenu}
        onClose={() => setShowMoreMenu(false)}
        triggerRef={moreButtonRef}
        className="absolute right-0 top-full mt-1 z-20"
      >
        <div className="bg-card rounded-xl shadow-2xl border border-border py-1 min-w-[160px]">
          <button
            type="button"
            onClick={() => {
              setShowMoreMenu(false);
              setShowGuestPicker(!showGuestPicker);
            }}
            className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <UserPlus size={14} />
            Add guests
            {inviteEmails.length > 0 && (
              <span className="ml-auto text-[10px] font-medium text-blue-500">{inviteEmails.length}</span>
            )}
          </button>
        </div>
      </Popover>

      {/* Guest picker popup */}
      <Popover
        open={showGuestPicker}
        onClose={() => setShowGuestPicker(false)}
        triggerRef={moreButtonRef}
        className="absolute right-0 top-full mt-1 z-20"
      >
        <div className="bg-card rounded-xl shadow-2xl border border-border p-3 w-64">
          <GuestPicker
            selectedEmails={inviteEmails}
            onEmailsChange={setInviteEmails}
          />
        </div>
      </Popover>
    </div>
  );
}
