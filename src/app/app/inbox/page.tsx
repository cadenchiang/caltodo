"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Inbox, ChevronDown, X, Sun, CalendarRange, MoreVertical, List, LayoutGrid } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useToast } from "@/contexts/ToastContext";
import TaskList from "@/components/tasks/TaskList";
import TaskBoardView from "@/components/tasks/TaskBoardView";
import TaskDetailPanel from "@/components/tasks/TaskDetailPanel";
import TaskPopover from "@/components/tasks/TaskPopover";
import PageTransition from "@/components/ui/PageTransition";
import type { Task, IntegrationCredentials } from "@/lib/types";

type InboxFilter = "all" | "today" | "7days";
type ViewMode = "list" | "board";

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

/** localStorage key for remembering sync course selections. */
const SYNC_COURSES_KEY = "caltodo_sync_course_selections";

interface SelectedCourse {
  id: string | number;
  name: string;
  source: "canvas" | "gradescope";
  checked: boolean;
}

/**
 * Loads saved sync course selection states from localStorage.
 * Returns a Map of "source:id" → checked boolean.
 */
function loadSavedSelections(): Map<string, boolean> {
  try {
    const raw = localStorage.getItem(SYNC_COURSES_KEY);
    if (!raw) return new Map();
    const entries: Array<[string, boolean]> = JSON.parse(raw);
    return new Map(entries);
  } catch {
    return new Map();
  }
}

/**
 * Saves sync course selection states to localStorage.
 *
 * @param courses - Current course selections to persist
 */
function saveSelections(courses: SelectedCourse[]): void {
  try {
    const entries = courses.map((c) => [`${c.source}:${c.id}`, c.checked] as [string, boolean]);
    localStorage.setItem(SYNC_COURSES_KEY, JSON.stringify(entries));
  } catch {
    // non-critical
  }
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
  const { showToast, updateToastProgress } = useToast();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const prevSyncResultRef = useRef<string | null>(syncResult?.last_synced_at ?? null);
  const [filter, setFilterRaw] = useState<InboxFilter>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("inbox-filter") as InboxFilter) || "all";
    }
    return "all";
  });

  /** Sets filter, persists to localStorage, and dispatches event for sidebar. */
  const setFilter = useCallback((f: InboxFilter) => {
    setFilterRaw(f);
    localStorage.setItem("inbox-filter", f);
    window.dispatchEvent(new CustomEvent("inbox-filter-change", { detail: f }));
  }, []);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncCourses, setSyncCourses] = useState<SelectedCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("inbox-view-mode") as ViewMode) || "list";
    }
    return "list";
  });
  const [showViewMenu, setShowViewMenu] = useState(false);
  const viewMenuRef = useRef<HTMLButtonElement>(null);
  const viewMenuDropdownRef = useRef<HTMLDivElement>(null);
  const [boardPopoverTask, setBoardPopoverTaskRaw] = useState<Task | null>(null);
  const [boardAnchorRect, setBoardAnchorRect] = useState<DOMRect | null>(null);

  /** Opens board popover near the clicked task card. */
  const setBoardPopoverTask = useCallback((task: Task | null, anchorRect?: DOMRect) => {
    setBoardPopoverTaskRaw(task);
    if (task && anchorRect) {
      setBoardAnchorRect(anchorRect);
    } else {
      setBoardAnchorRect(null);
    }
  }, []);

  // Keep selected task in sync with context after updates
  const currentSelectedTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) ?? null
    : null;

  // Keep board popover task in sync with context after updates
  const currentBoardPopoverTask = boardPopoverTask
    ? tasks.find((t) => t.id === boardPopoverTask.id) ?? null
    : null;

  // Filter tasks by date
  const filteredTasks = useMemo(
    () => filterTasksByDate(tasks, filter),
    [tasks, filter]
  );

  // Close filter dropdown on outside click or scroll
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        filterRef.current && !filterRef.current.contains(target) &&
        !filterDropdownRef.current?.contains(target)
      ) {
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

  // Persist view mode to localStorage
  useEffect(() => {
    localStorage.setItem("inbox-view-mode", viewMode);
  }, [viewMode]);

  // Listen for tour-triggered view mode changes
  useEffect(() => {
    function handleTourViewChange(e: Event) {
      const mode = (e as CustomEvent).detail as ViewMode;
      setViewMode(mode);
    }
    window.addEventListener("tour-set-view-mode", handleTourViewChange);
    return () => window.removeEventListener("tour-set-view-mode", handleTourViewChange);
  }, []);

  // Close view menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        viewMenuRef.current && !viewMenuRef.current.contains(target) &&
        !viewMenuDropdownRef.current?.contains(target)
      ) {
        setShowViewMenu(false);
      }
    }
    if (showViewMenu) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [showViewMenu]);

  // Show progress toast when sync starts
  const wasSyncingRef = useRef(false);
  useEffect(() => {
    if (syncing && !wasSyncingRef.current) {
      showToast("Syncing assignments...", { progress: 0 });
    }
    wasSyncingRef.current = syncing;
  }, [syncing, showToast]);

  // Update toast progress during sync
  useEffect(() => {
    if (syncing && syncProgress > 0) {
      updateToastProgress(syncProgress);
    }
  }, [syncProgress, syncing, updateToastProgress]);

  // Show sync result as a toast notification (replaces progress toast)
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
   * Opens the sync modal and loads ALL available courses from Canvas and Gradescope.
   * Restores previous check/uncheck selections from localStorage.
   */
  async function handleSyncClick() {
    setShowSyncModal(true);
    setLoadingCourses(true);
    try {
      const courses: SelectedCourse[] = [];
      const saved = loadSavedSelections();

      // Fetch all Canvas courses and all Gradescope courses in parallel
      const [canvasRes, gradescopeRes] = await Promise.all([
        fetch("/api/canvas/courses").catch(() => null),
        fetch("/api/gradescope/courses", { method: "POST" }).catch(() => null),
      ]);

      if (canvasRes?.ok) {
        const { courses: canvasCourses } = await canvasRes.json();
        for (const c of canvasCourses) {
          const key = `canvas:${c.id}`;
          courses.push({ id: c.id, name: c.name, source: "canvas", checked: saved.has(key) ? saved.get(key)! : true });
        }
      }

      if (gradescopeRes?.ok) {
        const { courses: gsCoures } = await gradescopeRes.json();
        for (const c of gsCoures) {
          const key = `gradescope:${c.id}`;
          courses.push({ id: c.id, name: c.name, source: "gradescope", checked: saved.has(key) ? saved.get(key)! : true });
        }
      }

      if (courses.length === 0) {
        setShowSyncModal(false);
        triggerSync();
        return;
      }

      setSyncCourses(courses);
    } catch {
      setShowSyncModal(false);
      triggerSync();
    } finally {
      setLoadingCourses(false);
    }
  }

  /** Toggles a course in the sync modal and persists the change. */
  function toggleSyncCourse(id: string | number) {
    setSyncCourses((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c));
      saveSelections(updated);
      return updated;
    });
  }

  /** Toggles all courses of a specific source in the sync modal. */
  function toggleSourceCourses(source: "canvas" | "gradescope") {
    setSyncCourses((prev) => {
      const sourceCourses = prev.filter((c) => c.source === source);
      const allChecked = sourceCourses.every((c) => c.checked);
      const updated = prev.map((c) =>
        c.source === source ? { ...c, checked: !allChecked } : c
      );
      saveSelections(updated);
      return updated;
    });
  }

  /** Confirms sync with selected courses, passing overrides to sync engine. */
  function handleConfirmSync() {
    saveSelections(syncCourses);
    const checkedCourses = syncCourses.filter((c) => c.checked);
    const canvasCourses = checkedCourses
      .filter((c) => c.source === "canvas")
      .map((c) => ({ id: Number(c.id), name: c.name }));
    const gradescopeCourses = checkedCourses
      .filter((c) => c.source === "gradescope")
      .map((c) => ({ id: String(c.id), name: c.name }));

    setShowSyncModal(false);
    triggerSync({
      canvas_courses: canvasCourses.length > 0 ? canvasCourses : undefined,
      gradescope_courses: gradescopeCourses.length > 0 ? gradescopeCourses : undefined,
    });
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
            <div id="tour-filter" ref={filterRef} className="relative">
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
              {showFilterDropdown && filterRef.current && createPortal(
                <div
                  ref={filterDropdownRef}
                  className="fixed z-[9999] rounded-xl shadow-2xl border border-border overflow-hidden animate-in min-w-[160px] bg-white dark:bg-[#1a1a1a]"
                  style={{
                    top: filterRef.current.getBoundingClientRect().bottom + 4,
                    left: filterRef.current.getBoundingClientRect().left,
                  }}
                >
                  {FILTER_OPTIONS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => {
                        setFilter(key);
                        setShowFilterDropdown(false);
                      }}
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${
                        filter === key
                          ? "text-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      style={{
                        backgroundColor: filter === key ? "rgba(255,255,255,0.08)" : "transparent",
                      }}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>,
                document.body
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                id="tour-view-toggle"
                ref={viewMenuRef}
                onClick={() => setShowViewMenu(!showViewMenu)}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all"
                title="View options"
              >
                <MoreVertical size={16} />
              </button>

              {showViewMenu && viewMenuRef.current && createPortal(
                <div
                  ref={viewMenuDropdownRef}
                  className="fixed z-[9999] rounded-xl shadow-2xl border border-border overflow-hidden animate-in min-w-[140px] bg-white dark:bg-[#1a1a1a]"
                  style={{
                    top: viewMenuRef.current.getBoundingClientRect().bottom + 4,
                    right: window.innerWidth - viewMenuRef.current.getBoundingClientRect().right,
                  }}
                >
                  <button
                    onClick={() => { setViewMode("list"); setShowViewMenu(false); }}
                    className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${
                      viewMode === "list"
                        ? "text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={{ backgroundColor: viewMode === "list" ? "rgba(255,255,255,0.08)" : "transparent" }}
                  >
                    <List size={14} />
                    List
                  </button>
                  <button
                    onClick={() => { setViewMode("board"); setShowViewMenu(false); }}
                    className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${
                      viewMode === "board"
                        ? "text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={{ backgroundColor: viewMode === "board" ? "rgba(255,255,255,0.08)" : "transparent" }}
                  >
                    <LayoutGrid size={14} />
                    Board
                  </button>
                </div>,
                document.body
              )}
            </div>
          </div>

          {/* Sync progress bar with glow */}
          {(syncing || syncProgress > 0) && syncProgress < 100 && (
            <div className="mx-8 mb-2">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out animate-sync-glow"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>
            </div>
          )}

          <div id="tour-task-list" className="flex-1 overflow-auto animate-stagger stagger-2">
            <div key={viewMode} className="animate-view-switch h-full">
              {viewMode === "list" ? (
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
              ) : (
                <TaskBoardView
                  tasks={filteredTasks}
                  loading={loading}
                  error={error}
                  selectedTaskId={boardPopoverTask?.id}
                  onAdd={addTask}
                  onToggle={toggleComplete}
                  onSelect={(task, anchorRect) => setBoardPopoverTask(task, anchorRect)}
                  onDelete={deleteTask}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right: detail panel (list view only) */}
        {viewMode === "list" && (
          <TaskDetailPanel
            task={currentSelectedTask}
            onClose={() => setSelectedTask(null)}
            onSave={updateTask}
          />
        )}
      </div>

      {/* Board view: floating task popover instead of split-screen detail panel */}
      {viewMode === "board" && currentBoardPopoverTask && boardAnchorRect && (
        <TaskPopover
          task={currentBoardPopoverTask}
          anchorRect={boardAnchorRect}
          onClose={() => { setBoardPopoverTask(null); setBoardAnchorRect(null); }}
          onSave={async (id, updates) => {
            await updateTask(id, updates);
          }}
          onDelete={async (id) => {
            await deleteTask(id);
            setBoardPopoverTask(null);
            setBoardAnchorRect(null);
          }}
        />
      )}

      {/* Sync class selection modal — portaled to escape transform stacking context */}
      {showSyncModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md mx-4 flex flex-col animate-modal-in">
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
              <div className="max-h-[60vh] overflow-auto px-5 py-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-4 h-4 rounded bg-muted shrink-0" />
                    <div className="h-4 bg-muted rounded flex-1" style={{ maxWidth: `${60 + (i * 7) % 30}%` }} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-auto">
                {canvasCourses.length > 0 && (
                  <div>
                    <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        bCourses
                      </p>
                      <button
                        onClick={() => toggleSourceCourses("canvas")}
                        className="text-[11px] text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        {canvasCourses.every((c) => c.checked) ? "Deselect all" : "Select all"}
                      </button>
                    </div>
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
                    <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Gradescope
                      </p>
                      <button
                        onClick={() => toggleSourceCourses("gradescope")}
                        className="text-[11px] text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        {gradescopeCourses.every((c) => c.checked) ? "Deselect all" : "Select all"}
                      </button>
                    </div>
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
                    const updated = prev.map((c) => ({ ...c, checked: !allChecked }));
                    saveSelections(updated);
                    return updated;
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
        </div>,
        document.body
      )}
    </PageTransition>
  );
}
