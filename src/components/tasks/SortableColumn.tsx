"use client";

import { useSortable } from "@dnd-kit/sortable";
import type { ReactNode } from "react";

interface SortableColumnChildProps {
  /** Ref to attach to the column's root DOM element. */
  setNodeRef: (node: HTMLElement | null) => void;
  /** Inline style with CSS transform/transition for animated reflow. */
  style: React.CSSProperties;
  /** ARIA and data attributes from useSortable to spread on the root element. */
  attributes: Record<string, unknown>;
  /** Event listeners to spread onto the drag handle element. */
  listeners: Record<string, Function> | undefined;
  /** True when this column is the active drag source. */
  isDragging: boolean;
}

interface SortableColumnProps {
  /** Unique identifier for this sortable item (column name). */
  id: string;
  /** Render function receiving sortable props for the column. */
  children: (props: SortableColumnChildProps) => ReactNode;
}

/**
 * Render-prop wrapper around @dnd-kit useSortable hook.
 * Delegates ref, style, listeners, and isDragging state to children.
 * The in-place element is hidden (opacity 0) while dragging so the
 * DragOverlay floating copy is the only visible representation.
 *
 * @param props - SortableColumnProps with id and render function
 * @returns ReactNode from the children render function
 */
export default function SortableColumn({ id, children }: SortableColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${Math.round(transform.x)}px, 0, 0)` : undefined,
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <>
      {children({
        setNodeRef,
        style,
        attributes: attributes as unknown as Record<string, unknown>,
        listeners: listeners as Record<string, Function> | undefined,
        isDragging,
      })}
    </>
  );
}
