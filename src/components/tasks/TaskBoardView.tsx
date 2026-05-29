"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronLeft, ChevronRight, MoreVertical, Palette, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
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
import { extractCourseCode } from "@/lib/course-name-merge";

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

/**
 * Notion-style soft-tinted column accents. Each column gets a deterministic
 * dot + tinted background pill based on a stable hash of its name. We use a
 * small fixed palette so colors feel curated rather than random.
 *
 * Date buckets get fixed colors that read as a chronological gradient
 * (purple → amber → blue → green) to match common Kanban status palettes.
 */
const COLUMN_PALETTE: Array<{ dot: string; bg: string; subtle: string; text: string }> = [
  { dot: "#A78BFA", bg: "rgba(167,139,250,0.16)", subtle: "rgba(167,139,250,0.03)", text: "#7C3AED" }, // violet
  { dot: "#F59E0B", bg: "rgba(245,158,11,0.16)",  subtle: "rgba(245,158,11,0.03)",  text: "#B45309" }, // amber
  { dot: "#0e89d6", bg: "rgba(59,130,246,0.16)",  subtle: "rgba(59,130,246,0.03)",  text: "#0e89d6" }, // blue
  { dot: "#10B981", bg: "rgba(16,185,129,0.16)",  subtle: "rgba(16,185,129,0.03)",  text: "#047857" }, // green
  { dot: "#EC4899", bg: "rgba(236,72,153,0.16)",  subtle: "rgba(236,72,153,0.03)",  text: "#BE185D" }, // pink
  { dot: "#06B6D4", bg: "rgba(6,182,212,0.16)",   subtle: "rgba(6,182,212,0.03)",   text: "#0E7490" }, // cyan
  { dot: "#F97316", bg: "rgba(249,115,22,0.16)",  subtle: "rgba(249,115,22,0.03)",  text: "#C2410C" }, // orange
];
const NEUTRAL_ACCENT = { dot: "#9CA3AF", bg: "rgba(156,163,175,0.16)", subtle: "rgba(156,163,175,0.03)", text: "#374151" };

/** Date-bucket column names; these keep the fixed palette regardless of task colors. */
const DATE_BUCKET_SET = new Set(["Today", "Next 3 Days", "Next 7 Days", "Later"]);

/** Builds an accent palette from an arbitrary hex color so board columns match list-view task colors. */
function accentFromHex(hex: string): { dot: string; bg: string; subtle: string; text: string } {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return NEUTRAL_ACCENT;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return NEUTRAL_ACCENT;
  return {
    dot: hex,
    bg: `rgba(${r},${g},${b},0.16)`,
    subtle: `rgba(${r},${g},${b},0.03)`,
    text: hex,
  };
}

/**
 * Returns the column accent for a given column name. Date-bucket names get
 * fixed slots in the palette; everything else (class names, "General") gets
 * a hashed slot so repeat-renders produce the same color.
 *
 * @param name - The column's canonical key (course code, bucket name, etc.)
 */
function getColumnAccent(name: string): { dot: string; bg: string; subtle: string; text: string } {
  if (name === GENERAL_COLUMN) return NEUTRAL_ACCENT;
  // Pin the four date buckets so they read as a status gradient.
  if (name === "Today") return COLUMN_PALETTE[0];
  if (name === "Next 3 Days") return COLUMN_PALETTE[1];
  if (name === "Next 7 Days") return COLUMN_PALETTE[2];
  if (name === "Later") return COLUMN_PALETTE[3];
  // Deterministic FNV-1a-ish hash → palette index.
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return COLUMN_PALETTE[Math.abs(h) % COLUMN_PALETTE.length];
}

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
 * Groups tasks by course name into a sorted Map, merging courses with the
 * same extracted code (e.g. "UGBA 101A-LEC-002" and "UGBA 101A" merge).
 * Tasks without course_name go under "General".
 *
 * @param tasks - Array of tasks to group
 * @returns Map of canonical column name to tasks array, sorted alphabetically with General last
 */
function groupByCourse(tasks: Task[]): Map<string, Task[]> {
  // Map from course code → canonical (shortest) display name
  const codeToCanonical = new Map<string, string>();
  const codeGroups = new Map<string, Task[]>();

  for (const task of tasks) {
    const raw = task.course_name || GENERAL_COLUMN;
    const code = raw !== GENERAL_COLUMN ? extractCourseCode(raw) : null;

    let key: string;
    if (code) {
      const existing = codeToCanonical.get(code);
      if (!existing || raw.length < existing.length) {
        codeToCanonical.set(code, raw);
      }
      key = code;
    } else {
      key = raw;
    }

    const list = codeGroups.get(key);
    if (list) {
      list.push(task);
    } else {
      codeGroups.set(key, [task]);
    }
  }

  // Build result with canonical display names, sorted alphabetically
  const entries: [string, Task[]][] = [];
  for (const [key, tasks] of codeGroups) {
    const displayName = codeToCanonical.get(key) || key;
    entries.push([displayName, tasks]);
  }
  entries.sort((a, b) => {
    // General is the catch-all "no class" column — pin it first so the
    // user's untagged tasks are the leftmost column on the board.
    if (a[0] === GENERAL_COLUMN) return -1;
    if (b[0] === GENERAL_COLUMN) return 1;
    return a[0].localeCompare(b[0]);
  });

  const sorted = new Map<string, Task[]>();
  for (const [name, tasks] of entries) {
    sorted.set(name, tasks);
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

  // Refs / state for the scroll-arrow controls. The handlers that
  // consume columnIds are declared further down (after columnIds is
  // computed) to avoid a TDZ on the const declaration.
  const scrollRowRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const COLS_PER_PAGE = 4;
  const GAP = 16;
  /** localStorage key for the horizontal carousel position. Separated
   *  per groupBy so date and class views remember their own page.
   *  localStorage (not session) so the position survives closing the
   *  tab/browser and returning later. */
  const scrollMemoryKey = `board-scroll:${groupBy}`;
  /** Guards the one-shot restoration so we only seed scrollLeft once
   *  per mount, after columns paint. */
  const scrollRestoredRef = useRef(false);
  const pageStep = useCallback(() => {
    const el = scrollRowRef.current;
    if (!el) return 0;
    const first = el.children[0] as HTMLElement | undefined;
    if (!first) return 0;
    return COLS_PER_PAGE * (first.offsetWidth + GAP);
  }, []);

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
  /** Measured width of a rendered column at drag start, so the
   *  DragOverlay matches the source column's exact pixel width. */
  const [dragColWidth, setDragColWidth] = useState<number | null>(null);

  const isDragEnabled = groupBy === "class";

  /** PointerSensor with 5px activation distance to avoid accidental drags. */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  /** Sets activeId, snapshots column order, and measures the active
   *  column's pixel width so the DragOverlay can match it exactly. */
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    savedOrderRef.current = columnIdsRef.current;
    const first = scrollRowRef.current?.children[0] as HTMLElement | undefined;
    if (first) setDragColWidth(first.offsetWidth);
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

  // Scroll-arrow handlers + ResizeObserver — declared here because they
  // depend on columnIds. One page = 4 * (colWidth + gap). Total pages is
  // ceil(columnCount / 4) so a partial last page still counts. The last
  // page clamps to maxScroll (= scrollWidth − clientWidth) so the
  // viewport stays filled (e.g. cols 6–9 of 9 instead of just col 9).
  const handleScrollByOne = useCallback((direction: 1 | -1) => {
    const el = scrollRowRef.current;
    if (!el) return;
    const step = pageStep();
    if (!step) return;
    const maxPage = Math.max(0, totalPages - 1);
    const nextPage = Math.max(0, Math.min(maxPage, currentPage + direction));
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const target = nextPage === maxPage ? maxScroll : nextPage * step;
    el.scrollTo({ left: target, behavior: "smooth" });
  }, [pageStep, currentPage, totalPages]);
  const handleScrollUpdate = useCallback(() => {
    const el = scrollRowRef.current;
    if (!el) return;
    const step = pageStep();
    if (!step) return;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const pages = Math.max(1, Math.ceil(columnIds.length / COLS_PER_PAGE));
    setTotalPages(pages);
    setCurrentPage(
      el.scrollLeft >= maxScroll - 1 ? pages - 1 : Math.round(el.scrollLeft / step),
    );
    // Persist scroll position so navigating away and back to the board
    // (or switching between Board/List/Calendar tabs, or closing the
    // tab and returning later) returns to the same carousel page.
    // Only persist after the initial restore has run — otherwise the
    // first scroll event from the restore itself would just rewrite
    // the same value.
    if (scrollRestoredRef.current) {
      try {
        localStorage.setItem(scrollMemoryKey, String(el.scrollLeft));
      } catch {
        /* localStorage unavailable — non-critical */
      }
    }
  }, [pageStep, columnIds.length, scrollMemoryKey]);
  useEffect(() => {
    const el = scrollRowRef.current;
    if (!el) return;
    const recompute = () => {
      setTotalPages(Math.max(1, Math.ceil(columnIds.length / COLS_PER_PAGE)));
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    for (const child of Array.from(el.children)) ro.observe(child);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnIds.length]);

  /**
   * Restores horizontal scroll position from sessionStorage after the
   * columns have laid out. Runs once per mount of this component, gated
   * on columnIds.length so we don't restore before the row has width.
   * The clamp guards against stored positions exceeding the new
   * scrollWidth (e.g. user dropped a class between sessions).
   */
  useEffect(() => {
    if (scrollRestoredRef.current) return;
    const el = scrollRowRef.current;
    if (!el || columnIds.length === 0) return;
    try {
      const raw = localStorage.getItem(scrollMemoryKey);
      if (raw !== null) {
        const target = Number(raw);
        if (Number.isFinite(target)) {
          const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
          el.scrollLeft = Math.min(Math.max(0, target), maxScroll);
        }
      }
    } catch {
      /* localStorage unavailable — non-critical */
    }
    scrollRestoredRef.current = true;
    // Recompute page indicators against the freshly-set scrollLeft.
    handleScrollUpdate();
  }, [columnIds.length, scrollMemoryKey, handleScrollUpdate]);

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
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90 transition-opacity"
        >
          Refresh
        </button>
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
          No tasks yet. Press + to add one.
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
      autoScroll={{ threshold: { x: 0.15, y: 0.15 }, interval: 5 }}
    >
      {/* Static scroll controls — left/right arrows plus a current/total
          indicator so the user knows there are more columns to the right.
          Sticky to the top of the scrolling task-list wrapper so the
          arrows stay visible even as the user scrolls long columns. */}
      <div className="sticky top-0 z-10 bg-background flex items-center justify-between pt-1 pb-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleScrollByOne(-1)}
            disabled={currentPage <= 0}
            aria-label="Previous column"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleScrollByOne(1)}
            disabled={currentPage >= Math.max(0, columnIds.length - 1)}
            aria-label="Next column"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        {/* Page indicator — phone-home-screen style dots. One dot per
            page; the current page's dot is the accent foreground color,
            others are muted. Compact and instantly readable. */}
        <div className="flex items-center gap-1.5" aria-label={`Page ${currentPage + 1} of ${totalPages}`}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === currentPage ? "bg-foreground" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
      <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
        <div
          ref={scrollRowRef}
          onScroll={handleScrollUpdate}
          // overflow-x-hidden disables wheel/trackpad scrolling — only the
          // arrow buttons (which call scrollBy programmatically) advance
          // the row. Vertical scroll inside columns still works because
          // each column owns its own overflow.
          className="flex overflow-x-hidden gap-4 px-0 pb-6 h-full scroll-smooth"
        >
          {[...columns.entries()].map(([columnName, columnTasks]) => (
            <SortableColumn key={columnName} id={columnName}>
              {({ setNodeRef, style, attributes, listeners }) => (
                <div
                  ref={setNodeRef}
                  // Width math: 4 columns fit perfectly in the viewport
                  // when each is (100% − 3 gaps × 16px) / 4 wide.
                  style={{ ...style, flex: "0 0 calc((100% - 48px) / 4)" }}
                  className="min-w-0"
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
          <div
            className="opacity-95 shadow-2xl cursor-grabbing"
            // Use the measured pixel width of the live column so the
            // overlay matches the source column shape exactly.
            style={{ willChange: "transform", width: dragColWidth ?? 280 }}
          >
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
  // Completed section starts collapsed by default. The hydrate effect below
  // re-opens it only if the user previously expanded it for this column —
  // saved state under `caltodo_board_completed_${name}` ("true" = expanded).
  const [completedExpanded, setCompletedExpanded] = useState(false);
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

  // Hydrate expanded state from localStorage after mount. We now store
  // "true" only when the user has explicitly expanded the section for this
  // column, so the default-collapsed state needs no entry.
  useEffect(() => {
    try {
      const key = `caltodo_board_completed_${name}`;
      const saved = localStorage.getItem(key);
      if (saved === "true") setCompletedExpanded(true);
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

  // Column accent — for class columns, derive from the dominant task color
  // so the board matches the list view's class color. Date buckets keep the
  // fixed chronological gradient palette.
  const accent = (!DATE_BUCKET_SET.has(name) && columnColor)
    ? accentFromHex(columnColor)
    : getColumnAccent(name);

  // The whole column wrapper is the drag handle now — listeners go on the
  // root div. PointerSensor's 5px activation distance still keeps task-card
  // clicks and the title-pill click from being interpreted as drags.
  const wrapperListeners = (showDragHandle && dragHandleListeners ? dragHandleListeners : {}) as Record<string, (e: React.PointerEvent) => void>;

  return (
    <div
      // Spread listeners first so the explicit `style` below wins over any
      // style coming from dnd-kit (we previously had touchAction collide
      // with backgroundColor, wiping out the column tint entirely).
      {...wrapperListeners}
      // Column hugs its content exactly — no h-full, no min-h. Whatever
      // the header + active list + Completed row need is the column
      // height. align-self start prevents the parent flex from
      // stretching us to match a taller neighbor.
      className={`flex flex-col self-start rounded-2xl border border-border/60 px-2 pt-2 pb-2 ${
        showDragHandle ? "cursor-grab active:cursor-grabbing" : ""
      }`}
      style={{
        backgroundColor: accent.subtle,
        touchAction: showDragHandle ? "none" : undefined,
      }}
    >
      <div className="px-0.5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {/* Title pill — clicking the pill opens the column options menu
              (replaces the three-dot button). When editing the title, the
              input replaces the label inline. */}
          {editing ? (
            <div
              className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 rounded-full min-w-0"
              style={{ backgroundColor: accent.bg }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: accent.text }}
              />
              <input
                ref={editInputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") { setEditValue(displayName); setEditing(false); }
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="text-sm font-semibold text-foreground bg-transparent border-b border-blue-500 outline-none min-w-0 py-0"
              />
            </div>
          ) : (
            <button
              ref={menuBtnRef}
              type="button"
              onClick={() => !hideMenu && setShowMenu(!showMenu)}
              disabled={hideMenu}
              className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 rounded-full min-w-0 hover:brightness-95 dark:hover:brightness-110 transition-all disabled:cursor-default cursor-pointer"
              style={{ backgroundColor: accent.bg }}
              title={hideMenu ? undefined : "Column options"}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: accent.text }}
              />
              <span className="text-sm font-semibold text-foreground truncate">
                {displayName}
              </span>
            </button>
          )}
          <span
            className="text-sm font-semibold shrink-0"
            style={{ color: accent.text }}
          >
            {active.length}
          </span>
        </div>
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

      {/* Card area — natural height: each section sits directly under the
          previous one (active list → + New task → Completed). The column
          wrapper's h-full still provides vertical room when the column is
          short relative to its neighbors. */}
      <div className="flex flex-col gap-2">
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

        {/* "+ New task" — always visible (when the column accepts new tasks),
            sits below the active list. Outline-only and super subtle so it
            reads as a quiet add-affordance rather than a CTA. Drag listeners
            on the parent shouldn't pick this up because clicks don't move. */}
        {!hideMenu && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Add task"
            title="Add task"
            // "+ New task" — + on the left, label to its right, vertically
            // centered. Faded by default, lights up on hover. Border picks
            // up the title-pill tint so it reads as part of the column's
            // color family.
            className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-opacity cursor-pointer bg-transparent hover:bg-accent/40 opacity-60 hover:opacity-100"
            style={{ color: accent.text, border: `1px solid ${accent.bg}` }}
          >
            <Plus size={16} strokeWidth={2.5} className="shrink-0" />
            <span>New task</span>
          </button>
        )}

        {/* Truly empty + columns where adding is disabled get a neutral
            "No tasks" hint instead of the add button above. */}
        {hideMenu && active.length === 0 && completed.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/40 py-6 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No tasks</span>
          </div>
        )}

        {/* Completed section — sits naturally under the + New task row
            (no mt-auto pinning). When expanded it just grows downward
            with its content. */}
        {completed.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => {
                const next = !completedExpanded;
                setCompletedExpanded(next);
                try { localStorage.setItem(`caltodo_board_completed_${name}`, String(next)); } catch { /* ignore */ }
              }}
              className={`flex items-center gap-1 px-1 py-1.5 w-full text-left transition-opacity hover:opacity-100 ${
                completedExpanded ? "opacity-100" : "opacity-60"
              }`}
            >
              <ChevronDown
                size={14}
                className={`shrink-0 transition-transform duration-200 ${
                  completedExpanded ? "" : "-rotate-90"
                }`}
                style={{ color: accent.text }}
              />
              <span className="text-sm font-semibold" style={{ color: accent.text }}>Completed</span>
              <span className="text-sm font-semibold ml-1" style={{ color: accent.text }}>
                {completed.length}
              </span>
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
          {/* Board-view cards never render a squircle — the preview
              popover that opens on click has its own checkbox. The card
              itself stays as just title + date. */}
          <span
            className={`text-sm font-semibold leading-snug flex-1 min-w-0 ${
              isCompleted ? "text-muted-foreground line-through" : "text-foreground"
            }`}
          >
            {task.title}
          </span>
          {/* Three-dots hover menu removed from board cards — delete /
              edit happen via the preview popover that opens on click. */}
        </div>

        {/* Date + time pill — tint is derived from the badge text color
            via color-mix(currentColor 14% transparent) so the soft bg
            always tracks whatever urgency color the badge is using
            (red for overdue, blue for upcoming, etc.). */}
        {dueBadge && (
          <div className="mt-1.5">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${dueBadge.className} ${isCompleted ? "opacity-70" : ""}`}
              style={{ backgroundColor: "color-mix(in srgb, currentColor 14%, transparent)" }}
            >
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
