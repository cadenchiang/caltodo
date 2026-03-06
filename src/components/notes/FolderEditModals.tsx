"use client";

import { X, Pencil, FileText } from "lucide-react";

/**
 * Small modal for renaming a folder.
 *
 * @param value - Current input value
 * @param onChange - Input change handler
 * @param onSave - Save callback
 * @param onClose - Close/cancel callback
 */
export function RenameModal({ value, onChange, onSave, onClose }: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-sm mx-4 animate-announce-card-in overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <Pencil size={20} className="text-blue-500" />
            <h2 className="text-base font-semibold text-foreground">Rename Folder</h2>
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
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && value.trim()) onSave();
              if (e.key === "Escape") onClose();
            }}
            placeholder="Folder name"
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
            onClick={onSave}
            disabled={!value.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Small modal for editing a folder description.
 *
 * @param value - Current textarea value
 * @param onChange - Textarea change handler
 * @param onSave - Save callback
 * @param onClose - Close/cancel callback
 */
export function DescriptionModal({ value, onChange, onSave, onClose }: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-sm mx-4 animate-announce-card-in overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <FileText size={20} className="text-blue-500" />
            <h2 className="text-base font-semibold text-foreground">Description</h2>
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
            Folder description
          </label>
          <textarea
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
            placeholder="Add a short description for this folder..."
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors resize-none"
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
            onClick={onSave}
            className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
