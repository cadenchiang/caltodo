"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Note, NoteInsert, NoteUpdate } from "@/lib/types";

/**
 * Hook for note CRUD operations with optimistic updates.
 * Fetches notes from Supabase filtered by course folder.
 *
 * @param courseId - Course ID to filter by, or "general" for notes with null course_id
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
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false });

    if (courseId === "general") {
      query = query.is("course_id", null);
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
   *
   * @param overrides - Optional fields to set on creation
   * @returns The created note, or null on error
   */
  async function createNote(overrides?: NoteInsert): Promise<Note | null> {
    const insertData = {
      title: "",
      content: { type: "doc", content: [{ type: "paragraph" }] },
      course_id: courseId === "general" ? null : courseId,
      ...overrides,
    };

    const { data, error: insertError } = await supabase
      .from("notes")
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return null;
    }

    if (data) {
      setNotes((prev) => [data, ...prev]);
    }
    return data;
  }

  /**
   * Update an existing note with optimistic local state.
   *
   * @param id - Note ID to update
   * @param updates - Fields to update
   */
  async function updateNote(id: string, updates: NoteUpdate) {
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
    }
  }

  /**
   * Delete a note with optimistic removal.
   *
   * @param id - Note ID to delete
   */
  async function deleteNote(id: string) {
    // Optimistic removal
    setNotes((prev) => prev.filter((n) => n.id !== id));

    const { error: deleteError } = await supabase
      .from("notes")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      fetchNotes(); // Revert on error
    }
  }

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes,
  };
}
