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
import { useToast } from "@/contexts/ToastContext";
import { parseISO } from "date-fns";
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
import PageTransition from "@/components/ui/PageTransition";
import GCalAnnouncementModal from "@/components/ui/GCalAnnouncementModal";
import type { PendingInvite, GCalEvent } from "@/lib/types";
import { usePendingInvites } from "@/hooks/usePendingInvites";
import { getEventDateKey } from "@/lib/gcal/event-utils";

const VIEW_MODE_KEY = "cal-view-mode";
const CAL_MODE_KEY = "cal-mode";

/** Calendar page with Month, Week, and Day views. */
export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // Calendar mode is locked to "assignments" — the GCal-events view + its
  // toggle were removed per product decision; only assignments are shown.
  // Typed as the open union (rather than the literal) so existing
  // calendarMode === "calendar" branches still compile as dead code.
  const calendarMode = "assignments" as CalendarMode;

  const { tasks, error, addTask, updateTask, deleteTask, toggleComplete } = useTaskContext();
  const { showToast } = useToast();
  const { invites: pendingInvites, setInvites: setPendingInvites } = usePendingInvites();
  /** ID of a task that was just dragged to a new day, used to play a brief
   *  fade-in animation on the destination cell. Cleared after the animation. */
  const [recentlyMovedTaskId, setRecentlyMovedTaskId] = useState<string | null>(null);

  const modals = useCalendarModals();
  const [clearPreviewSignal, setClearPreviewSignal] = useState(0);

  /** Closes the create modal and triggers the preview block exit animation. */
  function closeCreateModal() {
    setClearPreviewSignal((n) => n + 1);
    modals.closeAddPopover();
  }

  // Compute date range for GCal events
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

    return {
      timeMin: rangeStart.toISOString(),
      timeMax: rangeEnd.toISOString(),
    };
  }, [currentDate, viewMode]);

  // Only fetch GCal events when the Calendar mode is actually visible — the
  // Assignments mode never renders them, so fetching was burning a ~300ms
  // round-trip on every load and mode switch. Switching *into* calendar mode
  // triggers the fetch (SWR cache keeps subsequent switches instant).
  const shouldFetchGcal = calendarMode === "calendar";
  const { events: gcalEvents, calendarColors, mutate: refetchEvents } = useGCalEvents(
    shouldFetchGcal ? timeMin : undefined,
    shouldFetchGcal ? timeMax : undefined,
  );

  /** Derive fresh task data from context so toggles reflect immediately. */
  const currentPreviewTask = modals.previewTask
    ? tasks.find((t) => t.id === getRealTaskId(modals.previewTask!.id)) ?? null
    : null;

  // Pending invites come from the shared SWR hook now.

  // Restore persisted view mode and calendar mode
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_MODE_KEY) as CalendarViewMode | null;
      if (saved && ["month", "week", "day"].includes(saved)) setViewMode(saved);
      // Forget any prior calendar-mode preference now that the toggle is
      // gone — keeps stale "calendar" values from making the page render
      // with the dead GCal-events view if the constant is ever re-introduced.
      localStorage.removeItem(CAL_MODE_KEY);
    } catch { /* ignore */ }
  }, []);

  const handleViewModeChange = (mode: CalendarViewMode) => { setViewMode(mode); try { localStorage.setItem(VIEW_MODE_KEY, mode); } catch {} };

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
    <PageTransition>
      <div className="h-full flex flex-col overflow-hidden -m-4 -mb-16 md:-m-10 md:-mb-10 bg-background">
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

        <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-background">
          <div className="px-2.5 py-2 md:px-4 md:py-3 shrink-0 animate-stagger stagger-1">
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

          <div className="flex-1 min-h-0 flex flex-col overflow-y-auto md:mx-4 md:rounded-2xl md:border md:border-gray-200/80 md:dark:border-gray-700/50 md:overflow-hidden bg-white dark:bg-[#141414] animate-stagger stagger-2">
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
                  // Manual drag-drop reschedule. updateTask auto-stamps
                  // due_date_manually_edited_at so the next sync from
                  // Gradescope/Canvas/etc. won't overwrite this change.
                  const moved = tasks.find((t) => t.id === taskId);
                  if (!moved) return;
                  const previousDueDate = moved.due_date;
                  const previousLock = moved.due_date_manually_edited_at;
                  void updateTask(taskId, { due_date: newDate });

                  // Trigger the destination drop-in animation.
                  setRecentlyMovedTaskId(taskId);
                  setTimeout(() => {
                    setRecentlyMovedTaskId((id) => (id === taskId ? null : id));
                  }, 600);

                  // Toast confirmation with Undo. Undo passes both the old
                  // due_date and the old manual-edit lock so the prior state
                  // is restored exactly (TaskContext.updateTask honors an
                  // explicitly-supplied due_date_manually_edited_at).
                  const formattedDate = (() => {
                    try {
                      return format(parseISO(newDate), "EEE, MMM d");
                    } catch {
                      return newDate;
                    }
                  })();
                  const titlePreview =
                    moved.title.length > 32 ? moved.title.slice(0, 32).trimEnd() + "…" : moved.title;
                  showToast(`Moved “${titlePreview}” to ${formattedDate}`, {
                    action: {
                      label: "Undo",
                      onClick: () => {
                        void updateTask(taskId, {
                          due_date: previousDueDate,
                          due_date_manually_edited_at: previousLock,
                        });
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
        </div>

        {/* Unified creation modal: both always mounted when addingDate set, toggled via display */}
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
                createTypeToggle={
                  <CreateTypeToggle value={modals.createType} onChange={modals.switchCreateType} />
                }
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
            onDelete={async (id) => {
              await deleteTask(id);
              modals.closePreview();
            }}
            onToggle={toggleComplete}
          />
        )}

        <TaskCreateModal
          open={!!modals.editModalTask}
          onClose={modals.closeEditModal}
          onAdd={() => {}}
          editTask={modals.editModalTask}
          onSave={async (id, updates) => {
            await updateTask(id, updates);
          }}
          onDelete={async (id) => {
            await deleteTask(id);
            modals.closeEditModal();
          }}
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
        <GCalAnnouncementModal />
      </div>
    </PageTransition>
  );
}
