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
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <CalendarDays size={22} />
        {format(currentMonth, "MMMM yyyy")}
      </h1>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onToday}
          className="px-4 py-2 text-sm font-medium text-foreground rounded-xl bg-transparent border border-input-border hover:bg-accent transition-all"
        >
          Today
        </button>
        <button
          onClick={onPrevMonth}
          className="p-2 text-subtle-foreground hover:text-secondary-foreground rounded-xl hover:bg-accent transition-all"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={onNextMonth}
          className="p-2 text-subtle-foreground hover:text-secondary-foreground rounded-xl hover:bg-accent transition-all"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
