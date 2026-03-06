"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { Plus, FolderPlus, X } from "lucide-react";
import FolderCard from "./FolderCard";
import FolderCardPreview from "./FolderCardPreview";
import type { FolderAppearance } from "./FolderAppearanceModal";
import type { Course } from "@/lib/types";

/**
 * A folder entry representing either "General" or a course.
 */
export interface FolderEntry {
  id: string;
  label: string;
}

/** Default light warm gray for folder headers (matches default banner). */
const DEFAULT_APPEARANCE: FolderAppearance = {
  type: "color",
  value: "#d6d3d1",
};

/** LocalStorage key for folder appearance settings. */
const FOLDER_APPEARANCES_KEY = "notes_folder_appearances";

interface Props {
  onSelectFolder: (folder: FolderEntry) => void;
}

/**
 * Grid of folder cards (General + user's synced courses).
 * Supports renaming (updates courses.name + tasks.course_name),
 * appearance customization, folder creation, and deletion.
 *
 * @param onSelectFolder - Callback when a folder card is clicked
 */
export default function NotesFolderGrid({ onSelectFolder }: Props) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [noteCounts, setNoteCounts] = useState<Record<string, number>>({});
  const [appearances, setAppearances] = useState<Record<string, FolderAppearance>>({});
  const [loading, setLoading] = useState(true);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const supabase = createClient();

  // Load saved appearances from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FOLDER_APPEARANCES_KEY);
      if (saved) setAppearances(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const [membershipsRes, notesRes] = await Promise.all([
        supabase
          .from("course_memberships")
          .select("course_id, courses(id, source, external_id, name, created_at)")
          .eq("user_id", user.id),
        supabase
          .from("notes")
          .select("id, course_id")
          .eq("user_id", user.id),
      ]);

      if (membershipsRes.data) {
        const userCourses = membershipsRes.data
          .map((m) => m.courses as unknown as Course)
          .filter((c) => c && c.source !== "system")
          .sort((a, b) => a.name.localeCompare(b.name));
        setCourses(userCourses);
      }

      if (notesRes.data) {
        const counts: Record<string, number> = {};
        for (const note of notesRes.data) {
          const key = note.course_id ?? "general";
          counts[key] = (counts[key] ?? 0) + 1;
        }
        setNoteCounts(counts);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  /**
   * Persists appearance settings to localStorage.
   */
  function saveAppearances(updated: Record<string, FolderAppearance>) {
    setAppearances(updated);
    try {
      localStorage.setItem(FOLDER_APPEARANCES_KEY, JSON.stringify(updated));
    } catch { /* ignore quota errors */ }
  }

  /**
   * Renames a course folder. Updates courses.name in DB and all
   * tasks.course_name matching the old name to stay in sync.
   */
  const handleRename = useCallback(async (folderId: string, newName: string) => {
    const course = courses.find((c) => c.id === folderId);
    if (!course) return;

    const oldName = course.name;
    setCourses((prev) =>
      prev.map((c) => (c.id === folderId ? { ...c, name: newName } : c))
    );

    const { error: courseError } = await supabase
      .from("courses")
      .update({ name: newName })
      .eq("id", folderId);

    if (courseError) {
      setCourses((prev) =>
        prev.map((c) => (c.id === folderId ? { ...c, name: oldName } : c))
      );
      return;
    }

    await supabase
      .from("tasks")
      .update({ course_name: newName })
      .eq("course_name", oldName);
  }, [courses, supabase]);

  /**
   * Changes a folder's appearance. Persisted in localStorage.
   */
  const handleAppearanceChange = useCallback((folderId: string, appearance: FolderAppearance) => {
    const updated = { ...appearances, [folderId]: appearance };
    saveAppearances(updated);
  }, [appearances]);

  /**
   * Deletes a course folder and all its notes.
   */
  const handleDelete = useCallback(async (folderId: string) => {
    await supabase
      .from("notes")
      .delete()
      .eq("course_id", folderId);

    setCourses((prev) => prev.filter((c) => c.id !== folderId));
    setNoteCounts((prev) => {
      const updated = { ...prev };
      delete updated[folderId];
      return updated;
    });
  }, [supabase]);

  /**
   * Creates a new course folder. Inserts into courses table and
   * auto-enrolls the user via course_memberships.
   */
  async function handleCreateFolder() {
    const trimmed = newFolderName.trim();
    if (!trimmed) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: course, error } = await supabase
      .from("courses")
      .insert({
        source: "system",
        external_id: `notes-folder-${Date.now()}`,
        name: trimmed,
      })
      .select()
      .single();

    if (error || !course) {
      console.error("Failed to create folder:", error?.message);
      return;
    }

    // Auto-enroll the user
    await supabase
      .from("course_memberships")
      .insert({ user_id: user.id, course_id: course.id });

    setCourses((prev) => [...prev, course as Course].sort((a, b) => a.name.localeCompare(b.name)));
    setNewFolderName("");
    setShowNewFolder(false);
  }

  const folders: FolderEntry[] = [
    { id: "general", label: "General" },
    ...courses.map((c) => ({ id: c.id, label: c.name })),
  ];

  /**
   * Returns the appearance for a folder, falling back to Apple gray.
   */
  function getFolderAppearance(folderId: string): FolderAppearance {
    return appearances[folderId] ?? DEFAULT_APPEARANCE;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header with New Folder button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Notes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {folders.length} {folders.length === 1 ? "folder" : "folders"}
          </p>
        </div>
        <button
          onClick={() => setShowNewFolder(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          <Plus size={16} />
          New Folder
        </button>
      </div>

      {/* New folder modal */}
      {showNewFolder && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[55] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 animate-announce-backdrop-in"
            onClick={() => { setShowNewFolder(false); setNewFolderName(""); }}
          />
          <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-sm mx-4 animate-announce-card-in overflow-hidden">
            <div className="flex items-center justify-between p-5 pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <FolderPlus size={20} className="text-blue-500" />
                <h2 className="text-base font-semibold text-foreground">New Folder</h2>
              </div>
              <button
                onClick={() => { setShowNewFolder(false); setNewFolderName(""); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5">
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Folder name
              </label>
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newFolderName.trim()) handleCreateFolder();
                  if (e.key === "Escape") { setShowNewFolder(false); setNewFolderName(""); }
                }}
                placeholder="e.g. CS 61A, Personal, Research"
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
              />
            </div>
            <div className="flex justify-end gap-2 p-5 pt-0">
              <button
                onClick={() => { setShowNewFolder(false); setNewFolderName(""); }}
                className="px-4 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-40"
              >
                Create
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Folder grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {folders.map((folder) => (
          <FolderCard
            key={folder.id}
            folder={folder}
            appearance={getFolderAppearance(folder.id)}
            noteCount={noteCounts[folder.id] ?? 0}
            isGeneral={folder.id === "general"}
            onSelect={onSelectFolder}
            onRename={handleRename}
            onAppearanceChange={handleAppearanceChange}
            onDelete={handleDelete}
          />
        ))}

        {/* Live preview placeholder while creating a new folder */}
        {showNewFolder && (
          <div className="relative z-[56]">
            <FolderCardPreview
              label={newFolderName || "New Folder"}
              appearance={DEFAULT_APPEARANCE}
              noteCount={0}
              highlighted
            />
          </div>
        )}
      </div>
    </div>
  );
}
