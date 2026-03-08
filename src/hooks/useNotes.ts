"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Note, NoteInsert, NoteUpdate } from "@/lib/types";

/**
 * Hook for note CRUD operations with optimistic updates.
 * Fetches notes from Supabase filtered by course folder.
 *
 * @param courseId - Course ID to filter by, "general" for null course_id, or comma-separated IDs for merged folders
 * @returns Notes array, loading/error state, and CRUD functions
 */
export function useNotes(courseId: string | "general" | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchNotes = useCallback(async () => {
    if (courseId === null) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let query = supabase
      .from("notes")
      .select("*")
      .is("deleted_at", null)
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false });

    if (courseId === "general") {
      query = query.is("course_id", null);
    } else if (courseId.includes(",")) {
      // Merged folder: fetch notes from multiple course IDs
      query = query.in("course_id", courseId.split(","));
    } else {
      query = query.eq("course_id", courseId);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setNotes(data ?? []);
    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  /**
   * Create a new empty note in the current folder.
   * Returns an optimistic note instantly; the real ID is resolved via
   * the returned promise so the caller can swap it in if needed.
   *
   * @param overrides - Optional fields to set on creation
   * @returns Object with optimistic note and a promise resolving to the persisted note
   */
  function createNote(overrides?: NoteInsert): {
    optimistic: Note;
    persisted: Promise<Note | null>;
  } {
    const now = new Date().toISOString();
    const tempId = `temp-${crypto.randomUUID()}`;
    const truncatedTitle = (overrides?.title ?? "").slice(0, 500);
    const optimistic: Note = {
      id: tempId,
      user_id: "",
      course_id: courseId === "general" ? null : (courseId?.includes(",") ? courseId.split(",")[0] : courseId),
      title: truncatedTitle,
      content: overrides?.content ?? { type: "doc", content: [{ type: "paragraph" }] },
      is_pinned: false,
      created_at: now,
      updated_at: now,
      deleted_at: null,
      icon: overrides?.icon ?? null,
    };

    setError(null);
    setNotes((prev) => [optimistic, ...prev]);

    const persisted = (async (): Promise<Note | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated");
        setNotes((prev) => prev.filter((n) => n.id !== tempId));
        return null;
      }

      const insertData = {
        user_id: user.id,
        title: optimistic.title,
        content: optimistic.content,
        course_id: optimistic.course_id,
        ...overrides,
      };

      const { data, error: insertError } = await supabase
        .from("notes")
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        setNotes((prev) => prev.filter((n) => n.id !== tempId));
        return null;
      }

      if (data) {
        setNotes((prev) => prev.map((n) => (n.id === tempId ? data : n)));
      }
      return data;
    })();

    return { optimistic, persisted };
  }

  /**
   * Update an existing note with optimistic local state.
   *
   * @param id - Note ID to update
   * @param updates - Fields to update
   */
  async function updateNote(id: string, updates: NoteUpdate): Promise<boolean> {
    setError(null);
    if (updates.title !== undefined) {
      updates = { ...updates, title: updates.title.slice(0, 500) };
    }
    // Optimistic update
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, ...updates, updated_at: new Date().toISOString() }
          : n
      )
    );

    const { error: updateError } = await supabase
      .from("notes")
      .update(updates)
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      fetchNotes(); // Revert on error
      return false;
    }
    return true;
  }

  /**
   * Soft-delete a note by setting deleted_at timestamp.
   * Optimistically removes from local state.
   *
   * @param id - Note ID to soft-delete
   */
  async function deleteNote(id: string) {
    setError(null);
    // Optimistic removal
    setNotes((prev) => prev.filter((n) => n.id !== id));

    const { error: deleteError } = await supabase
      .from("notes")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      fetchNotes(); // Revert on error
    }
  }

  /**
   * Soft-delete multiple notes by IDs. Optimistically removes all from state.
   *
   * @param ids - Array of note IDs to soft-delete
   */
  async function deleteNotes(ids: string[]) {
    if (ids.length === 0) return;

    setError(null);
    setNotes((prev) => prev.filter((n) => !ids.includes(n.id)));

    const { error: deleteError } = await supabase
      .from("notes")
      .update({ deleted_at: new Date().toISOString() })
      .in("id", ids);

    if (deleteError) {
      setError(deleteError.message);
      fetchNotes();
    }
  }

  /**
   * Restore soft-deleted notes by clearing their deleted_at timestamp.
   * Refreshes local state after restore.
   *
   * @param ids - Array of note IDs to restore
   */
  async function restoreNotes(ids: string[]) {
    if (ids.length === 0) return;

    setError(null);
    const { error: restoreError } = await supabase
      .from("notes")
      .update({ deleted_at: null })
      .in("id", ids);

    if (restoreError) {
      setError(restoreError.message);
      console.error("Failed to restore notes:", restoreError.message);
    }

    fetchNotes();
  }

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    deleteNotes,
    restoreNotes,
    refetch: fetchNotes,
  };
}
