"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, MoreVertical, Palette, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import type { Task, TaskInsert } from "@/lib/types";
import { TASK_COLORS } from "@/lib/constants";
import BoardTaskAddForm from "./BoardTaskAddForm";

/** localStorage key for column name aliases. */
const COLUMN_ALIASES_KEY = "caltodo_board_column_aliases";

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

/** Default column name for tasks without a course_name. */
const GENERAL_COLUMN = "General";

interface TaskBoardViewProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  selectedTaskId?: string | null;
  groupBy?: "class" | "date";
  onAdd: (task: TaskInsert) => void;
  onToggle: (id: string) => void;
  onSelect: (task: Task, anchorRect?: DOMRect) => void;
  onDelete: (id: string) => void;
  onColorChange?: (courseName: string, color: string) => void;
  onDeleteClass?: (courseName: string) => void;
}

/**
 * Groups tasks by course name into a sorted Map.
 * Tasks without course_name go under "General".
 *
 * @param tasks - Array of tasks to group
 * @returns Map of column name to tasks array, sorted alphabetically with General last
 */
function groupByCourse(tasks: Task[]): Map<string, Task[]> {
  const groups = new Map<string, Task[]>();

  for (const task of tasks) {
    const key = task.course_name || GENERAL_COLUMN;
    const existing = groups.get(key);
    if (existing) {
      existing.push(task);
    } else {
      groups.set(key, [task]);
    }
  }

  // Sort: named courses alphabetically, "General" last
  const sorted = new Map<string, Task[]>();
  const keys = [...groups.keys()].sort((a, b) => {
    if (a === GENERAL_COLUMN) return 1;
    if (b === GENERAL_COLUMN) return -1;
    return a.localeCompare(b);
  });

  for (const key of keys) {
    sorted.set(key, groups.get(key)!);
  }

  return sorted;
}

/** Date bucket labels used for date group-by mode. */
const DATE_BUCKETS = ["Today", "Next 3 Days", "Next 7 Days", "Later"] as const;

/**
 * Groups tasks into 4 date-based columns: Today, Next 3 Days, Next 7 Days, Later.
 * Overdue tasks go into "Today". Tasks without a due_date go into "Later".
 * Empty buckets are preserved so the layout always shows all 4 columns.
 *
 * @param tasks - Array of tasks to group
 * @returns Map of date bucket name to tasks array, in chronological order
 */
function groupByDate(tasks: Task[]): Map<string, Task[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d3 = new Date(today);
  d3.setDate(d3.getDate() + 3);
  const d7 = new Date(today);
  d7.setDate(d7.getDate() + 7);

  const groups = new Map<string, Task[]>(
    DATE_BUCKETS.map((b) => [b, []])
  );

  for (const task of tasks) {
    if (!task.due_date) {
      groups.get("Later")!.push(task);
      continue;
    }
    const due = new Date(task.due_date + "T00:00:00");
    if (due <= today) {
      groups.get("Today")!.push(task);
    } else if (due <= d3) {
      groups.get("Next 3 Days")!.push(task);
    } else if (due <= d7) {
      groups.get("Next 7 Days")!.push(task);
    } else {
      groups.get("Later")!.push(task);
    }
  }

  return groups;
}

/**
 * Sorts tasks by closest due date first.
 * Tasks without a due date are placed at the end.
 *
 * @param tasks - Array of tasks to sort
 * @returns New sorted array (does not mutate input)
 */
function sortByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.localeCompare(b.due_date);
  });
}

/**
 * Formats a 24h time string (HH:MM) to 12h format (e.g. "11:59 PM").
 *
 * @param time24 - Time in HH:MM format
 * @returns Formatted 12h time string
 */
function formatTime12h(time24: string): string {
  const [hourStr, minute] = time24.split(":");
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minute} ${ampm}`;
}

/**
 * Returns a human-readable due date + time label and color class for board cards.
 *
 * @param dueDate - ISO date string (YYYY-MM-DD) or null
 * @param dueTime - 24h time string (HH:MM) or null
 * @returns Object with label and className, or null if no date
 */
function getDueDateLabel(dueDate: string | null, dueTime: string | null): { dateLabel: string; timeLabel: string | null; className: string } | null {
  if (!dueDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const timeLabel = dueTime ? formatTime12h(dueTime) : null;

  if (diffDays < 0) {
    const month = due.toLocaleString("en-US", { month: "short" });
    return { dateLabel: `${month} ${due.getDate()}`, timeLabel, className: "text-red-400" };
  }
  if (diffDays === 0) return { dateLabel: "Today", timeLabel, className: "text-blue-500" };
  if (diffDays === 1) return { dateLabel: "Tomorrow", timeLabel, className: "text-blue-400" };
  if (diffDays <= 7) {
    const month = due.toLocaleString("en-US", { month: "short" });
    return { dateLabel: `${month} ${due.getDate()}`, timeLabel, className: "text-blue-400" };
  }

  const month = due.toLocaleString("en-US", { month: "short" });
  return { dateLabel: `${month} ${due.getDate()}`, timeLabel, className: "text-muted-foreground" };
}

/**
 * Kanban/board view component that groups tasks by course_name in columns.
 * Each column has a plain-text header, task cards, and a collapsible Completed section.
 * Horizontal scroll for overflow.
 *
 * @param props - TaskBoardViewProps
 */
export default function TaskBoardView({
  tasks,
  loading,
  error,
  selectedTaskId,
  groupBy = "class",
  onAdd,
  onToggle,
  onSelect,
  onDelete,
  onColorChange,
  onDeleteClass,
}: TaskBoardViewProps) {
  const [aliases, setAliases] = useState<Map<string, string>>(() => loadColumnAliases());

  /** Renames a column by saving a display alias. */
  const renameColumn = useCallback((originalName: string, newDisplayName: string) => {
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

  /** Resets a column alias back to its original name. */
  const resetColumnName = useCallback((originalName: string) => {
    setAliases((prev) => {
      const next = new Map(prev);
      next.delete(originalName);
      saveColumnAliases(next);
      return next;
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-subtle-foreground text-sm">
        Loading tasks...
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

  const columns = groupBy === "date" ? groupByDate(tasks) : groupByCourse(tasks);
  const isDateMode = groupBy === "date";

  if (columns.size === 0 && !isDateMode) {
    return (
      <div className="px-6">
        <div className="max-w-[320px]">
          <BoardTaskAddForm onAdd={onAdd} onCancel={() => {}} />
        </div>
        <div className="text-center py-12 text-subtle-foreground text-sm">
          No tasks yet. Type above and press Enter!
        </div>
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto gap-6 px-6 pb-6 h-full">
      {[...columns.entries()].map(([columnName, columnTasks]) => (
        <BoardColumn
          key={columnName}
          name={columnName}
          displayName={isDateMode ? columnName : (aliases.get(columnName) || columnName)}
          hasAlias={isDateMode ? false : aliases.has(columnName)}
          hideMenu={isDateMode}
          tasks={columnTasks}
          selectedTaskId={selectedTaskId}
          onAdd={onAdd}
          onToggle={onToggle}
          onSelect={onSelect}
          onDelete={onDelete}
          onRename={renameColumn}
          onResetName={resetColumnName}
          onColorChange={onColorChange}
          onDeleteClass={onDeleteClass}
        />
      ))}
    </div>
  );
}

interface BoardColumnProps {
  name: string;
  displayName: string;
  hasAlias: boolean;
  hideMenu?: boolean;
  tasks: Task[];
  selectedTaskId?: string | null;
  onAdd: (task: TaskInsert) => void;
  onToggle: (id: string) => void;
  onSelect: (task: Task, anchorRect?: DOMRect) => void;
  onDelete: (id: string) => void;
  onRename: (originalName: string, newDisplayName: string) => void;
  onResetName: (originalName: string) => void;
  onColorChange?: (courseName: string, color: string) => void;
  onDeleteClass?: (courseName: string) => void;
}

/**
 * Single column in the board view. Plain-text header outside card area,
 * task cards with hover shadow, and collapsible Completed section.
 *
 * @param props - BoardColumnProps
 */
function BoardColumn({
  name,
  displayName,
  hasAlias,
  hideMenu = false,
  tasks,
  selectedTaskId,
  onAdd,
  onToggle,
  onSelect,
  onDelete,
  onRename,
  onResetName,
  onColorChange,
  onDeleteClass,
}: BoardColumnProps) {
  const [completedExpanded, setCompletedExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(displayName);
  const [showColorGrid, setShowColorGrid] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        menuBtnRef.current && !menuBtnRef.current.contains(target) &&
        !menuDropdownRef.current?.contains(target)
      ) {
        setShowMenu(false);
        setShowColorGrid(false);
        setShowDeleteConfirm(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

  // Focus input when editing starts
  useEffect(() => {
    if (editing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editing]);

  /** Commits the rename and exits edit mode. */
  function commitRename() {
    onRename(name, editValue);
    setEditing(false);
  }

  const { active, completed } = useMemo(() => {
    const activeList: Task[] = [];
    const completedList: Task[] = [];
    for (const t of tasks) {
      // Treat submitted tasks as completed in board view
      if (t.is_completed || t.is_submitted) {
        completedList.push(t);
      } else {
        activeList.push(t);
      }
    }
    return {
      active: sortByDueDate(activeList),
      completed: sortByDueDate(completedList),
    };
  }, [tasks]);

  return (
    <div className="min-w-[280px] max-w-[320px] flex-shrink-0 flex flex-col">
      {/* Column header — plain text, not in a box */}
      <div className="px-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {editing ? (
            <input
              ref={editInputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") { setEditValue(displayName); setEditing(false); }
              }}
              className="text-sm font-semibold text-foreground bg-transparent border-b border-blue-500 outline-none min-w-0 py-0"
            />
          ) : (
            <span className="text-sm font-semibold text-foreground truncate">{displayName}</span>
          )}
          <span className="text-xs text-muted-foreground shrink-0">{active.length}</span>
        </div>
        {!hideMenu && (
          <div className="flex items-center shrink-0">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              title="Add task"
            >
              <Plus size={14} />
            </button>
            <button
              ref={menuBtnRef}
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              title="Column options"
            >
              <MoreVertical size={14} />
            </button>
          </div>
        )}
        {showMenu && menuBtnRef.current && createPortal(
          <div
            ref={menuDropdownRef}
            className="fixed z-[9999] rounded-xl shadow-2xl border border-border overflow-hidden animate-in min-w-[150px] bg-white dark:bg-[#1a1a1a]"
            style={{
              top: menuBtnRef.current.getBoundingClientRect().bottom + 4,
              left: Math.min(
                menuBtnRef.current.getBoundingClientRect().left,
                window.innerWidth - 170
              ),
            }}
          >
            <button
              onClick={() => {
                setEditValue(displayName);
                setEditing(true);
                setShowMenu(false);
              }}
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Pencil size={13} />
              Rename
            </button>
            {hasAlias && (
              <button
                onClick={() => {
                  onResetName(name);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <RotateCcw size={13} />
                Reset name
              </button>
            )}
            {/* Change color option */}
            {onColorChange && (
              <>
                <button
                  onClick={() => setShowColorGrid(!showColorGrid)}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Palette size={13} />
                  Change color
                </button>
                {showColorGrid && (
                  <div className="flex gap-1.5 px-3 py-2 flex-wrap">
                    {TASK_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          onColorChange(name, c);
                          setShowMenu(false);
                          setShowColorGrid(false);
                        }}
                        className="w-5 h-5 rounded-full hover:scale-110 transition-all"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
            {/* Delete class option */}
            {onDeleteClass && name !== GENERAL_COLUMN && (
              <>
                <div className="border-t border-border my-1" />
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 size={13} />
                    Delete class
                  </button>
                ) : (
                  <div className="px-3 py-2">
                    <p className="text-xs text-muted-foreground mb-2">
                      Delete {tasks.length} task{tasks.length !== 1 ? "s" : ""}?
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-2.5 py-1 text-xs rounded-lg text-muted-foreground hover:bg-accent transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          onDeleteClass(name);
                          setShowMenu(false);
                          setShowDeleteConfirm(false);
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>,
          document.body
        )}
      </div>

      {/* Scrollable card area */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {/* Inline add task form */}
        {showAddForm && (
          <BoardTaskAddForm
            onAdd={(task) => {
              onAdd(task);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Active task cards */}
        {active.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isSelected={selectedTaskId === task.id}
            onToggle={onToggle}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}

        {active.length === 0 && completed.length === 0 && (
          hideMenu ? (
            <div className="rounded-xl border border-dashed border-border/50 py-8 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">No tasks</span>
            </div>
          ) : (
            <div
              className="rounded-xl bg-muted/50 dark:bg-muted/30 min-h-[200px]"
              style={{
                maskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
              }}
            />
          )
        )}

        {/* Completed section — expanded by default */}
        {completed.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setCompletedExpanded(!completedExpanded)}
              className="flex items-center gap-1 px-1 py-1.5 w-full text-left"
            >
              <ChevronDown
                size={14}
                className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
                  completedExpanded ? "" : "-rotate-90"
                }`}
              />
              <span className="text-sm font-semibold text-foreground">Completed</span>
              <span className="text-xs text-muted-foreground ml-1">{completed.length}</span>
            </button>
            {completedExpanded && (
              <div className="flex flex-col gap-2 mt-1">
                {completed.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isSelected={selectedTaskId === task.id}
                    onToggle={onToggle}
                    onSelect={onSelect}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onSelect: (task: Task, anchorRect?: DOMRect) => void;
  onDelete: (id: string) => void;
}

/**
 * Individual task card for board view. Rounded card with subtle border,
 * hover shadow, three-dot menu, optional source link, checkbox + title,
 * and combined due date + time label.
 *
 * @param props - TaskCardProps
 */
function TaskCard({ task, isSelected, onToggle, onSelect, onDelete }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);
  const isCompleted = task.is_completed || task.is_submitted;
  const rawBadge = getDueDateLabel(task.due_date, task.due_time);
  const dueBadge = isCompleted && rawBadge
    ? { ...rawBadge, className: "text-muted-foreground" }
    : rawBadge;

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        menuBtnRef.current && !menuBtnRef.current.contains(target) &&
        !menuDropdownRef.current?.contains(target)
      ) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

  return (
    <>
      <div
        className={`group relative rounded-xl border bg-card px-3.5 py-3 cursor-pointer transition-all duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${
          isSelected
            ? "border-blue-400 shadow-sm"
            : "border-input-border hover:shadow-md"
        } ${isCompleted ? "opacity-50" : ""}`}
        onClick={(e) => onSelect(task, e.currentTarget.getBoundingClientRect())}
      >
        {/* Checkbox + title + three-dot menu */}
        <div className="flex items-start gap-2.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task.id);
            }}
            className="group/check flex-shrink-0 w-3.5 h-3.5 rounded-[3px] mt-0.5 flex items-center justify-center transition-all"
            style={{
              backgroundColor: isCompleted ? `color-mix(in srgb, ${task.color || "#D1D5DB"} 35%, #9CA3AF)` : "transparent",
              border: isCompleted ? "none" : `1.5px solid ${task.color || "#D1D5DB"}`,
            }}
            aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
          >
            {isCompleted ? (
              <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="8" height="6" viewBox="0 0 10 8" fill="none" className="opacity-0 group-hover/check:opacity-40 transition-opacity">
                <path d="M1 4L3.5 6.5L9 1" stroke={task.color || "#D1D5DB"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <span
            className={`text-sm leading-snug flex-1 min-w-0 ${
              isCompleted ? "text-foreground line-through" : "text-foreground"
            }`}
          >
            {task.title}
          </span>
          <button
            ref={menuBtnRef}
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="flex-shrink-0 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all opacity-0 group-hover:opacity-100 [@media(pointer:coarse)]:opacity-100"
            aria-label="Task options"
          >
            <MoreVertical size={14} />
          </button>
        </div>

        {/* Date + time combined */}
        {dueBadge && (
          <div className="mt-1.5 pl-[24px]">
            <span className={`text-[11px] font-normal ${dueBadge.className} ${isCompleted ? "opacity-70" : ""}`}>
              {dueBadge.dateLabel}{dueBadge.timeLabel ? ` ${dueBadge.timeLabel}` : ""}
            </span>
          </div>
        )}
      </div>

      {/* Three-dot dropdown menu */}
      {showMenu && menuBtnRef.current && typeof document !== "undefined" && createPortal(
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setShowMenu(false)}
          />
          <div
            ref={menuDropdownRef}
            className="fixed z-50 bg-card rounded-lg shadow-xl border border-input-border py-1 min-w-[120px]"
            style={{
              top: menuBtnRef.current.getBoundingClientRect().bottom + 4,
              left: Math.min(
                menuBtnRef.current.getBoundingClientRect().left,
                window.innerWidth - 140
              ),
            }}
          >
            <button
              onClick={() => { setShowMenu(false); onDelete(task.id); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
