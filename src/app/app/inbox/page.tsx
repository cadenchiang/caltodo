"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Inbox, RefreshCw, ChevronDown, X, Sun, CalendarRange } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useToast } from "@/contexts/ToastContext";
import TaskList from "@/components/tasks/TaskList";
import TaskDetailPanel from "@/components/tasks/TaskDetailPanel";
import PageTransition from "@/components/ui/PageTransition";
import type { Task, IntegrationCredentials } from "@/lib/types";

type InboxFilter = "all" | "today" | "7days";

const FILTER_OPTIONS: { key: InboxFilter; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { key: "all", label: "Inbox", icon: Inbox },
  { key: "today", label: "Today", icon: Sun },
  { key: "7days", label: "Next 7 Days", icon: CalendarRange },
];

/**
 * Filters tasks by due date relative to today.
 *
 * @param tasks - Array of tasks to filter
 * @param filter - Time window filter ("all" = no filter, "today" = due today or earlier + undated, "7days" = next 7 days)
 * @returns Filtered tasks
 */
function filterTasksByDate(tasks: Task[], filter: InboxFilter): Task[] {
  if (filter === "all") return tasks;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (filter === "today") {
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);
    return tasks.filter((t) => {
      if (!t.due_date) return true; // keep undated tasks
      const due = new Date(t.due_date + "T23:59:59");
      return due <= endOfToday;
    });
  }

  // "7days"
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + 7);
  return tasks.filter((t) => {
    if (!t.due_date) return true;
    const due = new Date(t.due_date + "T23:59:59");
    return due <= cutoff;
  });
}

interface SelectedCourse {
  id: string | number;
  name: string;
  source: "canvas" | "gradescope";
  checked: boolean;
}

/**
 * Inbox page with split-screen layout: task list on left, detail panel on right.
 * Features: time filter dropdown, sync with class selection modal, auto-sync support.
 */
export default function InboxPage() {
  const {
    tasks, loading, error, addTask, toggleComplete, deleteTask, updateTask,
    syncing, syncProgress, syncResult, triggerSync,
  } = useTaskContext();
  const { showToast } = useToast();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const prevSyncResultRef = useRef<string | null>(null);
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncCourses, setSyncCourses] = useState<SelectedCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Keep selected task in sync with context after updates
  const currentSelectedTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) ?? null
    : null;

  // Filter tasks by date
  const filteredTasks = useMemo(
    () => filterTasksByDate(tasks, filter),
    [tasks, filter]
  );

  // Close filter dropdown on outside click or scroll
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterDropdown(false);
      }
    }
    function handleScroll() {
      setShowFilterDropdown(false);
    }
    if (showFilterDropdown) {
      document.addEventListener("mousedown", handleClick);
      window.addEventListener("scroll", handleScroll, true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [showFilterDropdown]);

  // Show sync result as a toast notification
  useEffect(() => {
    if (!syncResult || syncing) return;
    const syncKey = syncResult.last_synced_at;
    if (syncKey === prevSyncResultRef.current) return;
    prevSyncResultRef.current = syncKey;

    let message = `Synced ${syncResult.canvas.synced} from bCourses, ${syncResult.gradescope.synced} from Gradescope.`;
    const errors = [...syncResult.canvas.errors, ...syncResult.gradescope.errors];
    if (errors.length > 0) {
      const cleaned = errors.map((msg) => msg.replace(/Go to Settings to add them\.?/, "")).join(". ").trim();
      message += ` ${cleaned}`;
    }
    showToast(message);
  }, [syncResult, syncing, showToast]);

  /**
   * Opens the sync modal and loads the user's selected courses from credentials.
   */
  async function handleSyncClick() {
    setLoadingCourses(true);
    setShowSyncModal(true);
    try {
      const res = await fetch("/api/credentials");
      if (!res.ok) throw new Error("Failed to load courses");
      const creds: IntegrationCredentials = await res.json();

      const courses: SelectedCourse[] = [];
      if (creds.selected_canvas_courses) {
        for (const c of creds.selected_canvas_courses) {
          courses.push({ id: c.id, name: c.name, source: "canvas", checked: true });
        }
      }
      if (creds.selected_gradescope_courses) {
        for (const c of creds.selected_gradescope_courses) {
          courses.push({ id: c.id, name: c.name, source: "gradescope", checked: true });
        }
      }

      if (courses.length === 0) {
        // No courses configured — just sync directly
        setShowSyncModal(false);
        triggerSync();
        return;
      }

      setSyncCourses(courses);
    } catch {
      setShowSyncModal(false);
      triggerSync(); // fallback to normal sync
    } finally {
      setLoadingCourses(false);
    }
  }

  /** Toggles a course in the sync modal. */
  function toggleSyncCourse(id: string | number) {
    setSyncCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c))
    );
  }

  /** Confirms sync with selected courses. */
  function handleConfirmSync() {
    setShowSyncModal(false);
    triggerSync();
  }

  const canvasCourses = syncCourses.filter((c) => c.source === "canvas");
  const gradescopeCourses = syncCourses.filter((c) => c.source === "gradescope");

  return (
    <PageTransition>
      <div className="flex -m-10" style={{ height: "calc(100vh)" }}>
        {/* Left: task list */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="px-8 pt-8 pb-4 flex items-center justify-between animate-stagger stagger-1">
            {/* Clickable title = filter selector */}
            <div ref={filterRef} className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 text-xl font-bold text-foreground hover:opacity-80 transition-opacity"
              >
                {(() => {
                  const current = FILTER_OPTIONS.find((o) => o.key === filter) ?? FILTER_OPTIONS[0];
                  const Icon = current.icon;
                  return (
                    <>
                      <Icon size={20} className="text-muted-foreground" />
                      {current.label}
                    </>
                  );
                })()}
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>
              {showFilterDropdown && (
                <div className="absolute top-full left-0 mt-1 z-50 rounded-xl shadow-2xl border border-border overflow-hidden animate-in min-w-[160px] bg-white dark:bg-neutral-800">
                  {FILTER_OPTIONS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => {
                        setFilter(key);
                        setShowFilterDropdown(false);
                      }}
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${
                        filter === key
                          ? "text-foreground bg-accent font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSyncClick}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all disabled:opacity-50"
              title="Sync assignments from bCourses & Gradescope"
            >
              <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing..." : "Sync"}
            </button>
          </div>

          {/* Sync progress bar */}
          {(syncing || syncProgress > 0) && syncProgress < 100 && (
            <div className="mx-8 mb-2">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto animate-stagger stagger-2">
            <TaskList
              tasks={filteredTasks}
              loading={loading}
              error={error}
              selectedTaskId={selectedTask?.id}
              onAdd={addTask}
              onToggle={toggleComplete}
              onSelect={(task) => setSelectedTask(task)}
              onDelete={deleteTask}
              placeholder='Add task to "Inbox". Press Enter to save.'
            />
          </div>
        </div>

        {/* Right: detail panel */}
        <TaskDetailPanel
          task={currentSelectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={updateTask}
        />
      </div>

      {/* Sync class selection modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md mx-4 flex flex-col animate-in">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Sync Assignments</h3>
              <button
                onClick={() => setShowSyncModal(false)}
                className="p-1 text-subtle-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {loadingCourses ? (
              <div className="px-5 py-8 text-sm text-subtle-foreground text-center">
                Loading courses...
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-auto">
                {canvasCourses.length > 0 && (
                  <div>
                    <p className="px-5 pt-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      bCourses
                    </p>
                    {canvasCourses.map((course) => (
                      <label
                        key={`canvas-${course.id}`}
                        className="flex items-center gap-3 px-5 py-2.5 hover:bg-accent transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={course.checked}
                          onChange={() => toggleSyncCourse(course.id)}
                          className="w-4 h-4 rounded accent-blue-500 shrink-0"
                        />
                        <span className="text-sm text-foreground truncate">{course.name}</span>
                      </label>
                    ))}
                  </div>
                )}

                {gradescopeCourses.length > 0 && (
                  <div>
                    <p className="px-5 pt-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Gradescope
                    </p>
                    {gradescopeCourses.map((course) => (
                      <label
                        key={`gs-${course.id}`}
                        className="flex items-center gap-3 px-5 py-2.5 hover:bg-accent transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={course.checked}
                          onChange={() => toggleSyncCourse(course.id)}
                          className="w-4 h-4 rounded accent-blue-500 shrink-0"
                        />
                        <span className="text-sm text-foreground truncate">{course.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border flex items-center justify-between">
              <button
                onClick={() => {
                  setSyncCourses((prev) => {
                    const allChecked = prev.every((c) => c.checked);
                    return prev.map((c) => ({ ...c, checked: !allChecked }));
                  });
                }}
                className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
              >
                {syncCourses.every((c) => c.checked) ? "Deselect all" : "Select all"}
              </button>
              <button
                onClick={handleConfirmSync}
                disabled={syncCourses.filter((c) => c.checked).length === 0}
                className="px-5 py-2 rounded-xl text-sm font-medium bg-foreground text-background hover:opacity-90 disabled:opacity-40 transition-all"
              >
                Sync {syncCourses.filter((c) => c.checked).length} courses
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
