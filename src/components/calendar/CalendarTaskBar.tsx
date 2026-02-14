"use client";

import type { Task } from "@/lib/types";

interface CalendarTaskBarProps {
  task: Task;
  onClick: (task: Task, rect: DOMRect) => void;
}

/**
 * Colored task bar displayed within a calendar day cell.
 *
 * @param task - The task to display
 * @param onClick - Callback when the bar is clicked, includes bounding rect for popover positioning
 */
export default function CalendarTaskBar({ task, onClick }: CalendarTaskBarProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(task, e.currentTarget.getBoundingClientRect());
      }}
      className={`w-full text-left text-xs px-1.5 py-0.5 rounded truncate transition-opacity ${
        task.is_completed ? "opacity-50 line-through" : "opacity-100"
      }`}
      style={{
        backgroundColor: task.color + "20",
        color: task.color,
        borderLeft: `2px solid ${task.color}`,
      }}
      title={task.title}
    >
      {task.title}
    </button>
  );
}
