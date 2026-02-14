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
 * bCourses (Canvas LMS) logo — red circle with white compass pattern.
 * Sourced from the official Canvas LMS logomark at instructure/canvas-lms.
 *
 * @param size - Icon dimensions in pixels
 */
function CanvasLogo({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-0.5 -0.4 27.7 27.7" fill="none" className="shrink-0">
      <circle cx="13.35" cy="13.45" r="13.85" fill="#D64027" />
      <path fill="white" d="M3.9,13.5c0-2-1.5-3.6-3.4-3.8C0.2,10.9,0,12.1,0,13.5s0.2,2.6,0.5,3.8C2.4,17.1,3.9,15.4,3.9,13.5z" />
      <circle fill="white" cx="6.2" cy="13.4" r="1.2" />
      <path fill="white" d="M22.8,13.5c0,2,1.5,3.6,3.4,3.8c0.3-1.2,0.5-2.5,0.5-3.8s-0.2-2.6-0.5-3.8C24.3,9.9,22.8,11.5,22.8,13.5z" />
      <circle fill="white" cx="20.2" cy="13.4" r="1.2" />
      <path fill="white" d="M13.3,23c-2,0-3.6,1.5-3.8,3.4c1.2,0.3,2.5,0.5,3.8,0.5c1.3,0,2.6-0.2,3.8-0.5C16.9,24.5,15.3,23,13.3,23z" />
      <circle fill="white" cx="13.2" cy="20.4" r="1.2" />
      <path fill="white" d="M13.3,4c2,0,3.6-1.5,3.8-3.4c-1.2-0.3-2.5-0.5-3.8-0.5c-1.3,0-2.6,0.2-3.8,0.5C9.7,2.5,11.3,4,13.3,4z" />
      <circle fill="white" cx="13.2" cy="6.4" r="1.2" />
      <path fill="white" d="M20,20.2c-1.4,1.4-1.5,3.6-0.3,5.1c2.2-1.3,4.1-3.2,5.4-5.4C23.6,18.7,21.4,18.8,20,20.2z" />
      <circle fill="white" cx="18.2" cy="18.4" r="1.2" />
      <path fill="white" d="M6.6,6.8C8,5.4,8.1,3.2,6.9,1.7C4.7,3,2.8,4.9,1.5,7.1C3,8.3,5.2,8.2,6.6,6.8z" />
      <circle fill="white" cx="8.2" cy="8.4" r="1.2" />
      <path fill="white" d="M20,6.8c1.4,1.4,3.6,1.5,5.1,0.3c-1.3-2.2-3.2-4.1-5.4-5.4C18.5,3.2,18.6,5.4,20,6.8z" />
      <circle fill="white" cx="18.2" cy="8.4" r="1.2" />
      <path fill="white" d="M6.6,20.2c-1.4-1.4-3.6-1.5-5.1-0.3c1.3,2.2,3.2,4.1,5.4,5.4C8.1,23.7,8,21.6,6.6,20.2z" />
      <circle fill="white" cx="8.2" cy="18.4" r="1.2" />
    </svg>
  );
}

/**
 * Gradescope logo — teal rounded rectangle with 4 ascending white bars.
 * Sourced from the official Gradescope apple-touch-icon.
 *
 * @param size - Icon dimensions in pixels
 */
function GradescopeLogo({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="shrink-0">
      <rect width="14" height="14" rx="3" fill="#3AADA8" />
      <rect x="1.5" y="8.5" width="2" height="3.5" rx="0.5" fill="white" />
      <rect x="4.5" y="6.5" width="2" height="5.5" rx="0.5" fill="white" />
      <rect x="7.5" y="4.5" width="2" height="7.5" rx="0.5" fill="white" />
      <rect x="10.5" y="2.5" width="2" height="9.5" rx="0.5" fill="white" />
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
