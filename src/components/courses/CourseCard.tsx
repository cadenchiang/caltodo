/**
 * A single course card in the courses grid.
 * Shows a colored/image header with course name and task count below.
 * Click opens the course tasks modal.
 *
 * @param courseName - The course display name
 * @param color - The dominant color for this course
 * @param taskCount - Number of active tasks in this course
 * @param onClick - Handler when card is clicked
 */

"use client";

import { getThemeColor } from "@/lib/constants";
import { useTheme } from "@/contexts/ThemeContext";

interface CourseCardProps {
  courseName: string;
  color: string;
  taskCount: number;
  onClick: () => void;
}

export default function CourseCard({ courseName, color, taskCount, onClick }: CourseCardProps) {
  const { colorTheme } = useTheme();
  const themeColor = getThemeColor(color, colorTheme);

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl overflow-hidden border border-foreground/[0.08] bg-card hover:shadow-md transition-all hover:-translate-y-0.5 group"
    >
      {/* Colored header area */}
      <div
        className="h-24 w-full transition-opacity group-hover:opacity-90"
        style={{ backgroundColor: `${themeColor}20`, backgroundImage: `linear-gradient(135deg, ${themeColor}30, ${themeColor}10)` }}
      >
        <div className="h-full w-full flex items-center justify-center">
          <span
            className="text-3xl font-bold opacity-20"
            style={{ color: themeColor }}
          >
            {courseName.slice(0, 2).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Label + count */}
      <div className="px-3.5 pt-2.5 pb-3">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: themeColor }}
          />
          <span className="text-[13px] font-semibold text-foreground truncate">
            {courseName}
          </span>
        </div>
        <span className="text-[11.5px] text-muted-foreground mt-0.5 block">
          {taskCount} {taskCount === 1 ? "task" : "tasks"}
        </span>
      </div>
    </button>
  );
}
