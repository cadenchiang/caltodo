"use client";

import { useRef, useState } from "react";
import { MoreVertical, Pencil, X } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import { ACTIONS } from "@/lib/copy";
import TaskContextMenu from "./TaskContextMenu";

interface TaskActionBarProps {
  /** Opens the full editor. Omitted where the fields edit inline (detail panel). */
  onEdit?: () => void;
  /** Deletes the task (single click; the toast carries Undo). Omit to hide. */
  onDelete?: () => void;
  /** Hides the task for a duration ("Hide for..."). Omit to hide. */
  onSnooze?: (hours: number) => void;
  /** Closes the panel or popover. */
  onClose: () => void;
  /** Link to the assignment on its platform; shows "Open assignment". */
  sourceUrl?: string | null;
}

/**
 * Header row for task detail surfaces: optional Edit, an overflow menu
 * (Hide for..., Open assignment, Delete task) and Close. Every control is an
 * IconButton with a label and the menu is the shared TaskContextMenu.
 *
 * @param onEdit - Shows the pencil when provided
 * @param onDelete - Adds Delete task to the menu
 * @param onSnooze - Adds Hide for... to the menu
 * @param onClose - Close handler
 * @param sourceUrl - Adds Open assignment to the menu
 */
export default function TaskActionBar({ onEdit, onDelete, onSnooze, onClose, sourceUrl }: TaskActionBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const hasMenuItems = !!onDelete || !!sourceUrl || !!onSnooze;

  return (
    <div className="flex items-center justify-end gap-1 px-5 pt-4 pb-2">
      {onEdit && (
        <IconButton aria-label="Edit task" title="Edit task" onClick={onEdit}>
          <Pencil size={18} />
        </IconButton>
      )}
      {hasMenuItems && (
        <>
          <IconButton
            ref={menuBtnRef}
            aria-label="More actions"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            title="More actions"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MoreVertical size={18} />
          </IconButton>
          <TaskContextMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            anchorRef={menuBtnRef}
            triggerRef={menuBtnRef}
            placement="bottom-end"
            onSnooze={onSnooze}
            onDelete={onDelete}
            sourceUrl={sourceUrl}
          />
        </>
      )}
      <IconButton aria-label={ACTIONS.close} title={ACTIONS.close} onClick={onClose}>
        <X size={18} />
      </IconButton>
    </div>
  );
}
