"use client";

import { useState, useEffect } from "react";
import { format, isSameDay, startOfWeek, addDays } from "date-fns";
import type { Task, PendingInvite } from "@/lib/types";
import { getThemeColor } from "@/lib/constants";
import { pendingInviteToPseudoTask } from "@/lib/pending-invite-helpers";
import { useTheme } from "@/contexts/ThemeContext";

interface CalendarWeekViewProps {
  currentDate: Date;
  tasks: Task[];
  pendingInvites?: PendingInvite[];
  onDayClick: (date: string, rect: DOMRect) => void;
  onTaskClick: (task: Task, rect: DOMRect) => void;
}

/**
 * Formats a 24-hour time string to compact 12-hour format.
 * e.g. "23:59" → "11:59p", "09:00" → "9a", "14:30" → "2:30p"
 *
 * @param time24 - "HH:MM" format
 * @returns Compact formatted time string
 */
function formatTime(time24: string): string {
  const [h, m] = time24.split(":");
  const hour = parseInt(h, 10);
  const minute = m;
  const suffix = hour >= 12 ? "p" : "a";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  if (minute === "00") return `${h12}${suffix}`;
  return `${h12}:${minute}${suffix}`;
}

/**
 * Converts a hex color to an rgba string at the given opacity.
 *
 * @param hex - Hex color string (e.g. "#3b82f6")
 * @param opacity - Opacity between 0 and 1
 * @returns rgba string
 */
function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Week view showing 7 day columns (Mon-Sun) with colored task cards.
 * Centered date headers with day name + large date number.
 * Hover shows + icon for adding tasks, double-click also works.
 *
 * @param currentDate - Any date within the target week
 * @param tasks - All tasks (filtered by week in this component)
 * @param onDayClick - Handler for adding tasks
 * @param onTaskClick - Click handler for editing tasks
 */
export default function CalendarWeekView({
  currentDate,
  tasks,
  pendingInvites = [],
  onDayClick,
  onTaskClick,
}: CalendarWeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const tasksByDate: Record<string, Task[]> = {};
  for (const task of tasks) {
    if (task.due_date) {
      if (!tasksByDate[task.due_date]) tasksByDate[task.due_date] = [];
      tasksByDate[task.due_date].push(task);
    }
  }

  const invitesByDate: Record<string, PendingInvite[]> = {};
  for (const invite of pendingInvites) {
    if (invite.taskDueDate) {
      if (!invitesByDate[invite.taskDueDate]) invitesByDate[invite.taskDueDate] = [];
      invitesByDate[invite.taskDueDate].push(invite);
    }
  }

  return (
    <div className="bg-card flex flex-col h-full overflow-hidden">
      {/* Column headers — centered day name + date number */}
      <div className="grid grid-cols-7 border-b border-gray-300 dark:border-gray-500 shrink-0">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isToday = isSameDay(day, new Date());
          return (
            <div
              key={dateStr}
              className="flex flex-col items-center py-1.5 md:py-2.5 gap-0.5"
            >
              <span className={`text-[9px] md:text-[11px] font-semibold uppercase ${
                isToday ? "text-[#007AFF]" : "text-foreground/60"
              }`}>
                <span className="md:hidden">{format(day, "EEEEE")}</span>
                <span className="hidden md:inline">{format(day, "EEE")}</span>
              </span>
              <span
                className={`text-sm md:text-lg font-semibold inline-flex items-center justify-center ${
                  isToday
                    ? "w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#007AFF] text-white"
                    : "text-foreground"
                }`}
              >
                {format(day, "d")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Day columns with task cards (desktop) or dots (mobile) */}
      <div className="grid grid-cols-7 flex-1 min-h-0 overflow-y-auto">
        {days.map((day, i) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayTasks = tasksByDate[dateStr] ?? [];
          const isLastCol = i === 6;
          return (
            <WeekDayColumn
              key={dateStr}
              dateStr={dateStr}
              tasks={dayTasks}
              pendingInvites={invitesByDate[dateStr] ?? []}
              isLastCol={isLastCol}
              isMobile={isMobile}
              onDayClick={onDayClick}
              onTaskClick={onTaskClick}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Single day column in week view with hover + icon and task cards.
 */
function WeekDayColumn({
  dateStr,
  tasks,
  pendingInvites,
  isLastCol,
  isMobile,
  onDayClick,
  onTaskClick,
}: {
  dateStr: string;
  tasks: Task[];
  pendingInvites: PendingInvite[];
  isLastCol: boolean;
  isMobile: boolean;
  onDayClick: (date: string, rect: DOMRect) => void;
  onTaskClick: (task: Task, rect: DOMRect) => void;
}) {
  const { colorTheme } = useTheme();
  const isMiffyTheme = colorTheme === "miffy";
  const [hovered, setHovered] = useState(false);
  const maxDots = 4;

  return (
    <div
      className={`${isLastCol ? "" : "border-r"} border-gray-300 dark:border-gray-600 p-1 md:p-1.5 flex flex-col gap-1 md:gap-1.5 hover:bg-muted/30 transition-colors`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={isMobile ? (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onDayClick(dateStr, new DOMRect(rect.left, rect.bottom + 4, rect.width, 1));
      } : undefined}
      onDoubleClick={!isMobile ? (e) => {
        const rect = new DOMRect(e.clientX - 40, e.clientY, 80, 1);
        onDayClick(dateStr, rect);
      } : undefined}
    >
      {isMobile ? (
        /* Mobile: centered colored dots */
        <div className="flex flex-col items-center justify-start pt-1 gap-1.5">
          {(tasks.length > 0 || pendingInvites.length > 0) && (
            <div className="flex items-center justify-center gap-[3px] flex-wrap max-w-[36px]">
              {tasks.slice(0, maxDots).map((task) => (
                <span
                  key={task.id}
                  className={`w-[5px] h-[5px] rounded-full shrink-0 ${task.is_completed ? "opacity-40" : ""}`}
                  style={{ backgroundColor: getThemeColor(task.color, colorTheme) }}
                />
              ))}
              {pendingInvites.map((invite) => (
                <span
                  key={invite.shareId}
                  className="w-[5px] h-[5px] rounded-full shrink-0 opacity-40"
                  style={{
                    backgroundColor: "transparent",
                    border: `1px dashed ${getThemeColor(invite.taskColor, colorTheme)}`,
                  }}
                />
              ))}
              {tasks.length > maxDots && (
                <span className="text-[8px] text-muted-foreground leading-none">+{tasks.length - maxDots}</span>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Desktop: + icon row and full task cards */}
          <div className="flex justify-end h-5 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                onDayClick(dateStr, new DOMRect(rect.left, rect.bottom + 4, rect.width, 1));
              }}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-foreground transition-all ${
                hovered ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          {tasks.map((task) => (
            <WeekTaskCard key={task.id} task={task} onTaskClick={onTaskClick} />
          ))}
          {pendingInvites.map((invite) => (
            <WeekTaskCard
              key={invite.shareId}
              task={pendingInviteToPseudoTask(invite)}
              onTaskClick={() => {}}
              isPending
            />
          ))}
        </>
      )}
    </div>
  );
}

/**
 * Task card for week view with color-tinted background and hover effect.
 *
 * @param task - The task to render
 * @param onTaskClick - Click callback
 * @param isPending - When true, renders with dashed outline for pending invites
 */
function WeekTaskCard({
  task,
  onTaskClick,
  isPending,
}: {
  task: Task;
  onTaskClick: (task: Task, rect: DOMRect) => void;
  isPending?: boolean;
}) {
  const { colorTheme } = useTheme();
  const color = getThemeColor(task.color, colorTheme);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onTaskClick(task, e.currentTarget.getBoundingClientRect());
      }}
      className={`group w-full text-left rounded-lg p-1.5 md:p-2.5 transition-all hover:-translate-y-px hover:shadow-sm ${
        task.is_completed ? "opacity-50" : ""
      } ${isPending ? "opacity-50" : ""}`}
      style={isPending ? {
        backgroundColor: "transparent",
        border: `1px dashed ${hexToRgba(color, 0.4)}`,
        borderLeftWidth: "2px",
        borderLeftStyle: "dashed",
        borderLeftColor: color,
      } : {
        backgroundColor: hexToRgba(color, 0.1),
        borderLeft: `2px solid ${color}`,
      }}
      onMouseEnter={(e) => {
        if (!isPending) e.currentTarget.style.backgroundColor = hexToRgba(color, 0.18);
      }}
      onMouseLeave={(e) => {
        if (!isPending) e.currentTarget.style.backgroundColor = hexToRgba(color, 0.1);
      }}
    >
      <p
        className={`text-[11px] md:text-[13px] font-semibold leading-snug flex items-center gap-1 ${task.is_completed && !isPending ? "line-through" : ""}`}
        style={{ color: isPending ? hexToRgba(color, 0.6) : color }}
      >
        {task.is_completed && !isPending && (
          <svg className="w-3.5 h-3.5 shrink-0 hidden md:block" style={{ color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {task.title}
      </p>
      {task.due_time && (
        <p className="hidden md:flex text-xs mt-1 items-center gap-1" style={{ color: isPending ? hexToRgba(color, 0.6) : color, opacity: 0.7 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {formatTime(task.due_time)}
        </p>
      )}
    </button>
  );
}
