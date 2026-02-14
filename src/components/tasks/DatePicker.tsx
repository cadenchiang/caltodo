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
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  value: string | null;
  timeValue?: string | null;
  onChange: (date: string | null) => void;
  onTimeChange?: (time: string | null) => void;
}

/**
 * Mini calendar date picker popup with optional time input, powered by date-fns.
 * Glassy styling with no outline borders.
 *
 * @param value - Currently selected date as YYYY-MM-DD string, or null
 * @param timeValue - Currently selected time as HH:MM string, or null
 * @param onChange - Callback with the new date string or null
 * @param onTimeChange - Callback with the new time string or null
 */
export default function DatePicker({ value, timeValue, onChange, onTimeChange }: DatePickerProps) {
  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const [currentMonth, setCurrentMonth] = useState(selectedDate ?? new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const today = startOfDay(new Date());

  return (
    <div className="bg-card rounded-2xl shadow-2xl border border-border p-3 w-64">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1.5 text-subtle-foreground hover:text-secondary-foreground rounded-lg hover:bg-accent transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1.5 text-subtle-foreground hover:text-secondary-foreground rounded-lg hover:bg-accent transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs text-subtle-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
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
              className={`w-8 h-8 text-xs rounded-full flex items-center justify-center transition-all ${
                isSelected
                  ? "bg-blue-500 text-white shadow-sm"
                  : isToday
                    ? "bg-blue-500/10 text-blue-600 font-medium"
                    : isPast
                      ? "text-subtle-foreground hover:bg-accent"
                      : isCurrentMonth
                        ? "text-secondary-foreground hover:bg-accent"
                        : "text-subtle-foreground/50"
              }`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      {/* Time input */}
      {onTimeChange && (
        <div className="mt-3 pt-3 border-t border-border px-1">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-secondary-foreground">Time</label>
            {timeValue && (
              <button
                type="button"
                onClick={() => onTimeChange(null)}
                className="text-xs text-subtle-foreground hover:text-secondary-foreground transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <input
            type="time"
            value={timeValue ?? ""}
            onChange={(e) => onTimeChange(e.target.value || null)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-blue-400 transition-all"
          />
        </div>
      )}

      {/* Clear button */}
      <button
        type="button"
        onClick={() => { onChange(null); onTimeChange?.(null); }}
        className="mt-2 w-full text-xs text-subtle-foreground hover:text-secondary-foreground py-1.5 rounded-lg hover:bg-accent transition-all"
      >
        Clear date
      </button>
    </div>
  );
}
