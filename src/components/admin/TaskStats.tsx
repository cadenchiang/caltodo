/**
 * Task completion statistics component.
 * Shows overall completion rate and per-source breakdown
 * with progress bars.
 */

"use client";

import { providerLabel } from "@/lib/copy";
import StatCard from "./StatCard";

interface SourceBreakdown {
  source: string;
  count: number;
  completed: number;
}

interface TaskStatsProps {
  /** Total number of tasks across all users */
  total: number;
  /** Number of completed tasks */
  completed: number;
  /** Completion rate percentage (0-100) */
  completionRate: number;
  /** Breakdown by source (manual, canvas, gradescope, etc.) */
  bySource: SourceBreakdown[];
}

/**
 * Formats a source key into a display label.
 *
 * @param source - Source key (e.g. "canvas", "manual", "gradescope")
 * @returns Human-readable label
 */
function formatSource(source: string): string {
  if (source === "manual") return "Manual";
  return providerLabel(source).charAt(0).toUpperCase() + providerLabel(source).slice(1);
}

/**
 * Renders task completion stat cards and a per-source breakdown table.
 *
 * @param props - TaskStatsProps with total, completed, rate, and source breakdown
 * @returns Grid of stats + breakdown list
 */
export default function TaskStats({
  total,
  completed,
  completionRate,
  bySource,
}: TaskStatsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total tasks" value={total.toLocaleString()} />
        <StatCard label="Completed" value={completed.toLocaleString()} />
        <StatCard
          label="Completion rate"
          value={`${completionRate}%`}
          subtext={`${completed} of ${total}`}
        />
      </div>

      {bySource.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Tasks by source
          </h3>
          <div className="space-y-3">
            {bySource.map((src) => {
              const rate =
                src.count > 0
                  ? Math.round((src.completed / src.count) * 100)
                  : 0;
              return (
                <div key={src.source}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground font-medium">
                      {formatSource(src.source)}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {src.completed}/{src.count} ({rate}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
