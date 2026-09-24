"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { ArrowDown, ArrowUp, ChevronRight, Clock, ExternalLink, Trash2 } from "lucide-react";
import Popover, { POPOVER_SURFACE } from "@/components/ui/Popover";
import type { PopoverPlacement } from "@/hooks/usePopoverPosition";
import SnoozeMenu, { MENU_ITEM } from "./SnoozeMenu";

/** Width the submenu needs beside the menu before it flips to the left. */
const SUBMENU_WIDTH = 170;

export interface TaskContextMenuProps {
  /** Whether the menu is visible. */
  open: boolean;
  /** Closes the menu. */
  onClose: () => void;
  /** Element the menu is anchored to (a button, or a 0x0 cursor marker). */
  anchorRef: RefObject<HTMLElement | null>;
  /** Trigger to exclude from outside-click and to refocus on close. */
  triggerRef?: RefObject<HTMLElement | null>;
  /** Preferred side. Defaults to bottom-start. */
  placement?: PopoverPlacement;
  /** Hides the task for the given hours. Omit to hide the entry. */
  onSnooze?: (hours: number) => void;
  /** Deletes the task (single click; the toast carries Undo). Omit to hide. */
  onDelete?: () => void;
  /** Moves the task one place up among its same-date siblings. */
  onMoveUp?: () => void;
  /** Moves the task one place down among its same-date siblings. */
  onMoveDown?: () => void;
  /** Link to the assignment on its platform, if any. */
  sourceUrl?: string | null;
}

/**
 * The one task menu: Hide for... (with a submenu that flips side near the
 * viewport edge), optional Move up / Move down, optional Open assignment,
 * and Delete task. Built on Popover so it has a menu role, closes on Escape
 * and outside click, and returns focus to its trigger.
 *
 * @param open - Visibility
 * @param anchorRef - What the menu is positioned beside
 * @param onSnooze - Hide handler, receives hours
 * @param onDelete - Delete handler
 * @param onMoveUp - Keyboard alternative to drag reorder (omit to hide)
 * @param onMoveDown - Keyboard alternative to drag reorder (omit to hide)
 * @param sourceUrl - Shows "Open assignment" when set
 */
export default function TaskContextMenu({
  open,
  onClose,
  anchorRef,
  triggerRef,
  placement = "bottom-start",
  onSnooze,
  onDelete,
  onMoveUp,
  onMoveDown,
  sourceUrl,
}: TaskContextMenuProps) {
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [flipSubmenu, setFlipSubmenu] = useState(false);
  const snoozeItemRef = useRef<HTMLButtonElement>(null);

  // Decide which side the submenu opens on from the item's position, so it
  // never runs off the right edge of a narrow viewport.
  useLayoutEffect(() => {
    if (!snoozeOpen) return;
    const rect = snoozeItemRef.current?.getBoundingClientRect();
    if (!rect) return;
    setFlipSubmenu(rect.right + SUBMENU_WIDTH > window.innerWidth);
  }, [snoozeOpen]);

  /** Closes both levels of the menu. */
  function closeAll() {
    setSnoozeOpen(false);
    onClose();
  }

  return (
    <Popover
      open={open}
      onClose={closeAll}
      anchorRef={anchorRef}
      triggerRef={triggerRef}
      placement={placement}
      role="menu"
      aria-label="Task actions"
      className="py-1 min-w-[160px]"
    >
      {onSnooze && (
      <div className="relative">
        <button
          ref={snoozeItemRef}
          type="button"
          role="menuitem"
          aria-haspopup="menu"
          aria-expanded={snoozeOpen}
          onClick={() => setSnoozeOpen((v) => !v)}
          className={MENU_ITEM}
        >
          <Clock size={14} />
          Hide for...
          <ChevronRight size={12} className="ml-auto text-muted-foreground" />
        </button>
        {snoozeOpen && (
          <div
            className={`absolute top-0 z-dropdown ${POPOVER_SURFACE} ${
              flipSubmenu ? "right-full mr-1" : "left-full ml-1"
            }`}
          >
            <SnoozeMenu onSnooze={onSnooze} onDone={closeAll} />
          </div>
        )}
      </div>
      )}

      {(onMoveUp || onMoveDown) && (
        <>
          {onSnooze && <div className="border-t border-border my-1" />}
          <button
            type="button"
            role="menuitem"
            disabled={!onMoveUp}
            onClick={() => { onMoveUp?.(); closeAll(); }}
            className={`${MENU_ITEM} disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <ArrowUp size={14} />
            Move up
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={!onMoveDown}
            onClick={() => { onMoveDown?.(); closeAll(); }}
            className={`${MENU_ITEM} disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <ArrowDown size={14} />
            Move down
          </button>
        </>
      )}

      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          role="menuitem"
          onClick={closeAll}
          className={MENU_ITEM}
        >
          <ExternalLink size={14} className="text-muted-foreground" />
          Open assignment
        </a>
      )}

      {onDelete && (
        <>
          {(onSnooze || onMoveUp || onMoveDown || sourceUrl) && <div className="border-t border-border my-1" />}
          <button
            type="button"
            role="menuitem"
            onClick={() => { closeAll(); onDelete(); }}
            className={`${MENU_ITEM} text-red-600 dark:text-red-400 hover:bg-danger-tint focus-visible:bg-danger-tint`}
          >
            <Trash2 size={14} />
            Delete task
          </button>
        </>
      )}
    </Popover>
  );
}
