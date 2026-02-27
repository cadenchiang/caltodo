"use client";

import { createContext, useContext, useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef, type ReactNode } from "react";
import { Undo2, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/contexts/ToastContext";
import { useNotifications } from "@/contexts/NotificationContext";
import type { Task, TaskInsert, TaskUpdate, SyncResult } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";
import { computeNextDueDate, shouldSpawnNext } from "@/lib/repeat";
import { createTaskSnapshot, detectSyncChanges } from "@/lib/notification-helpers";

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
  } catch {
    // localStorage full or unavailable — non-critical
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

/** How often auto-sync runs in milliseconds (5 minutes). */
const AUTO_SYNC_INTERVAL_MS = 5 * 60 * 1000;

/** Minimum time between auto-syncs to avoid rapid re-triggers (2 minutes). */
const AUTO_SYNC_COOLDOWN_MS = 2 * 60 * 1000;

interface TaskContextValue {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  syncing: boolean;
  lastSyncedAt: string | null;
  syncResult: SyncResult | null;
  /** Distinct course/tag names available for tagging, derived from all tasks. */
  availableTags: string[];
  addTask: (data: TaskInsert) => Promise<void>;
  updateTask: (id: string, updates: TaskUpdate) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  deleteTasksBySource: (source: "canvas" | "gradescope" | "pensieve") => Promise<void>;
  /** Deletes all Canvas tasks whose external_id starts with the given prefix. */
  deleteTasksByExternalIdPrefix: (prefix: string) => Promise<void>;
  /** Deletes all tasks matching any of the given course names. Returns count deleted. */
  deleteTasksByCourseNames: (courseNames: string[]) => Promise<number>;
  deleteAllTasks: () => Promise<void>;
  snoozeTask: (id: string, hours: number) => Promise<void>;
  unsnoozeTask: (id: string) => Promise<void>;
  reorderTasks: (updates: Array<{ id: string; sort_order: number }>) => Promise<void>;
  triggerSync: (courseOverrides?: { canvas_courses?: Array<{ id: number; name: string }>; gradescope_courses?: Array<{ id: string; name: string }> }, platforms?: Array<"canvas" | "gradescope" | "pensieve">) => Promise<void>;
  fetchTasks: () => Promise<Task[]>;
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
  const { addNotification } = useNotifications();
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

    const freshTasks = data ?? [];
    setTasks(freshTasks);
    setCachedTasks(freshTasks);
    taskBaselineRef.current = freshTasks;
    hasInitialFetchRef.current = true;
    setLoading(false);
    return freshTasks;
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
  const lastAutoSyncRef = useRef<number>(0);
  const autoSyncAbortRef = useRef<AbortController | null>(null);
  const isFirstAutoSyncRef = useRef(true);

  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();
    autoSyncAbortRef.current = abortController;

    /**
     * Runs sync silently if enough time has passed since the last sync.
     * Uses taskBaselineRef for a reliable snapshot instead of the stale
     * `tasks` state from the closure. Skips notification generation on
     * the first sync after mount (baseline is unreliable at that point).
     */
    async function autoSync() {
      const now = Date.now();
      if (syncing || now - lastAutoSyncRef.current < AUTO_SYNC_COOLDOWN_MS) return;
      lastAutoSyncRef.current = now;

      const shouldNotify = !isFirstAutoSyncRef.current && hasInitialFetchRef.current;
      isFirstAutoSyncRef.current = false;

      try {
        const snapshot = shouldNotify
          ? createTaskSnapshot(taskBaselineRef.current)
          : null;

        const res = await fetch("/api/assignments/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
          signal: abortController.signal,
        });
        if (!mounted) return;
        if (res.ok) {
          const result: SyncResult = await res.json();
          if (!mounted) return;
          setSyncResult(result);
          setLastSyncedAt(result.last_synced_at);

          const freshTasks = await fetchTasks();
          if (!mounted) return;

          // Only emit notifications after the first sync establishes a reliable baseline
          if (snapshot) {
            const changes = detectSyncChanges(snapshot, freshTasks);
            for (const change of changes) {
              addNotification(change.type, change.title, change.description, change.taskId);
            }

            // Show a toast popup when new assignments are discovered
            const newAssignments = changes.filter((c) => c.type === "new_assignment");
            if (newAssignments.length > 0) {
              const msg = newAssignments.length === 1
                ? "1 new assignment found"
                : `${newAssignments.length} new assignments found`;
              showToast(msg, {
                action: {
                  label: "Sync now",
                  icon: <RefreshCw size={14} />,
                  onClick: () => triggerSync(),
                },
              });
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Silent failure for auto-sync — user can still manually sync
      }
    }

    // Auto-sync on mount after a short delay (let initial fetch finish first)
    const mountTimer = setTimeout(() => autoSync(), 3000);

    // Set up periodic auto-sync
    const intervalTimer = setInterval(() => autoSync(), AUTO_SYNC_INTERVAL_MS);

    return () => {
      mounted = false;
      clearTimeout(mountTimer);
      clearInterval(intervalTimer);
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncing, fetchTasks, addNotification]);

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

      // Fire-and-forget: sync to Google Calendar if task has a due date
      if (data.due_date) {
        fetch("/api/gcal/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create", taskId: data.id }),
        }).catch((err) => {
          console.warn("GCal sync (create) failed:", err);
        });
      }

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
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
      );
      setCachedTasks(updated);
      // Keep baseline in sync so detectSyncChanges doesn't fire false
      // notifications for user-initiated changes (e.g. manual completion)
      taskBaselineRef.current = updated;
      return updated;
    });

    const { error: updateError } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      fetchTasks();
    } else {
      // Fire-and-forget: sync update to Google Calendar
      fetch("/api/gcal/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", taskId: id }),
      }).catch((err) => {
        console.warn("GCal sync (update) failed:", err);
      });
    }
  }

  async function toggleComplete(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const willComplete = !task.is_completed;
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
        addNotification(
          "repeat_spawned",
          `Next: ${task.title}`,
          `due ${nextDueDate}`,
        );
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

    // Optimistically update snoozed_until so task moves to Hidden section
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, snoozed_until: snoozedUntil } : t
      );
      setCachedTasks(updated);
      taskBaselineRef.current = updated;
      return updated;
    });

    const { error: snoozeError } = await supabase
      .from("tasks")
      .update({ snoozed_until: snoozedUntil })
      .eq("id", id);

    if (snoozeError) {
      setError(snoozeError.message);
      fetchTasks();
    }
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
    // Capture task before optimistic removal for GCal cleanup
    const taskToDelete = tasks.find((t) => t.id === id);

    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      setCachedTasks(updated);
      // Keep baseline in sync so detectSyncChanges reflects local state
      taskBaselineRef.current = updated;
      return updated;
    });

    const isSyncedTask = taskToDelete?.source && taskToDelete?.external_id;

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
    } else if (taskToDelete?.google_event_id) {
      // Fire-and-forget: delete Google Calendar event
      fetch("/api/gcal/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          taskId: id,
          googleEventId: taskToDelete.google_event_id,
        }),
      }).catch((err) => {
        console.warn("GCal sync (delete) failed:", err);
      });
    }
  }

  /**
   * Hard-deletes all tasks from a specific integration source.
   * Permanently removes matching rows from Supabase.
   * Optimistically removes matching tasks from local state; reverts on failure.
   *
   * @param source - The integration source to delete tasks for ("canvas" | "gradescope" | "pensieve")
   */
  async function deleteTasksBySource(source: "canvas" | "gradescope" | "pensieve") {
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

    const snapshot = createTaskSnapshot(taskBaselineRef.current);

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
      let toastMsg = parts.length > 0 ? `Synced ${parts.join(", ")}.` : "No new assignments found.";
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
      const freshTasks = await fetchTasks();
      const changes = detectSyncChanges(snapshot, freshTasks);
      for (const change of changes) {
        addNotification(change.type, change.title, change.description, change.taskId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      trackEvent("sync_failed", { error: message });
      setError(message);
      // Don't show sync errors in notifications — they're noisy from auto-sync
    } finally {
      clearInterval(progressInterval);
      setSyncing(false);
    }
  }

  /**
   * Distinct tag names derived from course_names and user-assigned tags across all tasks.
   * Used to populate the tag picker dropdown.
   */
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const t of tasks) {
      if (t.course_name) tagSet.add(t.course_name);
      if (t.tags) {
        for (const tag of t.tags) tagSet.add(tag);
      }
    }
    return Array.from(tagSet).sort();
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        syncing,
        lastSyncedAt,
        syncResult,
        availableTags,
        addTask,
        updateTask,
        toggleComplete,
        deleteTask,
        deleteTasksBySource,
        deleteTasksByExternalIdPrefix,
        deleteTasksByCourseNames,
        deleteAllTasks,
        snoozeTask,
        unsnoozeTask,
        reorderTasks,
        triggerSync,
        fetchTasks,
      }}
    >
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
