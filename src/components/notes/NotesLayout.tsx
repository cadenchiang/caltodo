"use client";

import { useState, useCallback, useEffect, useRef, lazy, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useNotes } from "@/hooks/useNotes";
import { useFolderSettings } from "@/hooks/useFolderSettings";
import NotesFolderGrid from "./NotesFolderGrid";
import type { FolderEntry } from "./NotesFolderGrid";
import { extractTextPreview } from "@/lib/notes-utils";
import { useToast } from "@/contexts/ToastContext";
import NotesWelcomeModal from "./NotesWelcomeModal";
import type { Note, NoteUpdate, Course } from "@/lib/types";

/** Lazy-load heavy components not needed on initial render. */
const NotesModal = lazy(() => import("./NotesModal"));
const NoteEditor = lazy(() => import("./NoteEditor"));

/** Current view state. */
type View = "folders" | "editor";

interface NotesLayoutProps {
  initialCourses: Course[];
  initialNoteCounts: Record<string, number>;
  initialRecentNotes: Note[];
  /** Server-fetched note when ?note=ID is in the URL (instant editor on reload). */
  initialNote: Note | null;
  /** Folder ID from URL params. */
  initialNoteFolder: string | null;
}

/**
 * Notes layout with folder grid, notes modal, and full-screen editor.
 * Clicking a folder opens a centered modal with list/grid view.
 * Clicking a note opens the editor full-screen.
 *
 * @param initialCourses - Server-fetched courses for instant folder grid render
 * @param initialNoteCounts - Server-fetched note counts per folder
 */
/** Persist note/folder view to sessionStorage so reload stays on the same page. */
const VIEW_STORAGE_KEY = "notes-view-state";

function saveViewState(state: { view: View; folderId?: string; folderLabel?: string; noteId?: string }) {
  try { sessionStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(state)); } catch { /* noop */ }
  // Sync URL so server can pre-fetch note on reload
  try {
    const url = new URL(window.location.href);
    if (state.view === "editor" && state.noteId) {
      url.searchParams.set("note", state.noteId);
      if (state.folderId) url.searchParams.set("folder", state.folderId);
    } else {
      url.searchParams.delete("note");
      url.searchParams.delete("folder");
    }
    window.history.replaceState(null, "", url.toString());
  } catch { /* noop */ }
}

function loadViewState(): { view: View; folderId?: string; folderLabel?: string; noteId?: string } | null {
  try {
    const raw = sessionStorage.getItem(VIEW_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function clearViewState() {
  try { sessionStorage.removeItem(VIEW_STORAGE_KEY); } catch { /* noop */ }
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete("note");
    url.searchParams.delete("folder");
    window.history.replaceState(null, "", url.toString());
  } catch { /* noop */ }
}

export default function NotesLayout({
  initialCourses,
  initialNoteCounts,
  initialRecentNotes,
  initialNote,
  initialNoteFolder,
}: NotesLayoutProps) {
  // If the server provided a note (via ?note=ID), start in editor mode immediately
  const hasServerNote = !!initialNote;

  // Fallback: read sessionStorage for cases without URL params
  const [savedState] = useState(() => loadViewState());
  const restoringFromSession = !hasServerNote && savedState?.view === "editor" && !!savedState.noteId;

  const [view, setView] = useState<View>(hasServerNote || restoringFromSession ? "editor" : "folders");
  const [selectedFolder, setSelectedFolder] = useState<FolderEntry | null>(() => {
    // Server-provided folder takes priority
    const fId = initialNoteFolder ?? savedState?.folderId;
    if (!fId) return null;
    const course = initialCourses.find((c) => c.id === fId);
    return course ? { id: course.id, label: course.name } : { id: "general", label: "General" };
  });
  const [selectedNote, setSelectedNote] = useState<Note | null>(initialNote);
  const [modalOpen, setModalOpen] = useState(!hasServerNote && !restoringFromSession && !!savedState?.folderId);
  const [gridRefreshKey, setGridRefreshKey] = useState(0);
  const [noteCountAdjustments, setNoteCountAdjustments] = useState<Record<string, number>>({});
  const [skipAnimation, setSkipAnimation] = useState(false);
  /** IDs of notes deleted this session — filtered out of the recent notes list. */
  const [deletedNoteIds, setDeletedNoteIds] = useState<Set<string>>(new Set());
  /** Tracks the real persisted ID of the last note created from home for safe cleanup. */
  const lastCreatedNoteIdRef = useRef<string | null>(null);

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

  const { notes, loading, error, createNote, updateNote, deleteNote, deleteNotes, restoreNotes } = useNotes(
    selectedFolder?.id ?? null
  );

  // Surface useNotes errors via toast
  useEffect(() => {
    if (error) showToast(error);
  }, [error, showToast]);

  /** Fetch the note for editor restore from sessionStorage (skip if server already provided it). */
  useEffect(() => {
    if (hasServerNote || !restoringFromSession || !savedState?.noteId) return;

    supabase
      .from("notes")
      .select("*")
      .eq("id", savedState.noteId)
      .single()
      .then(({ data }) => {
        if (data) {
          setSelectedNote(data);
        } else {
          // Note was deleted — fall back to folder modal
          setView("folders");
          setModalOpen(true);
          clearViewState();
        }
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Creates a new note in "General" from the home page (no folder selected).
   * Does a direct Supabase insert since useNotes may not be scoped to "general".
   */
  const handleCreateNoteFromHome = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date().toISOString();
    const tempId = `temp-${crypto.randomUUID()}`;
    const optimistic: Note = {
      id: tempId,
      user_id: user.id,
      course_id: null,
      title: "",
      content: { type: "doc", content: [{ type: "paragraph" }] },
      is_pinned: false,
      created_at: now,
      updated_at: now,
      deleted_at: null,
      icon: null,
    };

    setSelectedFolder({ id: "general", label: "General" });
    setSelectedNote(optimistic);
    setModalOpen(false);
    setView("editor");
    setNoteCountAdjustments((prev) => ({ ...prev, general: (prev.general ?? 0) + 1 }));
    showToast("Note created", { duration: 2000 });

    const { data } = await supabase
      .from("notes")
      .insert({ user_id: user.id, title: "", content: optimistic.content, course_id: null })
      .select()
      .single();

    if (data) {
      lastCreatedNoteIdRef.current = data.id;
      setSelectedNote((prev) => (prev?.id === tempId ? data : prev));
      saveViewState({ view: "editor", folderId: "general", folderLabel: "General", noteId: data.id });
    }
  }, [supabase, showToast]);

  /**
   * Opens a recent note from the home page in the editor.
   * Sets the selected folder to match the note's folder.
   */
  const handleOpenRecentNote = useCallback((note: Note) => {
    const course = initialCourses.find((c) => c.id === note.course_id);
    const folder = course ? { id: course.id, label: course.name } : { id: "general", label: "General" };
    setSelectedFolder(folder);
    setSelectedNote(note);
    setModalOpen(false);
    setView("editor");
    saveViewState({ view: "editor", folderId: folder.id, folderLabel: folder.label, noteId: note.id });
  }, [initialCourses]);

  const handleSelectFolder = useCallback((folder: FolderEntry) => {
    setSkipAnimation(false);
    setSelectedFolder(folder);
    setSelectedNote(null);
    setModalOpen(true);
    saveViewState({ view: "folders", folderId: folder.id, folderLabel: folder.label });
  }, []);

  const handleSelectNote = useCallback((note: Note) => {
    setSelectedNote(note);
    setModalOpen(false);
    setView("editor");
    saveViewState({ view: "editor", folderId: selectedFolder?.id, folderLabel: selectedFolder?.label, noteId: note.id });
  }, [selectedFolder]);

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
        saveViewState({ view: "editor", folderId: fId, folderLabel: selectedFolder?.label, noteId: real.id });
      }
    });
  }, [createNote, selectedFolder?.id, selectedFolder?.label, showToast]);

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
      setDeletedNoteIds((prev) => new Set(prev).add(id));
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
            setDeletedNoteIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
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
        setDeletedNoteIds((prev) => new Set(prev).add(noteId));
        if (noteId.startsWith("temp-")) {
          // Temp ID hasn't been persisted yet — use the tracked real ID from the ref
          const realId = lastCreatedNoteIdRef.current;
          if (realId) {
            supabase.from("notes").delete().eq("id", realId);
            lastCreatedNoteIdRef.current = null;
          }
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
      saveViewState({ view: "folders", folderId: selectedFolder.id, folderLabel: selectedFolder.label });
    } else {
      clearViewState();
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
      showToast("Couldn't rename folder");
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
  const hideGrid = view === "editor";

  return (
    <>
      <NotesWelcomeModal onCreateNote={handleCreateNoteFromHome} />
      {/* Editor skeleton while note is loading from DB */}
      {view === "editor" && !selectedNote && (
        <div className="fixed top-0 right-0 bottom-0 left-0 md:left-52 z-[35] flex flex-col bg-muted/50 dark:bg-neutral-900/50">
          <div className="shrink-0 bg-background border-b border-border/40 h-[88px]" />
          <div className="flex-1 px-4 md:px-8">
            <div className="max-w-3xl my-6 mx-auto md:-translate-x-[104px]">
              <div className="bg-background rounded-sm shadow-sm border border-border/30 px-8 md:px-14 py-12 min-h-[1056px]" />
            </div>
          </div>
        </div>
      )}
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
            saveError={error}
          />
        </Suspense>
      )}
      <div suppressHydrationWarning className="h-full" style={{ display: hideGrid ? "none" : undefined }}>
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
          onCreateNote={handleCreateNoteFromHome}
          recentNotes={deletedNoteIds.size > 0 ? initialRecentNotes.filter((n) => !deletedNoteIds.has(n.id)) : initialRecentNotes}
          onOpenRecentNote={handleOpenRecentNote}
          onDeleteNoteIds={(ids) => setDeletedNoteIds((prev) => { const next = new Set(prev); ids.forEach((id) => next.add(id)); return next; })}
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
              setDeletedNoteIds((prev) => { const next = new Set(prev); ids.forEach((id) => next.add(id)); return next; });
              showToast(`${ids.length} ${ids.length === 1 ? "note" : "notes"} deleted`, {
                action: {
                  label: "Undo",
                  onClick: () => {
                    restoreNotes(ids);
                    setNoteCountAdjustments((prev) => ({ ...prev, [fId]: (prev[fId] ?? 0) + ids.length }));
                    setDeletedNoteIds((prev) => { const next = new Set(prev); ids.forEach((id) => next.delete(id)); return next; });
                  },
                },
              });
            }}
            onRenameFolder={handleRenameFolder}
            onUpdateDescription={(desc) => updateSetting(folderId, "description", desc)}
            onUpdateIcon={(icon) => updateSetting(folderId, "icon", icon)}
            onClose={() => { setModalOpen(false); clearViewState(); }}
            skipAnimation={skipAnimation}
          />
        </Suspense>
      </div>
    </>
  );
}
