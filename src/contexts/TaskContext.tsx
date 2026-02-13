"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Task, TaskInsert, TaskUpdate, SyncResult } from "@/lib/types";

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
  triggerSync: () => Promise<void>;
  fetchTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextValue | null>(null);

/**
 * Global task state provider. Fetches all tasks (manual + synced assignments)
 * once and shares them across all views so tab switching is instant.
 * Also manages sync state for Canvas/Gradescope integration.
 * Retrieves user_id from auth session to satisfy RLS policies on insert.
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
  const supabase = createClient();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
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

    setTasks(data ?? []);
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
      setTasks((prev) => [data, ...prev]);
      setError(null);
    }
  }

  async function updateTask(id: string, updates: TaskUpdate) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
      )
    );

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
    setTasks((prev) => prev.filter((t) => t.id !== id));

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
