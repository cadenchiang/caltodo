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
    return { label: "Overdue", className: "text-red-400" };
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
 * Single task row with thin square checkbox, title, source tag, and due date.
 * No outlines — hover shows dark gray background like sidebar selectors.
 * Right-click opens a context menu with delete option.
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
        className={`group flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl transition-colors duration-100 cursor-pointer ${
          isSelected
            ? "bg-black/5"
            : "hover:bg-black/5"
        }`}
        onClick={() => onSelect(task)}
        onContextMenu={handleContextMenu}
      >
        {/* Thin square checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          className="flex-shrink-0 w-4 h-4 rounded-[3px] flex items-center justify-center transition-all"
          style={{
            backgroundColor: task.is_completed ? (task.color || "#9CA3AF") : "transparent",
            border: task.is_completed ? "none" : `1.5px solid ${task.color || "#D1D5DB"}`,
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
            task.is_completed ? "text-gray-400 line-through" : "text-gray-800"
          }`}
        >
          {task.title}
        </span>

        {/* Source tag with background */}
        {task.source && (
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${
              task.source === "canvas"
                ? "text-red-600 bg-red-50"
                : "text-emerald-600 bg-emerald-50"
            }`}
          >
            {task.source === "canvas" ? "Canvas" : "Gradescope"}
          </span>
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
