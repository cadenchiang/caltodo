/**
 * Custom hook for calendar page modal/popover state management.
 * Extracts preview, edit, add, and event-create modal state from CalendarPage
 * to keep page.tsx focused on layout and data fetching.
 */

import { useState, useCallback } from "react";
import { format } from "date-fns";
import type { Task } from "@/lib/types";

/** Whether creating a task or a GCal event. */
export type CreateType = "task" | "event";

/**
 * Manages all modal and popover state for the calendar page.
 *
 * @returns State values and handler functions for task preview, edit, add, and event create modals
 */
export function useCalendarModals() {
  const [previewTask, setPreviewTask] = useState<Task | null>(null);
  const [previewRect, setPreviewRect] = useState<DOMRect | null>(null);
  const [editModalTask, setEditModalTask] = useState<Task | null>(null);
  const [addingDate, setAddingDate] = useState<string | null>(null);
  const [addingTime, setAddingTime] = useState<string | null>(null);
  const [addingEndTime, setAddingEndTime] = useState<string | null>(null);
  const [createType, setCreateType] = useState<CreateType>("task");
  const [overflowDate, setOverflowDate] = useState<string | null>(null);
  const [overflowRect, setOverflowRect] = useState<DOMRect | null>(null);

  function handleTaskClick(task: Task, rect: DOMRect) {
    setAddingDate(null);
    setPreviewTask(task);
    setPreviewRect(rect);
  }

  /** Opens task create modal for today (used by header "+" button). */
  function handleAddClick() {
    setPreviewTask(null);
    setPreviewRect(null);
    setAddingDate(format(new Date(), "yyyy-MM-dd"));
    setAddingTime(null);
    setAddingEndTime(null);
    setCreateType("task");
  }

  /** Double-click on all-day section or month cell — opens task create. */
  function handleDayClick(date: string, _rect: DOMRect) {
    setPreviewTask(null);
    setPreviewRect(null);
    setAddingDate(date);
    setAddingTime(null);
    setAddingEndTime(null);
    setCreateType("task");
  }

  /** Double-click on time grid — opens task create with time pre-filled. */
  function handleTimeGridCreate(date: string, startTime: string, endTime: string) {
    setPreviewTask(null);
    setPreviewRect(null);
    setAddingDate(date);
    setAddingTime(startTime);
    setAddingEndTime(endTime);
    setCreateType("task");
  }

  /** Switch between task and event create while preserving date/time. */
  const switchCreateType = useCallback((type: CreateType) => {
    setCreateType(type);
  }, []);

  function closePreview() {
    setPreviewTask(null);
    setPreviewRect(null);
  }

  function handlePreviewEdit(task: Task) {
    closePreview();
    setEditModalTask(task);
  }

  function closeEditModal() {
    setEditModalTask(null);
  }

  function closeAddPopover() {
    setAddingDate(null);
    setAddingTime(null);
    setAddingEndTime(null);
    setCreateType("task");
  }

  function handleShowMore(date: string, rect: DOMRect) {
    setOverflowDate(date);
    setOverflowRect(rect);
  }

  function closeOverflow() {
    setOverflowDate(null);
    setOverflowRect(null);
  }

  return {
    previewTask,
    previewRect,
    editModalTask,
    addingDate,
    addingTime,
    addingEndTime,
    createType,
    handleTaskClick,
    handleAddClick,
    handleDayClick,
    handleTimeGridCreate,
    switchCreateType,
    closePreview,
    handlePreviewEdit,
    closeEditModal,
    closeAddPopover,
    overflowDate,
    overflowRect,
    handleShowMore,
    closeOverflow,
  };
}
