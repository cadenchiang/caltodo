"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Task, TaskInsert, TaskUpdate } from "@/lib/types";

/**
 * Hook for task CRUD operations with optimistic updates.
 * Fetches tasks from Supabase and provides add, update, delete, and toggle functions.
 *
 * @param filter - Optional filter: "today" for today's tasks, or a specific date string
 * @returns Tasks array, loading state, error state, and CRUD functions
 */
export function useTasks(filter?: "today" | { month: number; year: number }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter === "today") {
      const today = new Date().toISOString().split("T")[0];
      query = query.eq("due_date", today);
    } else if (filter && typeof filter === "object" && "month" in filter) {
      const startDate = new Date(filter.year, filter.month, 1)
        .toISOString()
        .split("T")[0];
      const endDate = new Date(filter.year, filter.month + 1, 0)
        .toISOString()
        .split("T")[0];
      query = query.gte("due_date", startDate).lte("due_date", endDate);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setTasks(data ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /**
   * Add a new task.
   *
   * @param taskData - The task fields to insert
   */
  async function addTask(taskData: TaskInsert) {
    const { data, error: insertError } = await supabase
      .from("tasks")
      .insert(taskData)
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (data) {
      setTasks((prev) => [data, ...prev]);
    }
  }

  /**
   * Update an existing task.
   *
   * @param id - The task ID to update
   * @param updates - The fields to update
   */
  async function updateTask(id: string, updates: TaskUpdate) {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t))
    );

    const { error: updateError } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      fetchTasks(); // Revert on error
    }
  }

  /**
   * Toggle the completion status of a task.
   *
   * @param id - The task ID to toggle
   */
  async function toggleComplete(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    await updateTask(id, { is_completed: !task.is_completed });
  }

  /**
   * Delete a task.
   *
   * @param id - The task ID to delete
   */
  async function deleteTask(id: string) {
    // Optimistic removal
    setTasks((prev) => prev.filter((t) => t.id !== id));

    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      fetchTasks(); // Revert on error
    }
  }

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    toggleComplete,
    deleteTask,
    refetch: fetchTasks,
  };
}
