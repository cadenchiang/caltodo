"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X, FilePlus, List, LayoutGrid, Pencil, Trash2, Pin, PinOff, Printer, Folder,
} from "lucide-react";
import { ListView, GridView } from "./NotesModalViews";
import { FolderTitle } from "./NotesModalParts";
import EditToggleButton from "@/components/ui/EditToggleButton";
import EmojiPicker from "@/components/home/EmojiPicker";
import { LUCIDE_ICON_MAP, isFilledIcon } from "@/components/home/emoji-picker-data";
import { useMarqueeSelection } from "@/hooks/useMarqueeSelection";
import DeleteNoteConfirmModal from "./DeleteNoteConfirmModal";
import { extractTextPreview } from "@/lib/notes-utils";
import type { Note, NoteUpdate } from "@/lib/types";

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
  onUpdateNote: (id: string, updates: NoteUpdate) => void;
  onDeleteNotes: (ids: string[]) => void;
  onRenameFolder: (newName: string) => void;
  onUpdateDescription: (description: string) => void;
  onUpdateIcon: (icon: string) => void;
  onClose: () => void;
  /** Skip entrance animation (e.g. when returning from editor). */
  skipAnimation?: boolean;
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
  onUpdateNote,
  onDeleteNotes,
  onRenameFolder,
  onUpdateDescription,
  onUpdateIcon,
  onClose,
  skipAnimation,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "grid";
    try {
      return (localStorage.getItem(VIEW_MODE_KEY) as ViewMode) || "grid";
    } catch { return "grid"; }
  });

  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const originalTitleRef = useRef("");
  const originalDescRef = useRef("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  /** Tracks the last plain-clicked note for shift+click range selection. */
  const anchorIdRef = useRef<string | null>(null);
  /** Caches the last non-empty selection so the exit animation doesn't flash empty state. */
  const lastSelectedRef = useRef<Set<string>>(new Set());
  if (selectedIds.size > 0) lastSelectedRef.current = new Set(selectedIds);
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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /** Tracks whether a marquee drag just finished to suppress the click-to-deselect. */
  const justMarqueedRef = useRef(false);

  const handleMarqueeSelection = useCallback((ids: Set<string>) => {
    setSelectedIds(ids);
    if (ids.size > 0) justMarqueedRef.current = true;
  }, []);

  const { marqueeStyle, isSelecting, onMouseDown: onMarqueeMouseDown } = useMarqueeSelection({
    containerRef: notesContainerRef,
    onSelectionChange: handleMarqueeSelection,
    existingSelection: selectedIds,
  });

  // Closing animation state — must be before early return to preserve hook order
  const [isClosing, setIsClosing] = useState(false);

  /** Render folderIcon — resolves "lucide:name" to actual component, or emoji text. */
  function renderFolderIcon() {
    if (!folderIcon) {
      return <Folder size={70} fill="currentColor" />;
    }
    if (folderIcon.startsWith("lucide:")) {
      const name = folderIcon.slice(7);
      const IconComp = LUCIDE_ICON_MAP[name];
      if (IconComp) {
        const filled = isFilledIcon(name);
        return <IconComp size={70} fill={filled ? "currentColor" : "none"} />;
      }
    }
    return <>{folderIcon}</>;
  }

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
    originalTitleRef.current = folderLabel;
    originalDescRef.current = folderDescription;
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

  /**
   * Select a note. Plain click selects only this one and sets anchor.
   * Shift+click selects the range between the anchor and the clicked note.
   */
  function toggleSelect(noteId: string, shiftKey: boolean) {
    if (shiftKey && anchorIdRef.current) {
      const anchorIdx = notes.findIndex((n) => n.id === anchorIdRef.current);
      const targetIdx = notes.findIndex((n) => n.id === noteId);
      if (anchorIdx !== -1 && targetIdx !== -1) {
        const start = Math.min(anchorIdx, targetIdx);
        const end = Math.max(anchorIdx, targetIdx);
        const rangeIds = notes.slice(start, end + 1).map((n) => n.id);
        setSelectedIds(new Set(rangeIds));
        return;
      }
    }
    // Plain click: select only this one, or deselect if already the sole selection
    if (selectedIds.size === 1 && selectedIds.has(noteId)) {
      anchorIdRef.current = null;
      setSelectedIds(new Set());
    } else {
      anchorIdRef.current = noteId;
      setSelectedIds(new Set([noteId]));
    }
  }

  /** Show delete confirmation for selected notes. */
  function handleDeleteSelected() {
    setShowDeleteConfirm(true);
  }

  /** Confirm deletion of selected notes. */
  function confirmDeleteSelected() {
    const ids = Array.from(selectedIds);
    onDeleteNotes(ids);
    setSelectedIds(new Set());
    setShowDeleteConfirm(false);
  }

  /** Toggle pin on all selected notes. */
  function handlePinSelected() {
    const selected = notes.filter((n) => selectedIds.has(n.id));
    const allPinned = selected.every((n) => n.is_pinned);
    for (const n of selected) {
      onUpdateNote(n.id, { is_pinned: !allPinned });
    }
    setSelectedIds(new Set());
  }

  /** Print selected notes by opening the browser print dialog. */
  function handlePrintSelected() {
    const selected = notes.filter((n) => selectedIds.has(n.id));
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const content = selected.map((n) => `<h2>${n.title || "Untitled"}</h2><p>${extractTextPreview(n.content, 200)}</p>`).join("<hr>");
    printWindow.document.write(`<html><head><title>Print Notes</title><style>@media print { @page { margin: 1cm; } }</style></head><body style="font-family:system-ui;padding:2rem">${content}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  }

  function handleClose() {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }

  return createPortal(
    <div className="fixed inset-0 z-[55] flex items-center justify-center">
      <div
        className={`absolute inset-0 bg-black/50 ${isClosing ? "animate-announce-backdrop-out" : skipAnimation ? "" : "animate-announce-backdrop-in"}`}
        onClick={handleClose}
      />

      {/* Modal — narrower fixed size */}
      <div className={`relative bg-card rounded-2xl shadow-xl overflow-hidden w-[760px] h-[92vh] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)] flex flex-col ${isClosing ? "animate-announce-card-out" : skipAnimation ? "" : "animate-announce-card-in"}`}>
        {/* Top-right controls: edit toggle + close */}
        <div className="absolute top-5 right-5 z-10 flex items-center gap-1">
          <EditToggleButton editing={editMode} onToggle={handleToggleEdit} />
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div
          ref={notesContainerRef}
          onMouseDown={onMarqueeMouseDown}
          className="flex-1 overflow-y-auto relative select-none"
          onClick={(e) => {
            // Skip deselect if a marquee drag just finished
            if (justMarqueedRef.current) {
              justMarqueedRef.current = false;
              return;
            }
            const target = e.target as HTMLElement;
            if (!target.closest("[data-note-id]") && selectedIds.size > 0) {
              anchorIdRef.current = null;
              setSelectedIds(new Set());
            }
          }}
        >
          {/* Title area */}
          <div className="px-10 pt-10 pb-3">
            {/* Clickable emoji icon — only clickable in edit mode */}
            <div className="mb-2">
              {editMode ? (
                <button
                  onClick={() => setShowEmojiPicker(true)}
                  className="relative text-5xl hover:bg-muted rounded-xl w-16 h-16 flex items-center justify-start transition-colors cursor-pointer group"
                  title="Change icon"
                  aria-label="Change folder icon"
                >
                  {renderFolderIcon()}
                  <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil size={10} className="text-white" />
                  </span>
                </button>
              ) : (
                <div className="text-5xl w-16 h-16 flex items-center justify-start">
                  {renderFolderIcon()}
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
                      setEditTitle(originalTitleRef.current);
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
                    if (e.key === "Escape") {
                      setEditDesc(originalDescRef.current);
                      setEditMode(false);
                    }
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
          {/* Marquee selection overlay */}
          {marqueeStyle && (
            <div
              className="bg-blue-500/20 border border-blue-500/50 rounded-sm pointer-events-none z-10"
              style={marqueeStyle}
            />
          )}
          <div
            className="min-h-[200px] px-10 py-5"
          >
            {loading ? (
              <div className="space-y-2 px-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 rounded-lg bg-muted/50 animate-pulse" />
                ))}
              </div>
            ) : notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-3">
                <p className="text-sm text-muted-foreground/60">No notes yet</p>
                <button
                  onClick={() => onCreateNote()}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  Create a note
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
            {lastSelectedRef.current.size} selected
          </span>
          <div className="w-px h-3.5 bg-background/20" />
          {/* Pin/Unpin */}
          <button
            onClick={handlePinSelected}
            className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-background/10 transition-colors"
            title={notes.filter((n) => lastSelectedRef.current.has(n.id)).every((n) => n.is_pinned) ? "Unpin" : "Pin"}
            aria-label="Toggle pin"
          >
            {notes.filter((n) => lastSelectedRef.current.has(n.id)).every((n) => n.is_pinned) ? <PinOff size={14} /> : <Pin size={14} />}
          </button>
          {/* Rename — only when exactly 1 note is selected */}
          {lastSelectedRef.current.size === 1 && (
            <button
              onClick={() => {
                const noteId = Array.from(selectedIds)[0];
                const note = notes.find((n) => n.id === noteId);
                if (note) {
                  onSelectNote(note);
                  setSelectedIds(new Set());
                }
              }}
              className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-background/10 transition-colors"
              title="Edit"
              aria-label="Edit note"
            >
              <Pencil size={14} />
            </button>
          )}
          {/* Print */}
          <button
            onClick={handlePrintSelected}
            className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-background/10 transition-colors"
            title="Print"
            aria-label="Print notes"
          >
            <Printer size={14} />
          </button>
          {/* Delete */}
          <button
            onClick={handleDeleteSelected}
            className="w-9 h-9 rounded-md flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-background/10 transition-colors"
            title="Delete"
            aria-label="Delete notes"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="w-9 h-9 rounded-md flex items-center justify-center text-background/60 hover:text-background hover:bg-background/10 transition-colors"
            title="Clear selection"
            aria-label="Clear selection"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <DeleteNoteConfirmModal
        open={showDeleteConfirm}
        noteCount={selectedIds.size}
        onConfirm={confirmDeleteSelected}
        onCancel={() => setShowDeleteConfirm(false)}
      />

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
