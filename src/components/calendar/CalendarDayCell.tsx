"use client";

import { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { format, isSameDay, isSameMonth, isBefore, startOfDay } from "date-fns";
import type { Task, PendingInvite, GCalEvent } from "@/lib/types";
import { getThemeColor } from "@/lib/constants";
import { getEventColor } from "@/lib/gcal/event-utils";
import { pendingInviteToPseudoTask } from "@/lib/pending-invite-helpers";
import { useTheme } from "@/contexts/ThemeContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import CalendarTaskBar, { TASK_DRAG_TYPE } from "./CalendarTaskBar";
import CalendarGCalItem from "./CalendarGCalItem";

interface CalendarDayCellProps {
  day: Date;
  currentMonth: Date;
  tasks: Task[];
  pendingInvites?: PendingInvite[];
  gcalEvents?: GCalEvent[];
  /** Map of calendarId to backgroundColor from Google. */
  calendarColors?: Record<string, string>;
  addingDate?: string | null;
  isLastCol?: boolean;
  isSelected?: boolean;
  /** Weekday label shown inside the cell for first-row cells (e.g. "Mon"). */
  weekdayLabel?: string;
  onDayClick: (date: string, rect: DOMRect) => void;
  onDaySelect: (date: string) => void;
  onTaskClick: (task: Task, rect: DOMRect) => void;
  /** Opens the day's full list (the "N more" button, and a tap on phones). */
  onShowMore?: (date: string, rect: DOMRect) => void;
  /** When true, hides events and uses bigger task bars. */
  assignmentsMode?: boolean;
  /** ID of the task whose popover is currently open (stays highlighted). */
  activeTaskId?: string | null;
  /** ID of a task just dropped; its bar plays a brief drop-in animation. */
  recentlyMovedTaskId?: string | null;
  /** Called when a task is dropped on this cell (drag-and-drop reschedule). */
  onTaskDrop?: (taskId: string, newDate: string) => void;
}

/** Heights in px used to derive how many bars fit in the measured cell. */
const HEADER_HEIGHT = 24;
const HEADER_HEIGHT_WITH_LABEL = 38;
/** Bar height plus the 1px gap between bars (compact and large). */
const ITEM_HEIGHT_COMPACT = 17;
const ITEM_HEIGHT_LARGE = 23;
const MORE_LINE_HEIGHT = 16;
/** Vertical padding of the cell (py-0.5 top and bottom). */
const CELL_PADDING = 4;

/**
 * How many bars fit in a cell of the given height, leaving room for the
 * "N more" line whenever anything would be hidden.
 *
 * @param cellHeight - Measured cell height in px
 * @param headerHeight - Height of the date number row (plus weekday label)
 * @param itemHeight - Bar height including its gap
 * @param totalItems - Bars the day has
 * @returns Number of bars to render (at least 1 when there is anything)
 */
export function computeVisibleItems(cellHeight: number, headerHeight: number, itemHeight: number, totalItems: number): number {
  if (totalItems === 0) return 0;
  const available = cellHeight - headerHeight - CELL_PADDING;
  const fitsAll = Math.floor(available / itemHeight);
  if (fitsAll >= totalItems) return totalItems;
  const withMore = Math.floor((available - MORE_LINE_HEIGHT) / itemHeight);
  return Math.max(1, Math.min(withMore, totalItems - 1));
}

/**
 * A single day cell in the month grid. The number of bars is derived from
 * the measured cell height (ResizeObserver) so the "N more" button is never
 * clipped. On phones the cell shows dots and a tap opens the day sheet.
 *
 * @param day - The date this cell represents
 * @param tasks - Tasks assigned to this day
 * @param onDayClick - Adds a task on this day (double-click, the + button)
 * @param onShowMore - Opens the day's full list
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
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [isDragOver, setIsDragOver] = useState(false);
  const [cellHeight, setCellHeight] = useState(0);
  const cellRef = useRef<HTMLDivElement>(null);
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isToday = isSameDay(day, new Date());
  const isPast = isBefore(day, startOfDay(new Date())) && !isToday;
  const dateStr = format(day, "yyyy-MM-dd");

  // One observer per cell: the grid rows are 1fr, so the cell height is
  // only known after layout and changes with the viewport.
  useEffect(() => {
    const el = cellRef.current;
    if (!el || isMobile) return;
    const ro = new ResizeObserver(([entry]) => setCellHeight(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMobile]);

  const headerH = weekdayLabel ? HEADER_HEIGHT_WITH_LABEL : HEADER_HEIGHT;
  const itemH = assignmentsMode ? ITEM_HEIGHT_LARGE : ITEM_HEIGHT_COMPACT;
  const effectiveEvents = assignmentsMode ? [] : gcalEvents;
  const totalItems = tasks.length + pendingInvites.length + effectiveEvents.length;
  // Before the first measurement, show a conservative budget so the first
  // paint never overflows.
  const maxItems = cellHeight > 0 ? computeVisibleItems(cellHeight, headerH, itemH, totalItems) : Math.min(totalItems, 2);

  // Distribute slots: tasks first, then invites, then events.
  const taskSlots = Math.min(tasks.length, maxItems);
  const inviteSlots = Math.min(pendingInvites.length, maxItems - taskSlots);
  const eventSlots = Math.min(effectiveEvents.length, maxItems - taskSlots - inviteSlots);
  const overflow = totalItems - taskSlots - inviteSlots - eventSlots;

  /** Max coloured dots to show on mobile before "+N". */
  const maxDots = 4;
  const dotOverflow = tasks.length + effectiveEvents.length - maxDots;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!onTaskDrop || !e.dataTransfer.types.includes(TASK_DRAG_TYPE)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsDragOver(false);
  };

  /** Reschedules the dragged task to this day, skipping no-op drops. */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!onTaskDrop) return;
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData(TASK_DRAG_TYPE);
    if (!taskId) return;
    const dragged = tasks.find((t) => t.id === taskId);
    if (dragged && dragged.due_date === dateStr) return;
    onTaskDrop(taskId, dateStr);
  };

  /** Opens the day sheet on phones; selects the day on desktop. */
  function handleCellClick() {
    onDaySelect(dateStr);
    if (isMobile && onShowMore && cellRef.current) onShowMore(dateStr, cellRef.current.getBoundingClientRect());
  }

  const dayNumberClass = isToday
    ? "bg-blue-500 text-white font-bold"
    : isSelected
      ? "bg-foreground text-background font-bold"
      : isCurrentMonth
        ? "bg-transparent text-foreground font-medium"
        : "bg-transparent text-muted-foreground/60";

  return (
    <div
      ref={cellRef}
      role={isMobile ? "button" : undefined}
      tabIndex={isMobile ? 0 : undefined}
      aria-label={isMobile ? `${format(day, "EEEE, MMMM d")}, ${totalItems} ${totalItems === 1 ? "item" : "items"}` : undefined}
      className={`group p-0.5 md:px-1 md:py-0.5 overflow-hidden ${isLastCol ? "" : "border-r"} border-b border-border transition-colors duration-150 ease-out relative ${
        isPast ? "bg-[var(--sidebar-bg)] dark:bg-black/30" : isSelected && isMobile ? "bg-muted" : "bg-card"
      } hover:bg-foreground/[0.02] ${isDragOver ? "ring-2 ring-inset ring-blue-500/70 bg-blue-500/5" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleCellClick}
      onKeyDown={isMobile ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCellClick(); } } : undefined}
      onDoubleClick={(e) => {
        if (isMobile) return;
        onDayClick(dateStr, new DOMRect(e.clientX - 40, e.clientY, 80, 1));
      }}
    >
      {isMobile ? (
        <div className="flex flex-col items-center justify-start h-full pt-1 gap-1">
          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs leading-none ${dayNumberClass}`}>
            {format(day, "d")}
          </span>
          {totalItems > 0 && (
            <div className="flex items-center justify-center gap-[3px] flex-wrap max-w-[40px]" aria-hidden="true">
              {tasks.slice(0, maxDots).map((task) => (
                <span key={task.id} className={`w-[7px] h-[7px] rounded-full shrink-0 ${task.is_completed ? "opacity-60" : ""}`} style={{ backgroundColor: getThemeColor(task.color, colorTheme) }} />
              ))}
              {effectiveEvents.slice(0, Math.max(0, maxDots - tasks.length)).map((event) => (
                <span key={event.id} className="w-[7px] h-[7px] rounded-full shrink-0" style={{ border: `1.5px solid ${getEventColor(event.colorId, undefined, undefined, colorTheme)}` }} />
              ))}
              {pendingInvites.map((invite) => (
                <span key={invite.shareId} className="w-[7px] h-[7px] rounded-full shrink-0 opacity-40" style={{ border: `1px dashed ${getThemeColor(invite.taskColor, colorTheme)}` }} />
              ))}
              {dotOverflow > 0 && <span className="text-[8px] text-muted-foreground leading-none">+{dotOverflow}</span>}
            </div>
          )}
        </div>
      ) : (
        <>
          {weekdayLabel && (
            <div className="text-center text-3xs font-medium text-muted-foreground leading-none pt-0.5 pb-px">{weekdayLabel}</div>
          )}
          <div className="relative flex items-center justify-center mb-0.5 px-0.5">
            {/* Add: revealed on hover and keyboard focus; 44px hit area via IconButton-style bleed. */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                onDayClick(dateStr, new DOMRect(rect.left, rect.bottom + 4, rect.width, 1));
              }}
              aria-label={`Add task on ${format(day, "MMMM d")}`}
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-opacity after:absolute after:content-[''] after:-inset-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                addingDate ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              }`}
            >
              <Plus size={12} strokeWidth={2.5} aria-hidden="true" />
            </button>
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-2xs leading-none ${dayNumberClass}`}>
              {format(day, "d")}
            </span>
          </div>

          {addingDate === dateStr && (
            <div className="bg-blue-500 text-white text-3xs font-medium px-1.5 py-0.5 rounded truncate mb-0.5">(No title)</div>
          )}

          <div className="flex flex-col gap-px">
            {tasks.slice(0, taskSlots).map((task) => (
              <CalendarTaskBar key={task.id} task={task} onClick={onTaskClick} compact={!assignmentsMode} isActive={task.id === activeTaskId} justDropped={task.id === recentlyMovedTaskId} draggable={!!onTaskDrop} />
            ))}
            {pendingInvites.slice(0, inviteSlots).map((invite) => (
              <CalendarTaskBar key={invite.shareId} task={pendingInviteToPseudoTask(invite)} onClick={() => {}} isPending compact={!assignmentsMode} />
            ))}
            <div className={isPast ? "opacity-40" : ""}>
              {effectiveEvents.slice(0, eventSlots).map((event) => (
                <CalendarGCalItem key={event.id} event={event} calendarColor={calendarColors[event.calendarId ?? ""]} />
              ))}
            </div>
            {overflow > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onShowMore && cellRef.current) onShowMore(dateStr, cellRef.current.getBoundingClientRect());
                }}
                className={`text-3xs font-semibold hover:underline px-0.5 text-left -mt-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isPast ? "text-muted-foreground" : "text-foreground"}`}
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
