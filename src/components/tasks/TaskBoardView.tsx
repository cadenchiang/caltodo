"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { Task, TaskInsert } from "@/lib/types";
import { useTaskContext } from "@/contexts/TaskContext";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import TaskCreateModal from "./TaskCreateModal";
import SortableColumn from "./SortableColumn";
import BoardColumn from "./board/BoardColumn";
import { useBoardPaging } from "./board/useBoardPaging";
import { loadColumnAliases, saveColumnAliases, loadColumnOrder, saveColumnOrder } from "./board-storage";
import { applyColumnOrder, groupByCourse, groupByDate } from "./board-helpers";

/**
 * Column width by breakpoint: one column on phones, two from md, four from
 * lg. Snap points keep a swipe landing on a whole column.
 */
const COLUMN_WIDTH = "shrink-0 grow-0 snap-start basis-full md:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-3rem)/4)]";

interface TaskBoardViewProps {
  tasks: Task[];
  loading: boolean;
  /** Plain message for a failed initial load; null otherwise. */
  error: string | null;
  selectedTaskId?: string | null;
  groupBy?: "class" | "date";
  onAdd: (task: TaskInsert) => void | Promise<boolean | void>;
  onToggle: (id: string) => void;
  onSelect: (task: Task, anchorRect?: DOMRect) => void;
  onDelete: (id: string) => void;
  onColorChange?: (courseName: string, color: string) => void;
  onDeleteClass?: (courseName: string) => void;
}

/**
 * Board view: one column per class (or per date bucket), 1/2/4 columns by
 * breakpoint with horizontal snap scrolling. Class columns reorder by
 * dragging their grip handle with the pointer or the keyboard.
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
  const { fetchTasks } = useTaskContext();
  const [aliases, setAliases] = useState<Map<string, string>>(() => loadColumnAliases());
  const [emptyStateCreateOpen, setEmptyStateCreateOpen] = useState(false);
  const scrollRowRef = useRef<HTMLDivElement>(null);
  const isDateMode = groupBy === "date";
  const isDragEnabled = groupBy === "class";

  /** Renames a column by saving a display alias. */
  const renameColumn = useCallback((originalName: string, newDisplayName: string) => {
    setAliases((prev) => {
      const next = new Map(prev);
      const trimmed = newDisplayName.trim();
      if (!trimmed || trimmed === originalName) next.delete(originalName);
      else next.set(originalName, trimmed);
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

  // Column drag-and-drop (@dnd-kit): pointer from the grip, keyboard too.
  const [columnOrder, setColumnOrder] = useState<string[]>(() => loadColumnOrder());
  const [activeId, setActiveId] = useState<string | null>(null);
  const savedOrderRef = useRef<string[]>([]);
  const columnIdsRef = useRef<string[]>([]);
  const [dragColWidth, setDragColWidth] = useState<number | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    savedOrderRef.current = columnIdsRef.current;
    const first = scrollRowRef.current?.children[0] as HTMLElement | undefined;
    if (first) setDragColWidth(first.offsetWidth);
  }, []);

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

  const handleDragCancel = useCallback(() => {
    setColumnOrder(savedOrderRef.current);
    setActiveId(null);
  }, []);

  const columns = useMemo(() => {
    if (isDateMode) return groupByDate(tasks);
    const base = groupByCourse(tasks);
    return columnOrder.length === 0 ? base : applyColumnOrder(base, columnOrder);
  }, [tasks, isDateMode, columnOrder]);
  const columnIds = useMemo(() => [...columns.keys()], [columns]);
  columnIdsRef.current = columnIds;

  const paging = useBoardPaging(scrollRowRef, columnIds.length, `board-scroll:${groupBy}`);
  const activeColumnTasks = activeId ? columns.get(activeId) ?? null : null;

  /** Props every column shares. */
  const columnCallbacks = { onAdd, onToggle, onSelect, onDelete, onRename: renameColumn, onResetName: resetColumnName, onColorChange, onDeleteClass, selectedTaskId };

  if (loading) {
    return (
      <div className="flex gap-4 pt-1" role="status" aria-busy="true">
        <span className="sr-only">Loading tasks</span>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${COLUMN_WIDTH} rounded-2xl border border-border/60 p-2 space-y-2`}>
            <div className="h-6 w-2/3 rounded-full bg-muted animate-pulse" />
            <div className="h-14 rounded-xl bg-muted animate-pulse" />
            <div className="h-14 rounded-xl bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // Only a failed initial load reaches here (TaskContext keeps write
  // failures out of `error`), so there is nothing to keep on screen.
  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle size={20} />}
        title={error}
        description="Check your connection and try again."
        action={<Button variant="inverted" onClick={() => fetchTasks()}>Try again</Button>}
      />
    );
  }

  if (columns.size === 0 && !isDateMode) {
    return (
      <>
        <EmptyState
          icon={<LayoutGrid size={20} />}
          title="No tasks yet"
          description="Add one, or sync your classes to pull in assignments."
          action={<Button onClick={() => setEmptyStateCreateOpen(true)}>Add task</Button>}
        />
        <TaskCreateModal
          open={emptyStateCreateOpen}
          onClose={() => setEmptyStateCreateOpen(false)}
          onAdd={(task) => { setEmptyStateCreateOpen(false); return onAdd(task); }}
        />
      </>
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
      {/* Paging controls, sticky above the row. */}
      <div className="sticky top-0 z-sticky bg-background flex items-center justify-between pt-1 pb-3">
        <div className="flex items-center gap-1">
          <IconButton variant="secondary" shape="square" aria-label="Previous columns" disabled={paging.currentPage <= 0} onClick={() => paging.scrollByPage(-1)}>
            <ChevronLeft size={16} />
          </IconButton>
          <IconButton variant="secondary" shape="square" aria-label="Next columns" disabled={paging.currentPage >= paging.totalPages - 1} onClick={() => paging.scrollByPage(1)}>
            <ChevronRight size={16} />
          </IconButton>
        </div>
        <div className="flex items-center gap-1.5" role="status" aria-label={`Page ${paging.currentPage + 1} of ${paging.totalPages}`}>
          {Array.from({ length: paging.totalPages }).map((_, i) => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === paging.currentPage ? "bg-foreground" : "bg-muted-foreground/30"}`} />
          ))}
        </div>
      </div>

      <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
        <div
          ref={scrollRowRef}
          onScroll={paging.onScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 px-0 pb-6 h-full scroll-smooth"
        >
          {[...columns.entries()].map(([columnName, columnTasks]) => (
            <SortableColumn key={columnName} id={columnName}>
              {({ setNodeRef, style, attributes, listeners }) => (
                <div ref={setNodeRef} style={style} className={`${COLUMN_WIDTH} min-w-0`}>
                  <BoardColumn
                    name={columnName}
                    displayName={isDateMode ? columnName : aliases.get(columnName) || columnName}
                    hasAlias={isDateMode ? false : aliases.has(columnName)}
                    hideMenu={isDateMode}
                    showDragHandle={isDragEnabled}
                    dragHandleListeners={isDragEnabled ? listeners : undefined}
                    dragHandleAttributes={isDragEnabled ? attributes : undefined}
                    tasks={columnTasks}
                    {...columnCallbacks}
                  />
                </div>
              )}
            </SortableColumn>
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
        {activeId && activeColumnTasks && (
          <div className="opacity-95 shadow-2xl cursor-grabbing" style={{ willChange: "transform", width: dragColWidth ?? 280 }}>
            <BoardColumn
              name={activeId}
              displayName={isDateMode ? activeId : aliases.get(activeId) || activeId}
              hasAlias={isDateMode ? false : aliases.has(activeId)}
              hideMenu
              showDragHandle
              tasks={activeColumnTasks}
              {...columnCallbacks}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
