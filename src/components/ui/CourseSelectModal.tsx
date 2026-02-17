"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface CourseItem<T extends string | number> {
  id: T;
  name: string;
  subtitle?: string;
}

interface CourseGroup<T extends string | number> {
  /** Section header label (e.g. "bCourses", "Gradescope"). */
  label: string;
  /** Courses in this group. */
  courses: CourseItem<T>[];
  /** Accent color for the section header dot. */
  color?: string;
}

interface CourseSelectModalProps<T extends string | number> {
  /** Whether the modal is open. */
  open: boolean;
  /** Called when the modal should close (after exit animation completes). */
  onClose: () => void;
  /** Modal heading text. */
  title: string;
  /** Flat list of courses (used when groups is not provided). */
  courses: CourseItem<T>[];
  /** Optional grouped sections — overrides flat `courses` list when provided. */
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

/** Max rows that receive staggered entrance delay (avoids long delays on large lists). */
const MAX_STAGGER = 8;
/** Duration of the exit animation in ms. */
const EXIT_DURATION = 200;

/**
 * Renders a single course row with custom checkbox.
 *
 * @param course - The course item to render
 * @param checked - Whether the course is selected
 * @param index - Row index for stagger animation
 */
function CourseRow<T extends string | number>({
  course,
  checked,
  index,
}: {
  course: CourseItem<T>;
  checked: boolean;
  index: number;
}) {
  return (
    <label
      key={String(course.id)}
      className="flex items-center gap-3 px-5 py-3 hover:bg-accent transition-colors cursor-pointer border-b border-border-subtle last:border-0 animate-row-fade-in"
      style={{
        animationDelay: index < MAX_STAGGER ? `${index * 40}ms` : `${MAX_STAGGER * 40}ms`,
      }}
    >
      <div
        className="w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center transition-all duration-150"
        style={{
          backgroundColor: checked ? "#3b82f6" : "transparent",
          border: checked ? "none" : "2px solid var(--input-border)",
        }}
      >
        {checked && (
          <svg
            width="10"
            height="8"
            viewBox="0 0 10 8"
            fill="none"
            className="animate-[checkScale_0.2s_ease-out]"
          >
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm text-foreground block truncate">{course.name}</span>
        {course.subtitle && (
          <span className="text-xs text-subtle-foreground block truncate">{course.subtitle}</span>
        )}
      </div>
    </label>
  );
}

/**
 * Full-screen animated course selection modal with optional grouped sections.
 * Features: backdrop fade, slide-up entrance, staggered course row fade-in,
 * smooth exit animation, and custom checkbox with animated fill + checkmark.
 *
 * @param open - Controls mount/unmount with enter/exit animation
 * @param onClose - Called after exit animation finishes
 * @param title - Header text
 * @param courses - Flat array of { id, name, subtitle? } (ignored if groups provided)
 * @param groups - Optional grouped sections with label, courses, and color
 * @param selectedIds - Set of selected course IDs
 * @param onToggle - Toggle handler for a single course
 * @param onSelectAll - Select all handler
 * @param onDeselectAll - Deselect all handler
 */
export default function CourseSelectModal<T extends string | number>({
  open,
  onClose,
  title,
  courses,
  groups,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: CourseSelectModalProps<T>) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Compute total courses from groups or flat list
  const allCourses = groups ? groups.flatMap((g) => g.courses) : courses;
  const totalCount = allCourses.length;

  // Mount -> make visible (triggers enter animation)
  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  /**
   * Handles exit: sets visible=false to trigger exit animation,
   * then unmounts and calls onClose after animation duration.
   */
  const handleClose = useCallback(() => {
    setVisible(false);
    const timer = setTimeout(() => {
      setMounted(false);
      onClose();
    }, EXIT_DURATION);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!mounted) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, handleClose]);

  if (!mounted) return null;

  const allSelected = totalCount > 0 && selectedIds.size === totalCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ease-out"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={handleClose}
      />

      {/* Centered modal */}
      <div
        className={`relative bg-card w-full max-w-lg mx-4 max-h-[80vh] flex flex-col rounded-2xl border border-border shadow-2xl ${
          visible ? "animate-modal-in" : "animate-modal-out"
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0 rounded-t-2xl">
          <h3 className="text-sm font-semibold text-foreground">
            {title} ({selectedIds.size}/{totalCount})
          </h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={allSelected ? onDeselectAll : onSelectAll}
              className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
            <button
              onClick={handleClose}
              className="p-1 text-subtle-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Course list */}
        <div className="flex-1 overflow-auto">
          {groups ? (
            // Grouped display with section headers
            groups.map((group) => {
              if (group.courses.length === 0) return null;
              return (
                <div key={group.label}>
                  <div className="sticky top-0 z-10 bg-muted px-5 py-2 border-b border-border-subtle flex items-center gap-2">
                    {group.color && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: group.color }}
                      />
                    )}
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {group.label}
                    </span>
                    <span className="text-xs text-subtle-foreground">
                      ({group.courses.filter((c) => selectedIds.has(c.id)).length}/{group.courses.length})
                    </span>
                  </div>
                  {group.courses.map((course, i) => (
                    <label
                      key={String(course.id)}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-accent transition-colors cursor-pointer border-b border-border-subtle last:border-0 animate-row-fade-in"
                      style={{
                        animationDelay: i < MAX_STAGGER ? `${i * 40}ms` : `${MAX_STAGGER * 40}ms`,
                      }}
                      onClick={() => onToggle(course.id)}
                    >
                      <div
                        className="w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center transition-all duration-150"
                        style={{
                          backgroundColor: selectedIds.has(course.id) ? "#3b82f6" : "transparent",
                          border: selectedIds.has(course.id) ? "none" : "2px solid var(--input-border)",
                        }}
                      >
                        {selectedIds.has(course.id) && (
                          <svg
                            width="10"
                            height="8"
                            viewBox="0 0 10 8"
                            fill="none"
                            className="animate-[checkScale_0.2s_ease-out]"
                          >
                            <path
                              d="M1 4L3.5 6.5L9 1"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-foreground block truncate">{course.name}</span>
                        {course.subtitle && (
                          <span className="text-xs text-subtle-foreground block truncate">{course.subtitle}</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              );
            })
          ) : (
            // Flat list (backward-compatible)
            <>
              {courses.map((course, i) => {
                const checked = selectedIds.has(course.id);
                return (
                  <CourseRow key={String(course.id)} course={course} checked={checked} index={i} />
                );
              })}
              {courses.length === 0 && (
                <div className="px-5 py-8 text-sm text-subtle-foreground text-center">
                  No active courses found.
                </div>
              )}
            </>
          )}
          {groups && allCourses.length === 0 && (
            <div className="px-5 py-8 text-sm text-subtle-foreground text-center">
              No active courses found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border shrink-0 rounded-b-2xl">
          <button
            onClick={handleClose}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
