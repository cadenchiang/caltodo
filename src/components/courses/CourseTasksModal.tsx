/**
 * Modal that shows tasks for a single course.
 * Reuses the same TaskList component as the inbox, filtered to one course.
 * Includes task preview popover for mobile and edit modal for desktop.
 *
 * @param courseName - The course to filter tasks for
 * @param tasks - All tasks (filtered internally by course_name)
 * @param open - Whether the modal is visible
 * @param onClose - Handler to close the modal
 */

"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { getThemeColor } from "@/lib/constants";
import { useTheme } from "@/contexts/ThemeContext";
import TaskList from "@/components/tasks/TaskList";
import TaskPreviewPopover from "@/components/tasks/TaskPreviewPopover";
import TaskCreateModal from "@/components/tasks/TaskCreateModal";
import type { Task } from "@/lib/types";
import { extractCourseCode } from "@/lib/course-name-merge";

interface CourseTasksModalProps {
  courseName: string;
  tasks: Task[];
  color: string;
  open: boolean;
  onClose: () => void;
}

export default function CourseTasksModal({ courseName, tasks, color, open, onClose }: CourseTasksModalProps) {
  const { colorTheme } = useTheme();
  const { addTask, updateTask, deleteTask, toggleComplete } = useTaskContext();
  const [previewTask, setPreviewTask] = useState<Task | null>(null);
  const [previewRect, setPreviewRect] = useState<DOMRect | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const themeColor = getThemeColor(color, colorTheme);

  /** Filter tasks that belong to this course. */
  const courseTasks = useMemo(() => {
    const targetCode = extractCourseCode(courseName);
    return tasks.filter((t) => {
      const raw = t.course_name || "General";
      if (raw === courseName) return true;
      if (targetCode) {
        const taskCode = extractCourseCode(raw);
        return taskCode === targetCode;
      }
      return false;
    });
  }, [tasks, courseName]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="fixed inset-4 md:inset-y-8 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50 flex flex-col bg-popover rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-foreground/[0.08] shrink-0">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: themeColor }}
          />
          <h2 className="text-lg font-semibold text-foreground flex-1 truncate">
            {courseName}
          </h2>
          <span className="text-sm text-muted-foreground mr-2">
            {courseTasks.length} {courseTasks.length === 1 ? "task" : "tasks"}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-foreground/[0.06] text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Task list — same component as inbox */}
        <div className="flex-1 overflow-auto">
          <TaskList
            tasks={courseTasks}
            loading={false}
            error={null}
            sortMode="date"
            onAdd={addTask}
            onToggle={toggleComplete}
            onSelect={(task, anchorRect) => {
              if (typeof window !== "undefined" && window.innerWidth < 768 && anchorRect) {
                setPreviewTask(task);
                setPreviewRect(anchorRect);
              } else {
                setEditTask(task);
              }
            }}
            onDelete={deleteTask}
            onColorChange={async (cn, newColor) => {
              const matching = courseTasks.filter((t) => (t.course_name || "General") === cn);
              for (const t of matching) await updateTask(t.id, { color: newColor });
            }}
            onDeleteClass={async (cn) => {
              const matching = courseTasks.filter((t) => (t.course_name || "General") === cn);
              for (const t of matching) await deleteTask(t.id);
            }}
          />
        </div>
      </div>

      {/* Mobile preview popover */}
      {previewTask && previewRect && (
        <TaskPreviewPopover
          task={previewTask}
          anchorRect={previewRect}
          onClose={() => { setPreviewTask(null); setPreviewRect(null); }}
          onEdit={(task) => { setPreviewTask(null); setPreviewRect(null); setEditTask(task); }}
          onDelete={async (id) => { await deleteTask(id); setPreviewTask(null); setPreviewRect(null); }}
          onToggle={toggleComplete}
        />
      )}

      {/* Edit modal */}
      <TaskCreateModal
        open={!!editTask}
        onClose={() => setEditTask(null)}
        onAdd={() => {}}
        editTask={editTask}
        onSave={async (id, updates) => { await updateTask(id, updates); }}
        onDelete={async (id) => { await deleteTask(id); setEditTask(null); }}
      />
    </>
  );
}
