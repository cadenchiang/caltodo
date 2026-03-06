"use client";

import { useState, useMemo, useEffect } from "react";
import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { useTaskContext } from "@/contexts/TaskContext";
import { expandRepeatingTasks, getRealTaskId, isVirtualRepeatInstance } from "@/lib/expand-repeating-tasks";
import CalendarHeader, { type CalendarViewMode } from "@/components/calendar/CalendarHeader";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import CalendarWeekView from "@/components/calendar/CalendarWeekView";
import CalendarDayView from "@/components/calendar/CalendarDayView";
import TaskCreateModal from "@/components/tasks/TaskCreateModal";
import TaskPreviewPopover from "@/components/tasks/TaskPreviewPopover";
import PageTransition from "@/components/ui/PageTransition";
import type { Task, PendingInvite } from "@/lib/types";

const VIEW_MODE_KEY = "cal-view-mode";

/**
 * Calendar page with Month, Week, and Day views.
 * Persists view mode to localStorage. Filters tasks from shared TaskContext
 * per the active view's date range.
 */
export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [previewTask, setPreviewTask] = useState<Task | null>(null);
  const [previewRect, setPreviewRect] = useState<DOMRect | null>(null);
  const [editModalTask, setEditModalTask] = useState<Task | null>(null);
  const [addingDate, setAddingDate] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { tasks, loading, error, addTask, updateTask, deleteTask, toggleComplete } = useTaskContext();
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);

  /** Derive fresh task data from context so toggles reflect immediately.
   *  For virtual repeat instances, look up by the real (base) task ID. */
  const currentPreviewTask = previewTask
    ? tasks.find((t) => t.id === getRealTaskId(previewTask.id)) ?? null
    : null;

  // Fetch pending invites on mount
  useEffect(() => {
    async function fetchPendingInvites() {
      try {
        const res = await fetch("/api/tasks/invites/pending");
        if (res.ok) {
          const data = await res.json();
          setPendingInvites(data.invites ?? []);
        }
      } catch { /* non-critical — calendar still shows own tasks */ }
    }
    fetchPendingInvites();
  }, []);

  // Restore persisted view mode
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_MODE_KEY) as CalendarViewMode | null;
      if (saved && ["month", "week", "day"].includes(saved)) setViewMode(saved);
    } catch { /* ignore */ }
  }, []);

  function handleViewModeChange(mode: CalendarViewMode) {
    setViewMode(mode);
    try { localStorage.setItem(VIEW_MODE_KEY, mode); } catch { /* ignore */ }
  }

  // Filter tasks for the active view's date range, expanding repeating tasks
  const visibleTasks = useMemo(() => {
    let rangeStart: string;
    let rangeEnd: string;

    if (viewMode === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      rangeStart = format(startOfWeek(monthStart, { weekStartsOn: 1 }), "yyyy-MM-dd");
      rangeEnd = format(endOfWeek(monthEnd, { weekStartsOn: 1 }), "yyyy-MM-dd");
    } else if (viewMode === "week") {
      rangeStart = format(startOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
      rangeEnd = format(endOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
    } else {
      rangeStart = format(currentDate, "yyyy-MM-dd");
      rangeEnd = rangeStart;
    }

    const expanded = expandRepeatingTasks(tasks, rangeStart, rangeEnd);
    return expanded.filter((t) => t.due_date && t.due_date >= rangeStart && t.due_date <= rangeEnd);
  }, [tasks, currentDate, viewMode]);

  // Navigation handlers per view mode
  function handlePrev() {
    if (viewMode === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  }

  function handleNext() {
    if (viewMode === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  }

  function handleToday() {
    setCurrentDate(new Date());
  }

  // Build header title based on view mode
  function getTitle(): string {
    if (viewMode === "month") return format(currentDate, "MMMM yyyy");
    if (viewMode === "week") {
      const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
      const we = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(ws, "MMM d")} - ${format(we, "MMM d, yyyy")}`;
    }
    return format(currentDate, "EEEE, MMMM d, yyyy");
  }

  function handleTaskClick(task: Task, rect: DOMRect) {
    setAddingDate(null);
    setPreviewTask(task);
    setPreviewRect(rect);
  }

  function handleDayClick(date: string, _rect: DOMRect) {
    setPreviewTask(null);
    setPreviewRect(null);
    setAddingDate(date);
  }

  function closePreview() {
    setPreviewTask(null);
    setPreviewRect(null);
  }

  function handlePreviewEdit(task: Task) {
    closePreview();
    setEditModalTask(task);
  }

  function closeEditModal() {
    setEditModalTask(null);
  }

  function closeAddPopover() {
    setAddingDate(null);
  }

  return (
    <PageTransition>
      <div className="h-full flex flex-col overflow-hidden -mx-4 md:mx-0">
        {error && (
          <div className="px-4 md:px-0 shrink-0 mb-2">
            <div className="bg-red-400/10 text-red-500 text-sm p-4 rounded-2xl">
              Error loading tasks: {error}
            </div>
          </div>
        )}

        {/* Single bordered container wrapping header + calendar view */}
        <div className="flex-1 min-h-0 px-4 md:px-0 pb-2 flex flex-col">
          <div className="md:rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm bg-card flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="px-2.5 py-2 md:px-4 md:py-3 shrink-0">
              <CalendarHeader
                currentMonth={currentDate}
                title={getTitle()}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                onPrev={handlePrev}
                onNext={handleNext}
                onToday={handleToday}
              />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              {loading ? (
                <div className="flex-1 flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading calendar...</p>
                  </div>
                </div>
              ) : viewMode === "month" ? (
                <CalendarGrid
                  currentMonth={currentDate}
                  tasks={visibleTasks}
                  pendingInvites={pendingInvites}
                  addingDate={addingDate}
                  selectedDate={selectedDate}
                  onDayClick={handleDayClick}
                  onDaySelect={setSelectedDate}
                  onTaskClick={handleTaskClick}
                />
              ) : viewMode === "week" ? (
                <CalendarWeekView
                  currentDate={currentDate}
                  tasks={visibleTasks}
                  pendingInvites={pendingInvites}
                  onDayClick={handleDayClick}
                  onTaskClick={handleTaskClick}
                />
              ) : (
                <CalendarDayView
                  currentDate={currentDate}
                  tasks={visibleTasks}
                  pendingInvites={pendingInvites}
                  onAddClick={handleDayClick}
                  onTaskClick={handleTaskClick}
                />
              )}
            </div>
          </div>
        </div>

        {/* Task create modal (same as inbox/board views) */}
        <TaskCreateModal
          open={!!addingDate}
          onClose={closeAddPopover}
          onAdd={(task) => { addTask(task); closeAddPopover(); }}
          defaultDate={addingDate}
        />

        {/* Task preview popover (first click) */}
        {currentPreviewTask && previewRect && (
          <TaskPreviewPopover
            task={currentPreviewTask}
            anchorRect={previewRect}
            onClose={closePreview}
            onEdit={handlePreviewEdit}
            onDelete={async (id) => {
              await deleteTask(id);
              closePreview();
            }}
            onToggle={toggleComplete}
          />
        )}

        {/* Task edit modal (opened from preview pencil button) */}
        <TaskCreateModal
          open={!!editModalTask}
          onClose={closeEditModal}
          onAdd={() => {}}
          editTask={editModalTask}
          onSave={async (id, updates) => {
            await updateTask(id, updates);
          }}
          onDelete={async (id) => {
            await deleteTask(id);
            closeEditModal();
          }}
          onSaveColorForClass={async (courseName, color) => {
            const matching = tasks.filter(t => (t.course_name || "General") === courseName);
            for (const t of matching) await updateTask(t.id, { color });
          }}
        />
      </div>
    </PageTransition>
  );
}
