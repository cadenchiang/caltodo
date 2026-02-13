"use client";

import { useState, useMemo, useEffect } from "react";
import { addMonths, subMonths, format } from "date-fns";
import { useTaskContext } from "@/contexts/TaskContext";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import TaskEditModal from "@/components/tasks/TaskEditModal";
import TaskAddForm from "@/components/tasks/TaskAddForm";
import PageTransition from "@/components/ui/PageTransition";
import type { Task } from "@/lib/types";

/**
 * Calendar month view page. Filters tasks from shared TaskContext by month.
 * Uses animated modals for adding/editing tasks on specific dates.
 */
export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [addingDate, setAddingDate] = useState<string | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const { tasks, loading, error, addTask, updateTask } = useTaskContext();

  const monthTasks = useMemo(() => {
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    return tasks.filter((t) => {
      if (!t.due_date) return false;
      const d = new Date(t.due_date + "T00:00:00");
      return d.getMonth() === month && d.getFullYear() === year;
    });
  }, [tasks, currentMonth]);

  // Animate add-task modal in when addingDate changes
  useEffect(() => {
    if (addingDate) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAddModalVisible(true);
        });
      });
    }
  }, [addingDate]);

  function closeAddModal() {
    setAddModalVisible(false);
    setTimeout(() => setAddingDate(null), 200);
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
            <div className="glass rounded-2xl p-12 flex items-center justify-center text-gray-400 text-sm">
              Loading calendar...
            </div>
          ) : (
            <CalendarGrid
              currentMonth={currentMonth}
              tasks={monthTasks}
              addingDate={addingDate}
              onDayClick={(date) => setAddingDate(date)}
              onTaskClick={(task) => setEditingTask(task)}
            />
          )}
        </div>

        {/* Animated add task modal when a day is clicked */}
        {addingDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-200 ease-out ${
                addModalVisible ? "opacity-100" : "opacity-0"
              }`}
              onClick={closeAddModal}
            />
            <div
              className={`relative glass-strong rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-5 transition-all duration-200 ease-out ${
                addModalVisible
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 translate-y-2"
              }`}
            >
              <p className="text-sm font-medium text-gray-700 mb-3">
                Add task for {format(new Date(addingDate + "T00:00:00"), "MMMM d, yyyy")}
              </p>
              <TaskAddForm
                onAdd={(taskData) => {
                  addTask({ ...taskData, due_date: addingDate });
                  closeAddModal();
                }}
                defaultDate={addingDate}
              />
              <button
                onClick={closeAddModal}
                className="mt-2 w-full text-sm text-gray-400 hover:text-gray-600 py-1.5 rounded-xl hover:bg-white/40 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Edit modal */}
        {editingTask && (
          <TaskEditModal
            task={editingTask}
            onClose={() => setEditingTask(null)}
            onSave={async (id, updates) => {
              await updateTask(id, updates);
              setEditingTask(null);
            }}
          />
        )}
      </div>
    </PageTransition>
  );
}
