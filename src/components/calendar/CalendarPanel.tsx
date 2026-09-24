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
import { AlertCircle } from "lucide-react";
import { useWeekStart } from "@/hooks/useWeekStart";
import { useTaskContext } from "@/contexts/TaskContext";
import { useUndo } from "@/contexts/UndoContext";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
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

/**
 * Reads the saved calendar view before the first render so the skeleton and
 * the first paint already show the user's view (no month-then-week flip).
 *
 * @returns The saved view, or "month"
 */
function readSavedViewMode(): CalendarViewMode {
  if (typeof window === "undefined") return "month";
  try {
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    if (saved === "month" || saved === "week" || saved === "day") return saved;
  } catch { /* localStorage unavailable */ }
  return "month";
}

export default function CalendarPanel() {
  const weekStart = useWeekStart();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>(readSavedViewMode);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // Hardcoded on purpose: the Google Calendar overlay mode ("calendar",
  // with the time grid, event popovers and event create modal) never
  // mounts. The tree is kept so it can be switched back on, but no header
  // copy may promise it. See caltodo-ux-audit-2026-09-23.md, section 4.
  const calendarMode = "assignments" as CalendarMode;
  const { tasks, error, addTask, updateTask, deleteTask, toggleComplete, fetchTasks, recolorTasks } = useTaskContext();
  const { pushUndo } = useUndo();
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
      rangeStart = startOfWeek(monthStart, { weekStartsOn: weekStart });
      rangeEnd = endOfWeek(monthEnd, { weekStartsOn: weekStart });
    } else if (viewMode === "week") {
      rangeStart = startOfWeek(currentDate, { weekStartsOn: weekStart });
      rangeEnd = endOfWeek(currentDate, { weekStartsOn: weekStart });
    } else {
      rangeStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      rangeEnd = new Date(rangeStart);
      rangeEnd.setDate(rangeEnd.getDate() + 1);
    }
    return { timeMin: rangeStart.toISOString(), timeMax: rangeEnd.toISOString() };
  }, [currentDate, viewMode, weekStart]);

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
      rangeStart = format(startOfWeek(monthStart, { weekStartsOn: weekStart }), "yyyy-MM-dd");
      rangeEnd = format(endOfWeek(monthEnd, { weekStartsOn: weekStart }), "yyyy-MM-dd");
    } else if (viewMode === "week") {
      rangeStart = format(startOfWeek(currentDate, { weekStartsOn: weekStart }), "yyyy-MM-dd");
      rangeEnd = format(endOfWeek(currentDate, { weekStartsOn: weekStart }), "yyyy-MM-dd");
    } else {
      rangeStart = format(currentDate, "yyyy-MM-dd");
      rangeEnd = rangeStart;
    }
    const expanded = expandRepeatingTasks(tasks, rangeStart, rangeEnd);
    return expanded.filter((t) => t.due_date && t.due_date >= rangeStart && t.due_date <= rangeEnd);
  }, [tasks, currentDate, viewMode, weekStart]);

  const navigate = (dir: 1 | -1) => {
    const fn = viewMode === "month" ? (dir === 1 ? addMonths : subMonths)
      : viewMode === "week" ? (dir === 1 ? addWeeks : subWeeks)
      : (dir === 1 ? addDays : subDays);
    setCurrentDate(fn(currentDate, 1));
  };

  const title = useMemo(() => {
    if (viewMode === "month") return format(currentDate, "MMMM yyyy");
    if (viewMode === "week") {
      const ws = startOfWeek(currentDate, { weekStartsOn: weekStart });
      const we = endOfWeek(currentDate, { weekStartsOn: weekStart });
      const wm = format(ws, "MMMM"), em = format(we, "MMMM");
      return wm === em ? `${wm} ${format(we, "yyyy")}` : `${wm} – ${em} ${format(we, "yyyy")}`;
    }
    return format(currentDate, "EEEE, MMMM d, yyyy");
  }, [viewMode, currentDate, weekStart]);

  return (
    <div className="flex flex-col flex-1 bg-background">
      {error && (
        <EmptyState
          icon={<AlertCircle size={20} />}
          title={error}
          description="Check your connection and try again."
          action={<Button variant="inverted" onClick={() => fetchTasks()}>Try again</Button>}
          className="shrink-0"
        />
      )}

      <div className="px-4 md:px-8 pt-4 md:pt-5 pb-3 shrink-0">
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

      <div className="flex-1 flex flex-col mx-4 md:mx-8 rounded-2xl border border-border bg-card overflow-hidden min-h-0">
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
            onTaskDrop={async (taskId, newDate) => {
              const moved = tasks.find((t) => t.id === taskId);
              if (!moved) return;
              const previousDueDate = moved.due_date;
              const previousLock = moved.due_date_manually_edited_at;
              // The write is awaited and announced once, through the undo
              // stack (announce: false on the calendar's own write), so a
              // failed drop shows only TaskContext's error toast and a
              // successful one gets a single toast whose Undo is also Cmd+Z.
              const written = await updateTask(taskId, { due_date: newDate }, { announce: false });
              if (!written) return;
              setRecentlyMovedTaskId(taskId);
              setTimeout(() => setRecentlyMovedTaskId((id) => (id === taskId ? null : id)), 600);
              const formattedDate = (() => {
                try { return format(parseISO(newDate), "EEE, MMM d"); }
                catch { return newDate; }
              })();
              const titlePreview = moved.title.length > 32 ? moved.title.slice(0, 32).trimEnd() + "..." : moved.title;
              pushUndo({
                label: `Moved "${titlePreview}" to ${formattedDate}`,
                undo: async () => {
                  await updateTask(taskId, { due_date: previousDueDate, due_date_manually_edited_at: previousLock }, { announce: false });
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
            onAdd={(task) => { closeCreateModal(); return addTask(task); }}
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
        onSaveColorForClass={(courseName, color) => {
          const ids = tasks.filter((t) => (t.course_name || "General") === courseName).map((t) => t.id);
          return recolorTasks(ids, color);
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
          onAdd={modals.handleDayClick}
          activeTaskId={modals.previewTask?.id ?? null}
        />
      )}
    </div>
  );
}
