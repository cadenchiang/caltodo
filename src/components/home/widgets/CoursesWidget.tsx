/**
 * Courses widget — grid of course cards derived from task course_name values.
 * Clicking a card opens a modal with that course's tasks in list view.
 *
 * @param config - Widget configuration (unused currently)
 */

"use client";

import { useState, useMemo } from "react";
import { GraduationCap } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { extractCourseCode } from "@/lib/course-name-merge";
import { getThemeColor } from "@/lib/constants";
import { useTheme } from "@/contexts/ThemeContext";
import CourseTasksModal from "@/components/courses/CourseTasksModal";

interface CoursesWidgetProps {
  config?: Record<string, string>;
}

/**
 * Builds course summaries from tasks.
 *
 * @param tasks - All user tasks
 * @param courseColors - Map from course_name to dominant color
 * @returns Sorted array of { name, color, taskCount }
 */
function buildCourses(
  tasks: { course_name: string | null; is_completed: boolean; dismissed_at?: string | null }[],
  courseColors: Map<string, string>
): { name: string; color: string; taskCount: number }[] {
  const codeToCanonical = new Map<string, string>();
  const counts = new Map<string, number>();
  const active = tasks.filter((t) => !t.is_completed && !t.dismissed_at);

  for (const t of active) {
    const raw = t.course_name || "General";
    const code = raw !== "General" ? extractCourseCode(raw) : null;
    let key: string;
    if (code) {
      const existing = codeToCanonical.get(code);
      if (!existing || raw.length < existing.length) codeToCanonical.set(code, raw);
      key = code;
    } else {
      key = raw;
    }
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const result: { name: string; color: string; taskCount: number }[] = [];
  for (const [key, count] of counts) {
    const name = codeToCanonical.get(key) || key;
    result.push({ name, color: courseColors.get(name) || "#6b7280", taskCount: count });
  }
  result.sort((a, b) => {
    if (a.name === "General") return 1;
    if (b.name === "General") return -1;
    return a.name.localeCompare(b.name);
  });
  return result;
}

export default function CoursesWidget({ config }: CoursesWidgetProps) {
  const { tasks, courseColors } = useTaskContext();
  const { colorTheme } = useTheme();
  const [selected, setSelected] = useState<{ name: string; color: string } | null>(null);

  const courses = useMemo(() => buildCourses(tasks, courseColors), [tasks, courseColors]);

  if (courses.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-1.5 p-3">
        <GraduationCap size={24} className="text-muted-foreground/30" />
        <span className="text-xs text-muted-foreground">No courses yet</span>
      </div>
    );
  }

  return (
    <>
      <div className="h-full w-full overflow-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          {courses.map((c) => {
            const tc = getThemeColor(c.color, colorTheme);
            return (
              <button
                key={c.name}
                onClick={() => setSelected({ name: c.name, color: c.color })}
                className="text-left rounded-lg overflow-hidden border border-foreground/[0.06] hover:shadow-sm transition-all hover:-translate-y-px bg-card"
              >
                <div
                  className="h-12 w-full"
                  style={{ background: `linear-gradient(135deg, ${tc}30, ${tc}10)` }}
                />
                <div className="px-2.5 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tc }} />
                    <span className="text-[11px] font-semibold text-foreground truncate">{c.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{c.taskCount} tasks</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <CourseTasksModal
          courseName={selected.name}
          tasks={tasks}
          color={selected.color}
          open={true}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
