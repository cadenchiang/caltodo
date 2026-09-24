"use client";

import type { Task, PendingInvite, GCalEvent } from "@/lib/types";
import type { useCalendarModals } from "@/hooks/useCalendarModals";
import type { CalendarViewMode, CalendarMode } from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import CalendarWeekView from "./CalendarWeekView";
import CalendarDayView from "./CalendarDayView";
import AssignmentsWeekView from "./AssignmentsWeekView";
import AssignmentsDayView from "./AssignmentsDayView";

interface CalendarViewsProps {
  viewMode: CalendarViewMode;
  calendarMode: CalendarMode;
  currentDate: Date;
  tasks: Task[];
  pendingInvites: PendingInvite[];
  gcalEvents: GCalEvent[];
  calendarColors: Record<string, string>;
  selectedDate: string | null;
  onDaySelect: (date: string) => void;
  modals: ReturnType<typeof useCalendarModals>;
  clearPreviewSignal: number;
  recentlyMovedTaskId: string | null;
  onTaskDrop: (taskId: string, newDate: string) => void | Promise<void>;
}

/**
 * Picks the month, week or day view for the current mode. The "calendar"
 * branches (Google Calendar overlay with a time grid) are kept but never
 * mount while CalendarPanel hardcodes assignments mode.
 */
export default function CalendarViews({
  viewMode, calendarMode, currentDate, tasks, pendingInvites, gcalEvents, calendarColors,
  selectedDate, onDaySelect, modals, clearPreviewSignal, recentlyMovedTaskId, onTaskDrop,
}: CalendarViewsProps) {
  const activeTaskId = modals.previewTask?.id ?? null;
  const isOverlay = calendarMode === "calendar";

  if (viewMode === "month") {
    return (
      <CalendarGrid
        currentMonth={currentDate}
        tasks={tasks}
        pendingInvites={pendingInvites}
        gcalEvents={isOverlay ? gcalEvents : []}
        calendarColors={calendarColors}
        calendarMode={calendarMode}
        addingDate={modals.addingDate}
        selectedDate={selectedDate}
        onDayClick={modals.handleDayClick}
        onDaySelect={onDaySelect}
        onTaskClick={modals.handleTaskClick}
        onShowMore={modals.handleShowMore}
        activeTaskId={activeTaskId}
        recentlyMovedTaskId={recentlyMovedTaskId}
        onTaskDrop={onTaskDrop}
      />
    );
  }

  if (viewMode === "week") {
    return isOverlay ? (
      <CalendarWeekView
        currentDate={currentDate}
        tasks={tasks}
        pendingInvites={pendingInvites}
        gcalEvents={gcalEvents}
        calendarColors={calendarColors}
        addingDate={modals.addingDate}
        onDayClick={modals.handleDayClick}
        onTaskClick={modals.handleTaskClick}
        onEventCreate={modals.handleTimeGridCreate}
        clearPreviewSignal={clearPreviewSignal}
        activeTaskId={activeTaskId}
      />
    ) : (
      <AssignmentsWeekView
        currentDate={currentDate}
        tasks={tasks}
        pendingInvites={pendingInvites}
        onDayClick={modals.handleDayClick}
        onTaskClick={modals.handleTaskClick}
        activeTaskId={activeTaskId}
      />
    );
  }

  return isOverlay ? (
    <CalendarDayView
      currentDate={currentDate}
      tasks={tasks}
      pendingInvites={pendingInvites}
      gcalEvents={gcalEvents}
      calendarColors={calendarColors}
      onAddClick={modals.handleDayClick}
      onTaskClick={modals.handleTaskClick}
      onEventCreate={modals.handleTimeGridCreate}
      clearPreviewSignal={clearPreviewSignal}
      activeTaskId={activeTaskId}
    />
  ) : (
    <AssignmentsDayView
      currentDate={currentDate}
      tasks={tasks}
      pendingInvites={pendingInvites}
      onAddClick={modals.handleDayClick}
      onTaskClick={modals.handleTaskClick}
      activeTaskId={activeTaskId}
    />
  );
}
