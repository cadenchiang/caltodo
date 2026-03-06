"use client";

import { Pin } from "lucide-react";
import { extractTextPreview } from "@/lib/notes-utils";
import type { Note } from "@/lib/types";

/**
 * List view: compact rows with title, preview, and date.
 *
 * @param notes - Notes to display
 * @param onSelect - Callback when a note row is clicked
 */
export function ListView({ notes, onSelect }: { notes: Note[]; onSelect: (n: Note) => void }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-popover">
      {notes.map((note, i) => {
        const title = note.title || "Untitled";
        const preview = extractTextPreview(note.content, 80);
        const date = formatRelativeDate(note.updated_at);

        return (
          <button
            key={note.id}
            onClick={() => onSelect(note)}
            className={`w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors flex items-center gap-3 ${
              i < notes.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground truncate">
                  {title}
                </span>
                {note.is_pinned && (
                  <Pin size={11} className="shrink-0 text-muted-foreground" />
                )}
              </div>
              {preview && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {preview}
                </p>
              )}
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
 *
 * @param notes - Notes to display
 * @param onSelect - Callback when a note card is clicked
 */
export function GridView({ notes, onSelect }: { notes: Note[]; onSelect: (n: Note) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {notes.map((note) => {
        const title = note.title || "Untitled";
        const preview = extractTextPreview(note.content, 100);
        const date = formatRelativeDate(note.updated_at);

        return (
          <button
            key={note.id}
            onClick={() => onSelect(note)}
            className="rounded-xl border border-border bg-popover text-left transition-all hover:shadow-md dark:hover:shadow-black/20 hover:border-border/80 overflow-hidden"
          >
            <div className="h-2 bg-muted" />
            <div className="px-3 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm font-semibold text-foreground truncate flex-1">
                  {title}
                </span>
                {note.is_pinned && (
                  <Pin size={11} className="shrink-0 text-muted-foreground" />
                )}
              </div>
              {preview ? (
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {preview}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground/50 italic">Empty note</p>
              )}
              <p className="text-[10px] text-muted-foreground mt-2">{date}</p>
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
