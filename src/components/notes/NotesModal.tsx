"use client";

import { useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X, Plus, List, LayoutGrid, StickyNote,
  MoreVertical, Pencil, FileText,
} from "lucide-react";
import useClickOutside from "@/hooks/useClickOutside";
import { ListView, GridView } from "./NotesModalViews";
import { RenameModal, DescriptionModal } from "./FolderEditModals";
import type { Note } from "@/lib/types";

interface Props {
  open: boolean;
  folderId: string;
  folderLabel: string;
  folderDescription: string;
  isGeneral: boolean;
  notes: Note[];
  loading: boolean;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  onRenameFolder: (newName: string) => void;
  onUpdateDescription: (description: string) => void;
  onClose: () => void;
}

type ViewMode = "list" | "grid";
const VIEW_MODE_KEY = "notes_view_mode";

/**
 * Fixed-size modal for browsing notes inside a folder.
 * Large title (auto-shrinks for long names), optional description,
 * three-dot menu for rename/description, list/grid toggle.
 * Notes area has a light gray background.
 */
export default function NotesModal({
  open,
  folderLabel,
  folderDescription,
  isGeneral,
  notes,
  loading,
  onSelectNote,
  onCreateNote,
  onRenameFolder,
  onUpdateDescription,
  onClose,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "list";
    try {
      return (localStorage.getItem(VIEW_MODE_KEY) as ViewMode) || "list";
    } catch { return "list"; }
  });

  const [showMenu, setShowMenu] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [showDescModal, setShowDescModal] = useState(false);
  const [descValue, setDescValue] = useState("");

  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setShowMenu(false), showMenu, [menuBtnRef]);

  if (!open || typeof document === "undefined") return null;

  function toggleView(mode: ViewMode) {
    setViewMode(mode);
    try { localStorage.setItem(VIEW_MODE_KEY, mode); } catch { /* ignore */ }
  }

  function commitRename() {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== folderLabel) onRenameFolder(trimmed);
    setShowRenameModal(false);
  }

  function commitDescription() {
    onUpdateDescription(descValue);
    setShowDescModal(false);
  }

  return createPortal(
    <div className="fixed inset-0 z-[55] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 animate-announce-backdrop-in"
        onClick={onClose}
      />

      {/* Modal — narrower fixed size */}
      <div className="relative bg-card rounded-2xl shadow-xl animate-announce-card-in overflow-hidden w-[680px] h-[700px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)] flex flex-col">
        {/* Top-right controls: three-dot menu + close */}
        <div className="absolute top-5 right-5 z-10 flex items-center gap-1">
          {!isGeneral && (
            <div className="relative">
              <button
                ref={menuBtnRef}
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Edit folder"
              >
                <MoreVertical size={16} />
              </button>

              {showMenu && (
                <div
                  ref={menuRef}
                  className="absolute top-full right-0 mt-1 z-[60] rounded-xl shadow-2xl border border-border overflow-hidden min-w-[160px] bg-popover animate-in"
                >
                  <button
                    onClick={() => {
                      setRenameValue(folderLabel);
                      setShowRenameModal(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Pencil size={13} />
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      setDescValue(folderDescription);
                      setShowDescModal(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <FileText size={13} />
                    Description
                  </button>
                </div>
              )}
            </div>
          )}
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
          <div className="px-12 pt-12 pb-4">
            <div className="max-w-[380px]">
              <FolderTitle label={folderLabel} />
              {folderDescription && (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {folderDescription}
                </p>
              )}
            </div>

            <p className="text-sm text-muted-foreground mt-3">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </p>
          </div>

          {/* Toolbar */}
          <div className="px-12 pb-4 flex items-center justify-between">
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
              onClick={onCreateNote}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <Plus size={16} />
              New Note
            </button>
          </div>

          {/* Notes content — light gray area */}
          <div className="bg-stone-50 dark:bg-stone-900/40 min-h-[320px] px-12 py-8">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
              </div>
            ) : notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <StickyNote size={40} strokeWidth={1.5} className="mb-3 opacity-40" />
                <p className="text-sm">No notes yet</p>
                <button
                  onClick={onCreateNote}
                  className="text-sm text-blue-500 hover:text-blue-600 mt-2"
                >
                  Create your first note
                </button>
              </div>
            ) : viewMode === "list" ? (
              <ListView notes={notes} onSelect={onSelectNote} />
            ) : (
              <GridView notes={notes} onSelect={onSelectNote} />
            )}
          </div>
        </div>
      </div>

      {showRenameModal && (
        <RenameModal
          value={renameValue}
          onChange={setRenameValue}
          onSave={commitRename}
          onClose={() => setShowRenameModal(false)}
        />
      )}

      {showDescModal && (
        <DescriptionModal
          value={descValue}
          onChange={setDescValue}
          onSave={commitDescription}
          onClose={() => setShowDescModal(false)}
        />
      )}
    </div>,
    document.body,
  );
}

/**
 * Renders the folder title with auto-shrinking font size.
 * Picks a smaller size for longer names to fit in max 2 lines.
 *
 * @param label - The folder name to display
 */
function FolderTitle({ label }: { label: string }) {
  const titleClass = useMemo(() => {
    const len = label.length;
    if (len <= 15) return "text-4xl";
    if (len <= 30) return "text-3xl";
    if (len <= 50) return "text-2xl";
    return "text-xl";
  }, [label]);

  return (
    <h1 className={`${titleClass} font-bold text-foreground leading-tight line-clamp-2`}>
      {label}
    </h1>
  );
}
