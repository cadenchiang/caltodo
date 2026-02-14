"use client";

import { useState, useMemo } from "react";
import { addMonths, subMonths } from "date-fns";
import { useTaskContext } from "@/contexts/TaskContext";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import TaskPopover from "@/components/tasks/TaskPopover";
import TaskAddPopover from "@/components/tasks/TaskAddPopover";
import PageTransition from "@/components/ui/PageTransition";
import type { Task } from "@/lib/types";

/**
 * Calendar month view page. Filters tasks from shared TaskContext by month.
 * Uses Google Calendar-style floating popovers for adding/editing tasks.
 */
export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editAnchorRect, setEditAnchorRect] = useState<DOMRect | null>(null);
  const [addingDate, setAddingDate] = useState<string | null>(null);
  const [addAnchorRect, setAddAnchorRect] = useState<DOMRect | null>(null);

  const { tasks, loading, error, addTask, updateTask, deleteTask } = useTaskContext();

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
      </div>
    </PageTransition>
  );
}
