"use client";

import { createContext, useContext, useState, useEffect, useLayoutEffect, useCallback, useRef, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Task, TaskInsert, TaskUpdate, SyncResult } from "@/lib/types";

/** localStorage key and version for stale-while-revalidate task caching. */
const CACHE_KEY = "toodoo_tasks_cache";
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
  triggerSync: () => Promise<void>;
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

  async function addTask(taskData: TaskInsert) {
    if (!userId) {
      setError("Not authenticated. Please sign in again.");
      return;
    }

    const { data, error: insertError } = await supabase
      .from("tasks")
      .insert({ ...taskData, user_id: userId })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (data) {
      setTasks((prev) => {
        const updated = [data, ...prev];
        setCachedTasks(updated);
        return updated;
      });
      setError(null);
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
    }
  }

  async function toggleComplete(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    await updateTask(id, { is_completed: !task.is_completed });
  }

  async function deleteTask(id: string) {
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
  async function triggerSync() {
    setSyncing(true);
    setError(null);
    setSyncResult(null);
    startProgressTimer();

    try {
      const res = await fetch("/api/assignments/sync", { method: "POST" });
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
