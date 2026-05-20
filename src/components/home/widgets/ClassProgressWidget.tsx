"use client";

/**
 * Class Progress widget — Notion-style course cards with color-coded progress.
 * Each course shows a colored dot, name, completion ring, and task count.
 * Clicking a course opens a modal with all assignments for that course.
 *
 * @module ClassProgressWidget
 */

import { useMemo, useState, useCallback } from "react";
import { GraduationCap, X, Check } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useCompactMode } from "@/hooks/useCompactMode";
import { WidgetShell, WidgetHeader, WidgetEmptyState } from "./WidgetPrimitives";
import type { Task } from "@/lib/types";

/** A single course's progress data. */
interface CourseProgress {
  name: string;
  completed: number;
  total: number;
  color: string;
  tasks: Task[];
}

interface ClassProgressWidgetProps {
  config?: Record<string, string>;
}

/** Default palette for courses without a dominant color. */
const COURSE_COLORS = [
  "#0e89d6", "#8b5cf6", "#ec4899", "#f97316", "#22c55e",
  "#06b6d4", "#eab308", "#ef4444", "#6366f1", "#14b8a6",
];

/**
 * SVG ring progress indicator.
 *
 * @param pct - Completion percentage (0-100)
 * @param color - Stroke color
 * @param size - Ring diameter in pixels
 */
function ProgressRing({ pct, color, size = 32 }: { pct: number; color: string; size?: number }) {
  const r = (size - 4) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        className="text-muted/50"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-500 ease-out"
      />
    </svg>
  );
}

export default function ClassProgressWidget({ config }: ClassProgressWidgetProps) {
  const { tasks, courseColors } = useTaskContext();
  const sortMode = config?.progressSort || "count";
  const { containerRef, compact } = useCompactMode(160);
  const [selectedCourse, setSelectedCourse] = useState<CourseProgress | null>(null);

  const courses = useMemo(() => {
    const activeTasks = tasks.filter((t) => !t.dismissed_at && !t.snoozed_until);
    const map = new Map<string, { completed: number; total: number; tasks: Task[] }>();

    for (const t of activeTasks) {
      const name = t.course_name || "Manual";
      const entry = map.get(name) || { completed: 0, total: 0, tasks: [] };
      entry.total++;
      entry.tasks.push(t);
      if (t.is_completed) entry.completed++;
      map.set(name, entry);
    }

    const result: CourseProgress[] = [];
    let colorIndex = 0;
    for (const [name, { completed, total, tasks: courseTasks }] of map) {
      const color = courseColors.get(name) || COURSE_COLORS[colorIndex % COURSE_COLORS.length];
      result.push({ name, completed, total, color, tasks: courseTasks });
      colorIndex++;
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
      default:
        result.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
    }
    return result;
  }, [tasks, sortMode, courseColors]);

  const openCourse = useCallback((course: CourseProgress) => {
    setSelectedCourse(course);
  }, []);

  if (courses.length === 0) {
    return (
      <WidgetEmptyState
        icon={<GraduationCap size={24} />}
        message="No courses synced yet"
      />
    );
  }

  const totalTasks = courses.reduce((sum, c) => sum + c.total, 0);
  const totalCompleted = courses.reduce((sum, c) => sum + c.completed, 0);
  const overallPct = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <>
      <div ref={containerRef} className="h-full w-full flex flex-col p-3 overflow-hidden">
        <WidgetHeader
          title="Courses"
          right={
            <span className="text-xs text-foreground tabular-nums">
              {overallPct}% complete
            </span>
          }
        />

        {compact ? (
          /* Compact: overall bar with course dots */
          <div className="space-y-2">
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${overallPct}%`,
                  backgroundColor: config?.accentColor || "#0e89d6",
                }}
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {courses.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-1"
                  title={`${c.name}: ${c.completed}/${c.total}`}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-xs text-foreground truncate">
                    {c.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Expanded: course cards */
          <div className="flex-1 space-y-1 overflow-y-auto">
            {courses.map((c) => {
              const pct = c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0;
              return (
                <button
                  key={c.name}
                  onClick={() => openCourse(c)}
                  className="no-drag w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-muted/60 transition-colors text-left group"
                >
                  {/* Color dot */}
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                  />

                  {/* Course name + count */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate group-hover:text-foreground">
                      {c.name}
                    </p>
                    <p className="text-xs text-foreground tabular-nums">
                      {c.completed} of {c.total} done
                    </p>
                  </div>

                  {/* Progress ring */}
                  <div className="relative shrink-0">
                    <ProgressRing pct={pct} color={c.color} size={28} />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground tabular-nums">
                      {pct}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Course detail modal */}
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </>
  );
}

/**
 * Modal showing all assignments for a selected course.
 * Notion-style: clean list, colored header, subtle animations.
 *
 * @param course - The selected course with its tasks
 * @param onClose - Callback to close the modal
 */
function CourseDetailModal({
  course,
  onClose,
}: {
  course: CourseProgress;
  onClose: () => void;
}) {
  const { toggleComplete } = useTaskContext();
  const pct = course.total > 0 ? Math.round((course.completed / course.total) * 100) : 0;

  // Sort: incomplete first (by due date), then completed
  const sortedTasks = useMemo(() => {
    return [...course.tasks].sort((a, b) => {
      if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
      return (a.due_date ?? "").localeCompare(b.due_date ?? "");
    });
  }, [course.tasks]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 animate-announce-backdrop-in"
        onClick={onClose}
      />
      <div className="relative bg-popover rounded-2xl shadow-2xl border border-border w-full w-[calc(100%-2rem)] max-w-md animate-announce-card-in overflow-hidden max-h-[80vh] flex flex-col">
        {/* Header with course color accent */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: course.color }}
              />
              <h2 className="text-base font-semibold text-foreground truncate">
                {course.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: course.color }}
              />
            </div>
            <span className="text-xs text-foreground shrink-0 tabular-nums">
              {course.completed}/{course.total}
            </span>
          </div>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto p-2">
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-2.5 px-2.5 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleComplete(task.id)}
                className={`no-drag mt-0.5 w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-colors ${
                  task.is_completed
                    ? "border-transparent"
                    : "border-muted-foreground/30 hover:border-muted-foreground/60"
                }`}
                style={task.is_completed ? { backgroundColor: course.color } : undefined}
                aria-label={task.is_completed ? "Mark incomplete" : "Mark complete"}
              >
                {task.is_completed && <Check size={10} className="text-white" />}
              </button>

              {/* Task details */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${task.is_completed ? "line-through text-foreground" : "text-foreground"}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {task.due_date && (
                    <span className="text-xs text-foreground">
                      {new Date(task.due_date + "T12:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                  {task.points_possible != null && (
                    <span className="text-xs text-foreground">
                      {task.points_possible} pts
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
