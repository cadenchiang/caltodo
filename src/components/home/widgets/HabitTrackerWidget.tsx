"use client";

/**
 * Habit Tracker widget — GitHub-style contribution heatmap.
 * Shows last 12 weeks of daily check-ins with color intensity.
 * Streak counter and completion rate. Data stored in widget config.
 *
 * @module HabitTrackerWidget
 */

import { useState, useMemo, useCallback } from "react";
import { Flame } from "lucide-react";
import { WidgetHeader } from "./WidgetPrimitives";

interface HabitTrackerWidgetProps {
  config?: Record<string, string>;
  onUpdateConfig?: (config: Record<string, string>) => void;
}

/** Day labels for the heatmap grid (Mon, Wed, Fri shown). */
const DAY_LABELS = ["", "M", "", "W", "", "F", ""];

/**
 * Parses the checked dates set from config JSON.
 *
 * @param config - Widget config record
 * @returns Set of checked date strings (YYYY-MM-DD)
 */
function parseCheckedDates(config?: Record<string, string>): Set<string> {
  if (!config?.checkedDates) return new Set();
  try {
    return new Set(JSON.parse(config.checkedDates));
  } catch {
    return new Set();
  }
}

/**
 * Generates the last N weeks of dates for the heatmap grid.
 *
 * @param weeks - Number of weeks to generate
 * @returns 2D array of date strings [week][day], column-major for CSS grid
 */
function generateGrid(weeks: number): string[][] {
  const today = new Date();
  const grid: string[][] = [];

  // Start from (weeks) weeks ago, aligned to Monday
  const start = new Date(today);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - (weeks - 1) * 7);

  for (let w = 0; w < weeks; w++) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      if (date > today) {
        week.push("");
      } else {
        week.push(date.toISOString().split("T")[0]);
      }
    }
    grid.push(week);
  }
  return grid;
}

/**
 * Calculates the current streak of consecutive checked days ending today.
 *
 * @param checkedDates - Set of checked date strings
 * @returns Number of consecutive days including today (0 if today not checked)
 */
function calculateStreak(checkedDates: Set<string>): number {
  const today = new Date();
  let streak = 0;
  const date = new Date(today);

  while (true) {
    const key = date.toISOString().split("T")[0];
    if (checkedDates.has(key)) {
      streak++;
      date.setDate(date.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export default function HabitTrackerWidget({ config, onUpdateConfig }: HabitTrackerWidgetProps) {
  const checkedDates = useMemo(() => parseCheckedDates(config), [config]);
  const habitName = config?.habitName || "Daily habit";
  const accentColor = config?.accentColor || "#22c55e";
  const weeks = 12;
  const grid = useMemo(() => generateGrid(weeks), []);
  const streak = useMemo(() => calculateStreak(checkedDates), [checkedDates]);

  // Count total checked in visible grid
  const totalChecked = useMemo(() => {
    let count = 0;
    for (const week of grid) {
      for (const day of week) {
        if (day && checkedDates.has(day)) count++;
      }
    }
    return count;
  }, [grid, checkedDates]);

  const totalDays = useMemo(() => {
    let count = 0;
    for (const week of grid) {
      for (const day of week) {
        if (day) count++;
      }
    }
    return count;
  }, [grid]);

  /**
   * Toggles a date's checked state and persists to config.
   *
   * @param dateStr - Date string to toggle (YYYY-MM-DD)
   */
  const toggleDate = useCallback(
    (dateStr: string) => {
      if (!dateStr) return;
      const next = new Set(checkedDates);
      if (next.has(dateStr)) {
        next.delete(dateStr);
      } else {
        next.add(dateStr);
      }
      onUpdateConfig?.({
        ...config,
        checkedDates: JSON.stringify([...next]),
      });
    },
    [checkedDates, config, onUpdateConfig]
  );

  /**
   * Returns the opacity level for a cell based on whether it's checked.
   *
   * @param dateStr - Date string for the cell
   * @returns CSS opacity value string
   */
  function getCellColor(dateStr: string): string {
    if (!dateStr) return "transparent";
    if (checkedDates.has(dateStr)) return accentColor;
    return "var(--muted)";
  }

  return (
    <div className="h-full w-full flex flex-col p-4 overflow-hidden">
      <WidgetHeader
        title={habitName}
        right={
          streak > 0 ? (
            <div className="flex items-center gap-0.5">
              <Flame size={12} className="text-orange-500" />
              <span className="text-xs font-bold text-foreground tabular-nums">{streak}</span>
            </div>
          ) : undefined
        }
      />

      {/* Heatmap grid */}
      <div className="flex-1 flex gap-0.5 overflow-hidden">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 shrink-0 mr-1">
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="h-[11px] flex items-center justify-end"
            >
              <span className="text-[10px] text-muted-foreground leading-none">{label}</span>
            </div>
          ))}
        </div>

        {/* Grid columns */}
        <div className="flex-1 flex gap-0.5 overflow-x-auto">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5 flex-1 min-w-0">
              {week.map((day, di) => (
                <button
                  key={di}
                  onClick={() => toggleDate(day)}
                  disabled={!day}
                  className="no-drag w-full aspect-square rounded-[2px] transition-colors hover:opacity-80 disabled:cursor-default"
                  style={{ backgroundColor: getCellColor(day) }}
                  title={day || undefined}
                  aria-label={day ? `${day}${checkedDates.has(day) ? " (checked)" : ""}` : undefined}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-foreground/5">
        <span className="text-xs text-muted-foreground">
          {totalChecked}/{totalDays} days
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {totalDays > 0 ? Math.round((totalChecked / totalDays) * 100) : 0}%
        </span>
      </div>
    </div>
  );
}
