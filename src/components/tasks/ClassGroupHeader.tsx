"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, MoreVertical, Pencil, Palette, RotateCcw, Trash2 } from "lucide-react";
import { TASK_COLORS } from "@/lib/constants";

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
}

/**
 * Collapsible group header for class-sorted list view.
 * Shows chevron, display name, task count, and a 3-dot menu
 * with rename, reset name, change color, and delete class options.
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
}: ClassGroupHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
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

  // Sync editValue when displayName changes externally
  useEffect(() => {
    if (!editing) setEditValue(displayName);
  }, [displayName, editing]);

  /**
   * Commits the rename and exits edit mode.
   * Saves the alias if the name changed.
   */
  function commitRename() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== displayName) {
      onRename(groupName, trimmed);
    }
    setEditing(false);
  }

  return (
    <div className="flex items-center pl-2.5 pr-2 py-1.5 mx-2 mt-1 rounded-lg group">
      {/* Chevron toggle */}
      <button
        onClick={onToggle}
        className="shrink-0 p-0.5 hover:opacity-80 transition-opacity"
        aria-label={isCollapsed ? "Expand group" : "Collapse group"}
      >
        <ChevronRight
          size={12}
          className={`text-secondary-foreground transition-transform duration-200 ${
            !isCollapsed ? "rotate-90" : ""
          }`}
        />
      </button>

      {/* Group name (editable via menu, not inline click) */}
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
          className="text-sm font-semibold text-foreground bg-transparent border-b border-blue-500 outline-none min-w-0 ml-0.5 py-0 flex-1"
        />
      ) : (
        <span className="text-sm font-semibold text-foreground ml-0.5 truncate">
          {displayName}
        </span>
      )}

      {/* Task count */}
      <span className="text-xs text-subtle-foreground ml-1.5 shrink-0">{count}</span>

      {/* 3-dot menu button */}
      <button
        ref={menuBtnRef}
        onClick={() => {
          setShowMenu(!showMenu);
          setShowColorGrid(false);
          setShowDeleteConfirm(false);
        }}
        className="ml-1 p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        title="Group options"
      >
        <MoreVertical size={14} />
      </button>

      {/* Portaled dropdown menu */}
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
          {/* Rename */}
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
          {/* Reset name */}
          {hasAlias && (
            <button
              onClick={() => {
                onResetName(groupName);
                setShowMenu(false);
              }}
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <RotateCcw size={13} />
              Reset name
            </button>
          )}
          {/* Change color */}
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
                        onColorChange(groupName, c);
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
          {/* Delete class */}
          {onDeleteClass && groupName !== "General" && (
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
                    Delete {count} task{count !== 1 ? "s" : ""}?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onDeleteClass(groupName);
                        setShowMenu(false);
                        setShowDeleteConfirm(false);
                      }}
                      className="text-xs px-2.5 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-xs px-2.5 py-1 rounded-lg border border-border text-muted-foreground hover:bg-accent transition-colors"
                    >
                      Cancel
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
  );
}
