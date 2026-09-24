"use client";

import { useCallback, useEffect, useState } from "react";
import type { Task, TaskInsert, TaskUpdate } from "@/lib/types";
import { DEFAULT_TASK_COLOR } from "@/lib/constants";

type RepeatUnit = "day" | "week" | "month";

/** Every field the task editor edits. */
export interface TaskFormState {
  title: string;
  description: string;
  dueDate: string | null;
  dueTime: string | null;
  color: string;
  tags: string[];
  courseName: string | null;
  repeatInterval: number | null;
  repeatUnit: RepeatUnit | null;
  repeatEndDate: string | null;
  repeatEndCount: number | null;
}

export interface TaskFormDefaults {
  defaultDate?: string | null;
  defaultTime?: string | null;
  defaultCourseName?: string | null;
}

/**
 * Builds the initial form state from the create-mode defaults.
 *
 * @param defaults - Pre-filled date, time and class
 * @returns A blank form with those defaults applied
 */
export function initialFormState(defaults: TaskFormDefaults): TaskFormState {
  return {
    title: "",
    description: "",
    dueDate: defaults.defaultDate ?? null,
    dueTime: defaults.defaultTime ?? null,
    color: DEFAULT_TASK_COLOR,
    tags: [],
    courseName: defaults.defaultCourseName ?? null,
    repeatInterval: null,
    repeatUnit: null,
    repeatEndDate: null,
    repeatEndCount: null,
  };
}

/**
 * Form state from an existing task (edit mode).
 *
 * @param task - The task being edited
 * @returns Its fields as form state
 */
export function formStateFromTask(task: Task): TaskFormState {
  return {
    title: task.title,
    description: task.description || "",
    dueDate: task.due_date,
    dueTime: task.due_time,
    color: task.color,
    tags: task.tags ?? [],
    courseName: task.course_name,
    repeatInterval: task.repeat_interval,
    repeatUnit: task.repeat_unit,
    repeatEndDate: task.repeat_end_date,
    repeatEndCount: task.repeat_end_count,
  };
}

/**
 * The update payload for an edit. Repeat end date and count are included,
 * so what the picker shows is what gets saved.
 *
 * @param form - Current form state
 * @returns Columns to write
 */
export function buildTaskUpdates(form: TaskFormState): TaskUpdate {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    due_date: form.dueDate,
    due_time: form.dueTime,
    color: form.color,
    tags: form.tags,
    course_name: form.courseName,
    repeat_interval: form.repeatInterval,
    repeat_unit: form.repeatUnit,
    repeat_end_date: form.repeatEndDate,
    repeat_end_count: form.repeatEndCount,
  };
}

/**
 * The insert payload for a new task.
 *
 * @param form - Current form state
 * @returns Columns for the new row
 */
export function buildTaskInsert(form: TaskFormState): TaskInsert {
  return {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    due_date: form.dueDate,
    due_time: form.dueTime,
    color: form.color,
    tags: form.tags.length > 0 ? form.tags : undefined,
    course_name: form.courseName || undefined,
    repeat_interval: form.repeatInterval,
    repeat_unit: form.repeatUnit,
    repeat_end_date: form.repeatEndDate,
    repeat_end_count: form.repeatEndCount,
  };
}

/**
 * Holds the task editor's fields, pre-fills them from the defaults (create)
 * or the task (edit) when the dialog opens, and exposes one setter.
 *
 * @param open - Whether the dialog is open
 * @param editTask - Task being edited, or null/undefined for create mode
 * @param defaults - Create-mode defaults
 * @returns The form, a field setter and a reset
 * @remarks Edit pre-fill depends on editTask.id, not the object, so a
 *          background refetch cannot clobber in-progress edits.
 */
export function useTaskForm(open: boolean, editTask: Task | null | undefined, defaults: TaskFormDefaults) {
  const [form, setForm] = useState<TaskFormState>(() => initialFormState(defaults));
  const { defaultDate, defaultTime, defaultCourseName } = defaults;

  const set = useCallback(<K extends keyof TaskFormState>(key: K, value: TaskFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setForm(initialFormState({ defaultDate, defaultTime, defaultCourseName }));
  }, [defaultDate, defaultTime, defaultCourseName]);

  useEffect(() => {
    if (open && !editTask) reset();
  }, [open, editTask, reset]);

  useEffect(() => {
    if (open && editTask) setForm(formStateFromTask(editTask));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editTask?.id]);

  return { form, set, reset };
}
