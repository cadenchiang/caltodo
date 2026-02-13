"use client";

import { format } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

/**
 * Calendar header with month/year display and navigation controls.
 * Glassy button styling with no outline borders.
 */
export default function CalendarHeader({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <CalendarDays size={22} />
        {format(currentMonth, "MMMM yyyy")}
      </h1>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onToday}
          className="px-4 py-2 text-sm font-medium text-gray-800 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 transition-all"
        >
          Today
        </button>
        <button
          onClick={onPrevMonth}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white/40 transition-all"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={onNextMonth}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white/40 transition-all"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
