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

  // Build completion count map from tasks
  const completionMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tasks) {
      if (t.is_completed && t.completed_at && !t.dismissed_at) {
        const day = t.completed_at.split("T")[0];
        map.set(day, (map.get(day) || 0) + 1);
      }
    }
    return map;
  }, [tasks]);

  // Generate grid of dates
  const { grid, monthLabels, totalCompleted, bestDay } = useMemo(() => {
    const today = new Date();
    const g: { date: string; count: number }[][] = [];

    const start = new Date(today);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - (weeks - 1) * 7);

    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    let total = 0;
    let best = 0;

    for (let w = 0; w < weeks; w++) {
      const week: { date: string; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * 7 + d);
        if (date > today) {
          week.push({ date: "", count: 0 });
        } else {
          const key = date.toISOString().split("T")[0];
          const count = completionMap.get(key) || 0;
          week.push({ date: key, count });
          total += count;
          if (count > best) best = count;
          if (date.getMonth() !== lastMonth) {
            lastMonth = date.getMonth();
            labels.push({ label: MONTHS[lastMonth], col: w });
          }
        }
      }
      g.push(week);
    }

    return { grid: g, monthLabels: labels, totalCompleted: total, bestDay: best };
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
          <span className="text-xs text-muted-foreground tabular-nums">
            {totalCompleted} tasks completed
          </span>
        }
      />

      {/* Month labels */}
      <div className="flex gap-0.5 ml-4 mb-1">
        {monthLabels.map((m, i) => (
          <span
            key={i}
            className="text-[10px] text-muted-foreground"
            style={{
              marginLeft: i === 0 ? `${m.col * 14}px` : undefined,
              width: i < monthLabels.length - 1
                ? `${(monthLabels[i + 1].col - m.col) * 14}px`
                : undefined,
            }}
          >
            {m.label}
          </span>
        ))}
      </div>

      {/* Heatmap */}
      <div className="flex-1 flex gap-0.5 overflow-hidden">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 shrink-0 mr-1">
          {["", "M", "", "W", "", "F", ""].map((label, i) => (
            <div key={i} className="h-[11px] flex items-center justify-end">
              <span className="text-[10px] text-muted-foreground leading-none">{label}</span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 flex gap-0.5 overflow-x-auto">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5 flex-1 min-w-0">
              {week.map((cell, di) => (
                <div
                  key={di}
                  className="w-full aspect-square rounded-[2px] transition-colors"
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
        <span className="text-[10px] text-muted-foreground mr-1">Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className="w-[10px] h-[10px] rounded-[2px]"
            style={{ backgroundColor: getCellStyle(level) }}
          />
        ))}
        <span className="text-[10px] text-muted-foreground ml-1">More</span>
      </div>
    </div>
  );
}
