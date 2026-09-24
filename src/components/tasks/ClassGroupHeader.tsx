"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronRight, MoreVertical, Plus } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import ClassMenu from "./shared/ClassMenu";

interface ClassGroupHeaderProps {
  /** Original course_name key used for alias lookup. */
  groupName: string;
  /** Shown label (alias or original name). */
  displayName: string;
  /** Whether the group has a custom alias. */
  hasAlias: boolean;
  /** Number of tasks in this group. */
  count: number;
  /** Whether the group body is currently collapsed. */
  isCollapsed: boolean;
  /** Callback to expand/collapse the group. */
  onToggle: () => void;
  /** Callback to save a new alias: (originalName, newName) => void. */
  onRename: (originalName: string, newName: string) => void;
  /** Callback to reset alias to original name. */
  onResetName: (originalName: string) => void;
  /** Callback to change the color for all tasks in this class. */
  onColorChange?: (courseName: string, color: string) => void;
  /** Callback to delete all tasks in this class. */
  onDeleteClass?: (courseName: string) => void;
  /** Callback to add a new task pre-filled with this class. */
  onAddTask?: (courseName: string) => void;
}

/**
 * Collapsible group header for the class-sorted list view. The toggle is a
 * real button with aria-expanded, and the add and options controls are
 * revealed on hover and on keyboard focus. Options open the shared ClassMenu.
 *
 * @param props - ClassGroupHeaderProps
 */
export default function ClassGroupHeader({
  groupName,
  displayName,
  hasAlias,
  count,
  isCollapsed,
  onToggle,
  onRename,
  onResetName,
  onColorChange,
  onDeleteClass,
  onAddTask,
}: ClassGroupHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(displayName);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editing]);

  // Sync editValue when displayName changes externally
  useEffect(() => {
    if (!editing) setEditValue(displayName);
  }, [displayName, editing]);

  /** Commits the rename and exits edit mode. Saves the alias if the name changed. */
  function commitRename() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== displayName) onRename(groupName, trimmed);
    setEditing(false);
  }

  return (
    <div className="group flex items-center -ml-3 pl-3 pr-3 py-1.5 mt-1 rounded-xl focus-within:bg-foreground/[0.035] dark:focus-within:bg-foreground/[0.07]">
      {editing ? (
        <>
          <ChevronRight size={12} className="shrink-0 -ml-4 mr-0.5 text-secondary-foreground rotate-90" aria-hidden="true" />
          <label htmlFor={`rename-${groupName}`} className="sr-only">
            Rename {displayName}
          </label>
          <input
            id={`rename-${groupName}`}
            ref={editInputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") { setEditValue(displayName); setEditing(false); }
            }}
            className="text-sm font-semibold text-foreground bg-transparent border-b border-blue-500 outline-none min-w-0 py-0 flex-1"
          />
        </>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!isCollapsed}
          className="flex items-center flex-1 min-w-0 -ml-4 min-h-11 -my-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronRight
            size={12}
            className={`shrink-0 text-secondary-foreground transition-transform duration-200 ${!isCollapsed ? "rotate-90" : ""}`}
            aria-hidden="true"
          />
          <span className="text-sm font-semibold text-foreground truncate ml-0.5">{displayName}</span>
          <span className="text-xs text-subtle-foreground ml-1.5 shrink-0">{count}</span>
        </button>
      )}

      {/* Actions: revealed on hover and when anything in the row has focus. */}
      <div className="ml-auto flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
        {onAddTask && (
          <IconButton size="sm" bleed aria-label={`Add task to ${displayName}`} title="Add task to this class" onClick={() => onAddTask(groupName)}>
            <Plus size={14} />
          </IconButton>
        )}
        <IconButton
          ref={menuBtnRef}
          size="sm"
          bleed
          aria-label={`Options for ${displayName}`}
          aria-haspopup="menu"
          aria-expanded={showMenu}
          title="Group options"
          onClick={() => setShowMenu((v) => !v)}
        >
          <MoreVertical size={14} />
        </IconButton>
      </div>

      <ClassMenu
        open={showMenu}
        onClose={() => setShowMenu(false)}
        anchorRef={menuBtnRef}
        placement="bottom-end"
        name={groupName}
        hasAlias={hasAlias}
        taskCount={count}
        onRename={() => { setEditValue(displayName); setEditing(true); }}
        onResetName={() => onResetName(groupName)}
        onColorChange={onColorChange}
        onDeleteClass={onDeleteClass}
      />
    </div>
  );
}
