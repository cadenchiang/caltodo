"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Check } from "lucide-react";

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

/** Duration of the exit animation in ms. */
const EXIT_DURATION = 200;

/**
 * Course selection modal with kanban-style multi-column layout.
 * Each platform gets its own scrollable column. On mobile, columns stack vertically.
 *
 * @param open - Controls mount/unmount with enter/exit animation
 * @param onClose - Called after exit animation finishes
 * @param title - Header text
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

  const allCourses = groups ? groups.flatMap((g) => g.courses) : courses;
  const totalCount = allCourses.length;

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  const handleClose = useCallback(() => {
    setVisible(false);
    const timer = setTimeout(() => {
      setMounted(false);
      onClose();
    }, EXIT_DURATION);
    return () => clearTimeout(timer);
  }, [onClose]);

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
  const activeGroups = groups?.filter((g) => g.courses.length > 0) ?? [];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ease-out"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={handleClose}
      />

      {/* Modal — wide on desktop */}
      <div
        className={`relative bg-card w-full h-full sm:h-[85vh] flex flex-col sm:rounded-2xl sm:border sm:border-border shadow-2xl ${
          activeGroups.length > 1 ? "sm:max-w-4xl" : "sm:max-w-lg"
        } sm:mx-4 ${visible ? "animate-modal-in" : "animate-modal-out"}`}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between shrink-0 sm:rounded-t-2xl">
          <h3 className="text-sm font-semibold text-foreground">
            {title} ({selectedIds.size}/{totalCount})
          </h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={allSelected ? onDeselectAll : onSelectAll}
              className="text-xs text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
            <button
              onClick={handleClose}
              className="p-1 text-subtle-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content — kanban columns on desktop, stacked on mobile */}
        <div className="flex-1 overflow-auto sm:overflow-hidden min-h-0">
          {activeGroups.length > 0 ? (
            <div className="flex flex-col sm:flex-row h-full sm:gap-1 sm:px-1 sm:py-1">
              {activeGroups.map((group) => {
                const groupSelectedCount = group.courses.filter((c) => selectedIds.has(c.id)).length;
                return (
                  <div key={group.label} className="flex-1 flex flex-col min-w-0 sm:min-h-0 sm:overflow-hidden sm:rounded-xl sm:bg-muted/50">
                    {/* Column header */}
                    <div className="px-3 py-2 flex items-baseline gap-2 shrink-0">
                      {group.color && (
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 self-center"
                          style={{ backgroundColor: group.color }}
                        />
                      )}
                      <span className="text-xs font-bold text-foreground leading-none">{group.label}</span>
                      <span className="text-[11px] text-muted-foreground leading-none">
                        {groupSelectedCount}/{group.courses.length}
                      </span>
                    </div>
                    {/* Course list — scrolls per column */}
                    <div className="flex-1 overflow-y-auto min-h-0 px-1 pb-1">
                      {group.courses.map((course) => {
                        const checked = selectedIds.has(course.id);
                        return (
                          <button
                            key={String(course.id)}
                            type="button"
                            onClick={() => onToggle(course.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                              checked ? "bg-accent/60" : "hover:bg-accent/30"
                            }`}
                          >
                            <div
                              className="w-4 h-4 rounded shrink-0 flex items-center justify-center transition-all duration-150"
                              style={{
                                backgroundColor: checked ? (group.color || "#0e89d6") : "transparent",
                                border: checked ? "none" : "1.5px solid var(--input-border)",
                              }}
                            >
                              {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                            </div>
                            <span className={`text-[13px] truncate ${checked ? "text-foreground" : "text-muted-foreground"}`}>
                              {course.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Flat list fallback
            <div>
              {courses.map((course) => {
                const checked = selectedIds.has(course.id);
                return (
                  <button
                    key={String(course.id)}
                    type="button"
                    onClick={() => onToggle(course.id)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors cursor-pointer ${
                      checked ? "bg-accent/50" : "hover:bg-accent/30"
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded shrink-0 flex items-center justify-center transition-all duration-150"
                      style={{
                        backgroundColor: checked ? "#0e89d6" : "transparent",
                        border: checked ? "none" : "1.5px solid var(--input-border)",
                      }}
                    >
                      {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className={`text-[13px] truncate ${checked ? "text-foreground" : "text-muted-foreground"}`}>
                      {course.name}
                    </span>
                  </button>
                );
              })}
              {courses.length === 0 && (
                <div className="px-5 py-8 text-sm text-subtle-foreground text-center">
                  No active courses found.
                </div>
              )}
            </div>
          )}
          {activeGroups.length > 0 && allCourses.length === 0 && (
            <div className="px-5 py-8 text-sm text-subtle-foreground text-center">
              No active courses found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-border shrink-0 sm:rounded-b-2xl">
          <button
            onClick={handleClose}
            className="w-full px-4 py-2 rounded-xl text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
