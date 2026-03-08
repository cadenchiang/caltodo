/**
 * Course grid view for the inbox page.
 * Displays a grid of CourseCard components built from active tasks.
 * Clicking a card opens CourseTasksModal with that course's tasks.
 *
 * @param tasks - All user tasks (filtered internally to active only)
 * @param courseColors - Map from course_name to hex color
 * @param loading - Whether tasks are still loading
 */

"use client";

import { useState, useMemo } from "react";
import { GraduationCap } from "lucide-react";
import { extractCourseCode } from "@/lib/course-name-merge";
import CourseCard from "@/components/courses/CourseCard";
import CourseTasksModal from "@/components/courses/CourseTasksModal";
import type { Task } from "@/lib/types";

interface CourseGridViewProps {
  tasks: Task[];
  courseColors: Map<string, string>;
  loading: boolean;
}

/**
 * Builds course summaries from active tasks.
 *
 * @param tasks - All tasks
 * @param courseColors - Map from course_name to color
 * @returns Sorted array of { name, color, taskCount }
 */
function buildCourses(
  tasks: Task[],
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

export default function CourseGridView({ tasks, courseColors, loading }: CourseGridViewProps) {
  const [selected, setSelected] = useState<{ name: string; color: string } | null>(null);
  const courses = useMemo(() => buildCourses(tasks, courseColors), [tasks, courseColors]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading courses…</span>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 p-8">
        <GraduationCap size={32} className="text-muted-foreground/30" />
        <span className="text-sm text-muted-foreground">No courses yet</span>
        <span className="text-xs text-muted-foreground/60">Add tasks with a course name to see them here</span>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {courses.map((c) => (
            <CourseCard
              key={c.name}
              courseName={c.name}
              color={c.color}
              taskCount={c.taskCount}
              onClick={() => setSelected({ name: c.name, color: c.color })}
            />
          ))}
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
