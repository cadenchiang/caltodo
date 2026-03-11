"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FolderPlus, X } from "lucide-react";

interface Props {
  name: string;
  onChangeName: (name: string) => void;
  onCreate: () => void;
  onClose: () => void;
}

/**
 * Modal dialog for creating a new notes folder.
 * Supports Enter to confirm and Escape to cancel.
 *
 * @param name - Current folder name input value
 * @param onChangeName - Callback when name input changes
 * @param onCreate - Callback to create the folder
 * @param onClose - Callback to close the modal
 */
export default function NewFolderModal({ name, onChangeName, onCreate, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[55] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 animate-announce-backdrop-in"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-2xl shadow-xl w-full w-[calc(100%-2rem)] max-w-sm animate-announce-card-in overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <FolderPlus size={20} className="text-blue-500" />
            <h2 className="text-base font-semibold text-foreground">New Folder</h2>
          </div>
          <button
            onClick={onClose}
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
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) onCreate();
              if (e.key === "Escape") onClose();
            }}
            placeholder="e.g. CS 61A, Personal, Research"
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
          />
        </div>
        <div className="flex justify-end gap-2 p-5 pt-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-40"
          >
            Create
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
