"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronRight } from "lucide-react";

/**
 * Collapsible group header for class-sorted list view.
 * Shows chevron, inline-editable display name, and task count.
 * Click the name to edit it directly. Press Escape to revert.
 *
 * @param groupName - Original course_name key used for alias lookup
 * @param displayName - Shown label (alias or original name)
 * @param count - Number of tasks in this group
 * @param isCollapsed - Whether the group body is currently collapsed
 * @param onToggle - Callback to expand/collapse the group
 * @param onRename - Callback to save a new alias: (originalName, newName) => void
 */
export default function ClassGroupHeader({
  groupName,
  displayName,
  count,
  isCollapsed,
  onToggle,
  onRename,
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
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(displayName);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus and select input text when editing starts
  useEffect(() => {
    if (editing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editing]);

  // Sync editValue when displayName changes externally
  useEffect(() => {
    if (!editing) {
      setEditValue(displayName);
    }
  }, [displayName, editing]);

  /**
   * Commits the rename and exits edit mode.
   * Saves the alias if the name changed; clears it if reverted to original.
   */
  function commitRename() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== displayName) {
      onRename(groupName, trimmed);
    }
    setEditing(false);
  }

  return (
    <div className="flex items-center pl-2.5 pr-2 py-1.5 mx-2 mt-1 rounded-lg">
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

      {/* Inline-editable group name */}
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditValue(displayName);
            setEditing(true);
          }}
          className="text-sm font-semibold text-foreground ml-0.5 truncate hover:text-blue-500 transition-colors text-left cursor-text"
          title="Click to rename"
        >
          {displayName}
        </button>
      )}

      {/* Task count */}
      <span className="text-xs text-subtle-foreground ml-1.5 shrink-0">{count}</span>
    </div>
  );
}
