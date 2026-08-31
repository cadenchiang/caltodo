"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
  startOfDay,
  addMonths,
  subMonths,
} from "date-fns";
import { useWeekStart } from "@/hooks/useWeekStart";
import { ChevronLeft, ChevronRight, Clock, Repeat, Flag } from "lucide-react";
import { getRepeatLabel } from "@/lib/repeat";
import { getDatePresets } from "@/lib/date-presets";
import TimePicker from "./TimePicker";

// Re-exported so existing importers keep working after the picker moved into
// its own file.
export { default as TimePicker } from "./TimePicker";

type RepeatUnit = "day" | "week" | "month";
type ExpandedSection = "time" | "repeat" | "ends" | null;

interface DatePickerProps {
  value: string | null;
  timeValue?: string | null;
  onChange: (date: string | null) => void;
  onTimeChange?: (time: string | null) => void;
  /** Current repeat interval (null = no repeat). */
  repeatInterval?: number | null;
  /** Current repeat unit. */
  repeatUnit?: RepeatUnit | null;
  /** Callback when repeat changes. If provided, the repeat section is shown. */
  onRepeatChange?: (interval: number | null, unit: RepeatUnit | null) => void;
  /** End date for repeat (YYYY-MM-DD) or null for no end date. */
  repeatEndDate?: string | null;
  /** End count for repeat (total occurrences) or null for no count limit. */
  repeatEndCount?: number | null;
  /** Callback when repeat end condition changes. */
  onRepeatEndChange?: (endDate: string | null, endCount: number | null) => void;
}

/** Preset repeat options displayed as quick-select buttons. */
const REPEAT_PRESETS: Array<{ label: string; interval: number; unit: RepeatUnit }> = [
  { label: "Daily", interval: 1, unit: "day" },
  { label: "Weekly", interval: 1, unit: "week" },
  { label: "Biweekly", interval: 2, unit: "week" },
  { label: "Monthly", interval: 1, unit: "month" },
];

/**
 * Unified date picker with structured MM/DD/YYYY input, calendar grid,
 * optional time input, and optional integrated repeat section.
 *
 * @param value - Currently selected date as YYYY-MM-DD string, or null
 * @param timeValue - Currently selected time as HH:MM string, or null
 * @param onChange - Callback with the new date string or null
 * @param onTimeChange - Callback with the new time string or null
 * @param repeatInterval - Current repeat interval or null
 * @param repeatUnit - Current repeat unit or null
 * @param onRepeatChange - Callback with new repeat interval and unit
 * @param repeatEndDate - End date for repeat or null
 * @param repeatEndCount - End count for repeat or null
 * @param onRepeatEndChange - Callback with new end date and end count
 */
export default function DatePicker({
  value,
  timeValue,
  onChange,
  onTimeChange,
  repeatInterval,
  repeatUnit,
  onRepeatChange,
  repeatEndDate,
  repeatEndCount,
  onRepeatEndChange,
}: DatePickerProps) {
  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const [currentMonth, setCurrentMonth] = useState(selectedDate ?? new Date());
  const [showCustomRepeat, setShowCustomRepeat] = useState(false);
  const [customInterval, setCustomInterval] = useState(repeatInterval ?? 1);
  const [customUnit, setCustomUnit] = useState<RepeatUnit>(repeatUnit ?? "day");
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);

  // Derive end mode from props
  const endMode = repeatEndDate ? "date" : repeatEndCount ? "count" : "never";
  const [localEndCount, setLocalEndCount] = useState(repeatEndCount ?? 5);

  const weekStart = useWeekStart();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: weekStart });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: weekStart });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  // Two-letter labels rotated to match the user's week start. Previously this
  // grid always began on Sunday while the main calendar always began on
  // Monday, so the two disagreed regardless of preference.
  const weekDays =
    weekStart === 1
      ? ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
      : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const today = startOfDay(new Date());

  // Resolved once per render so "Today" cannot go stale across midnight while
  // the picker sits open.
  const presets = getDatePresets();

  /**
   * Checks if a repeat preset matches the current configuration.
   */
  function isRepeatPresetActive(p: { interval: number; unit: RepeatUnit }): boolean {
    return repeatInterval === p.interval && repeatUnit === p.unit;
  }

  /**
   * Toggles a collapsible section open/closed.
   * Accordion behavior: only one section open at a time.
   */
  function toggleSection(section: ExpandedSection) {
    setExpandedSection((prev) => (prev === section ? null : section));
  }

  /**
   * Returns the display label for the current time value.
   * Formats 24h time string to 12h format (e.g. "11:30 PM").
   */
  function getTimeLabel(): string {
    if (!timeValue) return "";
    const [h, m] = timeValue.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  }

  /**
   * Returns the display label for the current ends configuration.
   */
  function getEndsLabel(): string {
    if (repeatEndDate) return `On ${repeatEndDate}`;
    if (repeatEndCount) return `After ${repeatEndCount}`;
    return "Never";
  }

  return (
    <div className="bg-card rounded-2xl shadow-2xl border border-border p-3 w-64">
      {/* Month navigation header */}
      <div className="flex items-center justify-between mb-1">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 text-subtle-foreground hover:text-secondary-foreground rounded-lg hover:bg-accent transition-all"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs font-semibold text-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 text-subtle-foreground hover:text-secondary-foreground rounded-lg hover:bg-accent transition-all"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-0.5">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-[10px] text-subtle-foreground py-0.5 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          const isPast = isCurrentMonth && isBefore(day, today) && !isToday;
          const dateStr = format(day, "yyyy-MM-dd");

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onChange(dateStr)}
              className={`w-8 h-8 text-xs rounded-full flex items-center justify-center mx-auto transition-all ${
                isSelected
                  ? "bg-blue-500 text-white shadow-sm"
                  : isToday
                    ? "bg-blue-500/10 text-blue-600 font-medium"
                    : isPast
                      ? "text-subtle-foreground hover:bg-accent"
                      : isCurrentMonth
                        ? "text-secondary-foreground hover:bg-accent"
                        : "text-subtle-foreground/30"
              }`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      {/* Collapsible sections */}
      {(onTimeChange || onRepeatChange) && (
        <div className="mt-2 pt-2 border-t border-border space-y-0.5">
          {/* Time row */}
          {onTimeChange && (
            <div>
              <button
                type="button"
                onClick={() => toggleSection("time")}
                className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-lg transition-all"
              >
                <Clock size={14} className="text-subtle-foreground shrink-0" />
                <span className="text-xs font-medium text-secondary-foreground">Time</span>
                <span className="ml-auto text-xs text-subtle-foreground">{getTimeLabel()}</span>
                <ChevronRight
                  size={12}
                  className={`text-subtle-foreground shrink-0 transition-transform duration-200 ${
                    expandedSection === "time" ? "rotate-90" : ""
                  }`}
                />
              </button>
              {expandedSection === "time" && (
                <div className="px-2 pb-2 pt-1">
                  <TimePicker
                    value={timeValue ?? null}
                    onChange={(t) => onTimeChange(t)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Repeat row */}
          {onRepeatChange && (
            <div>
              <button
                type="button"
                onClick={() => toggleSection("repeat")}
                className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-lg transition-all"
              >
                <Repeat size={14} className="text-subtle-foreground shrink-0" />
                <span className="text-xs font-medium text-secondary-foreground">Repeat</span>
                <span className="ml-auto text-xs text-subtle-foreground">
                  {repeatInterval && repeatUnit ? getRepeatLabel(repeatInterval, repeatUnit) : ""}
                </span>
                <ChevronRight
                  size={12}
                  className={`text-subtle-foreground shrink-0 transition-transform duration-200 ${
                    expandedSection === "repeat" ? "rotate-90" : ""
                  }`}
                />
              </button>
              {expandedSection === "repeat" && (
                <div className="px-2 pb-1.5 pt-1">
                  {repeatInterval && repeatUnit && (
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-blue-500">
                        {getRepeatLabel(repeatInterval, repeatUnit)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onRepeatChange(null, null);
                          setShowCustomRepeat(false);
                        }}
                        className="text-xs text-subtle-foreground hover:text-secondary-foreground transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  {/* Preset buttons */}
                  <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                    {REPEAT_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          onRepeatChange(p.interval, p.unit);
                          setShowCustomRepeat(false);
                        }}
                        className={`text-xs font-medium py-2 px-2 rounded-lg transition-all ${
                          isRepeatPresetActive(p)
                            ? "bg-blue-500 text-white"
                            : "bg-accent text-secondary-foreground hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom repeat toggle */}
                  {!showCustomRepeat ? (
                    <button
                      type="button"
                      onClick={() => setShowCustomRepeat(true)}
                      className="w-full text-xs text-secondary-foreground hover:text-foreground py-1 rounded-lg hover:bg-accent transition-all"
                    >
                      Custom...
                    </button>
                  ) : (
                    <div className="border-t border-border pt-2 mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-secondary-foreground shrink-0">Every</span>
                        <input
                          type="number"
                          min={1}
                          max={365}
                          value={customInterval}
                          onChange={(e) => setCustomInterval(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-14 px-2 py-1 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <select
                          value={customUnit}
                          onChange={(e) => setCustomUnit(e.target.value as RepeatUnit)}
                          className="flex-1 px-2 py-1 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="day">{customInterval === 1 ? "day" : "days"}</option>
                          <option value="week">{customInterval === 1 ? "week" : "weeks"}</option>
                          <option value="month">{customInterval === 1 ? "month" : "months"}</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRepeatChange(customInterval, customUnit)}
                        className="w-full mt-2 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 py-1.5 rounded-lg transition-colors"
                      >
                        Set
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Ends row — only shown when a repeat is active and onRepeatEndChange is provided */}
          {repeatInterval && repeatUnit && onRepeatEndChange && (
            <div>
              <button
                type="button"
                onClick={() => toggleSection("ends")}
                className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-lg transition-all"
              >
                <Flag size={14} className="text-subtle-foreground shrink-0" />
                <span className="text-xs font-medium text-secondary-foreground">Ends</span>
                <span className="ml-auto text-xs text-subtle-foreground">{getEndsLabel()}</span>
                <ChevronRight
                  size={12}
                  className={`text-subtle-foreground shrink-0 transition-transform duration-200 ${
                    expandedSection === "ends" ? "rotate-90" : ""
                  }`}
                />
              </button>
              {expandedSection === "ends" && (
                <div className="px-2 pb-1.5 pt-1">
                  <div className="flex flex-col gap-1.5">
                    {/* Never */}
                    <button
                      type="button"
                      onClick={() => onRepeatEndChange(null, null)}
                      className={`text-xs py-1.5 px-2 rounded-lg text-left transition-all ${
                        endMode === "never"
                          ? "bg-blue-500 text-white"
                          : "bg-accent text-secondary-foreground hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      }`}
                    >
                      Never
                    </button>

                    {/* After X occurrences */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onRepeatEndChange(null, localEndCount)}
                        className={`text-xs py-1.5 px-2 rounded-lg transition-all shrink-0 ${
                          endMode === "count"
                            ? "bg-blue-500 text-white"
                            : "bg-accent text-secondary-foreground hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        }`}
                      >
                        After
                      </button>
                      <input
                        type="number"
                        min={2}
                        max={999}
                        value={endMode === "count" ? (repeatEndCount ?? localEndCount) : localEndCount}
                        onChange={(e) => {
                          const val = Math.max(2, parseInt(e.target.value) || 2);
                          setLocalEndCount(val);
                          if (endMode === "count") {
                            onRepeatEndChange(null, val);
                          }
                        }}
                        className="w-14 px-2 py-1 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <span className="text-xs text-secondary-foreground">times</span>
                    </div>

                    {/* On date */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const defaultEnd = format(addMonths(new Date(), 1), "yyyy-MM-dd");
                          onRepeatEndChange(repeatEndDate ?? defaultEnd, null);
                        }}
                        className={`text-xs py-1.5 px-2 rounded-lg transition-all shrink-0 ${
                          endMode === "date"
                            ? "bg-blue-500 text-white"
                            : "bg-accent text-secondary-foreground hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        }`}
                      >
                        On
                      </button>
                      <input
                        type="date"
                        value={repeatEndDate ?? ""}
                        onChange={(e) => {
                          if (e.target.value) {
                            onRepeatEndChange(e.target.value, null);
                          }
                        }}
                        className="flex-1 px-2 py-1 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick presets — the common picks, without hunting the grid. */}
      <div className="mt-2 pt-2 border-t border-border grid grid-cols-2 gap-1.5">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onChange(p.date)}
            className={`text-xs font-medium py-1.5 px-2 rounded-lg transition-all truncate ${
              value === p.date
                ? "bg-blue-500 text-white"
                : "bg-accent text-secondary-foreground hover:bg-blue-50 dark:hover:bg-blue-900/30"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Clear date button */}
      <button
        type="button"
        onClick={() => { onChange(null); onTimeChange?.(null); }}
        className="mt-1.5 w-full text-xs text-subtle-foreground hover:text-secondary-foreground py-1 rounded-lg hover:bg-accent transition-all"
      >
        Clear date
      </button>
    </div>
  );
}
