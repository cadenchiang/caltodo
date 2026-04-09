"use client";

import { useState, useEffect, useRef } from "react";
import { format, isSameDay, isSameMonth, isBefore, startOfDay } from "date-fns";
import type { Task, PendingInvite, GCalEvent } from "@/lib/types";
import { getThemeColor } from "@/lib/constants";
import { getEventColor } from "@/lib/gcal/event-utils";
import { pendingInviteToPseudoTask } from "@/lib/pending-invite-helpers";
import { useTheme } from "@/contexts/ThemeContext";
import CalendarTaskBar from "./CalendarTaskBar";
import CalendarGCalItem from "./CalendarGCalItem";

interface CalendarDayCellProps {
  day: Date;
  currentMonth: Date;
  tasks: Task[];
  pendingInvites?: PendingInvite[];
  gcalEvents?: GCalEvent[];
  /** Map of calendarId → backgroundColor from Google. */
  calendarColors?: Record<string, string>;
  addingDate?: string | null;
  isLastCol?: boolean;
  isSelected?: boolean;
  /** Weekday label shown inside the cell for first-row cells (e.g. "Mon"). */
  weekdayLabel?: string;
  onDayClick: (date: string, rect: DOMRect) => void;
  onDaySelect: (date: string) => void;
  onTaskClick: (task: Task, rect: DOMRect) => void;
  onShowMore?: (date: string, rect: DOMRect) => void;
  /** When true, hides events and uses bigger task bars. */
  assignmentsMode?: boolean;
  /** ID of the task whose popover is currently open (stays highlighted). */
  activeTaskId?: string | null;
  /** ID of a task just dropped — its bar plays a brief drop-in animation. */
  recentlyMovedTaskId?: string | null;
  /** Called when a task is dropped on this cell (drag-and-drop reschedule). */
  onTaskDrop?: (taskId: string, newDate: string) => void;
}

/** Approximate heights in px for layout calculations. */
const HEADER_HEIGHT = 22;
const HEADER_HEIGHT_WITH_LABEL = 34;
const ITEM_HEIGHT = 17;
const ITEM_HEIGHT_LARGE = 22;
const MORE_LINE_HEIGHT = 14;

/**
 * A single day cell in the month grid. Double-click to add a task.
 * Dynamically measures available height to show as many items as fit,
 * with a "+N more" button that opens an overflow popover.
 *
 * @param day - The date this cell represents
 * @param currentMonth - The currently displayed month
 * @param tasks - Tasks assigned to this day
 * @param gcalEvents - Google Calendar events for this day
 * @param onDayClick - Callback when double-clicked
 * @param onTaskClick - Callback when a task is clicked
 * @param onShowMore - Callback when "+N more" is clicked
 */
export default function CalendarDayCell({
  day,
  currentMonth,
  tasks,
  pendingInvites = [],
  gcalEvents = [],
  calendarColors = {},
  addingDate,
  isLastCol,
  isSelected,
  weekdayLabel,
  onDayClick,
  onDaySelect,
  onTaskClick,
  onShowMore,
  assignmentsMode = false,
  activeTaskId,
  recentlyMovedTaskId,
  onTaskDrop,
}: CalendarDayCellProps) {
  const { colorTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isToday = isSameDay(day, new Date());
  const isPast = isBefore(day, startOfDay(new Date())) && !isToday;
  const dateStr = format(day, "yyyy-MM-dd");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const headerH = weekdayLabel ? HEADER_HEIGHT_WITH_LABEL : HEADER_HEIGHT;

  // Dynamically compute how many items fit in the cell.
  // Start with Infinity (show all) so there's no reflow flash — the ResizeObserver
  // fires within the same frame and constrains to the actual available space.
  const [maxItems, setMaxItems] = useState(Infinity);

  useEffect(() => {
    const el = cellRef.current;
    if (!el || isMobile) return;
    const itemH = assignmentsMode ? ITEM_HEIGHT_LARGE : ITEM_HEIGHT;
    const observer = new ResizeObserver(([entry]) => {
      const h = entry.contentBoxSize[0].blockSize;
      const available = h - headerH - MORE_LINE_HEIGHT;
      setMaxItems(Math.max(1, Math.floor(available / itemH)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile, headerH, assignmentsMode]);

  const effectiveEvents = assignmentsMode ? [] : gcalEvents;
  const totalItems = tasks.length + pendingInvites.length + effectiveEvents.length;
  const hasOverflow = totalItems > maxItems;

  // Distribute maxItems slots: tasks first, then invites, then events
  const slotsForItems = hasOverflow ? maxItems : totalItems;
  const taskSlots = Math.min(tasks.length, slotsForItems);
  const inviteSlots = Math.min(pendingInvites.length, slotsForItems - taskSlots);
  const eventSlots = Math.min(effectiveEvents.length, slotsForItems - taskSlots - inviteSlots);
  const visibleTasks = tasks.slice(0, taskSlots);
  const visibleInvites = pendingInvites.slice(0, inviteSlots);
  const visibleEvents = effectiveEvents.slice(0, eventSlots);
  const overflow = totalItems - taskSlots - inviteSlots - eventSlots;

  /** Max colored dots to show on mobile before "+N". */
  const maxDots = 4;
  const dotTasks = tasks.slice(0, maxDots);
  const dotOverflow = tasks.length + effectiveEvents.length - maxDots;

  /**
   * Drag-over handler — prevents default to mark the cell as a valid drop
   * target and shows a highlight ring. Only active when onTaskDrop is wired.
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!onTaskDrop) return;
    if (!e.dataTransfer.types.includes("application/x-caltodo-task-id")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!isDragOver) setIsDragOver(true);
  };

  /** Clear highlight when the dragged task leaves this cell. */
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // relatedTarget can be null when leaving the window — always clear.
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsDragOver(false);
    }
  };

  /**
   * Drop handler — resolves the dragged task id and asks the parent to
   * reschedule it to this cell's date. Skips updates when the date is
   * unchanged so we don't spam the network or stamp manual-edit columns.
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!onTaskDrop) return;
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData("application/x-caltodo-task-id");
    if (!taskId) return;
    const dragged = tasks.find((t) => t.id === taskId);
    if (dragged && dragged.due_date === dateStr) return;
    onTaskDrop(taskId, dateStr);
  };

  return (
    <div
      ref={cellRef}
      className={`p-0.5 md:px-1 md:py-0.5 overflow-hidden ${isLastCol ? "" : "border-r"} border-b border-gray-200 dark:border-gray-700/50 transition-all duration-150 ease-out relative ${
        isPast
          ? "bg-gray-100 dark:bg-black/30"
          : !isCurrentMonth
            ? "bg-gray-50 dark:bg-black/15"
            : isSelected && isMobile
              ? "bg-gray-100 dark:bg-white/5"
              : "bg-card"
      } hover:bg-black/[0.02] dark:hover:bg-white/[0.03] ${
        isDragOver ? "ring-2 ring-inset ring-[#007AFF]/70 bg-[#007AFF]/5 dark:bg-[#007AFF]/10" : ""
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => onDaySelect(dateStr)}
      onDoubleClick={(e) => {
        const rect = new DOMRect(e.clientX - 40, e.clientY, 80, 1);
        onDayClick(dateStr, rect);
      }}
    >
      {/* Mobile: centered day number + dots below */}
      {isMobile ? (
        <div className="flex flex-col items-center justify-start h-full pt-1 gap-1">
          <span
            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs leading-none transition-all duration-200 ease-out ${
              isToday
                ? "bg-[#007AFF] text-white font-bold"
                : isSelected
                  ? "bg-gray-800 dark:bg-white text-white dark:text-gray-900 font-bold"
                  : isCurrentMonth
                    ? "bg-transparent text-foreground font-medium"
                    : "bg-transparent text-muted-foreground/60"
            }`}
          >
            {format(day, "d")}
          </span>
          {(tasks.length > 0 || gcalEvents.length > 0 || pendingInvites.length > 0) && (
            <div className="flex items-center justify-center gap-[3px] flex-wrap max-w-[40px]">
              {dotTasks.map((task) => (
                <span
                  key={task.id}
                  className={`w-[7px] h-[7px] rounded-full shrink-0 ${task.is_completed ? "opacity-60" : ""}`}
                  style={{ backgroundColor: getThemeColor(task.color, colorTheme) }}
                />
              ))}
              {effectiveEvents.slice(0, Math.max(0, maxDots - tasks.length)).map((event) => (
                <span
                  key={event.id}
                  className="w-[7px] h-[7px] rounded-full shrink-0"
                  style={{
                    backgroundColor: "transparent",
                    border: `1.5px solid ${getEventColor(event.colorId, undefined, undefined, colorTheme)}`,
                  }}
                />
              ))}
              {pendingInvites.map((invite) => (
                <span
                  key={invite.shareId}
                  className="w-[7px] h-[7px] rounded-full shrink-0 opacity-40"
                  style={{
                    backgroundColor: "transparent",
                    border: `1px dashed ${getThemeColor(invite.taskColor, colorTheme)}`,
                  }}
                />
              ))}
              {dotOverflow > 0 && (
                <span className="text-[8px] text-muted-foreground leading-none">+{dotOverflow}</span>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Desktop: optional weekday label + centered day number + add button */}
          {weekdayLabel && (
            <div className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide leading-none pt-0.5 pb-px">
              {weekdayLabel}
            </div>
          )}
          <div className="flex items-center justify-center relative mb-0.5">
            <span
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] leading-none transition-all duration-200 ease-out ${
                isToday
                  ? "bg-[#007AFF] text-white font-bold"
                  : isSelected
                    ? "bg-gray-800 dark:bg-white text-white dark:text-gray-900 font-bold"
                    : isCurrentMonth
                      ? "bg-transparent text-foreground font-medium"
                      : "bg-transparent text-muted-foreground/60"
              }`}
            >
              {format(day, "d")}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                onDayClick(dateStr, new DOMRect(rect.left, rect.bottom + 4, rect.width, 1));
              }}
              className={`absolute right-0 w-4 h-4 rounded-full items-center justify-center text-muted-foreground hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-foreground transition-all flex ${
                hovered && !addingDate ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          {addingDate === dateStr && (
            <div className="bg-blue-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded truncate mb-0.5">
              (No title)
            </div>
          )}

          {/* Task bars + GCal events */}
          <div className="flex flex-col gap-px">
            {visibleTasks.map((task) => (
              <CalendarTaskBar
                key={task.id}
                task={task}
                onClick={onTaskClick}
                compact={!assignmentsMode}
                isActive={task.id === activeTaskId}
                justDropped={task.id === recentlyMovedTaskId}
              />
            ))}
            {visibleInvites.map((invite) => (
              <CalendarTaskBar
                key={invite.shareId}
                task={pendingInviteToPseudoTask(invite)}
                onClick={() => {}}
                isPending
                compact={!assignmentsMode}
              />
            ))}
            <div className={isPast ? "opacity-40" : ""}>
              {visibleEvents.map((event) => (
                <CalendarGCalItem key={event.id} event={event} calendarColor={calendarColors[event.calendarId ?? ""]} />
              ))}
            </div>
            {overflow > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onShowMore && cellRef.current) {
                    onShowMore(dateStr, cellRef.current.getBoundingClientRect());
                  }
                }}
                className={`text-[10px] font-semibold hover:underline px-0.5 text-left transition-all -mt-0.5 ${isPast ? "text-foreground/40" : "text-foreground"}`}
              >
                {overflow} more
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
