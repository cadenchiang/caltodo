"use client";

import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface CourseItem<T extends string | number> {
  id: T;
  name: string;
  subtitle?: string;
}

interface CourseGroup<T extends string | number> {
  /** Section header label (e.g. "Canvas", "Gradescope"). */
  label: string;
  /** Courses in this group. */
  courses: CourseItem<T>[];
  /** Accent color for the section header dot and checked boxes. */
  color?: string;
}

interface CourseSelectModalProps<T extends string | number> {
  /** Whether the modal is open. */
  open: boolean;
  /** Cancels: called on Escape, backdrop click, the close button, and Cancel. */
  onClose: () => void;
  /** Commits the current selection. When omitted, Done behaves like onClose. */
  onDone?: () => void;
  /** Disables Done, for example while the selection is unchanged. */
  doneDisabled?: boolean;
  /** Modal heading text. */
  title: string;
  /** Flat list of courses (used when groups is not provided). */
  courses: CourseItem<T>[];
  /** Optional grouped sections; overrides the flat `courses` list when provided. */
  groups?: CourseGroup<T>[];
  /** Currently selected course IDs. */
  selectedIds: Set<T>;
  /** Toggle a single course selection. */
  onToggle: (id: T) => void;
  /** Select all courses. */
  onSelectAll: () => void;
  /** Deselect all courses. */
  onDeselectAll: () => void;
}

/**
 * Course selection modal built on Modal. Grouped courses render as columns
 * on desktop and stack on mobile; a flat list renders as rows.
 *
 * Every way out other than Done is a cancel: Escape, the backdrop, the close
 * button and the Cancel button all call onClose, and only Done calls onDone.
 *
 * @param open - Controls rendering
 * @param onClose - Cancel handler
 * @param onDone - Commit handler; defaults to onClose
 * @param doneDisabled - Keeps Done disabled (unchanged selection)
 * @param title - Header text, followed by the selected/total count
 * @param courses - Flat array of courses (ignored if groups provided)
 * @param groups - Optional grouped sections with label, courses, and color
 * @param selectedIds - Set of selected course IDs
 * @param onToggle - Toggle handler for a single course
 * @param onSelectAll - Select all handler
 * @param onDeselectAll - Deselect all handler
 */
export default function CourseSelectModal<T extends string | number>({
  open,
  onClose,
  onDone,
  doneDisabled = false,
  title,
  courses,
  groups,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: CourseSelectModalProps<T>) {
  const allCourses = groups ? groups.flatMap((g) => g.courses) : courses;
  const totalCount = allCourses.length;
  const allSelected = totalCount > 0 && selectedIds.size === totalCount;
  const activeGroups = groups?.filter((g) => g.courses.length > 0) ?? [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${title} (${selectedIds.size}/${totalCount})`}
      size={activeGroups.length > 1 ? "xl" : "lg"}
      bodyClassName="flex flex-col"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="inverted" onClick={onDone ?? onClose} disabled={doneDisabled}>
            Done
          </Button>
        </>
      }
    >
      <div className="flex justify-end shrink-0 mb-2">
        <button
          type="button"
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="text-xs text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </div>

      {activeGroups.length > 0 ? (
        <div className="flex flex-col sm:flex-row gap-1 flex-1 min-h-0">
          {activeGroups.map((group) => {
            const groupSelectedCount = group.courses.filter((c) => selectedIds.has(c.id)).length;
            return (
              <div key={group.label} className="flex-1 flex flex-col min-w-0 sm:min-h-0 rounded-xl bg-muted/50">
                <div className="px-3 py-2 flex items-baseline gap-2 shrink-0">
                  {group.color && (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 self-center"
                      style={{ backgroundColor: group.color }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="text-xs font-semibold text-foreground leading-none">{group.label}</span>
                  <span className="text-2xs text-muted-foreground leading-none">
                    {groupSelectedCount}/{group.courses.length}
                  </span>
                </div>
                <div className="flex-1 sm:overflow-y-auto min-h-0 px-1 pb-1">
                  {group.courses.map((course) => (
                    <CourseRow
                      key={String(course.id)}
                      name={course.name}
                      checked={selectedIds.has(course.id)}
                      color={group.color}
                      onToggle={() => onToggle(course.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="-mx-2">
          {courses.map((course) => (
            <CourseRow
              key={String(course.id)}
              name={course.name}
              checked={selectedIds.has(course.id)}
              onToggle={() => onToggle(course.id)}
            />
          ))}
        </div>
      )}
      {totalCount === 0 && (
        <p className="px-5 py-8 text-sm text-muted-foreground text-center">No active courses found.</p>
      )}
    </Modal>
  );
}

/**
 * One selectable course row with a checkbox-styled toggle.
 *
 * @param name - Course name
 * @param checked - Whether the course is selected
 * @param color - Optional group accent for the checked box; defaults to the theme accent
 * @param onToggle - Flips the selection
 */
function CourseRow({
  name,
  checked,
  color,
  onToggle,
}: {
  name: string;
  checked: boolean;
  color?: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer",
        checked ? "bg-accent/60" : "hover:bg-accent/30"
      )}
    >
      <span
        className={cn(
          "w-4 h-4 rounded shrink-0 flex items-center justify-center transition-colors",
          checked ? "bg-blue-500" : "border-[1.5px] border-input-border"
        )}
        style={checked && color ? { backgroundColor: color } : undefined}
        aria-hidden="true"
      >
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </span>
      <span className={cn("text-sm truncate", checked ? "text-foreground" : "text-muted-foreground")}>
        {name}
      </span>
    </button>
  );
}
