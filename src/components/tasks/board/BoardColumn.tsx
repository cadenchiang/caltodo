"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, GripVertical, Plus } from "lucide-react";
import type { Task, TaskInsert } from "@/lib/types";
import { useNow } from "@/hooks/useNow";
import TaskCreateModal from "../TaskCreateModal";
import ClassMenu from "../shared/ClassMenu";
import BoardTaskCard from "./BoardTaskCard";
import type { DragHandleListeners } from "../SortableColumn";
import { DATE_BUCKET_SET, accentFromHex, dominantColor, getColumnAccent, partitionColumnTasks } from "../board-helpers";

/** Cards shown per section before "+N more". */
const BOARD_ITEMS_LIMIT = 5;

export interface BoardColumnProps {
  name: string;
  displayName: string;
  hasAlias: boolean;
  /** Date buckets: no rename, colour or delete, and no add button. */
  hideMenu?: boolean;
  /** Renders the grip handle that starts a column drag. */
  showDragHandle?: boolean;
  /** dnd-kit listeners to spread onto the grip handle. */
  dragHandleListeners?: DragHandleListeners;
  /** dnd-kit attributes (role, tabIndex, aria) for the grip handle. */
  dragHandleAttributes?: Record<string, unknown>;
  tasks: Task[];
  selectedTaskId?: string | null;
  onAdd: (task: TaskInsert) => void | Promise<boolean | void>;
  onToggle: (id: string) => void;
  onSelect: (task: Task, anchorRect?: DOMRect) => void;
  onDelete: (id: string) => void;
  onRename: (originalName: string, newDisplayName: string) => void;
  onResetName: (originalName: string) => void;
  onColorChange?: (courseName: string, color: string) => void;
  onDeleteClass?: (courseName: string) => void;
}

/**
 * Single board column: title pill (opens the class menu), grip handle for
 * dragging, active cards, a "New task" button and a collapsible Completed
 * section. Drag starts only from the grip, so the column root keeps normal
 * touch behaviour (page scroll works).
 *
 * @param props - BoardColumnProps
 */
export default function BoardColumn({
  name,
  displayName,
  hasAlias,
  hideMenu = false,
  showDragHandle = false,
  dragHandleListeners,
  dragHandleAttributes,
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
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [showAllActive, setShowAllActive] = useState(false);
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(displayName);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const now = useNow();

  // Re-open Completed only if the user expanded it for this column before.
  useEffect(() => {
    try {
      if (localStorage.getItem(`caltodo_board_completed_${name}`) === "true") setCompletedExpanded(true);
    } catch { /* ignore */ }
  }, [name]);

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

  const columnColor = useMemo(() => dominantColor(tasks), [tasks]);
  const { active, completed } = useMemo(() => partitionColumnTasks(tasks, now.getTime()), [tasks, now]);
  const accent = !DATE_BUCKET_SET.has(name) && columnColor ? accentFromHex(columnColor) : getColumnAccent(name);

  return (
    <div
      className="flex flex-col self-start rounded-2xl border border-border/60 px-2 pt-2 pb-2"
      style={{ backgroundColor: accent.subtle }}
    >
      <div className="px-0.5 pb-2 flex items-center justify-between gap-1">
        <div className="flex items-center gap-2 min-w-0">
          {showDragHandle && (
            <button
              type="button"
              {...dragHandleAttributes}
              {...dragHandleListeners}
              aria-label={`Drag to reorder ${displayName}`}
              title="Drag to reorder"
              className="shrink-0 -ml-1 w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent cursor-grab active:cursor-grabbing touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <GripVertical size={14} />
            </button>
          )}
          {editing ? (
            <div className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 rounded-full min-w-0" style={{ backgroundColor: accent.bg }}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: accent.text }} />
              <label htmlFor={`rename-col-${name}`} className="sr-only">Rename {displayName}</label>
              <input
                id={`rename-col-${name}`}
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
            </div>
          ) : (
            <button
              ref={menuBtnRef}
              type="button"
              onClick={() => !hideMenu && setShowMenu((v) => !v)}
              disabled={hideMenu}
              aria-haspopup={hideMenu ? undefined : "menu"}
              aria-expanded={hideMenu ? undefined : showMenu}
              className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 rounded-full min-w-0 hover:brightness-95 dark:hover:brightness-110 transition-all disabled:cursor-default cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ backgroundColor: accent.bg }}
              title={hideMenu ? undefined : "Column options"}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: accent.text }} />
              <span className="text-sm font-semibold text-foreground truncate">{displayName}</span>
            </button>
          )}
          <span className="text-sm font-semibold shrink-0" style={{ color: accent.text }}>{active.length}</span>
        </div>
        {!hideMenu && (
          <ClassMenu
            open={showMenu}
            onClose={() => setShowMenu(false)}
            anchorRef={menuBtnRef}
            name={name}
            hasAlias={hasAlias}
            taskCount={tasks.length}
            onRename={() => { setEditValue(displayName); setEditing(true); }}
            onResetName={() => onResetName(name)}
            onColorChange={onColorChange}
            onDeleteClass={onDeleteClass}
          />
        )}
      </div>

      <TaskCreateModal
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        onAdd={(task) => { setShowAddForm(false); return onAdd({ ...task, course_name: name }); }}
      />

      <div className="flex flex-col gap-2">
        {(showAllActive ? active : active.slice(0, BOARD_ITEMS_LIMIT)).map((task) => (
          <BoardTaskCard key={task.id} task={task} isSelected={selectedTaskId === task.id} onToggle={onToggle} onSelect={onSelect} onDelete={onDelete} />
        ))}
        {active.length > BOARD_ITEMS_LIMIT && (
          <button type="button" onClick={() => setShowAllActive((v) => !v)} className="py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left px-1">
            {showAllActive ? "Show less" : `+${active.length - BOARD_ITEMS_LIMIT} more`}
          </button>
        )}

        {!hideMenu && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center gap-2 rounded-xl px-3 py-2 min-h-11 text-sm font-medium transition-opacity cursor-pointer bg-transparent hover:bg-accent/40 opacity-60 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ color: accent.text, border: `1px solid ${accent.bg}` }}
          >
            <Plus size={16} strokeWidth={2.5} className="shrink-0" aria-hidden="true" />
            <span>New task</span>
          </button>
        )}

        {hideMenu && active.length === 0 && completed.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/40 py-6 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No tasks</span>
          </div>
        )}

        {completed.length > 0 && (
          <div className="mt-2">
            <button
              type="button"
              aria-expanded={completedExpanded}
              onClick={() => {
                const next = !completedExpanded;
                setCompletedExpanded(next);
                try { localStorage.setItem(`caltodo_board_completed_${name}`, String(next)); } catch { /* ignore */ }
              }}
              className={`flex items-center gap-1 px-1 py-1.5 w-full text-left transition-opacity hover:opacity-100 focus-visible:opacity-100 ${completedExpanded ? "opacity-100" : "opacity-60"}`}
            >
              <ChevronDown size={14} className={`shrink-0 transition-transform duration-200 ${completedExpanded ? "" : "-rotate-90"}`} style={{ color: accent.text }} aria-hidden="true" />
              <span className="text-sm font-semibold" style={{ color: accent.text }}>Completed</span>
              <span className="text-sm font-semibold ml-1" style={{ color: accent.text }}>{completed.length}</span>
            </button>
            {completedExpanded && (
              <div className="flex flex-col gap-2 mt-1">
                {(showAllCompleted ? completed : completed.slice(0, BOARD_ITEMS_LIMIT)).map((task) => (
                  <BoardTaskCard key={task.id} task={task} isSelected={selectedTaskId === task.id} onToggle={onToggle} onSelect={onSelect} onDelete={onDelete} />
                ))}
                {completed.length > BOARD_ITEMS_LIMIT && (
                  <button type="button" onClick={() => setShowAllCompleted((v) => !v)} className="py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left px-1">
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
