"use client";

import { createContext, useContext, useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef, type ReactNode } from "react";
import { Undo2, Eye, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/contexts/ToastContext";

import type { Task, TaskInsert, TaskUpdate, SyncResult } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";
import { computeNextDueDate, shouldSpawnNext } from "@/lib/repeat";

import { showNewAssignmentsModal } from "@/components/ui/NewAssignmentsModal";
import { readSyncStream } from "@/lib/gcal/read-sync-stream";
import { playTaskComplete } from "@/lib/sounds";

/** localStorage key and version for stale-while-revalidate task caching. */
const CACHE_KEY = "caltodo_tasks_cache";
const CACHE_VERSION = 1;

interface CachedTasks {
  version: number;
  tasks: Task[];
  timestamp: number;
}

/**
 * Reads cached tasks from localStorage.
 * Returns null if cache is missing, corrupt, or version-mismatched.
 */
function getCachedTasks(): Task[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CachedTasks = JSON.parse(raw);
    if (parsed.version !== CACHE_VERSION) return null;
    return parsed.tasks;
  } catch {
    return null;
  }
}

/**
 * Writes tasks to localStorage cache.
 * Silently fails if localStorage is full or unavailable.
 */
function setCachedTasks(tasks: Task[]): void {
  if (typeof window === "undefined") return;
  try {
    const cache: CachedTasks = {
      version: CACHE_VERSION,
      tasks,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (err) {
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      console.warn("[TaskContext] localStorage quota exceeded — task cache not persisted");
    }
  }
}

/** Clears the localStorage task cache. */
function clearCachedTasks(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // non-critical
  }
}

/** How often auto-sync runs in milliseconds (30 minutes). */
const AUTO_SYNC_INTERVAL_MS = 30 * 60 * 1000;

/** Minimum time between auto-syncs to avoid rapid re-triggers (10 minutes). */
const AUTO_SYNC_COOLDOWN_MS = 10 * 60 * 1000;

/**
 * localStorage key for the last auto-sync timestamp. Persisting this across
 * page loads prevents a fresh full sync every time the app mounts (which
 * would otherwise hammer the sync API on every navigation/reload).
 */
const LAST_AUTO_SYNC_KEY = "caltodo_last_auto_sync_at";

/**
 * Reads the last auto-sync timestamp from localStorage.
 *
 * @returns Epoch ms of the last sync, or 0 if none / unavailable.
 */
function readLastAutoSync(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(LAST_AUTO_SYNC_KEY);
    if (!raw) return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

/**
 * Writes the last auto-sync timestamp to localStorage.
 */
function writeLastAutoSync(now: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_AUTO_SYNC_KEY, String(now));
  } catch {
    // Non-critical (quota, private mode, etc.)
  }
}

interface TaskContextValue {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  syncing: boolean;
  lastSyncedAt: string | null;
  syncResult: SyncResult | null;
  /** Distinct user-assigned tag names (excludes course names). */
  availableTags: string[];
  /** Distinct non-null course_name values from all tasks. */
  availableCourses: string[];
  /** Maps each course_name to its dominant task color. */
  courseColors: Map<string, string>;
  addTask: (data: TaskInsert) => Promise<void>;
  updateTask: (id: string, updates: TaskUpdate) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  deleteTasksBySource: (source: "canvas" | "gradescope" | "pensieve" | "syllabus") => Promise<void>;
  /** Deletes all syllabus tasks for a specific course_name. */
  deleteSyllabusTasksByCourse: (courseName: string) => Promise<void>;
  /** Bulk-imports syllabus-extracted assignments as tasks. */
  importSyllabusTasks: (tasks: Array<{
    title: string;
    description?: string | null;
    due_date?: string | null;
    due_time?: string | null;
    course_name?: string | null;
    points_possible?: number | null;
  }>, color?: string) => Promise<void>;
  /** Deletes all Canvas tasks whose external_id starts with the given prefix. */
  deleteTasksByExternalIdPrefix: (prefix: string) => Promise<void>;
  /** Deletes all tasks matching any of the given course names. Returns count deleted. */
  deleteTasksByCourseNames: (courseNames: string[]) => Promise<number>;
  /** Soft-hides tasks by setting dismissed_at for given course names. Returns count hidden. */
  dismissTasksByCourseNames: (courseNames: string[]) => Promise<number>;
  /** Un-hides tasks by clearing dismissed_at for given course names. Returns count restored. */
  undismissTasksByCourseNames: (courseNames: string[]) => Promise<number>;
  deleteAllTasks: () => Promise<void>;
  snoozeTask: (id: string, hours: number) => Promise<void>;
  unsnoozeTask: (id: string) => Promise<void>;
  reorderTasks: (updates: Array<{ id: string; sort_order: number }>) => Promise<void>;
  triggerSync: (courseOverrides?: { canvas_courses?: Array<{ id: number; name: string }>; gradescope_courses?: Array<{ id: string; name: string }> }, platforms?: Array<"canvas" | "gradescope" | "pensieve">) => Promise<void>;
  fetchTasks: () => Promise<Task[]>;
  /**
   * Merges duplicate assignments into a single survivor task.
   * Appends each duplicate's source link to the survivor's description and
   * dismisses the duplicates so the sync engine won't resurrect them.
   */
  mergeDuplicates: (survivorId: string, duplicateIds: string[]) => Promise<void>;
}

const TaskContext = createContext<TaskContextValue | null>(null);

/**
 * Global task state provider using stale-while-revalidate pattern:
 * 1. On mount: hydrate from localStorage cache (avoids loading spinner)
 * 2. Fetch fresh data from Supabase in background
 * 3. Update state + cache on every successful fetch or mutation
 *
 * Cache hydration happens in useEffect to avoid SSR/client hydration mismatch.
 */
export function TaskProvider({ children }: { children: ReactNode }) {
  const { showToast, updateToastProgress } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const hasCacheRef = useRef(false);
  const supabase = createClient();

  // Hydrate from localStorage before first paint (useLayoutEffect runs synchronously
  // after DOM mutations but before the browser paints, eliminating the loading flash)
  useLayoutEffect(() => {
    const cached = getCachedTasks();
    if (cached) {
      setTasks(cached);
      setLoading(false);
      hasCacheRef.current = true;
    }
  }, []);

  /**
   * Ref holding the last successfully fetched task list.
   * Used as a reliable baseline for sync change detection instead of
   * the potentially-stale `tasks` state from React closures.
   */
  const taskBaselineRef = useRef<Task[]>([]);

  /**
   * Whether the initial fetchTasks has completed at least once.
   * Notifications are suppressed until this is true to avoid
   * false "new assignment" alerts on first load.
   */
  const hasInitialFetchRef = useRef(false);

  /**
   * Syncs any tasks with due dates but no google_event_id to Google Calendar.
   * Called after assignment sync completes. Silently skips if GCal is not connected.
   *
   * @param signal - Optional AbortSignal for clean cancellation
   */
  /**
   * Syncs unsynced tasks to GCal silently. Runs in the background without
   * toasts or banners — sync failures are not auth failures and shouldn't
   * prompt the user to reconnect. Only logs warnings on error.
   *
   * @param signal - Optional AbortSignal for clean cancellation
   */
  const syncUnsyncedToGCal = useCallback(async (signal?: AbortSignal) => {
    try {
      // Call initial-sync directly; it returns {synced: 0, reason: ...} fast
      // when GCal is disconnected or there are no unsynced tasks, so the
      // previous /api/gcal/unsynced-count pre-check was redundant — dropping
      // it halves function invocations on every auto-sync.
      const syncRes = await fetch("/api/gcal/initial-sync", { method: "POST", signal });
      const contentType = syncRes.headers.get("Content-Type") ?? "";

      if (contentType.includes("application/json")) {
        const body = await syncRes.json().catch(() => ({}));
        // Surface "needs calendar selection" once per session so users know
        // why their assignments aren't appearing on Google Calendar.
        // "not_connected" is intentional (user disconnected) — stay quiet.
        if (
          body?.needsCalendarSelection &&
          typeof window !== "undefined" &&
          !sessionStorage.getItem("gcal-needs-cal-toast-shown")
        ) {
          sessionStorage.setItem("gcal-needs-cal-toast-shown", "1");
          showToast("Pick a Google Calendar to sync assignments to", {
            duration: 10_000,
            action: {
              label: "Open settings",
              onClick: () => { window.location.href = "/app/settings?section=integrations"; },
            },
          });
        }
        return;
      }

      await readSyncStream(syncRes, {
        onProgress: () => {},
        onDone: () => {},
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.warn("Post-sync GCal sync failed:", err);
    }
  }, [showToast]);

  const fetchTasks = useCallback(async (): Promise<Task[]> => {
    // Only show loading spinner if we have no cached data
    if (!hasCacheRef.current) {
      setLoading(true);
    }
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }

    const { data, error: fetchError } = await supabase
      .from("tasks")
      .select("*")
      .is("dismissed_at", null)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return [];
    }

    const freshTasks = (data ?? []) as Task[];

    // Merge fresh server data with local state to avoid clobbering user
    // changes that happened mid-fetch. If a local task has a newer
    // updated_at than the fresh row, the local one wins — this is the
    // race that caused completions to bounce back when the user toggled
    // a task while /api/assignments/sync's follow-up fetchTasks() was
    // already in flight (its query snapshot was taken before the user
    // click landed in the DB). Optimistic temp- rows that don't yet
    // exist on the server are also preserved.
    const mergedTasks: Task[] = (() => {
      const prev = taskBaselineRef.current;
      if (!prev || prev.length === 0) return freshTasks;
      const freshIds = new Set(freshTasks.map((t) => t.id));
      const ts = (iso: string | null | undefined) => (iso ? new Date(iso).getTime() : 0);
      const reconciled = freshTasks.map((fresh) => {
        const local = prev.find((t) => t.id === fresh.id);
        if (!local) return fresh;
        return ts(local.updated_at) > ts(fresh.updated_at) ? local : fresh;
      });
      const tempLocals = prev.filter((t) => t.id.startsWith("temp-") && !freshIds.has(t.id));
      return [...tempLocals, ...reconciled];
    })();

    setTasks(mergedTasks);
    setCachedTasks(mergedTasks);
    taskBaselineRef.current = mergedTasks;
    hasInitialFetchRef.current = true;
    setLoading(false);
    return mergedTasks;
  }, []);

  const fetchLastSynced = useCallback(async () => {
    try {
      const res = await fetch("/api/credentials");
      if (res.ok) {
        const creds = await res.json();
        setLastSyncedAt(creds.last_synced_at);
      }
    } catch {
      // Non-critical, silently ignore
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchLastSynced();
  }, [fetchTasks, fetchLastSynced]);

  // Auto-sync: runs on initial load (if stale) and every 5 minutes.
  // Uses AbortController to cleanly cancel in-flight requests on unmount/re-render.
  // Suppresses notifications on first sync to avoid false positives from empty baseline.
  const lastAutoSyncRef = useRef<number>(readLastAutoSync());
  const autoSyncAbortRef = useRef<AbortController | null>(null);
  const isFirstAutoSyncRef = useRef(true);

  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();
    autoSyncAbortRef.current = abortController;

    /**
     * Runs sync silently if enough time has passed since the last sync.
     * Skips change detection on the first sync after mount.
     */
    async function autoSync() {
      // Skip when tab is not visible to save server CPU on idle/background tabs.
      if (typeof document !== "undefined" && document.hidden) return;
      const now = Date.now();
      if (syncing || now - lastAutoSyncRef.current < AUTO_SYNC_COOLDOWN_MS) return;
      lastAutoSyncRef.current = now;
      writeLastAutoSync(now);

      const shouldNotify = !isFirstAutoSyncRef.current && hasInitialFetchRef.current;
      isFirstAutoSyncRef.current = false;

      try {
        const res = await fetch("/api/assignments/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
          signal: abortController.signal,
        });
        if (!mounted || abortController.signal.aborted) return;
        if (res.ok) {
          const result: SyncResult = await res.json();
          if (!mounted || abortController.signal.aborted) return;
          setSyncResult(result);
          setLastSyncedAt(result.last_synced_at);

          const freshTasks = await fetchTasks();
          if (!mounted || abortController.signal.aborted) return;

          // Show a toast popup when new assignments are discovered
          if (shouldNotify) {
            const beforeIds = new Set(taskBaselineRef.current.map((t) => t.id));
            const newAssignments = freshTasks.filter((t) => !beforeIds.has(t.id) && t.source);
            if (newAssignments.length > 0) {
              const ids = newAssignments.map((t) => t.id);
              const msg = newAssignments.length === 1
                ? "1 new assignment found"
                : `${newAssignments.length} new assignments found`;
              showToast(msg, {
                action: {
                  label: "View now",
                  icon: <Eye size={14} />,
                  onClick: () => showNewAssignmentsModal(ids),
                },
              });
            }
          }

          // Prompt user about new unselected Canvas courses (one-time per course, stored on account)
          if (result.new_canvas_courses && result.new_canvas_courses.length > 0) {
            // Fetch dismissed course IDs from credentials
            let dismissedIds: number[] = [];
            try {
              const credCheck = await fetch("/api/credentials");
              if (credCheck.ok) {
                const credJson = await credCheck.json();
                dismissedIds = credJson.dismissed_canvas_course_ids || [];
              }
            } catch { /* continue */ }
            const dismissed = new Set(dismissedIds);
            const unprompted = result.new_canvas_courses.filter((c) => !dismissed.has(c.id));

            if (unprompted.length > 0) {
              // Mark as dismissed so we never show again
              const updatedDismissed = [...dismissedIds, ...unprompted.map((c) => c.id)];
              fetch("/api/credentials", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dismissed_canvas_course_ids: updatedDismissed }),
              });

              const names = unprompted.map((c) => c.name.replace(/\s*\(Spring 2026\)\s*/g, "").trim());
              const msg = unprompted.length === 1
                ? `New class detected: ${names[0]}`
                : `${unprompted.length} new classes detected`;
              showToast(msg, {
                action: {
                  label: "Add",
                  icon: <Plus size={14} />,
                  onClick: async () => {
                    try {
                      const credRes = await fetch("/api/credentials");
                      if (!credRes.ok) return;
                      const credData = await credRes.json();
                      const current = credData.selected_canvas_courses || [];
                      const updated = [...current, ...unprompted];
                      await fetch("/api/credentials", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ selected_canvas_courses: updated }),
                      });
                      showToast(`Added ${unprompted.length} class${unprompted.length > 1 ? "es" : ""}. Syncing...`);
                      fetch("/api/assignments/sync", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                          platforms: ["canvas"],
                        }),
                      });
                    } catch {
                      showToast("Failed to add classes. Try again in Settings.");
                    }
                  },
                },
                duration: 600000, // Stay until user acts (10 min max)
              });
            }
          }

          // Sync any newly imported tasks (with due dates) to GCal
          syncUnsyncedToGCal(abortController.signal);
        } else {
          // Even if assignment sync fails, still sync any unsynced tasks to GCal
          syncUnsyncedToGCal(abortController.signal);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Silent failure for auto-sync — still try GCal sync
        syncUnsyncedToGCal(abortController.signal);
      }
    }

    // Auto-sync on mount after a short delay (let initial fetch finish first)
    const mountTimer = setTimeout(() => autoSync(), 3000);

    // Set up periodic auto-sync
    const intervalTimer = setInterval(() => autoSync(), AUTO_SYNC_INTERVAL_MS);

    // Sync when tab becomes visible again (respects the cooldown so it
    // won't fire if the user just synced).
    const onVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden) autoSync();
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibilityChange);
    }

    return () => {
      mounted = false;
      clearTimeout(mountTimer);
      clearInterval(intervalTimer);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncing, fetchTasks, syncUnsyncedToGCal]);

  /**
   * Adds a task with optimistic UI: immediately shows in the list with a temp ID,
   * then replaces with the real record on Supabase success. Reverts on failure.
   */
  async function addTask(taskData: TaskInsert) {
    if (!userId) {
      setError("Not authenticated. Please sign in again.");
      return;
    }

    // Optimistic: create a temporary task object that appears instantly
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const optimisticTask: Task = {
      id: tempId,
      user_id: userId,
      title: taskData.title,
      description: taskData.description ?? "",
      due_date: taskData.due_date ?? null,
      due_time: taskData.due_time ?? null,
      is_completed: false,
      color: taskData.color ?? "#3B82F6",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source: null,
      external_id: null,
      course_name: taskData.course_name ?? null,
      source_url: null,
      points_possible: null,
      is_submitted: false,
      google_event_id: null,
      dismissed_at: null,
      repeat_interval: taskData.repeat_interval ?? null,
      repeat_unit: taskData.repeat_unit ?? null,
      repeat_end_date: taskData.repeat_end_date ?? null,
      repeat_end_count: taskData.repeat_end_count ?? null,
      late_due_date: null,
      completed_at: null,
      tags: taskData.tags ?? [],
      snoozed_until: null,
      sort_order: null,
      due_date_manually_edited_at: null,
      due_time_manually_edited_at: null,
    };

    setTasks((prev) => {
      const updated = [optimisticTask, ...prev];
      setCachedTasks(updated);
      return updated;
    });
    setError(null);
    trackEvent("task_created");

    // Separate invite emails from task columns before inserting
    const { inviteEmails, ...taskColumns } = taskData;

    // Persist to Supabase and replace temp with real record
    const { data, error: insertError } = await supabase
      .from("tasks")
      .insert({ ...taskColumns, user_id: userId })
      .select()
      .single();

    if (insertError) {
      // Revert: remove the optimistic task
      setTasks((prev) => {
        const reverted = prev.filter((t) => t.id !== tempId);
        setCachedTasks(reverted);
        return reverted;
      });
      setError(insertError.message);
      return;
    }

    if (data) {
      // Replace optimistic task with real DB record
      setTasks((prev) => {
        const updated = prev.map((t) => (t.id === tempId ? data : t));
        setCachedTasks(updated);
        // Keep baseline in sync so detectSyncChanges reflects local state
        taskBaselineRef.current = updated;
        return updated;
      });

      // Fire-and-forget: send invites if any emails were provided
      if (inviteEmails && inviteEmails.length > 0) {
        for (const email of inviteEmails) {
          fetch("/api/tasks/invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskId: data.id, email }),
          }).catch((err) => {
            console.warn("Task invite failed:", err);
          });
        }
      }
    }
  }

  async function updateTask(id: string, updates: TaskUpdate) {
    trackEvent("task_updated");
    // When the user manually edits due_date / due_time on a synced task,
    // stamp the corresponding manual-edit column so sync-engine.ts won't
    // overwrite the change on the next Gradescope/Canvas/etc. sync.
    // See migration 20260409000001 and upsertAssignments() for details.
    const stampedUpdates: TaskUpdate = { ...updates };
    const nowIso = new Date().toISOString();
    // Caller can pre-supply *_manually_edited_at to override the auto-stamp
    // (e.g. an Undo action restoring the previous lock state).
    if (
      Object.prototype.hasOwnProperty.call(updates, "due_date") &&
      !Object.prototype.hasOwnProperty.call(updates, "due_date_manually_edited_at")
    ) {
      stampedUpdates.due_date_manually_edited_at = nowIso;
    }
    if (
      Object.prototype.hasOwnProperty.call(updates, "due_time") &&
      !Object.prototype.hasOwnProperty.call(updates, "due_time_manually_edited_at")
    ) {
      stampedUpdates.due_time_manually_edited_at = nowIso;
    }

    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, ...stampedUpdates, updated_at: new Date().toISOString() } : t
      );
      setCachedTasks(updated);
      // Keep baseline in sync so detectSyncChanges doesn't fire false
      // notifications for user-initiated changes (e.g. manual completion)
      taskBaselineRef.current = updated;
      return updated;
    });

    const { error: updateError } = await supabase
      .from("tasks")
      .update(stampedUpdates)
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      fetchTasks();
    }
  }

  async function toggleComplete(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const willComplete = !task.is_completed;
    if (willComplete) playTaskComplete();
    trackEvent(willComplete ? "task_completed" : "task_uncompleted");
    await updateTask(id, {
      is_completed: willComplete,
      completed_at: willComplete ? new Date().toISOString() : null,
    });

    // Track spawned task info for undo cleanup
    let spawnedNextDueDate: string | null = null;

    // Spawn next occurrence for repeating tasks (with end condition checks)
    if (
      willComplete &&
      task.repeat_interval &&
      task.repeat_unit &&
      task.due_date &&
      !task.source
    ) {
      const nextDueDate = computeNextDueDate(task.due_date, task.repeat_interval, task.repeat_unit);

      if (shouldSpawnNext(nextDueDate, task.repeat_end_date, task.repeat_end_count)) {
        spawnedNextDueDate = nextDueDate;
        // Decrement end count for the spawned task (if count-based end)
        const nextEndCount = task.repeat_end_count ? task.repeat_end_count - 1 : null;

        await addTask({
          title: task.title,
          description: task.description || undefined,
          due_date: nextDueDate,
          due_time: task.due_time,
          color: task.color,
          course_name: task.course_name || undefined,
          tags: task.tags?.length ? task.tags : undefined,
          repeat_interval: task.repeat_interval,
          repeat_unit: task.repeat_unit,
          repeat_end_date: task.repeat_end_date,
          repeat_end_count: nextEndCount,
        });
        trackEvent("repeat_task_spawned");
      }
    }

    if (willComplete) {
      const taskTitle = task.title;
      const nextDate = spawnedNextDueDate;
      showToast("Task completed", {
        action: {
          label: "Undo",
          icon: <Undo2 size={14} />,
          onClick: () => {
            updateTask(id, { is_completed: false, completed_at: null });
            // Clean up spawned repeat task if undo is clicked
            if (nextDate) {
              setTasks((prev) => {
                const spawned = prev.find(
                  (t) =>
                    t.title === taskTitle &&
                    t.due_date === nextDate &&
                    !t.is_completed &&
                    t.id !== id,
                );
                if (!spawned) return prev;
                // Hard-delete spawned task from DB (manual task, no sync concern)
                supabase.from("tasks").delete().eq("id", spawned.id).then(() => {});
                const updated = prev.filter((t) => t.id !== spawned.id);
                setCachedTasks(updated);
                return updated;
              });
            }
          },
        },
      });
    }
  }

  /**
   * Snoozes a task by setting snoozed_until to a future timestamp.
   * Optimistically removes the task from the list immediately.
   *
   * @param id - Task ID to snooze
   * @param hours - Number of hours to hide the task
   */
  async function snoozeTask(id: string, hours: number) {
    const snoozedUntil = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    trackEvent("task_snoozed", { hours });
    await updateTask(id, { snoozed_until: snoozedUntil });
  }

  /**
   * Clears the snooze on a task so it reappears immediately.
   *
   * @param id - Task ID to unsnooze
   */
  async function unsnoozeTask(id: string) {
    await updateTask(id, { snoozed_until: null });
  }

  /**
   * Batch-updates sort_order for multiple tasks to persist manual drag-to-reorder.
   * Optimistically updates local state and cache, then persists to Supabase.
   * On failure, reverts by re-fetching tasks from the server.
   *
   * @param updates - Array of { id, sort_order } pairs to apply
   */
  async function reorderTasks(updates: Array<{ id: string; sort_order: number }>) {
    const orderMap = new Map(updates.map((u) => [u.id, u.sort_order]));

    // Optimistic update
    setTasks((prev) => {
      const updated = prev.map((t) =>
        orderMap.has(t.id) ? { ...t, sort_order: orderMap.get(t.id)! } : t
      );
      setCachedTasks(updated);
      taskBaselineRef.current = updated;
      return updated;
    });

    try {
      await Promise.all(
        updates.map((u) =>
          supabase.from("tasks").update({ sort_order: u.sort_order }).eq("id", u.id)
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("reorderTasks failed, reconciling from server:", message);
      setError(message);
      fetchTasks();
    }
  }

  /**
   * Deletes a task. Synced tasks (with source + external_id) are soft-deleted
   * by setting dismissed_at so the sync engine won't resurrect them.
   * Manual tasks are hard-deleted since they can't be recreated by sync.
   */
  async function deleteTask(id: string) {
    trackEvent("task_deleted");
    const taskToDelete = tasks.find((t) => t.id === id);
    const previousIndex = tasks.findIndex((t) => t.id === id);

    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      setCachedTasks(updated);
      // Keep baseline in sync so detectSyncChanges reflects local state
      taskBaselineRef.current = updated;
      return updated;
    });

    const isSyncedTask = !!(taskToDelete?.source && taskToDelete?.external_id);

    // Show an immediate, optimistic toast with Undo. Synced tasks restore by
    // clearing dismissed_at (the row still exists). Manual tasks are
    // re-inserted with the same id so any other UI references still work —
    // Supabase will accept the same UUID since the original row was deleted.
    if (taskToDelete) {
      showToast("Task deleted", {
        action: {
          label: "Undo",
          icon: <Undo2 size={14} />,
          onClick: async () => {
            // Restore in local state immediately at the original index
            setTasks((prev) => {
              if (prev.some((t) => t.id === taskToDelete.id)) return prev;
              const restored = [...prev];
              const insertAt = Math.min(Math.max(previousIndex, 0), restored.length);
              restored.splice(insertAt, 0, { ...taskToDelete, dismissed_at: null });
              setCachedTasks(restored);
              taskBaselineRef.current = restored;
              return restored;
            });
            if (isSyncedTask) {
              await supabase
                .from("tasks")
                .update({ dismissed_at: null })
                .eq("id", taskToDelete.id);
            } else {
              const { dismissed_at: _ignored, ...row } = taskToDelete;
              const { error: insertError } = await supabase.from("tasks").insert(row);
              if (insertError) {
                setError(insertError.message);
                fetchTasks();
              }
            }
          },
        },
      });
    }

    const { error: deleteError } = isSyncedTask
      ? await supabase
          .from("tasks")
          .update({ dismissed_at: new Date().toISOString() })
          .eq("id", id)
      : await supabase
          .from("tasks")
          .delete()
          .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      fetchTasks();
    }
  }

  /**
   * Merges duplicate assignments into a single survivor task.
   * Appends each duplicate's source link to the survivor's description and
   * dismisses the duplicates so the sync engine won't resurrect them.
   *
   * @param survivorId - ID of the task to keep
   * @param duplicateIds - IDs of tasks to merge into the survivor (will be dismissed)
   */
  async function mergeDuplicates(survivorId: string, duplicateIds: string[]) {
    if (duplicateIds.length === 0) return;
    const survivor = tasks.find((t) => t.id === survivorId);
    if (!survivor) return;

    const dupes = tasks.filter((t) => duplicateIds.includes(t.id) && t.id !== survivorId);
    if (dupes.length === 0) return;

    const links = dupes
      .filter((d) => d.source_url)
      .map((d) => {
        const sourceLabel = d.source ? d.source.charAt(0).toUpperCase() + d.source.slice(1) : "Other";
        return `Also on ${sourceLabel}: ${d.source_url}`;
      });

    if (links.length > 0) {
      const newDesc = [survivor.description, ...links].filter((s) => s && s.length > 0).join("\n\n");
      await updateTask(survivor.id, { description: newDesc });
    }

    for (const d of dupes) {
      await deleteTask(d.id);
    }

    trackEvent("duplicates_merged");
  }

  /**
   * Hard-deletes all tasks from a specific integration source.
   * Permanently removes matching rows from Supabase.
   * Optimistically removes matching tasks from local state; reverts on failure.
   *
   * @param source - The integration source to delete tasks for ("canvas" | "gradescope" | "pensieve")
   */
  async function deleteTasksBySource(source: "canvas" | "gradescope" | "pensieve" | "syllabus") {
    if (!userId) {
      setError("Not authenticated. Please sign in again.");
      return;
    }

    const previousTasks = [...tasks];
    const matchingIds = tasks.filter((t) => t.source === source).map((t) => t.id);
    if (matchingIds.length === 0) return;

    trackEvent("all_tasks_deleted");

    // Optimistic: remove matching tasks from local state
    setTasks((prev) => {
      const updated = prev.filter((t) => t.source !== source);
      setCachedTasks(updated);
      taskBaselineRef.current = updated;
      return updated;
    });

    // Hard-delete from Supabase
    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("user_id", userId)
      .eq("source", source);

    if (deleteError) {
      setError(deleteError.message);
      setTasks(previousTasks);
      setCachedTasks(previousTasks);
      fetchTasks();
    }
  }

  /**
   * Deletes all syllabus tasks matching a specific course_name.
   * Allows users to remove tasks from a single uploaded syllabus
   * without affecting tasks from other syllabus uploads.
   *
   * @param courseName - The course_name to match for deletion
   */
  async function deleteSyllabusTasksByCourse(courseName: string) {
    if (!userId) {
      setError("Not authenticated. Please sign in again.");
      return;
    }

    const previousTasks = [...tasks];
    const matchingIds = tasks.filter(
      (t) => t.source === "syllabus" && t.course_name === courseName
    ).map((t) => t.id);
    if (matchingIds.length === 0) return;

    // Optimistic: remove matching tasks from local state
    setTasks((prev) => {
      const updated = prev.filter(
        (t) => !(t.source === "syllabus" && t.course_name === courseName)
      );
      setCachedTasks(updated);
      taskBaselineRef.current = updated;
      return updated;
    });

    // Hard-delete from Supabase
    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("user_id", userId)
      .eq("source", "syllabus")
      .eq("course_name", courseName);

    if (deleteError) {
      setError(deleteError.message);
      setTasks(previousTasks);
      setCachedTasks(previousTasks);
      fetchTasks();
    }
  }

  /**
   * Deletes all Canvas tasks whose external_id starts with the given prefix.
   * Used for disconnect cleanup of additional Canvas accounts, where external_ids
   * are namespaced as "<account_id>:<assignment_id>".
   *
   * @param prefix - The external_id prefix to match (e.g. "canvas-abc123:")
   */
  async function deleteTasksByExternalIdPrefix(prefix: string) {
    if (!userId) {
      setError("Not authenticated. Please sign in again.");
      return;
    }

    const matchingTasks = tasks.filter(
      (t) => t.source === "canvas" && t.external_id?.startsWith(prefix)
    );
    if (matchingTasks.length === 0) return;

    const matchingIds = new Set(matchingTasks.map((t) => t.id));
    const previousTasks = [...tasks];

    // Optimistic: remove matching tasks from local state
    setTasks((prev) => {
      const updated = prev.filter((t) => !matchingIds.has(t.id));
      setCachedTasks(updated);
      taskBaselineRef.current = updated;
      return updated;
    });

    // Hard-delete from Supabase (these are synced tasks but the account is being removed)
    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("user_id", userId)
      .eq("source", "canvas")
      .like("external_id", `${prefix}%`);

    if (deleteError) {
      setError(deleteError.message);
      setTasks(previousTasks);
      setCachedTasks(previousTasks);
      fetchTasks();
    }
  }

  /**
   * Deletes all tasks whose course_name matches any of the given names.
   * Hard-deletes from Supabase and optimistically removes from local state.
   *
   * @param courseNames - Array of course name strings to match
   * @returns Number of tasks deleted (0 if none matched or on error)
   */
  async function deleteTasksByCourseNames(courseNames: string[]): Promise<number> {
    if (!userId || courseNames.length === 0) return 0;

    const matchingTasks = tasks.filter(
      (t) => t.course_name && courseNames.includes(t.course_name)
    );
    if (matchingTasks.length === 0) return 0;

    const count = matchingTasks.length;
    const matchingIds = new Set(matchingTasks.map((t) => t.id));
    const previousTasks = [...tasks];

    // Optimistic: remove matching tasks from local state
    setTasks((prev) => {
      const updated = prev.filter((t) => !matchingIds.has(t.id));
      setCachedTasks(updated);
      taskBaselineRef.current = updated;
      return updated;
    });

    // Hard-delete from Supabase
    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("user_id", userId)
      .in("course_name", courseNames);

    if (deleteError) {
      setError(deleteError.message);
      setTasks(previousTasks);
      setCachedTasks(previousTasks);
      fetchTasks();
      return 0;
    }

    return count;
  }

  /**
   * Soft-hides tasks by setting dismissed_at for all tasks matching given course names.
   * Optimistically removes from local state; reverts on error.
   *
   * @param courseNames - Array of course name strings to match
   * @returns Number of tasks hidden (0 if none matched or on error)
   */
  async function dismissTasksByCourseNames(courseNames: string[]): Promise<number> {
    if (!userId || courseNames.length === 0) return 0;

    const matchingTasks = tasks.filter(
      (t) => t.course_name && courseNames.includes(t.course_name)
    );
    if (matchingTasks.length === 0) return 0;

    const count = matchingTasks.length;
    const matchingIds = new Set(matchingTasks.map((t) => t.id));
    const previousTasks = [...tasks];

    // Optimistic: remove matching tasks from local state (they're "dismissed")
    setTasks((prev) => {
      const updated = prev.filter((t) => !matchingIds.has(t.id));
      setCachedTasks(updated);
      taskBaselineRef.current = updated;
      return updated;
    });

    const { error: dismissError } = await supabase
      .from("tasks")
      .update({ dismissed_at: new Date().toISOString() })
      .eq("user_id", userId)
      .in("course_name", courseNames)
      .is("dismissed_at", null);

    if (dismissError) {
      setError(dismissError.message);
      setTasks(previousTasks);
      setCachedTasks(previousTasks);
      fetchTasks();
      return 0;
    }

    return count;
  }

  /**
   * Un-hides tasks by clearing dismissed_at for all tasks matching given course names.
   * Re-fetches tasks from Supabase to restore them into local state.
   *
   * @param courseNames - Array of course name strings to match
   * @returns Number of tasks restored (0 if none matched or on error)
   */
  async function undismissTasksByCourseNames(courseNames: string[]): Promise<number> {
    if (!userId || courseNames.length === 0) return 0;

    const { data, error: undismissError } = await supabase
      .from("tasks")
      .update({ dismissed_at: null })
      .eq("user_id", userId)
      .in("course_name", courseNames)
      .not("dismissed_at", "is", null)
      .select("id");

    if (undismissError) {
      setError(undismissError.message);
      return 0;
    }

    const restoredCount = data?.length ?? 0;
    if (restoredCount > 0) {
      await fetchTasks();
    }
    return restoredCount;
  }

  /**
   * Bulk-imports syllabus-extracted assignments as tasks.
   * Generates external_id per task for dedup, upserts to Supabase with source="syllabus".
   *
   * @param syllabusTasks - Array of extracted assignment objects to import
   */
  async function importSyllabusTasks(syllabusTasks: Array<{
    title: string;
    description?: string | null;
    due_date?: string | null;
    due_time?: string | null;
    course_name?: string | null;
    points_possible?: number | null;
  }>, color?: string) {
    if (!userId || syllabusTasks.length === 0) return;

    const rows = syllabusTasks.map((t) => {
      // Generate a deterministic external_id for dedup
      const raw = `${t.title}|${t.due_date ?? ""}`;
      let hash = 0;
      for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
      }
      const externalId = `syllabus-${Math.abs(hash).toString(36)}`;

      return {
        user_id: userId,
        title: t.title,
        description: t.description ?? "",
        due_date: t.due_date ?? null,
        due_time: t.due_time ?? null,
        source: "syllabus" as const,
        external_id: externalId,
        color: color ?? "#8B5CF6",
        course_name: t.course_name ?? null,
        points_possible: t.points_possible ?? null,
        is_completed: false,
        is_submitted: false,
      };
    });

    // Optimistic: add to local state
    const optimisticTasks: Task[] = rows.map((r) => ({
      ...r,
      id: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source_url: null,
      google_event_id: null,
      dismissed_at: null,
      repeat_interval: null,
      repeat_unit: null,
      repeat_end_date: null,
      repeat_end_count: null,
      late_due_date: null,
      completed_at: null,
      tags: [],
      snoozed_until: null,
      sort_order: null,
      due_date_manually_edited_at: null,
      due_time_manually_edited_at: null,
    }));

    setTasks((prev) => {
      const updated = [...optimisticTasks, ...prev];
      setCachedTasks(updated);
      return updated;
    });

    // Upsert to Supabase — conflict on (user_id, source, external_id)
    const { error: upsertError } = await supabase
      .from("tasks")
      .upsert(rows, { onConflict: "user_id,source,external_id" });

    if (upsertError) {
      setError(upsertError.message);
    }

    // Reconcile from server to get real IDs
    await fetchTasks();
  }

  /**
   * Deletes all tasks for the current user.
   * Synced tasks are soft-deleted (dismissed_at set) to prevent sync resurrection.
   * Manual tasks are hard-deleted since they can't reappear.
   * Optimistically clears local state + cache; reverts on failure.
   */
  async function deleteAllTasks() {
    if (!userId) {
      setError("Not authenticated. Please sign in again.");
      return;
    }

    trackEvent("all_tasks_deleted");
    const previousTasks = [...tasks];

    setTasks([]);
    clearCachedTasks();
    taskBaselineRef.current = [];

    // Soft-delete synced tasks, hard-delete manual tasks (in parallel)
    const [softDeleteResult, hardDeleteResult] = await Promise.all([
      supabase
        .from("tasks")
        .update({ dismissed_at: new Date().toISOString() })
        .eq("user_id", userId)
        .not("source", "is", null),
      supabase
        .from("tasks")
        .delete()
        .eq("user_id", userId)
        .is("source", null),
    ]);

    const deleteError = softDeleteResult.error || hardDeleteResult.error;
    if (deleteError) {
      setError(deleteError.message);
      setTasks(previousTasks);
      setCachedTasks(previousTasks);
      fetchTasks();
    }
  }

  /**
   * Triggers a full sync from Canvas + Gradescope, then refreshes tasks.
   * Manages a simulated progress bar during the sync.
   */
  async function triggerSync(courseOverrides?: { canvas_courses?: Array<{ id: number; name: string }>; gradescope_courses?: Array<{ id: string; name: string }> }, platforms?: Array<"canvas" | "gradescope" | "pensieve">) {
    // Abort any in-flight auto-sync to prevent race condition where both
    // auto-sync and manual sync update taskBaselineRef concurrently
    autoSyncAbortRef.current?.abort();
    setSyncing(true);
    setError(null);
    setSyncResult(null);
    showToast("Syncing assignments...", { duration: 60_000, progress: 0 });
    trackEvent("sync_started");

    // Simulate progress: tick up to 90% while fetch is in-flight
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress = Math.min(currentProgress + 5, 90);
      updateToastProgress(currentProgress);
    }, 500);

    try {
      const res = await fetch("/api/assignments/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          ...courseOverrides,
          ...(platforms ? { platforms } : {}),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Sync failed: ${res.status}`);
      }
      const result: SyncResult = await res.json();

      // Complete the progress bar before showing the result toast
      clearInterval(progressInterval);
      updateToastProgress(100);

      setSyncResult(result);
      setLastSyncedAt(result.last_synced_at);
      trackEvent("sync_completed", {
        added: result.canvas.synced + result.gradescope.synced + result.pensieve.synced,
        errors: result.canvas.errors.length + result.gradescope.errors.length + result.pensieve.errors.length,
      });

      // Brief pause so the user sees 100% before the result toast replaces it
      await new Promise((r) => setTimeout(r, 400));

      // Build and show sync result toast globally
      const parts: string[] = [];
      if (result.canvas.synced > 0) parts.push(`${result.canvas.synced} from bCourses`);
      if (result.gradescope.synced > 0) parts.push(`${result.gradescope.synced} from Gradescope`);
      if (result.pensieve.synced > 0) parts.push(`${result.pensieve.synced} from Pensieve`);
      const syncErrors = [...result.canvas.errors, ...result.gradescope.errors, ...result.pensieve.errors];
      let toastMsg = parts.length > 0 ? `Synced ${parts.join(", ")}. All tasks are up to date.` : "All tasks are up to date — no new assignments found.";
      if (syncErrors.length > 0) {
        toastMsg += ` ${syncErrors.map(m => m.replace(/Go to Settings to add them\.?/, "")).join(". ").trim()}`;
      }
      showToast(toastMsg, {
        duration: 8_000,
        action: {
          label: "Inbox",
          onClick: () => { window.location.href = "/app/inbox"; },
        },
      });

      // Refresh tasks list after sync to include new assignments
      await fetchTasks();

      // Sync any newly imported tasks (with due dates) to GCal
      syncUnsyncedToGCal();

      // Notify IntegrationProvider to refresh credentials (updates Classes tab)
      window.dispatchEvent(new CustomEvent("credentials-changed"));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      trackEvent("sync_failed", { error: message });
      setError(message);
      clearInterval(progressInterval);
      showToast(`Sync failed: ${message}`, { duration: 6_000 });
    } finally {
      clearInterval(progressInterval);
      setSyncing(false);
    }
  }

  /**
   * Distinct user-assigned tag names across all tasks (excludes course names).
   * Used to populate the tag picker dropdown.
   */
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>(["bCourses", "Canvas", "Gradescope", "Pensive"]);
    for (const t of tasks) {
      if (t.tags) {
        for (const tag of t.tags) tagSet.add(tag);
      }
    }
    return Array.from(tagSet).sort();
  }, [tasks]);

  /** Distinct non-null course_name values across all tasks, sorted alphabetically. */
  const availableCourses = useMemo(() => {
    const set = new Set<string>();
    for (const t of tasks) {
      if (t.course_name) set.add(t.course_name);
    }
    return Array.from(set).sort();
  }, [tasks]);

  /** Maps each course_name to its most common task color. */
  const courseColors = useMemo(() => {
    const counts = new Map<string, Map<string, number>>();
    for (const t of tasks) {
      if (!t.course_name) continue;
      if (!counts.has(t.course_name)) counts.set(t.course_name, new Map());
      const m = counts.get(t.course_name)!;
      m.set(t.color, (m.get(t.color) || 0) + 1);
    }
    const result = new Map<string, string>();
    for (const [course, m] of counts) {
      let best = "";
      let max = 0;
      for (const [c, n] of m) {
        if (n > max) { max = n; best = c; }
      }
      if (best) result.set(course, best);
    }
    return result;
  }, [tasks]);

  // Keep the latest method implementations in a ref so we can expose
  // stable-identity wrappers to consumers. Without this, the provider's value
  // object would change on every render (method closures are recreated each
  // render), causing every subscriber's memoized effects/callbacks to bust.
  const methodsRef = useRef({
    addTask,
    updateTask,
    toggleComplete,
    deleteTask,
    deleteTasksBySource,
    deleteSyllabusTasksByCourse,
    importSyllabusTasks,
    deleteTasksByExternalIdPrefix,
    deleteTasksByCourseNames,
    dismissTasksByCourseNames,
    undismissTasksByCourseNames,
    deleteAllTasks,
    snoozeTask,
    unsnoozeTask,
    reorderTasks,
    triggerSync,
    fetchTasks,
    mergeDuplicates,
  });
  methodsRef.current = {
    addTask,
    updateTask,
    toggleComplete,
    deleteTask,
    deleteTasksBySource,
    deleteSyllabusTasksByCourse,
    importSyllabusTasks,
    deleteTasksByExternalIdPrefix,
    deleteTasksByCourseNames,
    dismissTasksByCourseNames,
    undismissTasksByCourseNames,
    deleteAllTasks,
    snoozeTask,
    unsnoozeTask,
    reorderTasks,
    triggerSync,
    fetchTasks,
    mergeDuplicates,
  };

  // Stable method wrappers — created once, always call the freshest impl via ref.
  const stableMethods = useMemo(() => ({
    addTask: ((...args) => methodsRef.current.addTask(...args)) as typeof addTask,
    updateTask: ((...args) => methodsRef.current.updateTask(...args)) as typeof updateTask,
    toggleComplete: ((...args) => methodsRef.current.toggleComplete(...args)) as typeof toggleComplete,
    deleteTask: ((...args) => methodsRef.current.deleteTask(...args)) as typeof deleteTask,
    deleteTasksBySource: ((...args) => methodsRef.current.deleteTasksBySource(...args)) as typeof deleteTasksBySource,
    deleteSyllabusTasksByCourse: ((...args) => methodsRef.current.deleteSyllabusTasksByCourse(...args)) as typeof deleteSyllabusTasksByCourse,
    importSyllabusTasks: ((...args) => methodsRef.current.importSyllabusTasks(...args)) as typeof importSyllabusTasks,
    deleteTasksByExternalIdPrefix: ((...args) => methodsRef.current.deleteTasksByExternalIdPrefix(...args)) as typeof deleteTasksByExternalIdPrefix,
    deleteTasksByCourseNames: ((...args) => methodsRef.current.deleteTasksByCourseNames(...args)) as typeof deleteTasksByCourseNames,
    dismissTasksByCourseNames: ((...args) => methodsRef.current.dismissTasksByCourseNames(...args)) as typeof dismissTasksByCourseNames,
    undismissTasksByCourseNames: ((...args) => methodsRef.current.undismissTasksByCourseNames(...args)) as typeof undismissTasksByCourseNames,
    deleteAllTasks: ((...args) => methodsRef.current.deleteAllTasks(...args)) as typeof deleteAllTasks,
    snoozeTask: ((...args) => methodsRef.current.snoozeTask(...args)) as typeof snoozeTask,
    unsnoozeTask: ((...args) => methodsRef.current.unsnoozeTask(...args)) as typeof unsnoozeTask,
    reorderTasks: ((...args) => methodsRef.current.reorderTasks(...args)) as typeof reorderTasks,
    triggerSync: ((...args) => methodsRef.current.triggerSync(...args)) as typeof triggerSync,
    fetchTasks: ((...args) => methodsRef.current.fetchTasks(...args)) as typeof fetchTasks,
    mergeDuplicates: ((...args) => methodsRef.current.mergeDuplicates(...args)) as typeof mergeDuplicates,
  }), []);

  // Memoize the full context value so subscribers only re-render when state
  // actually changes, not on every provider render.
  const contextValue = useMemo(
    () => ({
      tasks,
      loading,
      error,
      syncing,
      lastSyncedAt,
      syncResult,
      availableTags,
      availableCourses,
      courseColors,
      ...stableMethods,
    }),
    [
      tasks,
      loading,
      error,
      syncing,
      lastSyncedAt,
      syncResult,
      availableTags,
      availableCourses,
      courseColors,
      stableMethods,
    ],
  );

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
}

/**
 * Hook to access the shared task context.
 * Must be used within a TaskProvider.
 *
 * @returns TaskContextValue with all tasks, CRUD functions, and sync state
 */
export function useTaskContext() {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return ctx;
}
