"use client";

import type { ReactNode } from "react";
import SelectableTile from "@/components/onboarding/SelectableTile";
import { CLASS_NOUN_PLURAL } from "@/lib/copy";

/** A pickable class. `id` is whatever the source keys on. */
export interface PickableCourse<Id extends string | number> {
  id: Id;
  name: string;
  /** Optional second line (a course code). */
  detail?: string;
}

export interface CoursePickerProps<Id extends string | number> {
  /** Classes to offer. */
  courses: ReadonlyArray<PickableCourse<Id>>;
  /** Currently selected ids. */
  selectedIds: ReadonlySet<Id>;
  /** Toggle one class. */
  onToggle: (id: Id) => void;
  /** Replace the whole selection (select all / deselect all). */
  onSetSelection: (ids: Id[]) => void;
  /** Rendered when `courses` is empty. */
  emptyState?: ReactNode;
}

/**
 * The one class-picker recipe: a count heading, a select-all toggle, and a
 * scrolling list of SelectableTiles.
 *
 * @param courses - Classes to list
 * @param selectedIds - Selected ids
 * @param onToggle - Toggle handler for one row
 * @param onSetSelection - Handler for select all / deselect all
 * @param emptyState - Shown instead of the list when there is nothing to pick
 */
export default function CoursePicker<Id extends string | number>({
  courses,
  selectedIds,
  onToggle,
  onSetSelection,
  emptyState,
}: CoursePickerProps<Id>) {
  const allSelected = courses.length > 0 && selectedIds.size === courses.length;
  return (
    <div className="mb-4 text-left">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-foreground">
          Select {CLASS_NOUN_PLURAL} to sync ({selectedIds.size}/{courses.length})
        </p>
        {courses.length > 0 && (
          <button
            type="button"
            onClick={() => onSetSelection(allSelected ? [] : courses.map((c) => c.id))}
            className="text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors rounded px-1 py-1 -my-1"
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2 max-h-80 overflow-auto -mx-1 px-1 py-1">
        {courses.map((course) => (
          <SelectableTile
            key={String(course.id)}
            selected={selectedIds.has(course.id)}
            onToggle={() => onToggle(course.id)}
          >
            <span className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-foreground block truncate">{course.name}</span>
              {course.detail && (
                <span className="text-xs text-muted-foreground block truncate">{course.detail}</span>
              )}
            </span>
          </SelectableTile>
        ))}
        {courses.length === 0 && emptyState}
      </div>
    </div>
  );
}
