"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Pencil, ImageIcon, Trash2, X } from "lucide-react";
import useClickOutside from "@/hooks/useClickOutside";
import FolderCardPreview from "./FolderCardPreview";
import FolderAppearanceModal from "./FolderAppearanceModal";
import type { FolderAppearance } from "./FolderAppearanceModal";
import type { FolderEntry } from "./NotesFolderGrid";

interface Props {
  folder: FolderEntry;
  appearance: FolderAppearance;
  noteCount: number;
  isGeneral: boolean;
  onSelect: (folder: FolderEntry) => void;
  onRename: (folderId: string, newName: string) => void;
  onAppearanceChange: (folderId: string, appearance: FolderAppearance) => void;
  onDelete: (folderId: string) => void;
}

/**
 * A single folder card in the notes grid.
 * Delegates rendering to FolderCardPreview for consistent look.
 * Adds three-dot menu, rename modal, appearance modal, and delete.
 * Card stays highlighted while any editing modal is open.
 *
 * @param folder - The folder entry data
 * @param appearance - Header appearance (color, gradient, or image)
 * @param noteCount - Number of notes in this folder
 * @param isGeneral - Whether this is the "General" (non-course) folder
 * @param onSelect - Callback to open the folder
 * @param onRename - Callback to rename the folder
 * @param onAppearanceChange - Callback to change folder appearance
 * @param onDelete - Callback to delete folder and its notes
 */
export default function FolderCard({
  folder,
  appearance,
  noteCount,
  isGeneral,
  onSelect,
  onRename,
  onAppearanceChange,
  onDelete,
}: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState(folder.label);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);

  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuDropdownRef, () => {
    setShowMenu(false);
    setShowDeleteConfirm(false);
  }, showMenu, [menuBtnRef]);

  /**
   * Commits the rename from the modal and closes it.
   */
  function commitRename() {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== folder.label) {
      onRename(folder.id, trimmed);
    }
    setShowRenameModal(false);
  }

  // Card stays in hover state when menu or any modal is open
  const isActive = showMenu || showAppearanceModal || showRenameModal;

  // Show live rename value on the card while rename modal is open
  const displayLabel = showRenameModal ? (renameValue || folder.label) : folder.label;

  return (
    <>
      {/* Clickable card wrapper with three-dot menu overlay */}
      <div className="group relative">
        <button
          onClick={() => onSelect(folder)}
          className="w-full text-left"
        >
          <FolderCardPreview
            label={displayLabel}
            appearance={appearance}
            noteCount={noteCount}
            highlighted={isActive}
          />
        </button>

        {/* Three-dot menu trigger — always visible when active */}
        <button
          ref={menuBtnRef}
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
            setShowDeleteConfirm(false);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-lg transition-colors ${
            isActive
              ? "text-white bg-white/20 opacity-100"
              : "text-white/70 hover:text-white hover:bg-white/20 opacity-0 group-hover:opacity-100"
          }`}
          title="Folder options"
        >
          <MoreVertical size={16} />
        </button>

        {/* Portaled dropdown menu */}
        {showMenu && menuBtnRef.current && createPortal(
          <div
            ref={menuDropdownRef}
            className="fixed z-[9999] rounded-xl shadow-2xl border border-border overflow-hidden animate-in min-w-[160px] bg-popover"
            style={{
              top: menuBtnRef.current.getBoundingClientRect().bottom + 4,
              left: Math.min(
                menuBtnRef.current.getBoundingClientRect().left,
                window.innerWidth - 180
              ),
            }}
          >
            {/* Rename */}
            {!isGeneral && (
              <button
                onClick={() => {
                  setRenameValue(folder.label);
                  setShowRenameModal(true);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Pencil size={13} />
                Rename
              </button>
            )}

            {/* Change appearance */}
            <button
              onClick={() => {
                setShowAppearanceModal(true);
                setShowMenu(false);
              }}
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <ImageIcon size={13} />
              Appearance
            </button>

            {/* Delete */}
            {!isGeneral && (
              <>
                <div className="border-t border-border my-1" />
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 size={13} />
                    Delete folder
                  </button>
                ) : (
                  <div className="px-3 py-2">
                    <p className="text-xs text-muted-foreground mb-2">
                      Delete {noteCount} {noteCount === 1 ? "note" : "notes"}?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onDelete(folder.id);
                          setShowMenu(false);
                          setShowDeleteConfirm(false);
                        }}
                        className="text-xs px-2.5 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-border text-muted-foreground hover:bg-accent transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>,
          document.body
        )}
      </div>

      {/* Rename modal */}
      {showRenameModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[55] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 animate-announce-backdrop-in"
            onClick={() => setShowRenameModal(false)}
          />
          <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-sm mx-4 animate-announce-card-in overflow-hidden">
            <div className="flex items-center justify-between p-5 pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <Pencil size={20} className="text-blue-500" />
                <h2 className="text-base font-semibold text-foreground">Rename Folder</h2>
              </div>
              <button
                onClick={() => setShowRenameModal(false)}
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
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && renameValue.trim()) commitRename();
                  if (e.key === "Escape") setShowRenameModal(false);
                }}
                placeholder="Folder name"
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
              />
            </div>
            <div className="flex justify-end gap-2 p-5 pt-0">
              <button
                onClick={() => setShowRenameModal(false)}
                className="px-4 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={commitRename}
                disabled={!renameValue.trim()}
                className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Appearance modal — stays open for live preview on the card */}
      <FolderAppearanceModal
        open={showAppearanceModal}
        folderLabel={folder.label}
        currentAppearance={appearance}
        onApply={(a) => onAppearanceChange(folder.id, a)}
        onClose={() => setShowAppearanceModal(false)}
      />
    </>
  );
}
