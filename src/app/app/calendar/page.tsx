"use client";

import { useState, useMemo, useEffect } from "react";
import { addMonths, subMonths } from "date-fns";
import { X } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import TaskPopover from "@/components/tasks/TaskPopover";
import TaskAddPopover from "@/components/tasks/TaskAddPopover";
import CalendarModal from "@/components/CalendarModal";
import PageTransition from "@/components/ui/PageTransition";
import type { Task } from "@/lib/types";

const GCAL_DISMISSED_KEY = "caltodo_gcal_prompt_dismissed";

/**
 * Inline Google Calendar logo SVG for the banner.
 *
 * @param size - Icon dimensions in pixels (default 18)
 */
function GCalIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 122.88 122.88" className="inline-block shrink-0">
      <polygon points="93.78,29.1 29.1,29.1 29.1,93.78 93.78,93.78" fill="#fff" />
      <polygon points="93.78,122.88 122.88,93.78 93.78,93.78" fill="#EA4335" />
      <polygon points="122.88,29.1 93.78,29.1 93.78,93.78 122.88,93.78" fill="#FBBC04" />
      <polygon points="93.78,93.78 29.1,93.78 29.1,122.88 93.78,122.88" fill="#34A853" />
      <path d="M0,93.78v19.4c0,5.36,4.34,9.7,9.7,9.7h19.4v-29.1H0z" fill="#188038" />
      <path d="M122.88,29.1V9.7c0-5.36-4.34-9.7-9.7-9.7h-19.4v29.1H122.88z" fill="#1967D2" />
      <path d="M93.78,0H9.7C4.34,0,0,4.34,0,9.7v84.08h29.1V29.1h64.67V0z" fill="#4285F4" />
      <path d="M42.37,79.27c-2.42-1.63-4.09-4.02-5-7.17l5.61-2.31c0.51,1.94,1.4,3.44,2.67,4.51c1.26,1.07,2.8,1.59,4.59,1.59c1.84,0,3.41-0.56,4.73-1.67c1.32-1.12,1.98-2.54,1.98-4.26c0-1.76-0.7-3.2-2.09-4.32c-1.39-1.12-3.14-1.67-5.22-1.67H46.4v-5.55h2.91c1.79,0,3.31-0.48,4.54-1.46c1.23-0.97,1.84-2.3,1.84-3.99c0-1.5-0.55-2.7-1.65-3.6s-2.49-1.35-4.18-1.35c-1.65,0-2.96,0.44-3.93,1.32c-0.97,0.88-1.7,2-2.12,3.24l-5.55-2.31c0.74-2.09,2.09-3.93,4.07-5.52c1.98-1.59,4.51-2.39,7.58-2.39c2.27,0,4.32,0.44,6.13,1.32c1.81,0.88,3.23,2.1,4.26,3.65c1.03,1.56,1.54,3.31,1.54,5.25c0,1.98-0.48,3.65-1.43,5.03c-0.95,1.37-2.13,2.43-3.52,3.16v0.33c1.79,0.74,3.36,1.96,4.51,3.52c1.17,1.58,1.76,3.46,1.76,5.66c0,2.2-0.56,4.16-1.67,5.88c-1.12,1.72-2.66,3.08-4.62,4.07c-1.96,0.99-4.17,1.49-6.62,1.49C47.41,81.72,44.79,80.91,42.37,79.27z" fill="#1A73E8" />
      <path d="M76.83,51.43l-6.16,4.45l-3.08-4.67l11.05-7.97h4.24v37.6h-6.05V51.43z" fill="#1A73E8" />
    </svg>
  );
}

/**
 * Calendar month view page. Filters tasks from shared TaskContext by month.
 * Uses Google Calendar-style floating popovers for adding/editing tasks.
 * Shows a persistent banner prompting Google Calendar sync until dismissed.
 */
export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editAnchorRect, setEditAnchorRect] = useState<DOMRect | null>(null);
  const [addingDate, setAddingDate] = useState<string | null>(null);
  const [addAnchorRect, setAddAnchorRect] = useState<DOMRect | null>(null);
  const [showGcalBanner, setShowGcalBanner] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const { tasks, loading, error, addTask, updateTask, deleteTask } = useTaskContext();

  // Check localStorage on mount to decide whether to show the gcal banner
  useEffect(() => {
    setShowGcalBanner(localStorage.getItem(GCAL_DISMISSED_KEY) !== "1");
  }, []);

  /**
   * Dismisses the Google Calendar banner permanently.
   * Sets localStorage flag and dispatches event so the sidebar badge updates.
   */
  function dismissGcalBanner() {
    setShowGcalBanner(false);
    localStorage.setItem(GCAL_DISMISSED_KEY, "1");
    window.dispatchEvent(new Event("gcal-dismissed"));
  }

  const monthTasks = useMemo(() => {
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    return tasks.filter((t) => {
      if (!t.due_date) return false;
      const d = new Date(t.due_date + "T00:00:00");
      return d.getMonth() === month && d.getFullYear() === year;
    });
  }, [tasks, currentMonth]);

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
      <div>
        {/* Google Calendar sync banner */}
        {showGcalBanner && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 animate-stagger stagger-1">
            <GCalIcon size={20} />
            <p className="flex-1 text-sm text-blue-800 dark:text-blue-300">
              Sync your assignments to Google Calendar?
            </p>
            <button
              onClick={() => setShowCalendarModal(true)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Set up
            </button>
            <button
              onClick={dismissGcalBanner}
              className="p-1 text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 transition-colors rounded-lg"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="animate-stagger stagger-1">
          <CalendarHeader
            currentMonth={currentMonth}
            onPrevMonth={() => setCurrentMonth(subMonths(currentMonth, 1))}
            onNextMonth={() => setCurrentMonth(addMonths(currentMonth, 1))}
            onToday={() => setCurrentMonth(new Date())}
          />
        </div>

        {error && (
          <div className="bg-red-400/10 text-red-500 text-sm p-4 rounded-2xl backdrop-blur-sm mb-4">
            Error loading tasks: {error}
          </div>
        )}

        <div className="animate-stagger stagger-2">
          {loading ? (
            <div className="glass rounded-2xl p-12 flex items-center justify-center text-subtle-foreground text-sm">
              Loading calendar...
            </div>
          ) : (
            <CalendarGrid
              currentMonth={currentMonth}
              tasks={monthTasks}
              addingDate={addingDate}
              onDayClick={handleDayClick}
              onTaskClick={handleTaskClick}
            />
          )}
        </div>

        {/* Floating add-task popover when a day is clicked */}
        {addingDate && addAnchorRect && (
          <TaskAddPopover
            date={addingDate}
            anchorRect={addAnchorRect}
            onClose={closeAddPopover}
            onAdd={(taskData) => {
              addTask({ ...taskData, due_date: addingDate });
            }}
          />
        )}

        {/* Floating edit popover when a task bar is clicked */}
        {editingTask && editAnchorRect && (
          <TaskPopover
            task={editingTask}
            anchorRect={editAnchorRect}
            onClose={closeEditPopover}
            onSave={async (id, updates) => {
              await updateTask(id, updates);
              closeEditPopover();
            }}
            onDelete={async (id) => {
              await deleteTask(id);
              closeEditPopover();
            }}
          />
        )}

        {/* Google Calendar feed setup modal */}
        {showCalendarModal && (
          <CalendarModal
            onClose={() => {
              setShowCalendarModal(false);
              dismissGcalBanner();
            }}
          />
        )}
      </div>
    </PageTransition>
  );
}
