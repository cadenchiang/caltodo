"use client";

/**
 * Self-contained calendar body — month / week / day grids, modals, and
 * navigation controls. No outer chrome (logo / page title / tabs); the
 * caller wraps this with whatever surface it wants. Used by both the
 * inbox page (when viewMode === "calendar") and the legacy
 * /app/calendar route so the two paths share the same code.
 */

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
  parseISO,
} from "date-fns";
import { useTaskContext } from "@/contexts/TaskContext";
import { useToast } from "@/contexts/ToastContext";
import { expandRepeatingTasks, getRealTaskId } from "@/lib/expand-repeating-tasks";
import { useGCalEvents } from "@/hooks/useGCalEvents";
import { useCalendarModals } from "@/hooks/useCalendarModals";
import CalendarHeader, { type CalendarViewMode, type CalendarMode } from "@/components/calendar/CalendarHeader";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import CalendarWeekView from "@/components/calendar/CalendarWeekView";
import CalendarDayView from "@/components/calendar/CalendarDayView";
import AssignmentsWeekView from "@/components/calendar/AssignmentsWeekView";
import AssignmentsDayView from "@/components/calendar/AssignmentsDayView";
import TaskCreateModal from "@/components/tasks/TaskCreateModal";
import GCalEventCreateModal from "@/components/calendar/GCalEventCreateModal";
import CreateTypeToggle from "@/components/calendar/CreateTypeToggle";
import TaskPreviewPopover from "@/components/tasks/TaskPreviewPopover";
import DayOverflowPopover from "@/components/calendar/DayOverflowPopover";
import { usePendingInvites } from "@/hooks/usePendingInvites";
import { getEventDateKey } from "@/lib/gcal/event-utils";

const VIEW_MODE_KEY = "cal-view-mode";
const CAL_MODE_KEY = "cal-mode";

export default function CalendarPanel() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const calendarMode = "assignments" as CalendarMode;

  const { tasks, error, addTask, updateTask, deleteTask, toggleComplete } = useTaskContext();
  const { showToast } = useToast();
  const { invites: pendingInvites } = usePendingInvites();
  const [recentlyMovedTaskId, setRecentlyMovedTaskId] = useState<string | null>(null);

  const modals = useCalendarModals();
  const [clearPreviewSignal, setClearPreviewSignal] = useState(0);

  function closeCreateModal() {
    setClearPreviewSignal((n) => n + 1);
    modals.closeAddPopover();
  }

  const { timeMin, timeMax } = useMemo(() => {
    let rangeStart: Date;
    let rangeEnd: Date;
    if (viewMode === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      rangeStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      rangeEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    } else if (viewMode === "week") {
      rangeStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      rangeEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    } else {
      rangeStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      rangeEnd = new Date(rangeStart);
      rangeEnd.setDate(rangeEnd.getDate() + 1);
    }
    return { timeMin: rangeStart.toISOString(), timeMax: rangeEnd.toISOString() };
  }, [currentDate, viewMode]);

  const shouldFetchGcal = calendarMode === "calendar";
  const { events: gcalEvents, calendarColors, mutate: refetchEvents } = useGCalEvents(
    shouldFetchGcal ? timeMin : undefined,
    shouldFetchGcal ? timeMax : undefined,
  );

  const currentPreviewTask = modals.previewTask
    ? tasks.find((t) => t.id === getRealTaskId(modals.previewTask!.id)) ?? null
    : null;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_MODE_KEY) as CalendarViewMode | null;
      if (saved && ["month", "week", "day"].includes(saved)) setViewMode(saved);
      localStorage.removeItem(CAL_MODE_KEY);
    } catch { /* ignore */ }
  }, []);

  const handleViewModeChange = (mode: CalendarViewMode) => {
    setViewMode(mode);
    try { localStorage.setItem(VIEW_MODE_KEY, mode); } catch { /* ignore */ }
  };

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

  const navigate = (dir: 1 | -1) => {
    const fn = viewMode === "month" ? (dir === 1 ? addMonths : subMonths)
      : viewMode === "week" ? (dir === 1 ? addWeeks : subWeeks)
      : (dir === 1 ? addDays : subDays);
    setCurrentDate(fn(currentDate, 1));
  };

  const title = useMemo(() => {
    if (viewMode === "month") return format(currentDate, "MMMM yyyy");
    if (viewMode === "week") {
      const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
      const we = endOfWeek(currentDate, { weekStartsOn: 1 });
      const wm = format(ws, "MMMM"), em = format(we, "MMMM");
      return wm === em ? `${wm} ${format(we, "yyyy")}` : `${wm} – ${em} ${format(we, "yyyy")}`;
    }
    return format(currentDate, "EEEE, MMMM d, yyyy");
  }, [viewMode, currentDate]);

  return (
    <div className="flex flex-col flex-1 bg-background">
      {error && (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center shrink-0">
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90 transition-opacity"
          >
            Refresh
          </button>
        </div>
      )}

      <div className="px-10 py-2 md:px-20 md:pt-3 md:pb-3 shrink-0 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">{title}</h2>
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(-1)} className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm" aria-label="Previous">‹</button>
          <button onClick={() => setCurrentDate(new Date())} className="px-2.5 py-1 text-xs font-semibold text-foreground rounded-md border border-border hover:bg-accent transition-colors">Today</button>
          <button onClick={() => navigate(1)} className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm" aria-label="Next">›</button>
        </div>
      </div>

      {/* CalendarHeader kept off-screen to preserve its hooks/side effects */}
      <div className="hidden">
        <CalendarHeader
          currentMonth={currentDate}
          title={title}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onPrev={() => navigate(-1)}
          onNext={() => navigate(1)}
          onToday={() => setCurrentDate(new Date())}
          calendarMode={calendarMode}
          onCalendarsChange={refetchEvents}
          onAddClick={modals.handleAddClick}
        />
      </div>

      <div className="flex-1 flex flex-col mx-7 md:mx-[68px] mb-8 md:mb-12 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 bg-white dark:bg-[#141414] overflow-hidden">
        {viewMode === "month" ? (
          <CalendarGrid
            currentMonth={currentDate}
            tasks={visibleTasks}
            pendingInvites={pendingInvites}
            gcalEvents={calendarMode === "calendar" ? gcalEvents : []}
            calendarColors={calendarColors}
            calendarMode={calendarMode}
            addingDate={modals.addingDate}
            selectedDate={selectedDate}
            onDayClick={modals.handleDayClick}
            onDaySelect={setSelectedDate}
            onTaskClick={modals.handleTaskClick}
            onShowMore={modals.handleShowMore}
            activeTaskId={modals.previewTask?.id ?? null}
            recentlyMovedTaskId={recentlyMovedTaskId}
            onTaskDrop={(taskId, newDate) => {
              const moved = tasks.find((t) => t.id === taskId);
              if (!moved) return;
              const previousDueDate = moved.due_date;
              const previousLock = moved.due_date_manually_edited_at;
              void updateTask(taskId, { due_date: newDate });
              setRecentlyMovedTaskId(taskId);
              setTimeout(() => {
                setRecentlyMovedTaskId((id) => (id === taskId ? null : id));
              }, 600);
              const formattedDate = (() => {
                try { return format(parseISO(newDate), "EEE, MMM d"); }
                catch { return newDate; }
              })();
              const titlePreview = moved.title.length > 32 ? moved.title.slice(0, 32).trimEnd() + "…" : moved.title;
              showToast(`Moved “${titlePreview}” to ${formattedDate}`, {
                action: {
                  label: "Undo",
                  onClick: () => {
                    void updateTask(taskId, { due_date: previousDueDate, due_date_manually_edited_at: previousLock });
                  },
                },
              });
            }}
          />
        ) : viewMode === "week" ? (
          calendarMode === "assignments" ? (
            <AssignmentsWeekView
              currentDate={currentDate}
              tasks={visibleTasks}
              pendingInvites={pendingInvites}
              onDayClick={modals.handleDayClick}
              onTaskClick={modals.handleTaskClick}
              activeTaskId={modals.previewTask?.id ?? null}
            />
          ) : (
            <CalendarWeekView
              currentDate={currentDate}
              tasks={visibleTasks}
              pendingInvites={pendingInvites}
              gcalEvents={gcalEvents}
              calendarColors={calendarColors}
              addingDate={modals.addingDate}
              onDayClick={modals.handleDayClick}
              onTaskClick={modals.handleTaskClick}
              onEventCreate={modals.handleTimeGridCreate}
              clearPreviewSignal={clearPreviewSignal}
              activeTaskId={modals.previewTask?.id ?? null}
            />
          )
        ) : (
          calendarMode === "assignments" ? (
            <AssignmentsDayView
              currentDate={currentDate}
              tasks={visibleTasks}
              pendingInvites={pendingInvites}
              onAddClick={modals.handleDayClick}
              onTaskClick={modals.handleTaskClick}
              activeTaskId={modals.previewTask?.id ?? null}
            />
          ) : (
            <CalendarDayView
              currentDate={currentDate}
              tasks={visibleTasks}
              pendingInvites={pendingInvites}
              gcalEvents={gcalEvents}
              calendarColors={calendarColors}
              onAddClick={modals.handleDayClick}
              onTaskClick={modals.handleTaskClick}
              onEventCreate={modals.handleTimeGridCreate}
              clearPreviewSignal={clearPreviewSignal}
              activeTaskId={modals.previewTask?.id ?? null}
            />
          )
        )}
      </div>

      {modals.addingDate && (
        <>
          <TaskCreateModal
            open={calendarMode === "assignments" || modals.createType === "task"}
            keepMounted={calendarMode !== "assignments"}
            onClose={closeCreateModal}
            onAdd={(task) => { addTask(task); closeCreateModal(); }}
            defaultDate={modals.addingDate}
            defaultTime={modals.addingTime}
            createTypeToggle={
              calendarMode === "calendar"
                ? <CreateTypeToggle value={modals.createType} onChange={modals.switchCreateType} />
                : undefined
            }
          />
          {calendarMode === "calendar" && (
            <GCalEventCreateModal
              open={modals.createType === "event"}
              onClose={closeCreateModal}
              onCreated={() => { refetchEvents(); closeCreateModal(); }}
              defaultDate={modals.addingDate}
              defaultStartTime={modals.addingTime}
              defaultEndTime={modals.addingEndTime}
              createTypeToggle={<CreateTypeToggle value={modals.createType} onChange={modals.switchCreateType} />}
            />
          )}
        </>
      )}

      {currentPreviewTask && modals.previewRect && (
        <TaskPreviewPopover
          task={currentPreviewTask}
          anchorRect={modals.previewRect}
          onClose={modals.closePreview}
          onEdit={modals.handlePreviewEdit}
          onDelete={async (id) => { await deleteTask(id); modals.closePreview(); }}
          onToggle={toggleComplete}
        />
      )}

      <TaskCreateModal
        open={!!modals.editModalTask}
        onClose={modals.closeEditModal}
        onAdd={() => {}}
        editTask={modals.editModalTask}
        onSave={async (id, updates) => { await updateTask(id, updates); }}
        onDelete={async (id) => { await deleteTask(id); modals.closeEditModal(); }}
        onSaveColorForClass={async (courseName, color) => {
          const matching = tasks.filter(t => (t.course_name || "General") === courseName);
          for (const t of matching) await updateTask(t.id, { color });
        }}
      />

      {modals.overflowDate && modals.overflowRect && (
        <DayOverflowPopover
          date={modals.overflowDate}
          tasks={visibleTasks.filter((t) => t.due_date === modals.overflowDate)}
          pendingInvites={pendingInvites.filter((i) => i.taskDueDate === modals.overflowDate)}
          gcalEvents={calendarMode === "calendar" ? gcalEvents.filter((e) => getEventDateKey(e.start) === modals.overflowDate) : []}
          anchorRect={modals.overflowRect}
          onClose={modals.closeOverflow}
          onTaskClick={(task, rect) => { modals.handleTaskClick(task, rect); }}
        />
      )}
    </div>
  );
}
