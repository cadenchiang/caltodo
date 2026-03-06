"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useNotes } from "@/hooks/useNotes";
import { useFolderSettings } from "@/hooks/useFolderSettings";
import NotesFolderGrid from "./NotesFolderGrid";
import type { FolderEntry } from "./NotesFolderGrid";
import { extractTextPreview } from "@/lib/notes-utils";
import { useToast } from "@/contexts/ToastContext";
import type { Note, NoteUpdate, Course } from "@/lib/types";

/** Lazy-load heavy components not needed on initial render. */
const NotesModal = lazy(() => import("./NotesModal"));
const NoteEditor = lazy(() => import("./NoteEditor"));

/** Current view state. */
type View = "folders" | "editor";

interface NotesLayoutProps {
  initialCourses: Course[];
  initialNoteCounts: Record<string, number>;
}

/**
 * Notes layout with folder grid, notes modal, and full-screen editor.
 * Clicking a folder opens a centered modal with list/grid view.
 * Clicking a note opens the editor full-screen.
 *
 * @param initialCourses - Server-fetched courses for instant folder grid render
 * @param initialNoteCounts - Server-fetched note counts per folder
 */
export default function NotesLayout({
  initialCourses,
  initialNoteCounts,
}: NotesLayoutProps) {
  const [view, setView] = useState<View>("folders");
  const [selectedFolder, setSelectedFolder] = useState<FolderEntry | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [gridRefreshKey, setGridRefreshKey] = useState(0);
  /** Adjustments to note counts per folder (incremented/decremented on create/delete). */
  const [noteCountAdjustments, setNoteCountAdjustments] = useState<Record<string, number>>({});
  /** Tracks if we're returning from editor to skip entrance animation. */
  const [skipAnimation, setSkipAnimation] = useState(false);

  // skipAnimation is reset when the user opens a folder normally (not from back nav)

  const supabase = createClient();
  const { showToast } = useToast();
  const {
    getFolderSetting,
    updateSetting,
    customColors,
    addCustomColor,
    customImages,
    addCustomImage,
  } = useFolderSettings();

  const { notes, loading, createNote, updateNote, deleteNote, deleteNotes, restoreNotes } = useNotes(
    selectedFolder?.id ?? null
  );

  const handleSelectFolder = useCallback((folder: FolderEntry) => {
    setSkipAnimation(false);
    setSelectedFolder(folder);
    setSelectedNote(null);
    setModalOpen(true);
  }, []);

  const handleSelectNote = useCallback((note: Note) => {
    setSelectedNote(note);
    setModalOpen(false);
    setView("editor");
  }, []);

  const handleCreateNote = useCallback((title?: string) => {
    const { optimistic, persisted } = createNote(title ? { title } : undefined);
    setSelectedNote(optimistic);
    setModalOpen(false);
    setView("editor");

    // Increment note count for the current folder
    const fId = selectedFolder?.id ?? "general";
    setNoteCountAdjustments((prev) => ({ ...prev, [fId]: (prev[fId] ?? 0) + 1 }));
    showToast("Note created", { duration: 2000 });

    // Swap in the real note once persisted so subsequent saves use the real ID
    persisted.then((real) => {
      if (real) {
        setSelectedNote((prev) => (prev?.id === optimistic.id ? real : prev));
      }
    });
  }, [createNote, selectedFolder?.id, showToast]);

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

  const handleDeleteNote = useCallback(
    (id: string) => {
      deleteNote(id);
      const fId = selectedFolder?.id ?? "general";
      setNoteCountAdjustments((prev) => ({ ...prev, [fId]: (prev[fId] ?? 0) - 1 }));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setView("folders");
      }
      showToast("Note deleted", {
        action: {
          label: "Undo",
          onClick: () => {
            restoreNotes([id]);
            setNoteCountAdjustments((prev) => ({ ...prev, [fId]: (prev[fId] ?? 0) + 1 }));
          },
        },
      });
    },
    [deleteNote, restoreNotes, selectedNote?.id, selectedFolder?.id, showToast]
  );

  const handleBackFromEditor = useCallback(() => {
    // Auto-delete empty untitled notes on back
    if (selectedNote) {
      const hasTitle = selectedNote.title.trim().length > 0;
      const hasContent = extractTextPreview(selectedNote.content, 1).length > 0;
      if (!hasTitle && !hasContent) {
        // Hard-delete blank notes — they shouldn't go to Recently Deleted
        const noteId = selectedNote.id;
        const fId = selectedFolder?.id ?? "general";
        setNoteCountAdjustments((prev) => ({ ...prev, [fId]: (prev[fId] ?? 0) - 1 }));
        if (noteId.startsWith("temp-")) {
          // Temp ID hasn't been persisted yet — poll briefly for the real row
          const courseId = selectedNote.course_id;
          setTimeout(async () => {
            const { data } = await supabase
              .from("notes")
              .select("id")
              .eq("title", "")
              .is("course_id", courseId ?? null)
              .order("created_at", { ascending: false })
              .limit(1)
              .single();
            if (data) {
              await supabase.from("notes").delete().eq("id", data.id);
            }
          }, 1500);
        } else {
          supabase.from("notes").delete().eq("id", noteId);
        }
      }
    }
    setSkipAnimation(true);
    setSelectedNote(null);
    setView("folders");
    if (selectedFolder) {
      setModalOpen(true);
    }
  }, [selectedFolder, selectedNote, supabase]);

  /**
   * Renames the selected folder. Updates courses + tasks in DB,
   * refreshes the folder grid, and updates the modal title.
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

  const folderId = selectedFolder?.id ?? "general";
  const folderSettings = getFolderSetting(folderId);

  const showEditor = view === "editor" && selectedNote;

  return (
    <>
      {showEditor && (
        <Suspense fallback={null}>
          <NoteEditor
            key={selectedNote.id}
            note={selectedNote}
            folderLabel={selectedFolder?.label ?? "General"}
            folders={[
              { id: "general", label: "General" },
              ...initialCourses.map((c) => ({ id: c.id, label: c.name })),
            ]}
            currentFolderId={selectedFolder?.id ?? "general"}
            onMoveToFolder={(folderId) => {
              const courseId = folderId === "general" ? null : folderId;
              handleUpdateNote(selectedNote.id, { course_id: courseId });
              const oldFId = selectedFolder?.id ?? "general";
              setNoteCountAdjustments((prev) => ({
                ...prev,
                [oldFId]: (prev[oldFId] ?? 0) - 1,
                [folderId]: (prev[folderId] ?? 0) + 1,
              }));
              const target = initialCourses.find((c) => c.id === folderId);
              setSelectedFolder(target ? { id: target.id, label: target.name } : { id: "general", label: "General" });
              showToast("Note moved", { duration: 2000 });
            }}
            onUpdate={handleUpdateNote}
            onDelete={handleDeleteNote}
            onBack={handleBackFromEditor}
          />
        </Suspense>
      )}
      <div className="h-full" style={{ display: showEditor ? "none" : undefined }}>
        <NotesFolderGrid
          key={gridRefreshKey}
          initialCourses={initialCourses}
          initialNoteCounts={initialNoteCounts}
          onSelectFolder={handleSelectFolder}
          getFolderSetting={getFolderSetting}
          updateSetting={updateSetting}
          skipAnimation={skipAnimation}
          noteCountAdjustments={noteCountAdjustments}
          customColors={customColors}
          onAddCustomColor={addCustomColor}
          customImages={customImages}
          onAddCustomImage={addCustomImage}
        />
        <Suspense fallback={null}>
          <NotesModal
            open={modalOpen}
            folderId={folderId}
            folderLabel={selectedFolder?.label ?? ""}
            folderDescription={folderSettings.description ?? ""}
            folderIcon={folderSettings.icon ?? ""}
            isGeneral={selectedFolder?.id === "general"}
            notes={notes.filter((n) => n.title.trim() || extractTextPreview(n.content, 1))}
            loading={loading}
            onSelectNote={handleSelectNote}
            onCreateNote={handleCreateNote}
            onUpdateNote={updateNote}
            onDeleteNotes={(ids: string[]) => {
              deleteNotes(ids);
              const fId = selectedFolder?.id ?? "general";
              setNoteCountAdjustments((prev) => ({ ...prev, [fId]: (prev[fId] ?? 0) - ids.length }));
              showToast(`${ids.length} ${ids.length === 1 ? "note" : "notes"} deleted`, {
                action: {
                  label: "Undo",
                  onClick: () => {
                    restoreNotes(ids);
                    setNoteCountAdjustments((prev) => ({ ...prev, [fId]: (prev[fId] ?? 0) + ids.length }));
                  },
                },
              });
            }}
            onRenameFolder={handleRenameFolder}
            onUpdateDescription={(desc) => updateSetting(folderId, "description", desc)}
            onUpdateIcon={(icon) => updateSetting(folderId, "icon", icon)}
            onClose={() => setModalOpen(false)}
            skipAnimation={skipAnimation}
          />
        </Suspense>
      </div>
    </>
  );
}
