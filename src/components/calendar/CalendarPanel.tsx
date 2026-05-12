"use client";

/**
 * Self-contained calendar body — month / week / day grids, modals, and
 * navigation controls. No outer chrome (logo / page title / tabs); the
 * caller wraps this with whatever surface it wants. Used by both the
 * inbox page (when viewMode === "calendar") and the legacy
 * /app/calendar route so the two paths share the same code.
 */

import { useState, useMemo, useEffect, useRef } from "react";
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
import { Check } from "lucide-react";

const VIEW_MODE_KEY = "cal-view-mode";
const CAL_MODE_KEY = "cal-mode";

/**
 * Mini Google Calendar logo (24x24 multi-color svg). Inline so the
 * Synced pill renders without pulling the full CalendarHeader.
 */
function GCalLogo({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 122.88 122.88" className="shrink-0">
      <polygon points="93.78,29.1 29.1,29.1 29.1,93.78 93.78,93.78" fill="#fff" />
      <polygon points="93.78,122.88 122.88,93.78 93.78,93.78" fill="#EA4335" />
      <polygon points="122.88,29.1 93.78,29.1 93.78,93.78 122.88,93.78" fill="#FBBC04" />
      <polygon points="93.78,93.78 29.1,93.78 29.1,122.88 93.78,122.88" fill="#34A853" />
      <path d="M0,93.78v19.4c0,5.36,4.34,9.7,9.7,9.7h19.4v-29.1H0z" fill="#188038" />
      <path d="M122.88,29.1V9.7c0-5.36-4.34-9.7-9.7-9.7h-19.4v29.1H122.88z" fill="#1967D2" />
      <path d="M93.78,0H9.7C4.34,0,0,4.34,0,9.7v84.08h29.1V29.1h64.67V0z" fill="#4285F4" />
    </svg>
  );
}

export default function CalendarPanel() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const calendarMode = "assignments" as CalendarMode;
  /** Google Calendar sync state. Seeded from localStorage cache for
   *  instant hydration; refetched in background and written back. */
  const initialGcal = (() => {
    if (typeof window === "undefined") return { connected: false, email: null as string | null, photoUrl: null as string | null };
    try {
      const raw = localStorage.getItem("gcal_status");
      if (!raw) return { connected: false, email: null, photoUrl: null };
      const p = JSON.parse(raw) as { connected?: boolean; email?: string | null; photoUrl?: string | null };
      return { connected: !!p.connected, email: p.email ?? null, photoUrl: p.photoUrl ?? null };
    } catch {
      return { connected: false, email: null, photoUrl: null };
    }
  })();
  const [gcalConnected, setGcalConnected] = useState(initialGcal.connected);
  const [gcalEmail, setGcalEmail] = useState<string | null>(initialGcal.email);
  const [gcalPhotoUrl, setGcalPhotoUrl] = useState<string | null>(initialGcal.photoUrl);
  const [showGcalPopover, setShowGcalPopover] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const gcalBtnRef = useRef<HTMLButtonElement>(null);
  const gcalPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/credentials").then(async (res) => {
      if (!res.ok || cancelled) return;
      try {
        const data = await res.json();
        if (cancelled) return;
        const connected = !!data.google_calendar_id;
        setGcalConnected(connected);
        setGcalEmail(data.google_email ?? null);
        setGcalPhotoUrl(data.google_photo_url ?? null);
        try {
          localStorage.setItem("gcal_status", JSON.stringify({
            connected,
            calendarId: data.google_calendar_id ?? null,
            email: data.google_email ?? null,
            photoUrl: data.google_photo_url ?? null,
          }));
        } catch { /* quota / private */ }
      } catch { /* non-critical */ }
    }).catch(() => { /* offline / non-critical */ });
    return () => { cancelled = true; };
  }, []);

  // Close popover on outside click
  useEffect(() => {
    if (!showGcalPopover) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        gcalBtnRef.current && !gcalBtnRef.current.contains(target) &&
        gcalPopoverRef.current && !gcalPopoverRef.current.contains(target)
      ) {
        setShowGcalPopover(false);
        setConfirmDisconnect(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showGcalPopover]);

  async function handleGcalDisconnect() {
    if (!confirmDisconnect) {
      setConfirmDisconnect(true);
      setTimeout(() => setConfirmDisconnect(false), 3000);
      return;
    }
    setConfirmDisconnect(false);
    setDisconnecting(true);
    try {
      const res = await fetch("/api/gcal/disconnect", { method: "POST" });
      if (res.ok) {
        setGcalConnected(false);
        setShowGcalPopover(false);
        try { localStorage.removeItem("gcal_status"); } catch { /* ignore */ }
        showToast("Google Calendar disconnected.");
      } else {
        showToast("Failed to disconnect. Please try again.");
      }
    } catch {
      showToast("Failed to disconnect. Please try again.");
    } finally {
      setDisconnecting(false);
    }
  }

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
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">{title}</h2>
          {gcalConnected && (
            <div className="relative">
              <button
                ref={gcalBtnRef}
                type="button"
                onClick={() => setShowGcalPopover((v) => !v)}
                className="hidden md:inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors cursor-pointer"
                aria-label="Google Calendar synced"
                title="Google Calendar synced"
              >
                <GCalLogo size={12} />
                <Check size={11} strokeWidth={2.75} />
              </button>
              {showGcalPopover && (
                <div
                  ref={gcalPopoverRef}
                  className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-neutral-800 border border-border rounded-xl shadow-xl dark:shadow-black/40 p-3.5 min-w-[240px] animate-in"
                >
                  {gcalEmail && (
                    <div className="flex items-center gap-2.5 mb-3">
                      {gcalPhotoUrl ? (
                        <img src={gcalPhotoUrl} alt="" width={28} height={28} className="rounded-full shrink-0" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#0e89d6] flex items-center justify-center text-white text-xs font-medium shrink-0">
                          {gcalEmail[0].toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs text-foreground font-medium truncate flex-1">{gcalEmail}</span>
                      <Check size={14} className="text-emerald-500 shrink-0" />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mb-3">Viewing events from Google Calendar.</p>
                  <button
                    onClick={handleGcalDisconnect}
                    disabled={disconnecting}
                    className={`w-full px-3 py-2 text-xs font-medium rounded-lg transition-all disabled:opacity-60 ${
                      confirmDisconnect
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "text-foreground border border-border hover:bg-accent"
                    }`}
                  >
                    {disconnecting ? "Disconnecting…" : confirmDisconnect ? "Click to confirm disconnect" : "Disconnect Google Calendar"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
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
