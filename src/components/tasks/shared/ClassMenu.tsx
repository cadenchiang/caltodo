"use client";

import { useState, type RefObject } from "react";
import { Palette, Pencil, RotateCcw, Trash2 } from "lucide-react";
import Popover from "@/components/ui/Popover";
import Button from "@/components/ui/Button";
import type { PopoverPlacement } from "@/hooks/usePopoverPosition";
import ColorSwatchGrid from "./ColorSwatchGrid";
import { MENU_ITEM } from "./SnoozeMenu";

/** The catch-all group for tasks without a class; it cannot be deleted. */
export const GENERAL_GROUP = "General";

export interface ClassMenuProps {
  /** Whether the menu is visible. */
  open: boolean;
  /** Closes the menu. */
  onClose: () => void;
  /** Element the menu is positioned beside. */
  anchorRef: RefObject<HTMLElement | null>;
  /** Preferred side. Defaults to bottom-start. */
  placement?: PopoverPlacement;
  /** Original class name (the storage key). */
  name: string;
  /** Whether the class currently has a display alias. */
  hasAlias: boolean;
  /** Number of tasks that a delete would remove. */
  taskCount: number;
  /** Starts inline renaming in the parent. */
  onRename: () => void;
  /** Clears the alias. */
  onResetName: () => void;
  /** Recolors every task in the class. Omit to hide the option. */
  onColorChange?: (name: string, color: string) => void;
  /** Deletes every task in the class. Omit to hide the option. */
  onDeleteClass?: (name: string) => void;
}

/**
 * Options menu shared by the list's class headers and the board's columns:
 * Rename, Reset name, Change color (swatches through the theme) and Delete
 * class with an inline confirm. Built on Popover (menu role, Escape,
 * outside click, focus return).
 *
 * @param name - Class key passed back to the callbacks
 * @param taskCount - Shown in the delete confirm
 */
export default function ClassMenu({
  open,
  onClose,
  anchorRef,
  placement = "bottom-start",
  name,
  hasAlias,
  taskCount,
  onRename,
  onResetName,
  onColorChange,
  onDeleteClass,
}: ClassMenuProps) {
  const [showColors, setShowColors] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  /** Closes and resets the submenus. */
  function close() {
    setShowColors(false);
    setConfirmDelete(false);
    onClose();
  }

  return (
    <Popover
      open={open}
      onClose={close}
      anchorRef={anchorRef}
      triggerRef={anchorRef}
      placement={placement}
      role="menu"
      aria-label={`Options for ${name}`}
      className="py-1 min-w-[170px]"
    >
      <button type="button" role="menuitem" onClick={() => { onRename(); close(); }} className={MENU_ITEM}>
        <Pencil size={13} />
        Rename
      </button>
      {hasAlias && (
        <button type="button" role="menuitem" onClick={() => { onResetName(); close(); }} className={MENU_ITEM}>
          <RotateCcw size={13} />
          Reset name
        </button>
      )}
      {onColorChange && (
        <>
          <button
            type="button"
            role="menuitem"
            aria-expanded={showColors}
            onClick={() => setShowColors((v) => !v)}
            className={MENU_ITEM}
          >
            <Palette size={13} />
            Change color
          </button>
          {showColors && (
            <div className="px-3 py-2">
              <ColorSwatchGrid
                swatchClassName="w-5 h-5"
                onSelect={(c) => {
                  onColorChange(name, c);
                  close();
                }}
              />
            </div>
          )}
        </>
      )}
      {onDeleteClass && name !== GENERAL_GROUP && (
        <>
          <div className="border-t border-border my-1" />
          {!confirmDelete ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => setConfirmDelete(true)}
              className={`${MENU_ITEM} text-red-600 dark:text-red-400 hover:bg-danger-tint focus-visible:bg-danger-tint`}
            >
              <Trash2 size={13} />
              Delete class
            </button>
          ) : (
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground mb-2">
                Delete {taskCount} {taskCount === 1 ? "task" : "tasks"}?
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="destructive-filled" onClick={() => { onDeleteClass(name); close(); }}>
                  Delete
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Popover>
  );
}
