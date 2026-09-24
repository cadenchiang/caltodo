"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";
import type { Task } from "@/lib/types";
import { isSameDateSibling, moveTaskByStep, reorderWithinDate } from "../task-list-helpers";

/** sort_order writes produced by a reorder. */
export type SortOrderUpdates = Array<{ id: string; sort_order: number }>;

export interface ListReorder {
  /** Id of the row being dragged, if any. */
  draggedId: string | null;
  /** Index the drop indicator sits before, or null when no valid target. */
  dropTargetIndex: number | null;
  /** True while the pointer is over a row the drag may not drop on. */
  dropBlocked: boolean;
  onDragStart: (e: DragEvent, taskId: string) => void;
  onDragOver: (e: DragEvent, index: number, over: Task) => void;
  onDrop: (e: DragEvent) => void;
  onDragEnd: () => void;
  /** Moves a task one place up among its same-date siblings. */
  moveUp: (taskId: string) => void;
  /** Moves a task one place down among its same-date siblings. */
  moveDown: (taskId: string) => void;
  /** Whether a one-step move in the given direction is possible. */
  canMove: (taskId: string, direction: -1 | 1) => boolean;
}

/**
 * Drag-to-reorder for the flat list, constrained to same-date siblings, plus
 * keyboard moves for the context menu. Manual order only exists within a
 * due date, so a cross-date drop shows a not-allowed cursor and drops
 * nothing instead of issuing N updates that snap back.
 *
 * @param active - The displayed active list, in order
 * @param onReorder - Receives sort_order updates for the affected siblings
 * @param enabled - False disables every handler (class sort mode)
 * @returns Handlers and state for the rows
 */
export function useListReorder(
  active: Task[],
  onReorder: ((updates: SortOrderUpdates) => void) | undefined,
  enabled: boolean
): ListReorder {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [dropBlocked, setDropBlocked] = useState(false);
  const dragRafRef = useRef<number | null>(null);

  /** Clears every piece of drag state. */
  const reset = useCallback(() => {
    if (dragRafRef.current !== null) cancelAnimationFrame(dragRafRef.current);
    dragRafRef.current = null;
    setDraggedId(null);
    setDropTargetIndex(null);
    setDropBlocked(false);
  }, []);

  const onDragStart = useCallback(
    (e: DragEvent, taskId: string) => {
      if (!enabled) return;
      setDraggedId(taskId);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", taskId);
    },
    [enabled]
  );

  const onDragOver = useCallback(
    (e: DragEvent, index: number, over: Task) => {
      if (!enabled || !draggedId) return;
      e.preventDefault();
      const dragged = active.find((t) => t.id === draggedId);
      const allowed = dragged !== undefined && isSameDateSibling(dragged, over);
      // "none" makes the browser show the not-allowed cursor.
      e.dataTransfer.dropEffect = allowed ? "move" : "none";
      const clientY = e.clientY;
      const rect = e.currentTarget.getBoundingClientRect();
      if (dragRafRef.current !== null) cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = requestAnimationFrame(() => {
        dragRafRef.current = null;
        setDropBlocked(!allowed);
        if (!allowed) {
          setDropTargetIndex(null);
          return;
        }
        const midY = rect.top + rect.height / 2;
        setDropTargetIndex(clientY < midY ? index : index + 1);
      });
    },
    [enabled, draggedId, active]
  );

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      if (!enabled || !draggedId || dropTargetIndex === null || !onReorder) {
        reset();
        return;
      }
      const currentIndex = active.findIndex((t) => t.id === draggedId);
      // The indicator sits before dropTargetIndex; moving down by one slot
      // lands on dropTargetIndex - 1 once the dragged row is removed.
      const target = dropTargetIndex > currentIndex ? dropTargetIndex - 1 : dropTargetIndex;
      const updates = reorderWithinDate(active, draggedId, target);
      if (updates) {
        console.info("[useListReorder] drop", { taskId: draggedId, from: currentIndex, to: target, writes: updates.length });
        onReorder(updates);
      }
      reset();
    },
    [enabled, draggedId, dropTargetIndex, onReorder, active, reset]
  );

  const move = useCallback(
    (taskId: string, direction: -1 | 1) => {
      if (!onReorder) return;
      const updates = moveTaskByStep(active, taskId, direction);
      if (!updates) return;
      console.info("[useListReorder] keyboard move", { taskId, direction, writes: updates.length });
      onReorder(updates);
    },
    [active, onReorder]
  );

  const canMove = useCallback(
    (taskId: string, direction: -1 | 1) => enabled && moveTaskByStep(active, taskId, direction) !== null,
    [active, enabled]
  );
  // Stable identities so memoized rows do not re-render on every parent render.
  const moveUp = useCallback((id: string) => move(id, -1), [move]);
  const moveDown = useCallback((id: string) => move(id, 1), [move]);

  return {
    draggedId,
    dropTargetIndex,
    dropBlocked,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd: reset,
    moveUp,
    moveDown,
    canMove,
  };
}
