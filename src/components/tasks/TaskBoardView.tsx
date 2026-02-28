"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, GripVertical, MoreVertical, Palette, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import type { Task, TaskInsert } from "@/lib/types";
import { TASK_COLORS, getThemeColor } from "@/lib/constants";
import { getDueDateInfo } from "@/lib/task-utils";
import TaskCreateModal from "./TaskCreateModal";
import SortableColumn from "./SortableColumn";
import TaskCheckbox from "./shared/TaskCheckbox";
import { useTheme } from "@/contexts/ThemeContext";

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

/** localStorage key for saved column order. */
const COLUMN_ORDER_KEY = "caltodo_board_column_order";

/**
 * Loads saved column order from localStorage.
 *
 * @returns Array of column names in saved order, or empty array on failure
 */
function loadColumnOrder(): string[] {
  try {
    const raw = localStorage.getItem(COLUMN_ORDER_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

/**
 * Saves column order to localStorage.
 *
 * @param order - Array of column names in desired order
 */
function saveColumnOrder(order: string[]): void {
  try {
    localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(order));
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

/**
 * Reorders a grouped columns Map based on a saved column order.
 * Columns in savedOrder appear first (in that order), then any new columns
 * are appended alphabetically with "General" last.
 * Stale names in savedOrder that don't exist in columns are silently skipped.
 *
 * @param columns - Map of column name to tasks array
 * @param savedOrder - Previously saved array of column names
 * @returns New Map with columns reordered
 */
function applyColumnOrder(
  columns: Map<string, Task[]>,
  savedOrder: string[]
): Map<string, Task[]> {
  const result = new Map<string, Task[]>();
  const remaining = new Set(columns.keys());

  // Add columns in saved order first
  for (const name of savedOrder) {
    if (columns.has(name)) {
      result.set(name, columns.get(name)!);
      remaining.delete(name);
    }
  }

  // Append any new columns alphabetically, General last
  const newColumns = [...remaining].sort((a, b) => {
    if (a === GENERAL_COLUMN) return 1;
    if (b === GENERAL_COLUMN) return -1;
    return a.localeCompare(b);
  });

  for (const name of newColumns) {
    result.set(name, columns.get(name)!);
  }

  return result;
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
  const { colorTheme } = useTheme();
  const isMiffy = colorTheme === "miffy";
  const [aliases, setAliases] = useState<Map<string, string>>(() => loadColumnAliases());
  const [emptyStateCreateOpen, setEmptyStateCreateOpen] = useState(false);

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

  // --- Column drag-and-drop state (@dnd-kit) ---
  const [columnOrder, setColumnOrder] = useState<string[]>(() => loadColumnOrder());
  const [activeId, setActiveId] = useState<string | null>(null);
  /** Saved order snapshot to revert on cancel. */
  const savedOrderRef = useRef<string[]>([]);
  /** Always-current column IDs (updated after columns memo, read in callbacks). */
  const columnIdsRef = useRef<string[]>([]);

  const isDragEnabled = groupBy === "class";

  /** PointerSensor with 5px activation distance to avoid accidental drags. */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  /** Sets activeId and snapshots the current column order for potential revert. */
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    savedOrderRef.current = columnIdsRef.current;
  }, []);

  /** Persists the final order to localStorage and clears activeId. */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const currentIds = columnIdsRef.current;
      const oldIdx = currentIds.indexOf(String(active.id));
      const newIdx = currentIds.indexOf(String(over.id));
      if (oldIdx !== -1 && newIdx !== -1) {
        const newOrder = arrayMove(currentIds, oldIdx, newIdx);
        setColumnOrder(newOrder);
        saveColumnOrder(newOrder);
      }
    }
    setActiveId(null);
  }, []);

  /** Reverts to saved order on cancel (e.g. Escape key). */
  const handleDragCancel = useCallback(() => {
    setColumnOrder(savedOrderRef.current);
    setActiveId(null);
  }, []);

  const isDateMode = groupBy === "date";

  // Apply saved column order when in class mode
  const columns = useMemo(() => {
    if (isDateMode) return groupByDate(tasks);
    const base = groupByCourse(tasks);
    if (columnOrder.length === 0) return base;
    return applyColumnOrder(base, columnOrder);
  }, [tasks, isDateMode, columnOrder]);

  /** Ordered column IDs for SortableContext. */
  const columnIds = useMemo(() => [...columns.keys()], [columns]);
  columnIdsRef.current = columnIds;

  /** Active column data for DragOverlay rendering. */
  const activeColumnTasks = activeId ? columns.get(activeId) ?? null : null;

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

  if (columns.size === 0 && !isDateMode) {
    return (
      <div className="px-6">
        <div className="max-w-[320px]">
          <button
            onClick={() => setEmptyStateCreateOpen(true)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-accent transition-colors cursor-pointer w-full"
          >
            <Plus size={16} />
            Add task
          </button>
          <TaskCreateModal
            open={emptyStateCreateOpen}
            onClose={() => setEmptyStateCreateOpen(false)}
            onAdd={(task) => { onAdd(task); setEmptyStateCreateOpen(false); }}
          />
        </div>
        <div className="flex flex-col items-center py-12 text-subtle-foreground text-sm gap-3">
          {isMiffy && (
            <img
              src="/miffy/miffy-pen.png"
              alt=""
              className="w-20 h-auto opacity-50 select-none pointer-events-none"
              draggable={false}
            />
          )}
          No tasks yet. Type above and press Enter!
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      autoScroll={false}
    >
      <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
        <div className="flex overflow-x-auto gap-6 px-6 pb-6 h-full">
          {[...columns.entries()].map(([columnName, columnTasks]) => (
            <SortableColumn key={columnName} id={columnName}>
              {({ setNodeRef, style, attributes, listeners }) => (
                <div
                  ref={setNodeRef}
                  style={style}
                  className="min-w-[280px] max-w-[320px] flex-shrink-0"
                  {...attributes}
                >
                  <BoardColumn
                    name={columnName}
                    displayName={isDateMode ? columnName : (aliases.get(columnName) || columnName)}
                    hasAlias={isDateMode ? false : aliases.has(columnName)}
                    hideMenu={isDateMode}
                    showDragHandle={isDragEnabled}
                    dragHandleListeners={isDragEnabled ? listeners : undefined}
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
                </div>
              )}
            </SortableColumn>
          ))}
        </div>
      </SortableContext>

      {/* Floating drag overlay — follows cursor with subtle shadow */}
      <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
        {activeId && activeColumnTasks && (
          <div className="min-w-[280px] max-w-[320px] opacity-95 shadow-2xl cursor-grabbing" style={{ willChange: "transform" }}>
            <BoardColumn
              name={activeId}
              displayName={isDateMode ? activeId : (aliases.get(activeId) || activeId)}
              hasAlias={isDateMode ? false : aliases.has(activeId)}
              hideMenu
              showDragHandle
              tasks={activeColumnTasks}
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
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

interface BoardColumnProps {
  name: string;
  displayName: string;
  hasAlias: boolean;
  hideMenu?: boolean;
  showDragHandle?: boolean;
  /** @dnd-kit listeners to spread onto the drag grip handle. */
  dragHandleListeners?: Record<string, Function>;
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
  showDragHandle = false,
  dragHandleListeners,
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
  const BOARD_ITEMS_LIMIT = 5;
  const [completedExpanded, setCompletedExpanded] = useState(true);
  const [showAllActive, setShowAllActive] = useState(false);
  const [showAllCompleted, setShowAllCompleted] = useState(false);

  // Compute the most common task color in this column for new task defaults
  const columnColor = useMemo(() => {
    if (tasks.length === 0) return undefined;
    const counts = new Map<string, number>();
    for (const t of tasks) {
      counts.set(t.color, (counts.get(t.color) ?? 0) + 1);
    }
    let maxColor = tasks[0].color;
    let maxCount = 0;
    for (const [c, n] of counts) {
      if (n > maxCount) { maxColor = c; maxCount = n; }
    }
    return maxColor;
  }, [tasks]);

  // Hydrate collapsed state from localStorage after mount
  useEffect(() => {
    try {
      const key = `caltodo_board_completed_${name}`;
      const saved = localStorage.getItem(key);
      if (saved === "false") setCompletedExpanded(false);
    } catch { /* ignore */ }
  }, [name]);
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
    <div className="flex flex-col h-full">
      {/* Column header — plain text, not in a box */}
      <div className="px-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {showDragHandle && (
            <div
              className="flex-shrink-0 cursor-grab active:cursor-grabbing touch-none text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              title="Drag to reorder"
              {...dragHandleListeners}
            >
              <GripVertical size={14} />
            </div>
          )}
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
            className="fixed z-[9999] rounded-xl shadow-2xl border border-border overflow-hidden animate-in min-w-[150px] bg-popover"
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

      {/* Task creation modal — triggered by column + button */}
      <TaskCreateModal
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        onAdd={(task) => {
          onAdd({ ...task, course_name: name });
          setShowAddForm(false);
        }}
      />

      {/* Scrollable card area */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {/* Active task cards */}
        {(showAllActive ? active : active.slice(0, BOARD_ITEMS_LIMIT)).map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isSelected={selectedTaskId === task.id}
            onToggle={onToggle}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
        {active.length > BOARD_ITEMS_LIMIT && (
          <button
            onClick={() => setShowAllActive(!showAllActive)}
            className="py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left px-1"
          >
            {showAllActive ? "Show less" : `+${active.length - BOARD_ITEMS_LIMIT} more`}
          </button>
        )}

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
              onClick={() => {
                const next = !completedExpanded;
                setCompletedExpanded(next);
                try { localStorage.setItem(`caltodo_board_completed_${name}`, String(next)); } catch { /* ignore */ }
              }}
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
                {(showAllCompleted ? completed : completed.slice(0, BOARD_ITEMS_LIMIT)).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isSelected={selectedTaskId === task.id}
                    onToggle={onToggle}
                    onSelect={onSelect}
                    onDelete={onDelete}
                  />
                ))}
                {completed.length > BOARD_ITEMS_LIMIT && (
                  <button
                    onClick={() => setShowAllCompleted(!showAllCompleted)}
                    className="py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left px-1"
                  >
                    {showAllCompleted ? "Show less" : `+${completed.length - BOARD_ITEMS_LIMIT} more`}
                  </button>
                )}
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
  const { colorTheme } = useTheme();
  const isMiffyCard = colorTheme === "miffy";
  const taskColor = getThemeColor(task.color, colorTheme);
  const [showMenu, setShowMenu] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);
  const isCompleted = task.is_completed || task.is_submitted;
  const rawBadge = getDueDateInfo(task.due_date, task.due_time);
  const dueBadge = isCompleted && rawBadge
    ? { ...rawBadge, className: "text-muted-foreground" }
    : rawBadge && isMiffyCard && rawBadge.className === "text-blue-400"
      ? { ...rawBadge, className: "text-[#e8729a] dark:text-[#f4a0bc]" }
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
            ? isMiffyCard
              ? "border-[#e8729a] shadow-sm"
              : "border-blue-400 shadow-sm"
            : "border-input-border hover:shadow-md"
        } ${isCompleted ? "opacity-50" : ""}`}
        onClick={(e) => onSelect(task, e.currentTarget.getBoundingClientRect())}
      >
        {/* Checkbox + title + three-dot menu */}
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5">
            <TaskCheckbox
              color={taskColor}
              isCompleted={isCompleted}
              onToggle={() => onToggle(task.id)}
              size="sm"
            />
          </div>
          <span
            className={`text-sm leading-snug flex-1 min-w-0 ${
              isCompleted ? "text-muted-foreground" : "text-foreground"
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
