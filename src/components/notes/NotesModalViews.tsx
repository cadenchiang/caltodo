"use client";

import { Pin } from "lucide-react";
import { LUCIDE_ICON_MAP, isFilledIcon } from "@/components/home/emoji-picker-data";
import { extractTextPreview } from "@/lib/notes-utils";
import NoteContentPreview from "./NoteContentPreview";
import type { Note } from "@/lib/types";

interface ViewProps {
  notes: Note[];
  selectedIds: Set<string>;
  onSelect: (noteId: string, shiftKey: boolean) => void;
  onOpen: (note: Note) => void;
}

/**
 * List view: compact rows with title, preview, and date.
 * Single click toggles selection; double click opens the note.
 *
 * @param notes - Notes to display
 * @param selectedIds - Currently selected note IDs
 * @param onSelect - Toggle selection for a note ID
 * @param onOpen - Open a note in the editor
 */
export function ListView({ notes, selectedIds, onSelect, onOpen }: ViewProps) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-popover">
      {notes.map((note, i) => {
        const title = note.title || "Untitled";
        const date = formatRelativeDate(note.updated_at);
        const selected = selectedIds.has(note.id);

        return (
          <button
            key={note.id}
            data-note-id={note.id}
            onClick={(e) => onSelect(note.id, e.shiftKey)}
            onDoubleClick={() => onOpen(note)}
            className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 ${
              i < notes.length - 1 ? "border-b border-border" : ""
            } ${
              selected
                ? "bg-blue-500/15 dark:bg-blue-500/20"
                : "hover:bg-accent/50"
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {note.icon && (
                  <span className="text-sm shrink-0">
                    {note.icon.startsWith("lucide:") ? (() => {
                      const name = note.icon!.slice(7);
                      const IC = LUCIDE_ICON_MAP[name];
                      return IC ? <IC size={14} fill={isFilledIcon(name) ? "currentColor" : "none"} /> : null;
                    })() : note.icon}
                  </span>
                )}
                <span className="text-sm font-medium text-foreground truncate">
                  {title}
                </span>
                {note.is_pinned && (
                  <Pin size={11} className="shrink-0 text-muted-foreground" />
                )}
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground shrink-0">
              {date}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Grid view: cards with a color bar and content preview.
 * Single click toggles selection; double click opens the note.
 *
 * @param notes - Notes to display
 * @param selectedIds - Currently selected note IDs
 * @param onSelect - Toggle selection for a note ID
 * @param onOpen - Open a note in the editor
 */
export function GridView({ notes, selectedIds, onSelect, onOpen }: ViewProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {notes.map((note) => {
        const title = note.title || "Untitled";
        const hasContent = extractTextPreview(note.content, 1).length > 0;
        const date = formatRelativeDate(note.updated_at);
        const selected = selectedIds.has(note.id);

        return (
          <button
            key={note.id}
            data-note-id={note.id}
            onClick={(e) => onSelect(note.id, e.shiftKey)}
            onDoubleClick={() => onOpen(note)}
            className={`rounded-xl border text-left transition-all overflow-hidden ${
              selected
                ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30"
                : "border-border bg-popover hover:shadow-md dark:hover:shadow-black/20 hover:border-border/80"
            }`}
          >
            {hasContent ? (
              <NoteContentPreview content={note.content} />
            ) : (
              <div className="h-36 flex items-center justify-center">
                <p className="text-[10px] text-muted-foreground/40 italic">Empty note</p>
              </div>
            )}
            <div className="px-2.5 py-1.5 border-t border-border">
              <div className="flex items-center gap-1">
                {note.icon && (
                  <span className="text-xs shrink-0">
                    {note.icon.startsWith("lucide:") ? (() => {
                      const name = note.icon!.slice(7);
                      const IC = LUCIDE_ICON_MAP[name];
                      return IC ? <IC size={12} fill={isFilledIcon(name) ? "currentColor" : "none"} /> : null;
                    })() : note.icon}
                  </span>
                )}
                <span className="text-xs font-medium text-foreground truncate flex-1">
                  {title}
                </span>
                {note.is_pinned && (
                  <Pin size={10} className="shrink-0 text-muted-foreground" />
                )}
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5">{date}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Formats a timestamp into a human-readable relative string.
 *
 * @param iso - ISO timestamp string
 * @returns Relative date string like "Just now", "5m ago", "Yesterday"
 */
export function formatRelativeDate(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60_000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
