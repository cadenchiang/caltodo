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
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  value: string | null;
  onChange: (date: string | null) => void;
}

/**
 * Mini calendar date picker popup powered by date-fns.
 * Glassy styling with no outline borders.
 *
 * @param value - Currently selected date as YYYY-MM-DD string, or null
 * @param onChange - Callback with the new date string or null
 */
export default function DatePicker({ value, onChange }: DatePickerProps) {
  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const [currentMonth, setCurrentMonth] = useState(selectedDate ?? new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 w-64">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/40 transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-gray-800">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/40 transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
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
                    : isCurrentMonth
                      ? "text-gray-700 hover:bg-white/50"
                      : "text-gray-300"
              }`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      {/* Clear button */}
      <button
        type="button"
        onClick={() => onChange(null)}
        className="mt-2 w-full text-xs text-gray-400 hover:text-gray-600 py-1.5 rounded-lg hover:bg-white/40 transition-all"
      >
        Clear date
      </button>
    </div>
  );
}
