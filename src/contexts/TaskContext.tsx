"use client";

import { createContext, useContext, useState, useEffect, useLayoutEffect, useCallback, useRef, type ReactNode } from "react";
import { Undo2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/contexts/ToastContext";
import type { Task, TaskInsert, TaskUpdate, SyncResult } from "@/lib/types";

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

/** How often auto-sync runs in milliseconds (15 minutes). */
const AUTO_SYNC_INTERVAL_MS = 15 * 60 * 1000;

/** Minimum time between auto-syncs to avoid rapid re-triggers (5 minutes). */
const AUTO_SYNC_COOLDOWN_MS = 5 * 60 * 1000;

interface TaskContextValue {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  syncing: boolean;
  syncProgress: number;
  lastSyncedAt: string | null;
  syncResult: SyncResult | null;
  addTask: (data: TaskInsert) => Promise<void>;
  updateTask: (id: string, updates: TaskUpdate) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  deleteAllTasks: () => Promise<void>;
  triggerSync: (courseOverrides?: { canvas_courses?: Array<{ id: number; name: string }>; gradescope_courses?: Array<{ id: string; name: string }> }) => Promise<void>;
  fetchTasks: () => Promise<void>;
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
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  const fetchTasks = useCallback(async () => {
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
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    const freshTasks = data ?? [];
    setTasks(freshTasks);
    setCachedTasks(freshTasks);
    setLoading(false);
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

  // Auto-sync: runs on initial load (if stale) and every 15 minutes
  const lastAutoSyncRef = useRef<number>(0);
  const autoSyncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Runs sync silently if enough time has passed since the last sync.
   * Does not show a progress bar; just refreshes data in the background.
   */
  const autoSync = useCallback(async () => {
    const now = Date.now();
    if (syncing || now - lastAutoSyncRef.current < AUTO_SYNC_COOLDOWN_MS) return;
    lastAutoSyncRef.current = now;
    try {
      const res = await fetch("/api/assignments/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
      });
      if (res.ok) {
        const result: SyncResult = await res.json();
        setLastSyncedAt(result.last_synced_at);
        await fetchTasks();
      }
    } catch {
      // Silent failure for auto-sync — user can still manually sync
    }
  }, [syncing, fetchTasks]);

  useEffect(() => {
    // Auto-sync on mount after a short delay (let initial load finish)
    const mountTimer = setTimeout(() => autoSync(), 3000);

    // Set up periodic auto-sync
    autoSyncTimerRef.current = setInterval(() => autoSync(), AUTO_SYNC_INTERVAL_MS);

    return () => {
      clearTimeout(mountTimer);
      if (autoSyncTimerRef.current) clearInterval(autoSyncTimerRef.current);
    };
  }, [autoSync]);

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
      color: taskData.color ?? "#D1D5DB",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source: null,
      external_id: null,
      course_name: null,
      source_url: null,
      points_possible: null,
      is_submitted: false,
      google_event_id: null,
    };

    setTasks((prev) => {
      const updated = [optimisticTask, ...prev];
      setCachedTasks(updated);
      return updated;
    });
    setError(null);

    // Persist to Supabase and replace temp with real record
    const { data, error: insertError } = await supabase
      .from("tasks")
      .insert({ ...taskData, user_id: userId })
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
        return updated;
      });

      // Fire-and-forget: sync to Google Calendar if task has a due date
      if (data.due_date) {
        fetch("/api/gcal/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create", taskId: data.id }),
        }).catch(() => {});
      }
    }
  }

  async function updateTask(id: string, updates: TaskUpdate) {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
      );
      setCachedTasks(updated);
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
      }).catch(() => {});
    }
  }

  async function toggleComplete(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const willComplete = !task.is_completed;
    await updateTask(id, { is_completed: willComplete });

    if (willComplete) {
      showToast("Task completed", {
        action: {
          label: "Undo",
          icon: <Undo2 size={14} />,
          onClick: () => updateTask(id, { is_completed: false }),
        },
      });
    }
  }

  async function deleteTask(id: string) {
    // Capture task before optimistic removal for GCal cleanup
    const taskToDelete = tasks.find((t) => t.id === id);

    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      setCachedTasks(updated);
      return updated;
    });

    const { error: deleteError } = await supabase
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
      }).catch(() => {});
    }
  }

  /**
   * Deletes all tasks for the current user.
   * Optimistically clears local state + cache, then deletes from DB.
   * Falls back to refetching if the DB delete fails.
   */
  async function deleteAllTasks() {
    if (!userId) {
      setError("Not authenticated. Please sign in again.");
      return;
    }

    const previousTasks = [...tasks];
    setTasks([]);
    clearCachedTasks();

    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      setError(deleteError.message);
      setTasks(previousTasks);
      setCachedTasks(previousTasks);
      fetchTasks();
    }
  }

  /**
   * Starts a simulated progress timer that advances from 0% toward ~90%.
   * Uses exponential slowdown: fast at first, slowing as it approaches 90%.
   */
  function startProgressTimer() {
    setSyncProgress(0);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 90) return prev;
        // Advance quickly at first, slower as it approaches 90
        const remaining = 90 - prev;
        return prev + remaining * 0.06;
      });
    }, 300);
  }

  /** Stops the progress timer and sets progress to 100%, then resets after a brief delay. */
  function stopProgressTimer() {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setSyncProgress(100);
    setTimeout(() => setSyncProgress(0), 1500);
  }

  /**
   * Triggers a full sync from Canvas + Gradescope, then refreshes tasks.
   * Manages a simulated progress bar during the sync.
   */
  async function triggerSync(courseOverrides?: { canvas_courses?: Array<{ id: number; name: string }>; gradescope_courses?: Array<{ id: string; name: string }> }) {
    setSyncing(true);
    setError(null);
    setSyncResult(null);
    startProgressTimer();

    try {
      const res = await fetch("/api/assignments/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          ...courseOverrides,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Sync failed: ${res.status}`);
      }
      const result: SyncResult = await res.json();
      setSyncResult(result);
      setLastSyncedAt(result.last_synced_at);

      // Refresh tasks list after sync to include new assignments
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      stopProgressTimer();
      setSyncing(false);
    }
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        syncing,
        syncProgress,
        lastSyncedAt,
        syncResult,
        addTask,
        updateTask,
        toggleComplete,
        deleteTask,
        deleteAllTasks,
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
