"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useNotes } from "@/hooks/useNotes";
import NotesFolderGrid from "./NotesFolderGrid";
import NotesModal from "./NotesModal";
import NoteEditor from "./NoteEditor";
import type { FolderEntry } from "./NotesFolderGrid";
import type { Note, NoteUpdate } from "@/lib/types";

/** LocalStorage key for folder descriptions. */
const FOLDER_DESCRIPTIONS_KEY = "notes_folder_descriptions";

/** Current view state. */
type View = "folders" | "editor";

/**
 * Notes layout with folder grid, notes modal, and full-screen editor.
 * Clicking a folder opens a centered modal with list/grid view.
 * Clicking a note opens the editor full-screen.
 */
export default function NotesLayout() {
  const [view, setView] = useState<View>("folders");
  const [selectedFolder, setSelectedFolder] = useState<FolderEntry | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [gridRefreshKey, setGridRefreshKey] = useState(0);

  const supabase = createClient();

  const { notes, loading, createNote, updateNote, deleteNote } = useNotes(
    selectedFolder?.id ?? null
  );

  /**
   * Opens the notes modal for a folder.
   */
  const handleSelectFolder = useCallback((folder: FolderEntry) => {
    setSelectedFolder(folder);
    setSelectedNote(null);
    setModalOpen(true);
  }, []);

  /**
   * Opens a note in the editor and closes the modal.
   */
  const handleSelectNote = useCallback((note: Note) => {
    setSelectedNote(note);
    setModalOpen(false);
    setView("editor");
  }, []);

  /**
   * Creates a new note, closes the modal, opens the editor.
   */
  const handleCreateNote = useCallback(async () => {
    const newNote = await createNote();
    if (newNote) {
      setSelectedNote(newNote);
      setModalOpen(false);
      setView("editor");
    }
  }, [createNote]);

  /**
   * Updates a note. Keeps selectedNote in sync for the editor.
   */
  const handleUpdateNote = useCallback(
    (id: string, updates: NoteUpdate) => {
      updateNote(id, updates);
      setSelectedNote((prev) =>
        prev && prev.id === id
          ? { ...prev, ...updates, updated_at: new Date().toISOString() }
          : prev
      );
    },
    [updateNote]
  );

  /**
   * Deletes a note and returns to the folder grid.
   */
  const handleDeleteNote = useCallback(
    (id: string) => {
      deleteNote(id);
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setView("folders");
      }
    },
    [deleteNote, selectedNote?.id]
  );

  /**
   * Returns from editor to the notes modal for the same folder.
   */
  const handleBackFromEditor = useCallback(() => {
    setSelectedNote(null);
    setView("folders");
    if (selectedFolder) {
      setModalOpen(true);
    }
  }, [selectedFolder]);

  /**
   * Renames the selected folder. Updates courses + tasks in DB,
   * refreshes the folder grid, and updates the modal title.
   *
   * @param newName - The new folder name
   */
  const handleRenameFolder = useCallback(async (newName: string) => {
    if (!selectedFolder || selectedFolder.id === "general") return;
    const oldName = selectedFolder.label;

    setSelectedFolder((prev) => prev ? { ...prev, label: newName } : prev);

    const { error } = await supabase
      .from("courses")
      .update({ name: newName })
      .eq("id", selectedFolder.id);

    if (error) {
      console.error("Failed to rename folder:", error.message);
      setSelectedFolder((prev) => prev ? { ...prev, label: oldName } : prev);
      return;
    }

    await supabase
      .from("tasks")
      .update({ course_name: newName })
      .eq("course_name", oldName);

    setGridRefreshKey((k) => k + 1);
  }, [selectedFolder, supabase]);

  /**
   * Returns the stored description for a folder from localStorage.
   *
   * @param folderId - The folder ID
   * @returns The folder description or empty string
   */
  function getFolderDescription(folderId: string): string {
    try {
      const saved = localStorage.getItem(FOLDER_DESCRIPTIONS_KEY);
      if (saved) {
        const map = JSON.parse(saved) as Record<string, string>;
        return map[folderId] ?? "";
      }
    } catch { /* ignore */ }
    return "";
  }

  /**
   * Saves a folder description to localStorage.
   *
   * @param folderId - The folder ID
   * @param description - The new description text
   */
  function handleUpdateDescription(folderId: string, description: string) {
    try {
      const saved = localStorage.getItem(FOLDER_DESCRIPTIONS_KEY);
      const map = saved ? JSON.parse(saved) as Record<string, string> : {};
      if (description.trim()) {
        map[folderId] = description.trim();
      } else {
        delete map[folderId];
      }
      localStorage.setItem(FOLDER_DESCRIPTIONS_KEY, JSON.stringify(map));
    } catch { /* ignore quota errors */ }
  }

  if (view === "editor" && selectedNote) {
    return (
      <NoteEditor
        key={selectedNote.id}
        note={selectedNote}
        onUpdate={handleUpdateNote}
        onDelete={handleDeleteNote}
        onBack={handleBackFromEditor}
      />
    );
  }

  return (
    <>
      <NotesFolderGrid
        key={gridRefreshKey}
        onSelectFolder={handleSelectFolder}
      />
      <NotesModal
        open={modalOpen}
        folderId={selectedFolder?.id ?? "general"}
        folderLabel={selectedFolder?.label ?? ""}
        folderDescription={selectedFolder ? getFolderDescription(selectedFolder.id) : ""}
        isGeneral={selectedFolder?.id === "general"}
        notes={notes}
        loading={loading}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        onRenameFolder={handleRenameFolder}
        onUpdateDescription={(desc) => {
          if (selectedFolder) handleUpdateDescription(selectedFolder.id, desc);
        }}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
