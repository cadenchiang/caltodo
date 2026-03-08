"use client";

/**
 * Stats / KPI widget — big bold number with trend indicator.
 * Notion-style: large metric, small label, subtle change indicator.
 * Shows task completion stats derived from TaskContext.
 *
 * @module StatsWidget
 */

import { useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { WidgetShell } from "./WidgetPrimitives";

interface StatsWidgetProps {
  config?: Record<string, string>;
}

/**
 * Checks if a date string falls within this week (Mon-Sun).
 *
 * @param dateStr - ISO date string
 * @returns true if the date is in the current week
 */
function isThisWeek(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return date >= monday && date <= sunday;
}

/**
 * Checks if a date string falls within last week (Mon-Sun).
 *
 * @param dateStr - ISO date string
 * @returns true if the date is in last week
 */
function isLastWeek(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  thisMonday.setHours(0, 0, 0, 0);
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);
  const lastSunday = new Date(thisMonday);
  lastSunday.setDate(thisMonday.getDate() - 1);
  lastSunday.setHours(23, 59, 59, 999);
  return date >= lastMonday && date <= lastSunday;
}

export default function StatsWidget({ config }: StatsWidgetProps) {
  const { tasks } = useTaskContext();
  const metric = config?.statsMetric || "completion";
  const accentColor = config?.accentColor || "#007AFF";

  const stats = useMemo(() => {
    const active = tasks.filter((t) => !t.dismissed_at);

    switch (metric) {
      case "completed-week": {
        const thisWeekCount = active.filter(
          (t) => t.is_completed && t.completed_at && isThisWeek(t.completed_at)
        ).length;
        const lastWeekCount = active.filter(
          (t) => t.is_completed && t.completed_at && isLastWeek(t.completed_at)
        ).length;
        const change = lastWeekCount > 0
          ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
          : thisWeekCount > 0 ? 100 : 0;
        return { value: thisWeekCount.toString(), label: "Completed this week", change, suffix: "" };
      }
      case "streak": {
        let streak = 0;
        const date = new Date();
        while (true) {
          const dayStr = date.toISOString().split("T")[0];
          const hasCompletion = active.some(
            (t) => t.is_completed && t.completed_at?.startsWith(dayStr)
          );
          if (hasCompletion) {
            streak++;
            date.setDate(date.getDate() - 1);
          } else {
            break;
          }
        }
        return { value: streak.toString(), label: "Day streak", change: 0, suffix: "" };
      }
      case "pending": {
        const pending = active.filter((t) => !t.is_completed).length;
        return { value: pending.toString(), label: "Tasks remaining", change: 0, suffix: "" };
      }
      default: {
        const total = active.length;
        const completed = active.filter((t) => t.is_completed).length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { value: pct.toString(), label: "Overall completion", change: 0, suffix: "%" };
      }
    }
  }, [tasks, metric]);

  /** Icon badge based on metric type. */
  const badgeIcon = metric === "streak" ? "🔥" : metric === "pending" ? "📋" : "✓";

  return (
    <WidgetShell centered>
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs mb-2"
        style={{ backgroundColor: accentColor }}
      >
        {badgeIcon}
      </div>

      <div className="flex items-baseline gap-0.5">
        <span
          className="text-5xl font-extralight tabular-nums leading-none"
          style={{ color: accentColor }}
        >
          {stats.value}
        </span>
        {stats.suffix && (
          <span className="text-2xl font-extralight" style={{ color: accentColor }}>
            {stats.suffix}
          </span>
        )}
      </div>

      {stats.change !== 0 && (
        <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
          stats.change > 0
            ? "bg-emerald-500/10 text-emerald-500"
            : "bg-red-400/10 text-red-400"
        }`}>
          {stats.change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span className="tabular-nums">
            {stats.change > 0 ? "+" : ""}{stats.change}%
          </span>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-1.5">{stats.label}</p>
    </WidgetShell>
  );
}
