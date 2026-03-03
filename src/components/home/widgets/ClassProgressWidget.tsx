"use client";

/**
 * Widget showing per-course task completion progress bars.
 * Groups active tasks by course_name, sorted by most tasks first.
 * Tasks without a course are grouped as "Manual".
 *
 * @module ClassProgressWidget
 */

import { useMemo } from "react";
import { GraduationCap } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useCompactMode } from "@/hooks/useCompactMode";

/** A single course's progress data. */
interface CourseProgress {
  name: string;
  completed: number;
  total: number;
}

interface ClassProgressWidgetProps {
  config?: Record<string, string>;
}

export default function ClassProgressWidget({ config }: ClassProgressWidgetProps) {
  const { tasks } = useTaskContext();
  const sortMode = config?.progressSort || "count";
  const { containerRef, compact } = useCompactMode(160);

  const courses = useMemo(() => {
    const activeTasks = tasks.filter((t) => !t.dismissed_at && !t.snoozed_until);
    const map = new Map<string, { completed: number; total: number }>();

    for (const t of activeTasks) {
      const name = t.course_name || "Manual";
      const entry = map.get(name) || { completed: 0, total: 0 };
      entry.total++;
      if (t.is_completed) entry.completed++;
      map.set(name, entry);
    }

    const result: CourseProgress[] = [];
    for (const [name, { completed, total }] of map) {
      result.push({ name, completed, total });
    }

    switch (sortMode) {
      case "alpha":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "completion":
        result.sort((a, b) => {
          const pctA = a.total > 0 ? a.completed / a.total : 0;
          const pctB = b.total > 0 ? b.completed / b.total : 0;
          return pctB - pctA || a.name.localeCompare(b.name);
        });
        break;
      default: // "count"
        result.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
    }
    return result;
  }, [tasks, sortMode]);

  if (courses.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
        <GraduationCap size={24} className="text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No courses synced yet</p>
      </div>
    );
  }

  const totalTasks = courses.reduce((sum, c) => sum + c.total, 0);
  const totalCompleted = courses.reduce((sum, c) => sum + c.completed, 0);
  const overallPct = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

  return (
    <div ref={containerRef} className="h-full w-full flex flex-col p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Class Progress</h3>
        {compact && (
          <span className="text-xs text-muted-foreground">{courses.length} courses</span>
        )}
      </div>

      {compact ? (
        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${overallPct}%`,
              backgroundColor: config?.accentColor || '#3b82f6',
            }}
          />
        </div>
      ) : (
        <ul className="flex-1 space-y-0.5 overflow-y-auto">
          {courses.map((c) => {
            const pct = c.total > 0 ? (c.completed / c.total) * 100 : 0;
            return (
              <li key={c.name} className="py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground truncate mr-2">
                    {c.name}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {c.completed}/{c.total}
                  </span>
                </div>
                <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: config?.accentColor || '#3b82f6',
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
