"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, MoreVertical, Eye, Check, Trash2 } from "lucide-react";
import type { Task, TaskInsert, PendingInvite } from "@/lib/types";
import { useTaskContext } from "@/contexts/TaskContext";
import TaskItem from "./TaskItem";
import ClassGroupHeader from "./ClassGroupHeader";
import UserAvatar from "@/components/ui/UserAvatar";
import { pendingInviteToPseudoTask } from "@/lib/pending-invite-helpers";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Formats a countdown string from now until the given ISO timestamp.
 * Returns "Xh Ym" for multi-hour durations or "Xm" for under an hour.
 *
 * @param snoozedUntil - ISO 8601 timestamp when the snooze expires
 * @returns Human-readable countdown string, or "< 1m" if nearly expired
 */
function formatCountdown(snoozedUntil: string): string {
  const diff = new Date(snoozedUntil).getTime() - Date.now();
  if (diff <= 0) return "< 1m";
  // If snoozed for more than ~50 years, treat as "forever"
  const totalMinutes = Math.ceil(diff / 60_000);
  const totalHours = Math.floor(totalMinutes / 60);
  if (totalHours > 438_000) return "Hidden";
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/** Maximum items shown per section before "show more" truncation. */
const ITEMS_PER_SECTION = 10;

/** Shared localStorage key for column/group name aliases (same as board view). */
const COLUMN_ALIASES_KEY = "caltodo_board_column_aliases";

/** localStorage key for completed task auto-hide duration (in hours). */
const COMPLETED_HIDE_KEY = "caltodo_completed_hide_hours";

/** Default auto-hide duration: 24 hours. */
const DEFAULT_HIDE_HOURS = 24;

/** Preset auto-hide options shown in the settings menu. */
const HIDE_OPTIONS = [
  { label: "6 hours", hours: 6 },
  { label: "12 hours", hours: 12 },
  { label: "24 hours", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "7 days", hours: 168 },
  { label: "Never", hours: 0 },
];

/**
 * Loads the completed task auto-hide duration from localStorage.
 *
 * @returns Duration in hours, or the default (24) if not set
 */
function loadHideHours(): number {
  try {
    const raw = localStorage.getItem(COMPLETED_HIDE_KEY);
    if (raw === null) return DEFAULT_HIDE_HOURS;
    const val = parseInt(raw, 10);
    return isNaN(val) ? DEFAULT_HIDE_HOURS : val;
  } catch {
    return DEFAULT_HIDE_HOURS;
  }
}

/**
 * Saves the completed task auto-hide duration to localStorage.
 */
function saveHideHours(hours: number): void {
  try {
    localStorage.setItem(COMPLETED_HIDE_KEY, String(hours));
  } catch {
    // non-critical
  }
}

/**
 * Loads column name aliases from localStorage.
 *
 * @returns Map of original course_name to display alias
 */
function loadColumnAliases(): Map<string, string> {
  try {
    const raw = localStorage.getItem(COLUMN_ALIASES_KEY);
    if (!raw) return new Map();
    const entries: Array<[string, string]> = JSON.parse(raw);
    return new Map(entries);
  } catch {
    return new Map();
  }
}

/**
 * Saves column name aliases to localStorage.
 *
 * @param aliases - Map of original course_name to display alias
 */
function saveColumnAliases(aliases: Map<string, string>): void {
  try {
    localStorage.setItem(COLUMN_ALIASES_KEY, JSON.stringify([...aliases.entries()]));
  } catch {
    // non-critical
  }
}

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  selectedTaskId?: string | null;
  onAdd: (task: TaskInsert) => void;
  onToggle: (id: string) => void;
  onSelect: (task: Task, anchorRect?: DOMRect) => void;
  onDelete: (id: string) => void;
  defaultDate?: string | null;
  /** When "class", active tasks are grouped under collapsible course headers. */
  sortMode?: "date" | "class";
  /** Called after a drag-and-drop reorder with the new ordered list of task IDs. Only active in "date" sortMode. */
  onReorder?: (reorderedIds: string[]) => void;
  /** Callback to change the color for all tasks in a class. */
  onColorChange?: (courseName: string, color: string) => void;
  /** Callback to delete all tasks in a class. */
  onDeleteClass?: (courseName: string) => void;
  /** Pending task invitations to show in the "Requests" collapsible section. */
  pendingInvites?: PendingInvite[];
  /** Callback when user accepts or declines an invite. */
  onRespondInvite?: (shareId: string, action: "accept" | "decline") => void;
  /** Callback to accept all pending invites at once. */
  onAcceptAllInvites?: () => void;
}

/**
 * Groups tasks by course_name, preserving input order within each group.
 * Tasks with null course_name are grouped under "General".
 *
 * @param tasks - Pre-sorted array of tasks
 * @returns Ordered array of [groupName, tasks[]] pairs
 */
function groupByCourse(tasks: Task[]): [string, Task[]][] {
  const map = new Map<string, Task[]>();
  for (const t of tasks) {
    const key = t.course_name || "General";
    const list = map.get(key);
    if (list) {
      list.push(t);
    } else {
      map.set(key, [t]);
    }
  }
  return Array.from(map.entries());
}

/**
 * Sorts tasks by sort_order first (manual drag order), then by due_date.
 * Tasks with a non-null sort_order come first, sorted ascending.
 * Tasks with null sort_order follow, sorted by due_date ascending (undated first).
 *
 * @param tasks - Array of tasks to sort
 * @returns New sorted array (does not mutate input)
 */
function sortByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aHasOrder = a.sort_order !== null && a.sort_order !== undefined;
    const bHasOrder = b.sort_order !== null && b.sort_order !== undefined;

    // Both have sort_order: compare by sort_order
    if (aHasOrder && bHasOrder) return a.sort_order! - b.sort_order!;
    // Only one has sort_order: it comes first
    if (aHasOrder) return -1;
    if (bHasOrder) return 1;

    // Neither has sort_order: fall back to due_date
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return -1;
    if (!b.due_date) return 1;
    return a.due_date.localeCompare(b.due_date);
  });
}

/**
 * Task list with add input and two areas: active tasks (flat list) and Completed (collapsible).
 * When sortMode is "class", active tasks are grouped under collapsible course headers
 * with a three-dot menu for renaming (aliases shared with board view).
 *
 * @param tasks - Array of tasks to display
 * @param loading - Whether tasks are being fetched
 * @param error - Error message if fetch failed
 * @param selectedTaskId - ID of the currently selected task
 * @param onAdd - Callback for adding a task
 * @param onToggle - Callback for toggling task completion
 * @param onSelect - Callback for selecting a task (opens detail panel)
 * @param onDelete - Callback for deleting a task
 * @param defaultDate - Optional default date for new tasks
 * @param sortMode - "date" for flat list, "class" for grouped by course
 */
export default function TaskList({
  tasks,
  loading,
  error,
  selectedTaskId,
  onAdd,
  onToggle,
  onSelect,
  onDelete,
  defaultDate,
  sortMode = "date",
  onReorder,
  onColorChange,
  onDeleteClass,
  pendingInvites = [],
  onRespondInvite,
  onAcceptAllInvites,
}: TaskListProps) {
  const { unsnoozeTask } = useTaskContext();
  const { colorTheme } = useTheme();
  const isMiffy = colorTheme === "miffy";
  const [requestsExpanded, setRequestsExpanded] = useState(false);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [hiddenExpanded, setHiddenExpanded] = useState(false);
  const [showAllActive, setShowAllActive] = useState(false);
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  /** Ticks every 60s when Hidden section is expanded to refresh countdowns. */
  const [countdownTick, setCountdownTick] = useState(0);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [aliases, setAliases] = useState<Map<string, string>>(() => loadColumnAliases());
  const [hideHours, setHideHours] = useState<number>(() => loadHideHours());
  const [completedMenuOpen, setCompletedMenuOpen] = useState(false);
  const completedMenuBtnRef = useRef<HTMLButtonElement>(null);
  const completedMenuRef = useRef<HTMLDivElement>(null);

  // Drag-and-drop state (only active in "date" sortMode with onReorder)
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const dragEnabled = sortMode === "date" && !!onReorder;

  /** Toggles a course group's collapsed state. */
  const toggleGroup = useCallback((groupName: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  }, []);

  /** Renames a group by saving a display alias (shared with board view). */
  const renameGroup = useCallback((originalName: string, newDisplayName: string) => {
    setAliases((prev) => {
      const next = new Map(prev);
      const trimmed = newDisplayName.trim();
      if (!trimmed || trimmed === originalName) {
        next.delete(originalName);
      } else {
        next.set(originalName, trimmed);
      }
      saveColumnAliases(next);
      return next;
    });
  }, []);

  /** Updates the auto-hide duration for completed tasks. */
  const updateHideHours = useCallback((hours: number) => {
    setHideHours(hours);
    saveHideHours(hours);
    setCompletedMenuOpen(false);
  }, []);

  // Hydrate requestsExpanded and completedExpanded from localStorage (default collapsed)
  useEffect(() => {
    try {
      const storedRequests = localStorage.getItem("caltodo_requests_expanded");
      if (storedRequests === "true") setRequestsExpanded(true);
      const stored = localStorage.getItem("caltodo_completed_expanded");
      if (stored === "true") setCompletedExpanded(true);
    } catch { /* ignore */ }
  }, []);

  // Close completed menu on outside click
  useEffect(() => {
    if (!completedMenuOpen) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        completedMenuBtnRef.current && !completedMenuBtnRef.current.contains(target) &&
        completedMenuRef.current && !completedMenuRef.current.contains(target)
      ) {
        setCompletedMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [completedMenuOpen]);

  // 60-second interval to refresh countdown timers when Hidden section is expanded
  useEffect(() => {
    if (!hiddenExpanded) return;
    const timer = setInterval(() => setCountdownTick((t) => t + 1), 60_000);
    return () => clearInterval(timer);
  }, [hiddenExpanded]);

  /** Resets a group alias back to its original name. */
  const resetGroupName = useCallback((originalName: string) => {
    setAliases((prev) => {
      const next = new Map(prev);
      next.delete(originalName);
      saveColumnAliases(next);
      return next;
    });
  }, []);

  const { active, snoozed, completed } = useMemo(() => {
    const now = Date.now();
    const activeList: Task[] = [];
    const snoozedList: Task[] = [];
    const completedList: Task[] = [];

    for (const t of tasks) {
      if (t.is_completed) {
        completedList.push(t);
      } else if (t.snoozed_until && new Date(t.snoozed_until).getTime() > now) {
        snoozedList.push(t);
      } else {
        activeList.push(t);
      }
    }

    // Filter completed tasks to only show those within the auto-hide window
    // hideHours=0 means "never hide" — show all completed tasks
    const recentCompleted = hideHours === 0
      ? completedList
      : completedList.filter((t) => {
          if (!t.completed_at) return true; // Legacy tasks without completed_at stay visible
          const completedTime = new Date(t.completed_at).getTime();
          const cutoff = now - hideHours * 60 * 60 * 1000;
          return completedTime > cutoff;
        });

    return {
      active: sortByDueDate(activeList),
      snoozed: sortByDueDate(snoozedList),
      completed: sortByDueDate(recentCompleted),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, hideHours, countdownTick]);

  /** Active tasks grouped by course when sortMode is "class". */
  const activeGroups = useMemo(
    () => (sortMode === "class" ? groupByCourse(active) : []),
    [active, sortMode]
  );

  /** Handles drag start: records the dragged task ID. */
  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    setDraggedId(taskId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId);
  }, []);

  /** Handles drag over a task row: determines drop position (above or below). */
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setDropTargetIndex(e.clientY < midY ? index : index + 1);
  }, []);

  /** Handles drop: reorders the active task list and calls onReorder. */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedId || dropTargetIndex === null || !onReorder) {
      setDraggedId(null);
      setDropTargetIndex(null);
      return;
    }

    const currentIndex = active.findIndex((t) => t.id === draggedId);
    if (currentIndex === -1) {
      setDraggedId(null);
      setDropTargetIndex(null);
      return;
    }

    // Build new order by removing the dragged item and inserting at the drop position
    const reordered = active.filter((t) => t.id !== draggedId);
    const insertAt = dropTargetIndex > currentIndex ? dropTargetIndex - 1 : dropTargetIndex;
    reordered.splice(insertAt, 0, active[currentIndex]);

    onReorder(reordered.map((t) => t.id));
    setDraggedId(null);
    setDropTargetIndex(null);
  }, [draggedId, dropTargetIndex, onReorder, active]);

  /** Clears drag state when drag ends (e.g. dropped outside). */
  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDropTargetIndex(null);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-500 text-sm p-4 rounded-xl mx-4">
        Error loading tasks: {error}
      </div>
    );
  }

  const activeToShow = showAllActive ? active : active.slice(0, ITEMS_PER_SECTION);
  const completedToShow = showAllCompleted ? completed : completed.slice(0, ITEMS_PER_SECTION);

  return (
    <div className="flex flex-col">
      {/* Requests section (pending invites) — shown above active tasks */}
      {pendingInvites.length > 0 && (
        <div className="mt-1">
          <div className="flex items-center mx-2 pl-2.5 pr-1 py-1.5">
            <div
              className="flex items-center flex-1 rounded-lg hover:bg-accent transition-colors cursor-pointer px-0.5 py-0.5 -mx-0.5"
              onClick={() => {
                const next = !requestsExpanded;
                setRequestsExpanded(next);
                try { localStorage.setItem("caltodo_requests_expanded", String(next)); } catch { /* ignore */ }
              }}
            >
              <ChevronRight
                size={12}
                className={`shrink-0 text-secondary-foreground transition-transform duration-200 ${
                  requestsExpanded ? "rotate-90" : ""
                }`}
              />
              <span className="text-sm font-semibold text-foreground ml-0.5">Requests</span>
              <span className="text-xs text-amber-500 font-medium ml-1.5">{pendingInvites.length}</span>
            </div>
            {requestsExpanded && pendingInvites.length > 1 && onAcceptAllInvites && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onAcceptAllInvites(); }}
                className="text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors px-2 py-0.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-500/10 shrink-0"
              >
                Accept all
              </button>
            )}
          </div>
          {requestsExpanded && (
            <div className="space-y-1 mt-0.5">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.shareId}
                  className="mx-1 md:mx-2 rounded-xl border border-border bg-card"
                >
                  <div
                    className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 cursor-pointer hover:bg-accent/50 rounded-t-xl transition-colors"
                    onClick={() => onSelect(pendingInviteToPseudoTask(invite))}
                  >
                    <UserAvatar
                      url={invite.inviterAvatar}
                      name={invite.inviterName}
                      email={invite.inviterEmail}
                      size={24}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {invite.taskTitle}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        from {invite.inviterName || invite.inviterEmail}
                        {invite.taskDueDate && (
                          <span className="ml-1.5">
                            · due {new Date(invite.taskDueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 md:px-4 pb-2.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => onRespondInvite?.(invite.shareId, "accept")}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => onRespondInvite?.(invite.shareId, "decline")}
                      className="px-3 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {active.length === 0 && snoozed.length === 0 && completed.length === 0 && (
        <div className="flex flex-col items-center py-12 text-muted-foreground text-sm gap-3">
          {isMiffy && (
            <img
              src="/miffy/miffy-pen.png"
              alt=""
              className="w-20 h-auto opacity-50 select-none pointer-events-none"
              draggable={false}
            />
          )}
          No tasks yet. Press + to add one.
        </div>
      )}

      {/* Active tasks — grouped by class or flat list depending on sortMode */}
      {active.length > 0 && sortMode === "class" ? (
        <div className="mt-1">
          {activeGroups.map(([groupName, groupTasks], groupIdx) => {
            const isCollapsed = collapsedGroups.has(groupName);
            return (
              <div key={groupName} className={groupIdx > 0 ? "mt-4 border-t border-border pt-1" : ""}>
                <ClassGroupHeader
                  groupName={groupName}
                  displayName={aliases.get(groupName) || groupName}
                  hasAlias={aliases.has(groupName)}
                  count={groupTasks.length}
                  isCollapsed={isCollapsed}
                  onToggle={() => toggleGroup(groupName)}
                  onRename={renameGroup}
                  onResetName={resetGroupName}
                  onColorChange={onColorChange}
                  onDeleteClass={onDeleteClass}
                />
                {!isCollapsed && (
                  <>
                    {groupTasks.map((task, i) => (
                      <div key={task.id}>
                        {i > 0 && <div className="mx-12 h-px bg-border" />}
                        <TaskItem
                          task={task}
                          isSelected={selectedTaskId === task.id}
                          onToggle={onToggle}
                          onSelect={onSelect}
                          onDelete={onDelete}
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : active.length > 0 ? (
        <div className="mt-1">
          {activeToShow.map((task, i) => (
            <div
              key={task.id}
              draggable={dragEnabled}
              onDragStart={dragEnabled ? (e) => handleDragStart(e, task.id) : undefined}
              onDragOver={dragEnabled ? (e) => handleDragOver(e, i) : undefined}
              onDrop={dragEnabled ? handleDrop : undefined}
              onDragEnd={dragEnabled ? handleDragEnd : undefined}
              className={dragEnabled ? "cursor-grab active:cursor-grabbing" : ""}
              style={draggedId === task.id ? { opacity: 0.4 } : undefined}
            >
              {/* Blue drop indicator line */}
              {dropTargetIndex === i && draggedId !== task.id && (
                <div className="h-0.5 bg-blue-500 mx-4 rounded-full" />
              )}
              {i > 0 && dropTargetIndex !== i && <div className="mx-12 h-px bg-border" />}
              <TaskItem
                task={task}
                isSelected={selectedTaskId === task.id}
                onToggle={onToggle}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            </div>
          ))}
          {/* Drop indicator after last item */}
          {dropTargetIndex === activeToShow.length && draggedId && (
            <div className="h-0.5 bg-blue-500 mx-4 rounded-full" />
          )}
          {active.length > ITEMS_PER_SECTION && (
            <button
              onClick={() => setShowAllActive(!showAllActive)}
              className="px-8 py-2 text-xs text-subtle-foreground hover:text-secondary-foreground transition-colors w-full text-left"
            >
              {showAllActive ? "Show less" : `+${active.length - ITEMS_PER_SECTION} more`}
            </button>
          )}
        </div>
      ) : null}

      {/* Hidden (snoozed) section */}
      {snoozed.length > 0 && (
        <div className="mt-1">
          <div
            className="flex items-center mx-2 pl-2.5 pr-1 py-1.5 rounded-lg hover:bg-accent transition-colors cursor-pointer"
            onClick={() => setHiddenExpanded(!hiddenExpanded)}
          >
            <ChevronRight
              size={12}
              className={`shrink-0 text-secondary-foreground transition-transform duration-200 ${
                hiddenExpanded ? "rotate-90" : ""
              }`}
            />
            <span className="text-sm font-semibold text-foreground ml-0.5">Hidden</span>
            <span className="text-xs text-subtle-foreground ml-1.5">{snoozed.length}</span>
          </div>
          {hiddenExpanded && (
            <>
              {snoozed.map((task, i) => (
                <div key={task.id} className="cv-auto-task">
                  {i > 0 && <div className="mx-12 h-px bg-border" />}
                  <div className="flex items-center px-4 py-2 group">
                    <span className="text-sm text-foreground truncate flex-1 min-w-0">{task.title}</span>
                    <span className="text-xs text-subtle-foreground tabular-nums mr-2 shrink-0">
                      {formatCountdown(task.snoozed_until!)}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => unsnoozeTask(task.id)}
                        className="p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                        title="Unhide"
                        aria-label="Unhide"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggle(task.id)}
                        className="p-1 text-muted-foreground hover:text-green-600 rounded-lg transition-colors"
                        title="Complete"
                        aria-label="Complete"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(task.id)}
                        className="p-1 text-muted-foreground hover:text-red-500 rounded-lg transition-colors"
                        title="Delete"
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Completed section (collapsible) */}
      {completed.length > 0 && (
        <div className="mt-1">
          <div
            className="flex items-center mx-2 pl-2.5 pr-1 py-1.5 rounded-lg hover:bg-accent transition-colors group cursor-pointer"
            onClick={() => {
              const next = !completedExpanded;
              setCompletedExpanded(next);
              try { localStorage.setItem("caltodo_completed_expanded", String(next)); } catch { /* ignore */ }
            }}
          >
            <ChevronRight
              size={12}
              className={`shrink-0 text-secondary-foreground transition-transform duration-200 ${
                completedExpanded ? "rotate-90" : ""
              }`}
            />
            <span className="text-sm font-semibold text-foreground ml-0.5">Completed</span>
            <span className="text-xs text-subtle-foreground ml-1.5">{completed.length}</span>
            <button
              ref={completedMenuBtnRef}
              type="button"
              onClick={(e) => { e.stopPropagation(); setCompletedMenuOpen(!completedMenuOpen); }}
              className="ml-auto p-1 text-muted-foreground hover:text-foreground rounded-lg transition-all opacity-0 group-hover:opacity-100"
              title="Auto-hide settings"
              aria-label="Auto-hide settings"
            >
              <MoreVertical size={14} />
            </button>
          </div>

          {/* Completed auto-hide settings menu */}
          {completedMenuOpen && completedMenuBtnRef.current && typeof document !== "undefined" && createPortal(
            <div
              ref={completedMenuRef}
              className="fixed z-[9999] rounded-xl shadow-2xl border border-border overflow-hidden min-w-[180px] bg-popover"
              style={{
                top: completedMenuBtnRef.current.getBoundingClientRect().bottom + 4,
                left: Math.min(
                  completedMenuBtnRef.current.getBoundingClientRect().left,
                  window.innerWidth - 196
                ),
              }}
            >
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-medium text-foreground">Auto-hide after</p>
                <p className="text-[10px] text-muted-foreground">Completed tasks disappear after this time</p>
              </div>
              {HIDE_OPTIONS.map((opt) => (
                <button
                  key={opt.hours}
                  type="button"
                  onClick={() => updateHideHours(opt.hours)}
                  className={`flex items-center w-full text-left px-3 py-1.5 text-xs transition-colors ${
                    hideHours === opt.hours
                      ? "text-blue-500 bg-blue-50 dark:bg-blue-900/20 font-medium"
                      : "text-foreground hover:bg-accent"
                  }`}
                >
                  {opt.label}
                  {hideHours === opt.hours && (
                    <span className="ml-auto text-blue-500">&#10003;</span>
                  )}
                </button>
              ))}
            </div>,
            document.body
          )}
          {completedExpanded && (
            <>
              {completedToShow.map((task, i) => (
                <div key={task.id} className="cv-auto-task">
                  {i > 0 && <div className="mx-12 h-px bg-border" />}
                  <TaskItem
                    task={task}
                    isSelected={selectedTaskId === task.id}
                    onToggle={onToggle}
                    onSelect={onSelect}
                    onDelete={onDelete}
                  />
                </div>
              ))}
              {completed.length > ITEMS_PER_SECTION && (
                <button
                  onClick={() => setShowAllCompleted(!showAllCompleted)}
                  className="px-8 py-2 text-xs text-subtle-foreground hover:text-secondary-foreground transition-colors w-full text-left"
                >
                  {showAllCompleted ? "Show less" : `+${completed.length - ITEMS_PER_SECTION} more`}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
