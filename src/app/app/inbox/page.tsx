"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useRouter } from "next/navigation";
import { Inbox, ChevronDown, X, Sun, CalendarRange, CalendarDays, GraduationCap, MoreVertical, List, LayoutGrid, ArrowUpDown, RefreshCw, Plus } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { expandRepeatingTasks, getRealTaskId } from "@/lib/expand-repeating-tasks";
import TaskList from "@/components/tasks/TaskList";
import TaskBoardView from "@/components/tasks/TaskBoardView";
import CourseGridView from "@/components/courses/CourseGridView";
import TaskDetailPanel from "@/components/tasks/TaskDetailPanel";
import TaskCreateModal from "@/components/tasks/TaskCreateModal";
import TaskPreviewPopover from "@/components/tasks/TaskPreviewPopover";
import PageTransition from "@/components/ui/PageTransition";
import type { Task, PendingInvite } from "@/lib/types";
import { usePendingInvites } from "@/hooks/usePendingInvites";

import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { trackEvent } from "@/lib/analytics";

/** localStorage key to persist dismissal of the "Sync classes" badge. */
const SYNC_BADGE_DISMISSED_KEY = "caltodo_sync_badge_dismissed";

type InboxFilter = "all" | "today" | "7days";
type ViewMode = "list" | "board" | "courses";

const FILTER_OPTIONS: { key: InboxFilter; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { key: "all", label: "Inbox", icon: Inbox },
  { key: "today", label: "Today", icon: Sun },
  { key: "7days", label: "Next 7 Days", icon: CalendarRange },
];

/**
 * Formats a Date as "YYYY-MM-DD".
 *
 * @param date - Date to format
 * @returns ISO date string
 */
function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Filters tasks by due date relative to today.
 * Expands repeating tasks into virtual instances so they appear
 * on the appropriate dates in the inbox.
 *
 * @param tasks - Array of tasks to filter
 * @param filter - Time window filter ("all" = no filter, "today" = due today or earlier + undated, "7days" = next 7 days)
 * @returns Filtered tasks including virtual repeat instances
 */
function filterTasksByDate(tasks: Task[], filter: InboxFilter): Task[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const todayStr = toDateStr(now);

  // Determine expansion range based on filter
  let rangeEnd: Date;
  if (filter === "today") {
    rangeEnd = new Date(now);
  } else if (filter === "7days") {
    rangeEnd = new Date(now);
    rangeEnd.setDate(rangeEnd.getDate() + 7);
  } else {
    // "all" — expand 30 days ahead for upcoming repeat instances
    rangeEnd = new Date(now);
    rangeEnd.setDate(rangeEnd.getDate() + 30);
  }

  const rangeEndStr = toDateStr(rangeEnd);
  const expanded = expandRepeatingTasks(tasks, todayStr, rangeEndStr);

  if (filter === "all") {
    return expanded.filter((t) => {
      if (!t.due_date) return true;
      return t.due_date <= rangeEndStr;
    });
  }

  if (filter === "today") {
    return expanded.filter((t) => {
      if (!t.due_date) return true;
      return t.due_date <= todayStr;
    });
  }

  // "7days"
  return expanded.filter((t) => {
    if (!t.due_date) return true;
    return t.due_date <= rangeEndStr;
  });
}

type SortMode = "date" | "class";

/**
 * Sorts tasks by sort_order first (manual drag order), then by due_date.
 * Tasks with a non-null sort_order come first, sorted ascending.
 * Tasks with null sort_order follow, sorted by due_date ascending (undated first).
 *
 * @param tasks - Array of tasks to sort
 * @returns New sorted array (does not mutate input)
 */
function sortByDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // Primary sort: due date ascending (undated tasks first)
    if (!a.due_date && !b.due_date) {
      // Both undated: use sort_order as tiebreaker if available
      const aOrd = a.sort_order ?? Infinity;
      const bOrd = b.sort_order ?? Infinity;
      return aOrd - bOrd;
    }
    if (!a.due_date) return -1;
    if (!b.due_date) return 1;

    const dateCmp = a.due_date.localeCompare(b.due_date);
    if (dateCmp !== 0) return dateCmp;

    // Same date: use sort_order as tiebreaker (null sort_order sorts last)
    const aOrd = a.sort_order ?? Infinity;
    const bOrd = b.sort_order ?? Infinity;
    return aOrd - bOrd;
  });
}

/**
 * Sorts tasks by course_name alphabetically (null → last), then by due_date within each class.
 *
 * @param tasks - Array of tasks to sort
 * @returns New sorted array (does not mutate input)
 */
function sortByClass(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const ca = a.course_name || "\uffff";
    const cb = b.course_name || "\uffff";
    const cmp = ca.localeCompare(cb);
    if (cmp !== 0) return cmp;
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return -1;
    if (!b.due_date) return 1;
    return a.due_date.localeCompare(b.due_date);
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
 * Mobile uses preview popovers instead of the side panel.
 * Features: time filter dropdown, list/board view, sync with class selection modal.
 */
export default function InboxPage() {
  const {
    tasks, loading, error, addTask, toggleComplete: rawToggle, deleteTask: rawDelete, updateTask: rawUpdate,
    syncing, triggerSync, reorderTasks, fetchTasks, lastSyncedAt, courseColors,
  } = useTaskContext();

  /** Wraps toggleComplete to resolve virtual repeat instance IDs to real task IDs. */
  const toggleComplete = useCallback((id: string) => rawToggle(getRealTaskId(id)), [rawToggle]);
  /** Wraps deleteTask to resolve virtual repeat instance IDs to real task IDs. */
  const deleteTask = useCallback((id: string) => rawDelete(getRealTaskId(id)), [rawDelete]);
  /** Wraps updateTask to resolve virtual repeat instance IDs to real task IDs. */
  const updateTask = useCallback(
    (id: string, updates: Parameters<typeof rawUpdate>[1]) => rawUpdate(getRealTaskId(id), updates),
    [rawUpdate],
  );

  const inboxRouter = useRouter();
  const searchParams = useSearchParams();
  const { hasCompletedOnboarding, loading: onboardingLoading } = useOnboardingStatus({ skipCache: true });
  const [syncBadgeDismissed, setSyncBadgeDismissed] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [listPreviewTask, setListPreviewTask] = useState<Task | null>(null);
  const [listPreviewRect, setListPreviewRect] = useState<DOMRect | null>(null);
  const [listModalTask, setListModalTask] = useState<Task | null>(null);
  const [filter, setFilterRaw] = useState<InboxFilter>("all");
  const { invites: pendingInvites, setInvites: setPendingInvites } = usePendingInvites();

  /** Sets filter, persists to localStorage, and dispatches event for sidebar. */
  const setFilter = useCallback((f: InboxFilter) => {
    trackEvent("filter_changed", { filter: f });
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
  /** Guards persist effects from running on mount (which would overwrite hydrated values). */
  const hydratedRef = useRef(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showViewMenu, setShowViewMenu] = useState(false);
  const viewMenuRef = useRef<HTMLButtonElement>(null);
  const viewMenuDropdownRef = useRef<HTMLDivElement>(null);
  const [sortMode, setSortMode] = useState<SortMode>("date");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLButtonElement>(null);
  const sortMenuDropdownRef = useRef<HTMLDivElement>(null);
  const [boardGroupBy, setBoardGroupBy] = useState<"class" | "date">("class");

  // Hydrate persisted preferences from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    const savedFilter = localStorage.getItem("inbox-filter") as InboxFilter | null;
    if (savedFilter) setFilterRaw(savedFilter);
    const savedView = localStorage.getItem("inbox-view-mode") as ViewMode | null;
    if (savedView) setViewMode(savedView);
    const savedSort = localStorage.getItem("inbox-sort-mode") as SortMode | null;
    if (savedSort) setSortMode(savedSort);
    const savedGroup = localStorage.getItem("inbox-board-group") as "class" | "date" | null;
    if (savedGroup) setBoardGroupBy(savedGroup);
    hydratedRef.current = true;
    try {
      setSyncBadgeDismissed(localStorage.getItem(SYNC_BADGE_DISMISSED_KEY) === "true");
    } catch { /* ignore */ }
  }, []);

  // Pending invites now come from the shared SWR hook (usePendingInvites)
  // so the Inbox and Calendar pages dedupe onto a single request.

  /**
   * Handles accepting or declining a task invite.
   * On accept, refetches tasks (new task appeared) and removes from pending list.
   * On decline, removes from pending list.
   *
   * @param shareId - The share to respond to
   * @param action - "accept" or "decline"
   */
  const handleRespondInvite = useCallback(async (shareId: string, action: "accept" | "decline") => {
    try {
      const res = await fetch(`/api/tasks/invite/${shareId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        setPendingInvites((prev) => {
          const updated = prev.filter((i) => i.shareId !== shareId);
          return updated;
        });

        // On accept, refetch tasks so the newly copied task appears in the inbox.
        // Small delay lets the admin-inserted row propagate through RLS.
        if (action === "accept") {
          await new Promise((r) => setTimeout(r, 300));
          await fetchTasks();
        }
      }
    } catch {
      // Non-critical — user can retry
    }
  }, [fetchTasks]);

  /**
   * Accepts all pending invites at once by firing accept for each.
   */
  const handleAcceptAllInvites = useCallback(async () => {
    const invites = [...pendingInvites];
    if (invites.length === 0) return;

    // Clear the list immediately for instant UI feedback
    setPendingInvites([]);
    // Fire all accept calls in parallel
    await Promise.allSettled(
      invites.map((invite) =>
        fetch(`/api/tasks/invite/${invite.shareId}/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "accept" }),
        })
      )
    );

    // Refetch tasks so accepted ones appear
    await new Promise((r) => setTimeout(r, 300));
    await fetchTasks();
  }, [pendingInvites, fetchTasks]);

  // Auto-select task from ?task= query param (e.g. from notification click-through)
  const taskParamHandled = useRef(false);
  useEffect(() => {
    if (taskParamHandled.current || loading || tasks.length === 0) return;
    const taskId = searchParams.get("task");
    if (!taskId) return;

    taskParamHandled.current = true;
    const target = tasks.find((t) => t.id === taskId);
    if (target) {
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        // Mobile: no anchor rect from deep link — open full modal
        setListModalTask(target);
      } else {
        // Desktop: show in detail panel
        setSelectedTask(target);
      }
    }
    // Clear the URL param without adding a history entry
    inboxRouter.replace("/app/inbox", { scroll: false });
  }, [searchParams, tasks, loading, inboxRouter]);

  const [boardEditTask, setBoardEditTask] = useState<Task | null>(null);
  const [boardAnchorRect, setBoardAnchorRect] = useState<DOMRect | null>(null);
  const [boardModalTask, setBoardModalTask] = useState<Task | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalCourseName, setAddModalCourseName] = useState<string | null>(null);

  // Keep selected task in sync with context after updates (desktop detail panel)
  const currentSelectedTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) ?? null
    : null;

  // Keep list preview task in sync with context after updates (mobile popover)
  const currentListPreviewTask = listPreviewTask
    ? tasks.find((t) => t.id === listPreviewTask.id) ?? null
    : null;

  // Keep board edit task in sync with context after updates
  const currentBoardEditTask = boardEditTask
    ? tasks.find((t) => t.id === boardEditTask.id) ?? null
    : null;

  // Filter tasks by date
  const filteredTasks = useMemo(
    () => {
      const result = filterTasksByDate(tasks, filter);
      // Debug: log tasks that exist in context but were filtered out
      if (typeof window !== "undefined" && tasks.length > 0) {
        const filtered = tasks.filter((t) => !result.some((r) => r.id === t.id));
        if (filtered.length > 0) {
          console.log("[Inbox] Tasks filtered out:", filtered.map((t) => ({ id: t.id, title: t.title, due_date: t.due_date, is_completed: t.is_completed, snoozed_until: t.snoozed_until, dismissed_at: t.dismissed_at })));
        }
      }
      return result;
    },
    [tasks, filter]
  );

  // Apply sort mode to filtered tasks
  const sortedTasks = useMemo(
    () => sortMode === "class" ? sortByClass(filteredTasks) : sortByDate(filteredTasks),
    [filteredTasks, sortMode]
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

  // Persist preferences to localStorage (skip mount to avoid overwriting hydrated values)
  useEffect(() => {
    if (!hydratedRef.current) return;
    localStorage.setItem("inbox-view-mode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    localStorage.setItem("inbox-sort-mode", sortMode);
  }, [sortMode]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    localStorage.setItem("inbox-board-group", boardGroupBy);
  }, [boardGroupBy]);

  // Auto-reset filter to "all" when board view is in date group mode
  useEffect(() => {
    if (viewMode === "board" && boardGroupBy === "date" && filter !== "all") {
      setFilter("all");
    }
  }, [viewMode, boardGroupBy, filter, setFilter]);

  // Close sort menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        sortMenuRef.current && !sortMenuRef.current.contains(target) &&
        !sortMenuDropdownRef.current?.contains(target)
      ) {
        setShowSortMenu(false);
      }
    }
    if (showSortMenu) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [showSortMenu]);

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

  /**
   * Handles drag-and-drop reorder by mapping new ID order to sort_order values.
   * Uses gaps of 1000 between values to allow future insertions without reindexing.
   *
   * @param reorderedIds - Task IDs in their new display order
   */
  const handleReorder = useCallback((reorderedIds: string[]) => {
    const updates = reorderedIds.map((id, index) => ({
      id,
      sort_order: (index + 1) * 1000,
    }));
    reorderTasks(updates);
  }, [reorderTasks]);

  const canvasCourses = syncCourses.filter((c) => c.source === "canvas");
  const gradescopeCourses = syncCourses.filter((c) => c.source === "gradescope");

  return (
    <PageTransition>
      <div className="flex flex-col md:flex-row -m-4 md:-m-10 h-[calc(100dvh-3rem)] md:h-dvh">
        {/* Left: task list (60%) */}
        <div className="flex flex-col min-w-0 min-h-0" style={{ flex: "3 1 0%" }}>
          <div className="px-4 pt-4 pb-3 md:px-8 md:pt-8 md:pb-4 flex items-center justify-between animate-stagger stagger-1">
            {/* Left: title + sync badge grouped together */}
            <div className="flex items-center gap-2.5 min-w-0">
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
                    id="tour-filter-dropdown"
                    ref={filterDropdownRef}
                    className="fixed z-[9999] rounded-xl shadow-2xl border border-border overflow-hidden animate-in min-w-[160px] bg-popover"
                    style={{
                      top: filterRef.current.getBoundingClientRect().bottom + 4,
                      left: filterRef.current.getBoundingClientRect().left,
                    }}
                  >
                    {FILTER_OPTIONS.map(({ key, label, icon: Icon }) => {
                      const isDisabled = viewMode === "board" && boardGroupBy === "date" && key !== "all";
                      return (
                        <button
                          key={key}
                          disabled={isDisabled}
                          onClick={() => {
                            if (isDisabled) return;
                            setFilter(key);
                            setShowFilterDropdown(false);
                          }}
                          className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${
                            isDisabled
                              ? "opacity-40 cursor-not-allowed pointer-events-none"
                              : filter === key
                                ? "text-foreground font-medium"
                                : "text-muted-foreground hover:text-foreground"
                          }`}
                          style={{
                            backgroundColor: !isDisabled && filter === key ? "rgba(255,255,255,0.08)" : "transparent",
                          }}
                        >
                          <Icon size={16} />
                          {label}
                        </button>
                      );
                    })}
                  </div>,
                  document.body
                )}
              </div>

              {/* "Sync Classes" badge for unonboarded users — hidden on mobile */}
              {!hasCompletedOnboarding && !lastSyncedAt && !syncBadgeDismissed && !onboardingLoading && (
                <div className="relative shrink-0 hidden md:flex items-center group/sync">
                  <a
                    href="/app/settings?section=integrations"
                    title="Connect your class platforms"
                    className="active:scale-95 transition-all relative"
                  >
                    <div className="rounded-full bg-[#007AFF] pl-2.5 pr-3 py-1.5 flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                      <span className="text-xs font-semibold text-white">Sync Classes</span>
                    </div>
                  </a>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSyncBadgeDismissed(true);
                      try { localStorage.setItem(SYNC_BADGE_DISMISSED_KEY, "true"); } catch { /* ignore */ }
                    }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center opacity-0 group-hover/sync:opacity-100 transition-opacity hover:bg-gray-300 dark:hover:bg-zinc-600"
                    aria-label="Dismiss"
                    title="Dismiss"
                  >
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Add task button */}
              <button
                id="tour-add-task"
                onClick={() => setShowAddModal(true)}
                className="p-1.5 text-foreground hover:bg-accent rounded-lg transition-all"
                title="Add task"
              >
                <Plus size={18} />
              </button>
              {/* Sort / group-by button — works for both list and board */}
              <div className="relative">
                <button
                  ref={sortMenuRef}
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="p-1.5 text-foreground hover:bg-accent rounded-lg transition-all"
                  title={viewMode === "list" ? "Sort tasks" : "Group by"}
                >
                  <ArrowUpDown size={18} />
                </button>
                {showSortMenu && sortMenuRef.current && createPortal(
                  <div
                    ref={sortMenuDropdownRef}
                    className="fixed z-[9999] rounded-xl shadow-2xl border border-border overflow-hidden animate-in min-w-[120px] bg-popover"
                    style={{
                      top: sortMenuRef.current.getBoundingClientRect().bottom + 4,
                      right: window.innerWidth - sortMenuRef.current.getBoundingClientRect().right,
                    }}
                  >
                    {(() => {
                      const currentValue = viewMode === "list" ? sortMode : boardGroupBy;
                      const setValue = viewMode === "list"
                        ? (v: "date" | "class") => setSortMode(v)
                        : (v: "date" | "class") => setBoardGroupBy(v);
                      return (
                        <>
                          <button
                            onClick={() => { trackEvent("sort_mode_changed", { sort: "date" }); setValue("date"); setShowSortMenu(false); }}
                            className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${
                              currentValue === "date"
                                ? "text-foreground font-medium"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                            style={{ backgroundColor: currentValue === "date" ? "rgba(255,255,255,0.08)" : "transparent" }}
                          >
                            <CalendarDays size={14} />
                            Date
                          </button>
                          <button
                            onClick={() => { trackEvent("sort_mode_changed", { sort: "class" }); setValue("class"); setShowSortMenu(false); }}
                            className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${
                              currentValue === "class"
                                ? "text-foreground font-medium"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                            style={{ backgroundColor: currentValue === "class" ? "rgba(255,255,255,0.08)" : "transparent" }}
                          >
                            <GraduationCap size={14} />
                            Class
                          </button>
                        </>
                      );
                    })()}
                  </div>,
                  document.body
                )}
              </div>
              <button
                id="tour-view-toggle"
                ref={viewMenuRef}
                onClick={() => setShowViewMenu(!showViewMenu)}
                className="p-1.5 text-foreground hover:bg-accent rounded-lg transition-all"
                title="View options"
              >
                <MoreVertical size={18} />
              </button>

              {showViewMenu && viewMenuRef.current && createPortal(
                <div
                  ref={viewMenuDropdownRef}
                  className="fixed z-[9999] rounded-xl shadow-2xl border border-border overflow-hidden animate-in min-w-[140px] bg-popover"
                  style={{
                    top: viewMenuRef.current.getBoundingClientRect().bottom + 4,
                    right: window.innerWidth - viewMenuRef.current.getBoundingClientRect().right,
                  }}
                >
                  <button
                    onClick={() => { trackEvent("view_mode_changed", { mode: "list" }); setViewMode("list"); setShowViewMenu(false); }}
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
                    id="tour-board-option"
                    onClick={() => { trackEvent("view_mode_changed", { mode: "board" }); setViewMode("board"); setShowViewMenu(false); }}
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
                  <button
                    onClick={() => { trackEvent("view_mode_changed", { mode: "courses" }); setViewMode("courses"); setShowViewMenu(false); }}
                    className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${
                      viewMode === "courses"
                        ? "text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={{ backgroundColor: viewMode === "courses" ? "rgba(255,255,255,0.08)" : "transparent" }}
                  >
                    <GraduationCap size={14} />
                    Courses
                  </button>
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={() => { setShowViewMenu(false); handleSyncClick(); }}
                    disabled={syncing}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
                    {syncing ? "Syncing..." : "Sync"}
                  </button>
                </div>,
                document.body
              )}
            </div>
          </div>

          {/* Header add-task modal */}
          <TaskCreateModal
            open={showAddModal}
            onClose={() => { setShowAddModal(false); setAddModalCourseName(null); }}
            onAdd={(task) => { addTask(task); setShowAddModal(false); setAddModalCourseName(null); }}
            defaultCourseName={addModalCourseName}
          />

          <div id="tour-task-list" className="flex-1 overflow-auto animate-stagger stagger-2">
            <div key={viewMode} className="animate-view-switch h-full">
              {viewMode === "list" ? (
                <TaskList
                  tasks={sortedTasks}
                  loading={loading}
                  error={error}
                  selectedTaskId={selectedTask?.id}
                  sortMode={sortMode}
                  onAdd={addTask}
                  onToggle={toggleComplete}
                  onSelect={(task, anchorRect) => {
                    if (typeof window !== "undefined" && window.innerWidth < 768 && anchorRect) {
                      // Mobile: show preview popover
                      setListPreviewTask(task);
                      setListPreviewRect(anchorRect);
                    } else {
                      // Desktop: show in detail panel
                      setSelectedTask(task);
                    }
                  }}
                  onDelete={deleteTask}
                  onReorder={sortMode === "date" ? handleReorder : undefined}
                  onColorChange={async (courseName, color) => {
                    const matching = sortedTasks.filter(
                      (t) => (t.course_name || "General") === courseName
                    );
                    for (const t of matching) {
                      await updateTask(t.id, { color });
                    }
                  }}
                  onDeleteClass={async (courseName) => {
                    const matching = sortedTasks.filter(
                      (t) => (t.course_name || "General") === courseName
                    );
                    for (const t of matching) {
                      await deleteTask(t.id);
                    }
                  }}
                  onAddTaskToClass={(courseName) => {
                    setAddModalCourseName(courseName);
                    setShowAddModal(true);
                  }}
                  pendingInvites={pendingInvites}
                  onRespondInvite={handleRespondInvite}
                  onAcceptAllInvites={handleAcceptAllInvites}
                />
              ) : viewMode === "courses" ? (
                <CourseGridView
                  tasks={filteredTasks}
                  courseColors={courseColors}
                  loading={loading}
                />
              ) : (
                <TaskBoardView
                  tasks={filteredTasks}
                  loading={loading}
                  error={error}
                  selectedTaskId={boardEditTask?.id}
                  groupBy={boardGroupBy}
                  onAdd={addTask}
                  onToggle={toggleComplete}
                  onSelect={(task, anchorRect) => {
                    setBoardEditTask(task);
                    setBoardAnchorRect(anchorRect ?? null);
                  }}
                  onDelete={deleteTask}
                  onColorChange={async (courseName, color) => {
                    const matching = filteredTasks.filter(
                      (t) => (t.course_name || "General") === courseName
                    );
                    for (const t of matching) {
                      await updateTask(t.id, { color });
                    }
                  }}
                  onDeleteClass={async (courseName) => {
                    const matching = filteredTasks.filter(
                      (t) => (t.course_name || "General") === courseName
                    );
                    for (const t of matching) {
                      await deleteTask(t.id);
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right: detail panel (40%, list view only, hidden on mobile) */}
        {viewMode === "list" && (
          <div className="hidden md:flex w-[50%] shrink-0">
            <TaskDetailPanel
              task={currentSelectedTask}
              onClose={() => setSelectedTask(null)}
              onSave={updateTask}
              onDelete={deleteTask}
            />
          </div>
        )}
      </div>

      {/* Board view: preview popover (first click) */}
      {viewMode === "board" && currentBoardEditTask && boardAnchorRect && (
        <TaskPreviewPopover
          task={currentBoardEditTask}
          anchorRect={boardAnchorRect}
          onClose={() => { setBoardEditTask(null); setBoardAnchorRect(null); }}
          onEdit={(task) => {
            setBoardEditTask(null);
            setBoardAnchorRect(null);
            setBoardModalTask(task);
          }}
          onDelete={async (id) => {
            await deleteTask(id);
            setBoardEditTask(null);
            setBoardAnchorRect(null);
          }}
          onToggle={toggleComplete}
        />
      )}

      {/* Board view: full edit modal (opened from preview pencil) */}
      {viewMode === "board" && (
        <TaskCreateModal
          open={!!boardModalTask}
          onClose={() => setBoardModalTask(null)}
          onAdd={() => {}}
          editTask={boardModalTask}
          onSave={async (id, updates) => {
            await updateTask(id, updates);
          }}
          onDelete={async (id) => {
            await deleteTask(id);
            setBoardModalTask(null);
          }}
          onSaveColorForClass={async (courseName, color) => {
            const matching = tasks.filter(t => (t.course_name || "General") === courseName);
            for (const t of matching) await updateTask(t.id, { color });
          }}
        />
      )}

      {/* List view: preview popover (mobile only — desktop uses TaskDetailPanel) */}
      {viewMode === "list" && currentListPreviewTask && listPreviewRect && (
        <TaskPreviewPopover
          task={currentListPreviewTask}
          anchorRect={listPreviewRect}
          onClose={() => { setListPreviewTask(null); setListPreviewRect(null); }}
          onEdit={(task) => {
            setListPreviewTask(null);
            setListPreviewRect(null);
            setListModalTask(task);
          }}
          onDelete={async (id) => {
            await deleteTask(id);
            setListPreviewTask(null);
            setListPreviewRect(null);
          }}
          onToggle={toggleComplete}
        />
      )}

      {/* List view: full edit modal (opened from preview pencil or deep link) */}
      {viewMode === "list" && (
        <TaskCreateModal
          open={!!listModalTask}
          onClose={() => setListModalTask(null)}
          onAdd={() => {}}
          editTask={listModalTask}
          onSave={async (id, updates) => {
            await updateTask(id, updates);
          }}
          onDelete={async (id) => {
            await deleteTask(id);
            setListModalTask(null);
          }}
          onSaveColorForClass={async (courseName, color) => {
            const matching = tasks.filter(t => (t.course_name || "General") === courseName);
            for (const t of matching) await updateTask(t.id, { color });
          }}
        />
      )}

      {/* Sync class selection modal — portaled to escape transform stacking context */}
      {showSyncModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full w-[calc(100%-2rem)] max-w-md flex flex-col animate-modal-in">
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
                      <p className="text-xs font-semibold text-foreground">
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
                      <p className="text-xs font-semibold text-foreground">
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
