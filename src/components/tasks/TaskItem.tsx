"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";
import type { Task } from "@/lib/types";

interface TaskItemProps {
  task: Task;
  isSelected?: boolean;
  onToggle: (id: string) => void;
  onSelect: (task: Task) => void;
  onDelete: (id: string) => void;
}

/**
 * Inline bCourses (Canvas) logo SVG.
 * Red circle with a stylized "C" arc representing the Canvas mark.
 *
 * @param size - Icon dimensions in pixels
 */
function CanvasLogo({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="shrink-0">
      <circle cx="7" cy="7" r="7" fill="#E03C31" />
      <path
        d="M9.5 4.5C8.8 3.7 7.9 3.2 7 3.2c-2.1 0-3.8 1.7-3.8 3.8s1.7 3.8 3.8 3.8c.9 0 1.8-.4 2.5-1.1"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * Inline Gradescope logo SVG.
 * Teal circle with a stylized checkmark representing grading.
 *
 * @param size - Icon dimensions in pixels
 */
function GradescopeLogo({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="shrink-0">
      <circle cx="7" cy="7" r="7" fill="#00A67E" />
      <path
        d="M4.2 7.2l1.8 1.8 3.8-3.8"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * Returns a human-readable due date label and color class.
 *
 * @param dueDate - ISO date string ("YYYY-MM-DD") or null
 * @returns Object with label and className, or null if no date
 */
function getDueDateBadge(dueDate: string | null): { label: string; className: string } | null {
  if (!dueDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");

  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const month = due.toLocaleString("en-US", { month: "short" });
    const day = due.getDate();
    return { label: `${month} ${day}`, className: "text-red-400" };
  }
  if (diffDays === 0) {
    return { label: "Today", className: "text-blue-400" };
  }
  if (diffDays === 1) {
    return { label: "Tomorrow", className: "text-blue-400" };
  }
  if (diffDays <= 7) {
    const month = due.toLocaleString("en-US", { month: "short" });
    const day = due.getDate();
    return { label: `${month} ${day}`, className: "text-blue-400" };
  }

  const month = due.toLocaleString("en-US", { month: "short" });
  const day = due.getDate();
  return { label: `${month} ${day}`, className: "text-gray-400" };
}

/**
 * Single task row with checkbox, title, source logo, and due date.
 * Hover shows dark gray background. Right-click opens delete context menu.
 * Completed tasks render with reduced opacity for a faded look.
 *
 * @param task - The task data to display
 * @param isSelected - Whether this task is currently selected
 * @param onToggle - Callback to toggle completion
 * @param onSelect - Callback when task is clicked to show detail panel
 * @param onDelete - Callback to delete the task
 */
export default function TaskItem({ task, isSelected, onToggle, onSelect, onDelete }: TaskItemProps) {
  const dueBadge = getDueDateBadge(task.due_date);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }

  function handleDelete() {
    setContextMenu(null);
    onDelete(task.id);
  }

  return (
    <>
      <div
        className={`group flex items-center gap-3 px-6 h-10 mx-2 rounded-xl transition-colors duration-100 cursor-pointer ${
          isSelected
            ? "bg-black/5"
            : "hover:bg-black/5"
        } ${task.is_completed ? "opacity-40" : ""}`}
        onClick={() => onSelect(task)}
        onContextMenu={handleContextMenu}
      >
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          className="flex-shrink-0 w-4 h-4 rounded-[3px] flex items-center justify-center transition-all"
          style={{
            backgroundColor: task.is_completed ? "#D1D5DB" : "transparent",
            border: task.is_completed ? "none" : "1px solid #D1D5DB",
          }}
          aria-label={task.is_completed ? "Mark incomplete" : "Mark complete"}
        >
          {task.is_completed && (
            <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Title */}
        <span
          className={`flex-1 min-w-0 truncate text-sm ${
            task.is_completed ? "text-gray-800 line-through" : "text-gray-800"
          }`}
        >
          {task.title}
        </span>

        {/* Source logo with hover tooltip */}
        {task.source && (
          <div className="relative shrink-0 group/logo">
            {task.source === "canvas" ? <CanvasLogo /> : <GradescopeLogo />}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-800 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover/logo:opacity-100 transition-opacity pointer-events-none">
              {task.source === "canvas" ? "bCourses (Canvas)" : "Gradescope"}
            </div>
          </div>
        )}

        {/* Due date */}
        {dueBadge && (
          <span className={`text-[11px] shrink-0 font-medium ${dueBadge.className}`}>
            {dueBadge.label}
          </span>
        )}
      </div>

      {/* Right-click context menu */}
      {contextMenu && typeof document !== "undefined" && createPortal(
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
          />
          <div
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[140px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
              Delete task
            </button>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
