"use client";

/**
 * Weekly Heatmap widget — visual representation of task completion activity.
 * GitHub-style contribution grid showing the last 12 weeks of activity.
 * Color intensity based on number of tasks completed each day.
 *
 * @module WeeklyHeatmapWidget
 */

import { useMemo } from "react";
import { useTaskContext } from "@/contexts/TaskContext";
import { WidgetHeader } from "./WidgetPrimitives";

interface WeeklyHeatmapWidgetProps {
  config?: Record<string, string>;
}

/** Month abbreviations for the top axis labels. */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Weekday row labels. Rows run Mon→Sun (see grid build), so M/W/F sit on
 *  rows 0/2/4 — the grid starts on a Monday. */
const DAY_LABELS = ["M", "", "W", "", "F", "", ""];

/**
 * Local calendar-day key (YYYY-MM-DD) from a Date, using the browser's local
 * timezone. Both the grid and the completion counts key off this so a task
 * completed at, say, 11pm local lands on the correct local day instead of
 * being shoved onto the UTC day (the old toISOString bug).
 */
function localDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Returns the intensity level (0-4) for a given completion count.
 *
 * @param count - Number of tasks completed on a given day
 * @returns Intensity level from 0 (none) to 4 (high)
 */
function getIntensity(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

export default function WeeklyHeatmapWidget({ config }: WeeklyHeatmapWidgetProps) {
  const { tasks } = useTaskContext();
  const accentColor = config?.accentColor || "#22c55e";
  const weeks = 12;

  // Build completion count map keyed by LOCAL day.
  const completionMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tasks) {
      if (t.is_completed && t.completed_at && !t.dismissed_at) {
        const key = localDayKey(new Date(t.completed_at));
        map.set(key, (map.get(key) || 0) + 1);
      }
    }
    return map;
  }, [tasks]);

  // Generate the 12-week grid of local dates plus month labels keyed by column.
  const { grid, monthByCol, totalCompleted } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize so time-of-day never shifts a cell

    // Monday of the earliest visible week (weeks-1 weeks before this week's Monday).
    const start = new Date(today);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - (weeks - 1) * 7);

    const g: { date: string; count: number }[][] = [];
    const monthCol = new Map<number, string>();
    let lastMonth = -1;
    let total = 0;

    for (let w = 0; w < weeks; w++) {
      const week: { date: string; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * 7 + d);
        if (date > today) {
          week.push({ date: "", count: 0 });
          continue;
        }
        const key = localDayKey(date);
        const count = completionMap.get(key) || 0;
        week.push({ date: key, count });
        total += count;
        // Label the column where a new month first appears.
        if (date.getMonth() !== lastMonth) {
          lastMonth = date.getMonth();
          if (!monthCol.has(w)) monthCol.set(w, MONTHS[lastMonth]);
        }
      }
      g.push(week);
    }

    return { grid: g, monthByCol: monthCol, totalCompleted: total };
  }, [completionMap, weeks]);

  /**
   * Returns the background color for a cell based on intensity level.
   * Uses the accent color with varying opacity levels.
   *
   * @param intensity - Level 0-4
   * @returns CSS color string
   */
  function getCellStyle(intensity: number): string {
    if (intensity === 0) return "var(--muted)";
    const opacities = [0.2, 0.4, 0.7, 1];
    return `color-mix(in srgb, ${accentColor} ${opacities[intensity - 1] * 100}%, transparent)`;
  }

  return (
    <div className="h-full w-full flex flex-col p-3 overflow-hidden">
      <WidgetHeader
        title="Activity"
        right={
          <span className="text-xs text-foreground tabular-nums">
            {totalCompleted} task{totalCompleted === 1 ? "" : "s"} completed
          </span>
        }
      />

      {/* Month labels — share the exact column grid as the heatmap so they
          always line up with the week columns beneath them. */}
      <div className="flex mb-1">
        <div className="w-4 mr-1 shrink-0" aria-hidden />
        <div className="flex-1 flex gap-0.5">
          {grid.map((_, wi) => (
            <div
              key={wi}
              className="flex-1 min-w-0 text-xs text-foreground leading-none whitespace-nowrap"
              style={{ overflow: "visible" }}
            >
              {monthByCol.get(wi) ?? ""}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap: fixed-width day-label column + 12 equal week columns. Rows
          use flex-1 in both columns so weekday labels align with cell rows. */}
      <div className="flex-1 flex min-h-0">
        <div className="flex flex-col gap-0.5 shrink-0 mr-1 w-4">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="flex-1 flex items-center justify-end">
              <span className="text-xs text-foreground leading-none">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 flex gap-0.5">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5 flex-1 min-w-0">
              {week.map((cell, di) => (
                <div
                  key={di}
                  className="w-full flex-1 rounded-[2px] transition-colors"
                  style={{
                    backgroundColor: cell.date
                      ? getCellStyle(getIntensity(cell.count))
                      : "transparent",
                  }}
                  title={cell.date ? `${cell.date}: ${cell.count} task${cell.count === 1 ? "" : "s"}` : undefined}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-2">
        <span className="text-xs text-foreground mr-1">Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className="w-[10px] h-[10px] rounded-[2px]"
            style={{ backgroundColor: getCellStyle(level) }}
          />
        ))}
        <span className="text-xs text-foreground ml-1">More</span>
      </div>
    </div>
  );
}
