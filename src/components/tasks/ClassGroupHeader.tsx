"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, MoreVertical, Pencil, RotateCcw } from "lucide-react";

/**
 * Collapsible group header for class-sorted list view.
 * Shows chevron, display name (or alias), task count, and a three-dot menu for renaming.
 *
 * @param groupName - Original course_name key used for alias lookup
 * @param displayName - Shown label (alias or original name)
 * @param hasAlias - Whether this group has a custom alias (shows "Reset name" option)
 * @param count - Number of tasks in this group
 * @param isCollapsed - Whether the group body is currently collapsed
 * @param onToggle - Callback to expand/collapse the group
 * @param onRename - Callback to save a new alias: (originalName, newName) => void
 * @param onResetName - Callback to clear the alias: (originalName) => void
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
}: {
  groupName: string;
  displayName: string;
  hasAlias: boolean;
  count: number;
  isCollapsed: boolean;
  onToggle: () => void;
  onRename: (originalName: string, newName: string) => void;
  onResetName: (originalName: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(displayName);
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
    onRename(groupName, editValue);
    setEditing(false);
  }

  return (
    <div className="flex items-center pl-2.5 pr-2 py-1.5 mx-2 mt-1 rounded-lg group">
      <button
        onClick={onToggle}
        className="flex items-center min-w-0 flex-1 hover:opacity-80 transition-opacity"
      >
        <ChevronRight
          size={12}
          className={`shrink-0 text-secondary-foreground transition-transform duration-200 ${
            !isCollapsed ? "rotate-90" : ""
          }`}
        />
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
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-semibold text-foreground bg-transparent border-b border-blue-500 outline-none min-w-0 ml-0.5 py-0"
          />
        ) : (
          <span className="text-sm font-semibold text-foreground ml-0.5 truncate">{displayName}</span>
        )}
        <span className="text-xs text-subtle-foreground ml-1.5 shrink-0">{count}</span>
      </button>
      <button
        ref={menuBtnRef}
        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
        className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        title="Group options"
      >
        <MoreVertical size={14} />
      </button>
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
                onResetName(groupName);
                setShowMenu(false);
              }}
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <RotateCcw size={13} />
              Reset name
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
