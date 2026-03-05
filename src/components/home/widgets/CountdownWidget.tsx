"use client";

/**
 * Countdown widget — big number showing days/hours until a target date.
 * Notion-style: large bold number, small muted label, minimal chrome.
 * Auto-detects next deadline from tasks, or uses a custom date/label.
 *
 * @module CountdownWidget
 */

import { useState, useEffect, useMemo } from "react";
import { Hourglass } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { WidgetShell, WidgetEmptyState } from "./WidgetPrimitives";

interface CountdownWidgetProps {
  config?: Record<string, string>;
}

/**
 * Computes the time remaining from now to a target date.
 *
 * @param targetDate - ISO date string (YYYY-MM-DD)
 * @returns Object with days, hours, minutes, and whether the target has passed
 */
function getTimeRemaining(targetDate: string): {
  days: number;
  hours: number;
  minutes: number;
  passed: boolean;
} {
  const target = new Date(targetDate + "T23:59:59");
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, passed: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes, passed: false };
}

export default function CountdownWidget({ config }: CountdownWidgetProps) {
  const { tasks } = useTaskContext();
  const mode = config?.countdownMode || "auto";
  const customDate = config?.countdownDate || "";
  const customLabel = config?.countdownLabel || "";

  const autoTarget = useMemo(() => {
    const now = new Date().toISOString().split("T")[0];
    const upcoming = tasks
      .filter((t) => t.due_date && t.due_date >= now && !t.is_completed && !t.dismissed_at)
      .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""));
    if (upcoming.length === 0) return null;
    return { date: upcoming[0].due_date!, label: upcoming[0].title };
  }, [tasks]);

  const targetDate = mode === "custom" ? customDate : autoTarget?.date || "";
  const targetLabel = mode === "custom" ? customLabel : autoTarget?.label || "";

  const [remaining, setRemaining] = useState(
    targetDate ? getTimeRemaining(targetDate) : null
  );

  useEffect(() => {
    if (!targetDate) { setRemaining(null); return; }
    setRemaining(getTimeRemaining(targetDate));
    const interval = setInterval(() => setRemaining(getTimeRemaining(targetDate)), 60_000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate || !remaining) {
    return (
      <WidgetEmptyState
        icon={<Hourglass size={24} />}
        message="No upcoming deadlines"
      />
    );
  }

  const accentColor = config?.accentColor || undefined;

  return (
    <WidgetShell centered>
      {remaining.passed ? (
        <>
          <p className="text-2xl font-bold text-foreground">Done!</p>
          <p className="text-[11px] text-muted-foreground mt-1 truncate max-w-full">
            {targetLabel}
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            {[
              { value: remaining.days, label: remaining.days === 1 ? "day" : "days" },
              { value: remaining.hours, label: remaining.hours === 1 ? "hr" : "hrs" },
              { value: remaining.minutes, label: "min" },
            ].map((unit) => (
              <div
                key={unit.label}
                className="flex flex-col items-center rounded-xl bg-muted/50 px-3 py-2"
              >
                <span
                  className={`text-2xl font-light tabular-nums leading-none ${
                    remaining.days < 3
                      ? "text-red-400"
                      : remaining.days < 7
                        ? "text-amber-400"
                        : ""
                  }`}
                  style={remaining.days >= 7 ? { color: accentColor } : undefined}
                >
                  {unit.value}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2.5 truncate max-w-full leading-tight">
            {targetLabel}
          </p>
        </>
      )}
    </WidgetShell>
  );
}
