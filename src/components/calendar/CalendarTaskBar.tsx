"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";

interface CalendarTaskBarProps {
  task: Task;
  onClick: (task: Task, rect: DOMRect) => void;
}

/**
 * Colored task bar displayed within a calendar day cell.
 * Brightens background and text on hover for clear interactivity.
 *
 * @param task - The task to display
 * @param onClick - Callback when the bar is clicked, includes bounding rect for popover positioning
 */
export default function CalendarTaskBar({ task, onClick }: CalendarTaskBarProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(task, e.currentTarget.getBoundingClientRect());
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`w-full text-left text-[10px] md:text-xs px-1 py-0.5 md:px-1.5 md:py-0.5 rounded-sm md:rounded truncate transition-all ${
        task.is_completed ? "opacity-50 line-through" : "opacity-100"
      }`}
      style={{
        backgroundColor: task.color + (hovered ? "40" : "20"),
        color: task.color,
        fontWeight: hovered ? 600 : 400,
        borderLeft: `2px solid ${task.color}`,
      }}
      title={task.title}
    >
      {task.title}
    </button>
  );
}
