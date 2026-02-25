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
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { useTaskContext } from "@/contexts/TaskContext";
import CalendarHeader, { type CalendarViewMode } from "@/components/calendar/CalendarHeader";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import CalendarWeekView from "@/components/calendar/CalendarWeekView";
import CalendarDayView from "@/components/calendar/CalendarDayView";
import TaskPopover from "@/components/tasks/TaskPopover";
import TaskAddPopover from "@/components/tasks/TaskAddPopover";
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
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editAnchorRect, setEditAnchorRect] = useState<DOMRect | null>(null);
  const [addingDate, setAddingDate] = useState<string | null>(null);
  const [addAnchorRect, setAddAnchorRect] = useState<DOMRect | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { tasks, loading, error, addTask, updateTask, deleteTask } = useTaskContext();
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);

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

  // Filter tasks for the active view's date range
  const visibleTasks = useMemo(() => {
    if (viewMode === "month") {
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      return tasks.filter((t) => {
        if (!t.due_date) return false;
        const d = new Date(t.due_date + "T00:00:00");
        return d.getMonth() === month && d.getFullYear() === year;
      });
    }
    if (viewMode === "week") {
      const ws = format(startOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
      const we = format(endOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
      return tasks.filter((t) => t.due_date && t.due_date >= ws && t.due_date <= we);
    }
    // day
    const ds = format(currentDate, "yyyy-MM-dd");
    return tasks.filter((t) => t.due_date === ds);
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
    setAddAnchorRect(null);
    setEditingTask(task);
    setEditAnchorRect(rect);
  }

  function handleDayClick(date: string, rect: DOMRect) {
    setEditingTask(null);
    setEditAnchorRect(null);
    setAddingDate(date);
    setAddAnchorRect(rect);
  }

  function closeEditPopover() {
    setEditingTask(null);
    setEditAnchorRect(null);
  }

  function closeAddPopover() {
    setAddingDate(null);
    setAddAnchorRect(null);
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
                <div className="p-12 flex items-center justify-center text-muted-foreground text-sm h-full">
                  Loading calendar...
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
                  onDayClick={handleDayClick}
                  onTaskClick={handleTaskClick}
                />
              ) : (
                <CalendarDayView
                  currentDate={currentDate}
                  tasks={visibleTasks}
                  onAddClick={handleDayClick}
                  onTaskClick={handleTaskClick}
                />
              )}
            </div>
          </div>
        </div>

        {/* Floating add-task popover */}
        {addingDate && addAnchorRect && (
          <TaskAddPopover
            date={addingDate}
            anchorRect={addAnchorRect}
            onClose={closeAddPopover}
            onAdd={(taskData) => {
              addTask(taskData);
            }}
          />
        )}

        {/* Floating edit popover */}
        {editingTask && editAnchorRect && (
          <TaskPopover
            task={editingTask}
            anchorRect={editAnchorRect}
            onClose={closeEditPopover}
            onSave={async (id, updates) => {
              await updateTask(id, updates);
            }}
            onDelete={async (id) => {
              await deleteTask(id);
              closeEditPopover();
            }}
          />
        )}
      </div>
    </PageTransition>
  );
}
