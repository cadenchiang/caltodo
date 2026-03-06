"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X, FilePlus, List, LayoutGrid, StickyNote, Pencil, Trash2,
} from "lucide-react";
import { ListView, GridView } from "./NotesModalViews";
import { FolderTitle } from "./NotesModalParts";
import EditToggleButton from "@/components/ui/EditToggleButton";
import EmojiPicker from "@/components/home/EmojiPicker";
import { useMarqueeSelection } from "@/hooks/useMarqueeSelection";
import type { Note } from "@/lib/types";

interface Props {
  open: boolean;
  folderId: string;
  folderLabel: string;
  folderDescription: string;
  folderIcon: string;
  isGeneral: boolean;
  notes: Note[];
  loading: boolean;
  onSelectNote: (note: Note) => void;
  onCreateNote: (title?: string) => void;
  onDeleteNotes: (ids: string[]) => void;
  onRenameFolder: (newName: string) => void;
  onUpdateDescription: (description: string) => void;
  onUpdateIcon: (icon: string) => void;
  onClose: () => void;
}

type ViewMode = "list" | "grid";
const VIEW_MODE_KEY = "notes_view_mode";

/**
 * Fixed-size modal for browsing notes inside a folder.
 * Large title (auto-shrinks for long names), optional description,
 * edit toggle for inline editing of title/description/icon, list/grid toggle.
 * Notes area has a light gray background.
 */
export default function NotesModal({
  open,
  folderLabel,
  folderDescription,
  folderIcon,
  isGeneral,
  notes,
  loading,
  onSelectNote,
  onCreateNote,
  onDeleteNotes,
  onRenameFolder,
  onUpdateDescription,
  onUpdateIcon,
  onClose,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "list";
    try {
      return (localStorage.getItem(VIEW_MODE_KEY) as ViewMode) || "list";
    } catch { return "list"; }
  });

  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const notesContainerRef = useRef<HTMLDivElement>(null);

  // Clear selection when modal opens/closes
  useEffect(() => {
    if (!open) setSelectedIds(new Set());
  }, [open]);

  // Animate floating bar exit
  const [noteBarVisible, setNoteBarVisible] = useState(false);
  const [noteBarClosing, setNoteBarClosing] = useState(false);
  const noteBarTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (selectedIds.size > 0) {
      clearTimeout(noteBarTimerRef.current);
      setNoteBarClosing(false);
      setNoteBarVisible(true);
    } else if (noteBarVisible) {
      setNoteBarClosing(true);
      noteBarTimerRef.current = setTimeout(() => {
        setNoteBarVisible(false);
        setNoteBarClosing(false);
      }, 200);
    }
  }, [selectedIds.size]);

  const handleMarqueeSelection = useCallback((ids: Set<string>) => {
    setSelectedIds(ids);
  }, []);

  const { marqueeStyle, isSelecting, onMouseDown: onMarqueeMouseDown } = useMarqueeSelection({
    containerRef: notesContainerRef,
    onSelectionChange: handleMarqueeSelection,
    existingSelection: selectedIds,
  });

  if (!open || typeof document === "undefined") return null;

  function toggleView(mode: ViewMode) {
    setViewMode(mode);
    try { localStorage.setItem(VIEW_MODE_KEY, mode); } catch { /* ignore */ }
  }

  /**
   * Enter edit mode — initialize local state from current folder props.
   */
  function enterEditMode() {
    setEditTitle(folderLabel);
    setEditDesc(folderDescription);
    setEditMode(true);
  }

  /**
   * Exit edit mode — commit any changes to title/description.
   */
  function exitEditMode() {
    const trimmedTitle = editTitle.trim();
    if (!isGeneral && trimmedTitle && trimmedTitle !== folderLabel) {
      onRenameFolder(trimmedTitle);
    }
    if (editDesc !== folderDescription) {
      onUpdateDescription(editDesc);
    }
    setEditMode(false);
  }

  function handleToggleEdit() {
    if (editMode) {
      exitEditMode();
    } else {
      enterEditMode();
    }
  }

  /** Select a note. Plain click selects only this one; Shift+click adds to selection. */
  function toggleSelect(noteId: string, shiftKey: boolean) {
    setSelectedIds((prev) => {
      if (shiftKey) {
        const next = new Set(prev);
        if (next.has(noteId)) {
          next.delete(noteId);
        } else {
          next.add(noteId);
        }
        return next;
      }
      if (prev.size === 1 && prev.has(noteId)) {
        return new Set();
      }
      return new Set([noteId]);
    });
  }

  /** Delete all selected notes and clear selection. */
  function handleDeleteSelected() {
    const ids = Array.from(selectedIds);
    onDeleteNotes(ids);
    setSelectedIds(new Set());
  }

  return createPortal(
    <div className="fixed inset-0 z-[55] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 animate-announce-backdrop-in"
        onClick={onClose}
      />

      {/* Modal — narrower fixed size */}
      <div className="relative bg-card rounded-2xl shadow-xl animate-announce-card-in overflow-hidden w-[680px] h-[640px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)] flex flex-col">
        {/* Top-right controls: edit toggle + close */}
        <div className="absolute top-5 right-5 z-10 flex items-center gap-1">
          <EditToggleButton editing={editMode} onToggle={handleToggleEdit} />
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Title area */}
          <div className="px-10 pt-10 pb-3">
            {/* Clickable emoji icon — only clickable in edit mode */}
            <div className="mb-4">
              {editMode ? (
                <button
                  onClick={() => setShowEmojiPicker(true)}
                  className="relative text-5xl hover:bg-muted rounded-xl w-16 h-16 flex items-center justify-center transition-colors cursor-pointer group"
                  title="Change icon"
                  aria-label="Change folder icon"
                >
                  {folderIcon || "📁"}
                  <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil size={10} className="text-white" />
                  </span>
                </button>
              ) : (
                <div className="text-5xl w-16 h-16 flex items-center justify-center">
                  {folderIcon || "📁"}
                </div>
              )}
            </div>

            <div className="max-w-[380px]">
              {editMode && !isGeneral ? (
                <input
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") exitEditMode();
                    if (e.key === "Escape") {
                      setEditMode(false);
                    }
                  }}
                  placeholder="Folder name"
                  className="w-full bg-transparent text-foreground font-bold outline-none border-b-2 border-blue-500 pb-1"
                  style={{ fontSize: "36px", lineHeight: 1.2 }}
                />
              ) : (
                <FolderTitle label={folderLabel} />
              )}

              {editMode ? (
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setEditMode(false);
                  }}
                  placeholder="Add a description..."
                  rows={2}
                  className="w-full mt-2 text-sm bg-transparent text-foreground outline-none border-b border-border focus:border-blue-500 resize-none placeholder:text-muted-foreground leading-relaxed pb-1 transition-colors"
                />
              ) : folderDescription ? (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {folderDescription}
                </p>
              ) : null}
            </div>

            <p className="text-sm text-muted-foreground mt-3">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </p>
          </div>

          <div className="mx-10 border-t border-border" />

          {/* Toolbar */}
          <div className="px-10 py-3 flex items-center justify-between">
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted">
              <button
                onClick={() => toggleView("list")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="List view"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => toggleView("grid")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
            <button
              onClick={() => onCreateNote()}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="New Note"
            >
              <FilePlus size={18} />
            </button>
          </div>

          {/* Notes content */}
          <div
            ref={notesContainerRef}
            onMouseDown={onMarqueeMouseDown}
            className="relative min-h-[200px] px-10 py-5 select-none"
          >
            {/* Marquee selection overlay */}
            {marqueeStyle && (
              <div
                className="bg-blue-500/20 border border-blue-500/50 rounded-sm"
                style={marqueeStyle}
              />
            )}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
              </div>
            ) : notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
                <StickyNote size={40} strokeWidth={1.5} className="mb-3 opacity-40" />
                <p className="text-sm">No notes yet</p>
                <button
                  onClick={() => onCreateNote()}
                  className="text-sm text-blue-500 hover:text-blue-600 mt-2"
                >
                  Create your first note
                </button>
              </div>
            ) : viewMode === "list" ? (
              <ListView
                notes={notes}
                selectedIds={selectedIds}
                onSelect={toggleSelect}
                onOpen={onSelectNote}
              />
            ) : (
              <GridView
                notes={notes}
                selectedIds={selectedIds}
                onSelect={toggleSelect}
                onOpen={onSelectNote}
              />
            )}
          </div>
        </div>
      </div>

      {/* Floating selection bar */}
      {noteBarVisible && (
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-foreground text-background shadow-lg ${noteBarClosing ? "animate-announce-card-out" : "animate-announce-card-in"}`}>
          <span className="text-xs font-medium">
            {selectedIds.size} selected
          </span>
          <div className="w-px h-3.5 bg-background/20" />
          <button
            onClick={handleDeleteSelected}
            className="w-7 h-7 rounded-md flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-background/10 transition-colors"
            title="Delete"
            aria-label="Delete notes"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="w-7 h-7 rounded-md flex items-center justify-center text-background/60 hover:text-background hover:bg-background/10 transition-colors"
            title="Clear selection"
            aria-label="Clear selection"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <EmojiPicker
        open={showEmojiPicker}
        onSelect={(emoji) => {
          onUpdateIcon(emoji);
          setShowEmojiPicker(false);
        }}
        onClose={() => setShowEmojiPicker(false)}
      />
    </div>,
    document.body,
  );
}
