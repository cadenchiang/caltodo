/**
 * Mini calendar widget showing the current month grid.
 * Highlights today's date. Compact layout for dashboard use.
 *
 * @param config - Widget config (unused currently)
 */

"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from "date-fns";

interface MiniCalendarWidgetProps {
  config?: Record<string, string>;
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function MiniCalendarWidget({ config }: MiniCalendarWidgetProps) {
  const [now, setNow] = useState(new Date());
  const accentColor = config?.accentColor || "#4285F4";

  // Update at midnight to stay current
  useEffect(() => {
    const msUntilMidnight = () => {
      const n = new Date();
      const midnight = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1);
      return midnight.getTime() - n.getTime();
    };
    const timer = setTimeout(() => setNow(new Date()), msUntilMidnight());
    return () => clearTimeout(timer);
  }, [now]);

  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <div className="h-full w-full flex flex-col p-2.5 overflow-hidden">
      {/* Month/year header */}
      <div className="text-center mb-1.5">
        <span className="text-xs font-semibold text-foreground">
          {format(now, "MMMM yyyy")}
        </span>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-0">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-center">
            <span className="text-xs font-medium text-foreground/60">{d}</span>
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0 flex-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, now);
          const today = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className="flex items-center justify-center"
            >
              <div
                className={`w-5 h-5 flex items-center justify-center rounded-full text-xs tabular-nums leading-none ${
                  today
                    ? "text-white font-semibold"
                    : inMonth
                      ? "text-foreground"
                      : "text-foreground/30"
                }`}
                style={today ? { backgroundColor: accentColor } : undefined}
              >
                {format(day, "d")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
