"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useRouter } from "next/navigation";
import { Inbox, X, Sun, CalendarRange, CalendarDays, GraduationCap, List, LayoutGrid, ArrowUpDown, RefreshCw, Plus, ChevronDown } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useToast } from "@/contexts/ToastContext";
import { getRealTaskId } from "@/lib/expand-repeating-tasks";
import TaskList from "@/components/tasks/TaskList";
import TaskBoardView from "@/components/tasks/TaskBoardView";
import TaskDetailPanel from "@/components/tasks/TaskDetailPanel";
import TaskCreateModal from "@/components/tasks/TaskCreateModal";
import TaskPreviewPopover from "@/components/tasks/TaskPreviewPopover";
import PageTransition from "@/components/ui/PageTransition";
import type { Task, PendingInvite } from "@/lib/types";
import { usePendingInvites } from "@/hooks/usePendingInvites";

import { trackEvent } from "@/lib/analytics";

type InboxFilter = "all" | "today" | "7days";
type ViewMode = "list" | "board";

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
 *
 * Repeating tasks are NOT expanded into virtual instances here: the base
 * row's due_date always holds the next occurrence (completing advances it),
 * so each repeating task appears exactly once in the list. The calendar is
 * the only view that expands future occurrences.
 *
 * @param tasks - Array of tasks to filter
 * @param filter - Time window filter ("all" = no filter, "today" = due today or earlier + undated, "7days" = next 7 days)
 * @returns Filtered tasks
 */
function filterTasksByDate(tasks: Task[], filter: InboxFilter): Task[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const todayStr = toDateStr(now);

  if (filter === "today") {
    return tasks.filter((t) => {
      if (!t.due_date) return true;
      return t.due_date <= todayStr;
    });
  }

  // "all" looks 30 days ahead, "7days" one week.
  const rangeEnd = new Date(now);
  rangeEnd.setDate(rangeEnd.getDate() + (filter === "7days" ? 7 : 30));
  const rangeEndStr = toDateStr(rangeEnd);
  return tasks.filter((t) => {
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
  const { showToast } = useToast();

  /** Wraps toggleComplete to resolve virtual repeat instance IDs to real task IDs. */
  const toggleComplete = useCallback((id: string) => rawToggle(getRealTaskId(id)), [rawToggle]);
  /** Wraps deleteTask to resolve virtual repeat instance IDs to real task IDs. */
  const deleteTask = useCallback((id: string, opts?: { silent?: boolean }) => rawDelete(getRealTaskId(id), opts), [rawDelete]);
  /** Wraps updateTask to resolve virtual repeat instance IDs to real task IDs. */
  const updateTask = useCallback(
    (id: string, updates: Parameters<typeof rawUpdate>[1]) => rawUpdate(getRealTaskId(id), updates),
    [rawUpdate],
  );

  const inboxRouter = useRouter();
  const searchParams = useSearchParams();
  // First name for the page title — read from the user-profile cache
  // that the sidebar writes on mount. Falls back to "My Tasks" when no
  // name is available.
  const [firstName, setFirstName] = useState<string>("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem("caltodo_user_profile");
      if (!raw) return;
      const parsed = JSON.parse(raw) as { fullName?: string | null };
      const first = (parsed.fullName ?? "").split(" ")[0] ?? "";
      if (first) setFirstName(first);
    } catch { /* localStorage unavailable */ }
  }, []);
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

  /**
   * Stable onSelect callback for task rows. Mobile (<768px) shows the
   * preview popover anchored at the row; desktop opens the detail panel.
   * Memoized so memo'd TaskItem instances don't re-render on every parent
   * render just because of a new arrow-function identity.
   */
  const handleTaskSelect = useCallback((task: Task, anchorRect?: DOMRect) => {
    if (typeof window !== "undefined" && window.innerWidth < 768 && anchorRect) {
      setListPreviewTask(task);
      setListPreviewRect(anchorRect);
    } else {
      setSelectedTask(task);
    }
  }, []);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncCourses, setSyncCourses] = useState<SelectedCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  /** Guards persist effects from running on mount (which would overwrite hydrated values). */
  const hydratedRef = useRef(false);
  // New users default to the Board view ("list" was the old default).
  // Once the user has explicitly picked anything we persist it under
  // Inbox defaults to List view for new sessions. The hydrate effect
  // below restores the user's last selection from localStorage so the
  // toggle persists across visits. A separate callback wraps setState
  // with an inline localStorage write so the persistence never gets
  // clobbered by a hydration-time effect race.
  const [viewMode, setViewModeState] = useState<ViewMode>("list");
  const setViewMode = useCallback((next: ViewMode) => {
    setViewModeState(next);
    try { localStorage.setItem("inbox-view-mode", next); } catch { /* non-critical */ }
  }, []);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const viewMenuRef = useRef<HTMLButtonElement>(null);
  const viewMenuDropdownRef = useRef<HTMLDivElement>(null);
  // View switcher (List / Board) is now a single pill that opens a dropdown
  // instead of two always-visible tabs.
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const viewToggleRef = useRef<HTMLDivElement>(null);
  const [sortMode, setSortMode] = useState<SortMode>("date");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLButtonElement>(null);
  const sortMenuDropdownRef = useRef<HTMLDivElement>(null);
  const [boardGroupBy, setBoardGroupBy] = useState<"class" | "date">("class");

  // Hydrate persisted preferences from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    const savedFilter = localStorage.getItem("inbox-filter") as InboxFilter | null;
    if (savedFilter) setFilterRaw(savedFilter);
    const savedView = localStorage.getItem("inbox-view-mode");
    // Use the raw state setter (NOT the persisted wrapper) so the
    // hydrate-read doesn't immediately re-save itself.
    if (savedView === "list" || savedView === "board") setViewModeState(savedView);
    const savedSort = localStorage.getItem("inbox-sort-mode") as SortMode | null;
    if (savedSort) setSortMode(savedSort);
    const savedGroup = localStorage.getItem("inbox-board-group") as "class" | "date" | null;
    if (savedGroup) setBoardGroupBy(savedGroup);
    hydratedRef.current = true;
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
    () => filterTasksByDate(tasks, filter),
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

  // viewMode persistence is handled inline by the setViewMode callback
  // above — the previous standalone effect ran during hydration and
  // overwrote the saved value with the default "list" before the
  // hydrate effect's setState committed. Don't put it back.

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

  // Close view switcher dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (viewToggleRef.current && !viewToggleRef.current.contains(e.target as Node)) {
        setShowViewDropdown(false);
      }
    }
    if (showViewDropdown) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showViewDropdown]);


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
      {/* Height cancels exactly the negative top margin, so the page fills
          <main> without overflowing it. Overflowing by even a few pixels gives
          <main> its own scrollbar, which scrolls the whole two-pane layout —
          including the right detail panel — instead of just the task list.
          The task list below owns the only scroll area on this page. */}
      <div className="flex flex-row -m-4 md:-m-10 h-[calc(100%+1rem)] md:h-[calc(100%+2.5rem)] overflow-hidden">
        {/* Left column — filter bar, tabs row, and task list. */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
        {/* Filter + actions bar — Inbox dropdown left, action buttons
            right. Renders for both List and Board views. The dropdown
            picks the date filter (Inbox / Today / Next 7 days) and
            broadcasts changes to the sidebar via the existing custom
            event. */}
        {(() => {
          const ActiveIcon = (FILTER_OPTIONS.find((o) => o.key === filter) ?? FILTER_OPTIONS[0]).icon;
          const activeLabel = (FILTER_OPTIONS.find((o) => o.key === filter) ?? FILTER_OPTIONS[0]).label;
          return (
            <div className="pl-4 pr-3 pt-4 pb-2 md:pl-8 md:pr-6 md:pt-5 md:pb-2 flex items-center justify-between">
              <div className="relative" ref={filterRef}>
                <button
                  type="button"
                  onClick={() => setShowFilterDropdown((v) => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 -ml-2 rounded-lg hover:bg-foreground/[0.05] transition-colors"
                >
                  <ActiveIcon size={18} className="text-foreground" />
                  <span className="text-lg font-bold text-foreground tracking-tight">
                    {activeLabel}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-foreground transition-transform ${showFilterDropdown ? "rotate-180" : ""}`}
                  />
                </button>
                {showFilterDropdown && (
                  <div
                    ref={filterDropdownRef}
                    className="absolute top-full left-0 mt-1 z-50 rounded-xl shadow-2xl border border-border overflow-hidden min-w-[180px] bg-popover"
                  >
                    {FILTER_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isActive = opt.key === filter;
                      return (
                        <button
                          key={opt.key}
                          onClick={() => {
                            setFilter(opt.key);
                            setShowFilterDropdown(false);
                          }}
                          className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${
                            isActive ? "bg-foreground/[0.06] font-semibold" : "hover:bg-foreground/[0.04]"
                          }`}
                        >
                          <Icon size={14} className="text-foreground" />
                          <span className="text-foreground">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                {/* View switcher (List / Board) — icon-only, opens a dropdown.
                    Lives here with the other toolbar icons instead of a labeled
                    pill below the header. */}
                <div className="relative" ref={viewToggleRef}>
                  <button
                    type="button"
                    onClick={() => setShowViewDropdown((v) => !v)}
                    className="p-1.5 text-foreground hover:bg-foreground/[0.05] rounded-lg transition-colors"
                    title={viewMode === "list" ? "List view" : "Board view"}
                    aria-label="Switch view"
                  >
                    {viewMode === "list" ? <List size={18} /> : <LayoutGrid size={18} />}
                  </button>
                  {showViewDropdown && (
                    <div className="absolute top-full right-0 mt-1 z-50 rounded-xl shadow-2xl border border-border overflow-hidden min-w-[150px] bg-popover">
                      {([
                        { key: "list" as const, label: "List", Icon: List },
                        { key: "board" as const, label: "Board", Icon: LayoutGrid },
                      ]).map((opt) => {
                        const isActive = opt.key === viewMode;
                        return (
                          <button
                            key={opt.key}
                            onClick={() => {
                              trackEvent("view_mode_changed", { mode: opt.key });
                              setViewMode(opt.key);
                              setShowViewDropdown(false);
                            }}
                            className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${
                              isActive ? "bg-foreground/[0.06] font-semibold" : "hover:bg-foreground/[0.04]"
                            }`}
                          >
                            <opt.Icon size={14} className="text-foreground" />
                            <span className="text-foreground">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <button
                  id="tour-add-task"
                  onClick={() => setShowAddModal(true)}
                  className="p-1.5 text-foreground hover:bg-foreground/[0.05] rounded-lg transition-colors"
                  title="Add task"
                >
                  <Plus size={18} />
                </button>
                <div className="relative">
                  <button
                    ref={sortMenuRef}
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="p-1.5 text-foreground hover:bg-foreground/[0.05] rounded-lg transition-colors"
                    title={viewMode === "list" ? "Sort tasks" : "Group by"}
                  >
                    <ArrowUpDown size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Sort / view dropdowns — portaled, anchored to the action
            buttons in the filter bar above. */}
        {showSortMenu && sortMenuRef.current && createPortal(
          <div
            ref={sortMenuDropdownRef}
            className="fixed z-[9999] rounded-xl shadow-2xl border border-border overflow-hidden min-w-[120px] bg-popover"
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
                    className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${currentValue === "date" ? "bg-foreground/[0.06] font-semibold" : "hover:bg-foreground/[0.04]"}`}
                  >
                    <CalendarDays size={14} />
                    Date
                  </button>
                  <button
                    onClick={() => { trackEvent("sort_mode_changed", { sort: "class" }); setValue("class"); setShowSortMenu(false); }}
                    className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${currentValue === "class" ? "bg-foreground/[0.06] font-semibold" : "hover:bg-foreground/[0.04]"}`}
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

        {showViewMenu && viewMenuRef.current && createPortal(
          <div
            ref={viewMenuDropdownRef}
            className="fixed z-[9999] rounded-xl shadow-2xl border border-border overflow-hidden min-w-[140px] bg-popover"
            style={{
              top: viewMenuRef.current.getBoundingClientRect().bottom + 4,
              right: window.innerWidth - viewMenuRef.current.getBoundingClientRect().right,
            }}
          >
            <button
              onClick={() => { setShowViewMenu(false); handleSyncClick(); }}
              disabled={syncing}
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-foreground hover:bg-foreground/[0.04] transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing..." : "Sync"}
            </button>
          </div>,
          document.body
        )}

        {/* Task list area — fills the rest of the left column. */}
          <TaskCreateModal
            open={showAddModal}
            onClose={() => { setShowAddModal(false); setAddModalCourseName(null); }}
            onAdd={(task) => { addTask(task); setShowAddModal(false); setAddModalCourseName(null); }}
            defaultCourseName={addModalCourseName}
          />

          <div
            id="tour-task-list"
            className={`flex-1 min-h-0 overflow-y-auto animate-stagger stagger-2 ${
              viewMode === "list"
                ? "pl-4 md:pl-8 pr-4 md:pr-6"
                : "pl-4 md:pl-8 pr-4 md:pr-8"
            }`}
          >
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
                  onSelect={handleTaskSelect}
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
                      await deleteTask(t.id, { silent: true });
                    }
                    if (matching.length > 0) {
                      showToast(
                        matching.length === 1
                          ? "Task deleted"
                          : `${matching.length} tasks deleted`
                      );
                    }
                  }}
                  onAddTaskToClass={(courseName) => {
                    setAddModalCourseName(courseName);
                    setShowAddModal(true);
                  }}
                  pendingInvites={pendingInvites}
                  onRespondInvite={handleRespondInvite}
                  onAcceptAllInvites={handleAcceptAllInvites}
                  onDeselect={() => setSelectedTask(null)}
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
                      await deleteTask(t.id, { silent: true });
                    }
                    if (matching.length > 0) {
                      showToast(
                        matching.length === 1
                          ? "Task deleted"
                          : `${matching.length} tasks deleted`
                      );
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right: edge-to-edge detail panel — extends from the very
            top of the page to the bottom, parallel to the left column
            (filter bar + tabs + task list). List view only. Clicking
            the panel's empty placeholder area deselects, mirroring the
            left task-list behavior. */}
        {viewMode === "list" && (
            <div
              className="hidden md:flex w-[50%] shrink-0 border-l border-border h-full"
              onClick={(e) => {
                // Deselect only when the click lands on the wrapper itself,
                // i.e. the empty area beside or below the panel. Treating any
                // bubbled click as "clicked off" meant clicking the task's own
                // title, dates or description closed the very task you were
                // reading, since none of those are inputs or buttons.
                if (e.target !== e.currentTarget) return;
                setSelectedTask(null);
              }}
            >
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
                        Canvas
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
