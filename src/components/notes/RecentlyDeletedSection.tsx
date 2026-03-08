"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2, ChevronDown, RotateCcw, X, FileText, FolderOpen } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import type { Note } from "@/lib/types";

/** 30 days in milliseconds. */
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

/** A unified deleted item (note or folder). */
interface DeletedItem {
  id: string;
  type: "note" | "folder";
  label: string;
  deleted_at: string;
  /** For folders: the course_id to restore/delete associated notes. */
  course_id?: string;
}

/**
 * Collapsible section showing soft-deleted notes and folders within the last 30 days.
 * Rendered below the folder grid. Collapsed by default.
 *
 * Features:
 * - Fetches soft-deleted notes and soft-deleted course memberships
 * - Shows document/folder icons to distinguish item types
 * - Restore note: sets deleted_at = null, course_id = null (goes to General)
 * - Restore folder: sets deleted_at = null on membership + restores notes in that folder
 * - Permanent delete: hard deletes from DB
 * - Clear All: permanently deletes all items
 */
export default function RecentlyDeletedSection() {
  const [expanded, setExpanded] = useState(false);
  const [items, setItems] = useState<DeletedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  /** Item pending permanent delete confirmation. */
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<DeletedItem | null>(null);
  const supabase = createClient();
  const { showToast } = useToast();
  /** Timer ref for delayed Clear All hard-delete. */
  const clearAllTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchDeleted = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const cutoff = new Date(Date.now() - RETENTION_MS).toISOString();

    const [notesRes, foldersRes] = await Promise.all([
      supabase
        .from("notes")
        .select("id, title, deleted_at, course_id")
        .eq("user_id", user.id)
        .not("deleted_at", "is", null)
        .gte("deleted_at", cutoff)
        .order("deleted_at", { ascending: false }),
      supabase
        .from("course_memberships")
        .select("course_id, deleted_at, courses(name)")
        .eq("user_id", user.id)
        .not("deleted_at", "is", null)
        .gte("deleted_at", cutoff)
        .order("deleted_at", { ascending: false }),
    ]);

    const combined: DeletedItem[] = [];

    if (notesRes.data) {
      for (const note of notesRes.data) {
        combined.push({
          id: note.id,
          type: "note",
          label: (note as Note).title || "Untitled",
          deleted_at: note.deleted_at!,
          course_id: note.course_id ?? undefined,
        });
      }
    } else if (notesRes.error) {
      console.error("Failed to fetch deleted notes:", notesRes.error.message);
    }

    if (foldersRes.data) {
      for (const membership of foldersRes.data) {
        const course = membership.courses as unknown as { name: string } | null;
        combined.push({
          id: membership.course_id,
          type: "folder",
          label: course?.name ?? "Unnamed Folder",
          deleted_at: membership.deleted_at!,
          course_id: membership.course_id,
        });
      }
    } else if (foldersRes.error) {
      console.error("Failed to fetch deleted folders:", foldersRes.error.message);
    }

    // Sort by deleted_at descending
    combined.sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());

    setItems(combined);
    setLoading(false);
    setHasFetched(true);
  }, [supabase]);

  // Fetch on first expand
  useEffect(() => {
    if (expanded && !hasFetched) {
      fetchDeleted();
    }
  }, [expanded, hasFetched, fetchDeleted]);

  /**
   * Restore a soft-deleted note. Sets deleted_at = null, course_id = null
   * so it appears in the General folder.
   *
   * @param itemId - ID of the note to restore
   */
  async function handleRestoreNote(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));

    const { error } = await supabase
      .from("notes")
      .update({ deleted_at: null, course_id: null })
      .eq("id", itemId);

    if (error) {
      console.error("Failed to restore note:", error.message);
      fetchDeleted();
    }
  }

  /**
   * Restore a soft-deleted folder. Sets deleted_at = null on membership
   * and restores all notes in that folder.
   *
   * @param courseId - Course ID of the folder to restore
   */
  async function handleRestoreFolder(courseId: string) {
    setItems((prev) => prev.filter((i) => !(i.type === "folder" && i.course_id === courseId)));
    // Also remove notes from this folder from the list (they'll reappear in the folder)
    setItems((prev) => prev.filter((i) => !(i.type === "note" && i.course_id === courseId)));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [membershipErr, notesErr] = await Promise.all([
      supabase
        .from("course_memberships")
        .update({ deleted_at: null })
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .then((r) => r.error),
      supabase
        .from("notes")
        .update({ deleted_at: null })
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .then((r) => r.error),
    ]);

    if (membershipErr || notesErr) {
      console.error("Failed to restore folder:", membershipErr?.message, notesErr?.message);
      fetchDeleted();
    }
  }

  /**
   * Permanently delete a note from the database.
   *
   * @param itemId - ID of the note to permanently delete
   */
  async function handlePermanentDeleteNote(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));

    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", itemId);

    if (error) {
      console.error("Failed to permanently delete note:", error.message);
      fetchDeleted();
    }
  }

  /**
   * Permanently delete a folder: hard-deletes membership and all notes in the folder.
   *
   * @param courseId - Course ID of the folder to permanently delete
   */
  async function handlePermanentDeleteFolder(courseId: string) {
    setItems((prev) => prev.filter((i) => !(i.type === "folder" && i.course_id === courseId)));
    // Also remove notes from this folder from the list
    setItems((prev) => prev.filter((i) => !(i.type === "note" && i.course_id === courseId)));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await Promise.all([
      supabase
        .from("notes")
        .delete()
        .eq("course_id", courseId)
        .eq("user_id", user.id),
      supabase
        .from("course_memberships")
        .delete()
        .eq("user_id", user.id)
        .eq("course_id", courseId),
    ]);
  }

  /**
   * Clear all deleted items with a 3-second undo grace period.
   * Optimistically clears UI, then hard-deletes after timeout.
   * Undo cancels the timer and restores items.
   */
  function handleClearAll() {
    const prevItems = [...items];
    setItems([]);

    // Cancel any existing pending clear
    if (clearAllTimerRef.current) {
      clearTimeout(clearAllTimerRef.current);
    }

    clearAllTimerRef.current = setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const cutoff = new Date(Date.now() - RETENTION_MS).toISOString();

      const [notesErr, membershipsErr] = await Promise.all([
        supabase
          .from("notes")
          .delete()
          .eq("user_id", user.id)
          .not("deleted_at", "is", null)
          .gte("deleted_at", cutoff)
          .then((r) => r.error),
        supabase
          .from("course_memberships")
          .delete()
          .eq("user_id", user.id)
          .not("deleted_at", "is", null)
          .gte("deleted_at", cutoff)
          .then((r) => r.error),
      ]);

      if (notesErr || membershipsErr) {
        console.error("Failed to clear all:", notesErr?.message, membershipsErr?.message);
        fetchDeleted();
      }
    }, 3000);

    showToast("Recently deleted items cleared", {
      duration: 3000,
      action: {
        label: "Undo",
        onClick: () => {
          if (clearAllTimerRef.current) {
            clearTimeout(clearAllTimerRef.current);
            clearAllTimerRef.current = undefined;
          }
          setItems(prevItems);
        },
      },
    });
  }

  /**
   * Format a deletion date for display.
   *
   * @param iso - ISO timestamp string
   * @returns Human-readable date string
   */
  function formatDeletedDate(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const count = hasFetched ? items.length : null;

  return (
    <div className="mt-40">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <Trash2 size={14} />
          <span>Recently Deleted</span>
          {count !== null && count > 0 && (
            <span className="text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {count}
            </span>
          )}
          <ChevronDown
            size={14}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
        {expanded && items.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-muted-foreground hover:text-red-500 transition-colors ml-auto"
          >
            Clear all
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-3 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No recently deleted items
            </p>
          ) : (
            items.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors group/item"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  {item.type === "note" ? (
                    <FileText size={14} className="text-muted-foreground shrink-0" />
                  ) : (
                    <FolderOpen size={14} className="text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Deleted {formatDeletedDate(item.deleted_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <button
                    onClick={() =>
                      item.type === "note"
                        ? handleRestoreNote(item.id)
                        : handleRestoreFolder(item.course_id!)
                    }
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title={item.type === "note" ? "Restore to General" : "Restore folder"}
                    aria-label="Restore"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteItem(item)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Delete forever"
                    aria-label="Delete permanently"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {/* Permanent delete confirmation */}
      {confirmDeleteItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in"
            onClick={() => setConfirmDeleteItem(null)}
          />
          <div className="relative bg-card rounded-2xl border border-border shadow-2xl max-w-sm mx-4 p-6 animate-announce-card-in">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Delete forever?
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                <span className="font-medium text-foreground">{confirmDeleteItem.label}</span>
                {" "}will be permanently deleted. This cannot be undone.
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirmDeleteItem.type === "note") {
                      handlePermanentDeleteNote(confirmDeleteItem.id);
                    } else {
                      handlePermanentDeleteFolder(confirmDeleteItem.course_id!);
                    }
                    setConfirmDeleteItem(null);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all cursor-pointer"
                >
                  Delete Forever
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteItem(null)}
                  className="w-full px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
