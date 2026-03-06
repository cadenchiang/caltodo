"use client";

import { LUCIDE_ICON_MAP, isFilledIcon } from "@/components/home/emoji-picker-data";
import { extractTextPreview } from "@/lib/notes-utils";
import NoteContentPreview from "./NoteContentPreview";
import { formatRelativeDate } from "./NotesModalViews";
import { Pin } from "lucide-react";
import type { Note } from "@/lib/types";

type ViewMode = "grid" | "list";

interface Props {
  notes: Note[];
  viewMode: ViewMode;
  onOpenNote: (note: Note) => void;
  /** Map of course_id to folder name for displaying folder labels. */
  folderNames: Record<string, string>;
}

/**
 * Displays recent notes below the folder grid on the notes home page.
 * Supports grid (document card) and list (compact row) views.
 *
 * @param notes - Recent notes to display
 * @param viewMode - "grid" or "list"
 * @param onOpenNote - Callback when a note is clicked
 * @param folderNames - Map of course_id to folder label
 */
export default function RecentNotes({ notes, viewMode, onOpenNote, folderNames }: Props) {
  if (notes.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-sm font-medium text-muted-foreground mb-3">Recent documents</h2>
      {viewMode === "grid" ? (
        <RecentGrid notes={notes} onOpenNote={onOpenNote} folderNames={folderNames} />
      ) : (
        <RecentList notes={notes} onOpenNote={onOpenNote} folderNames={folderNames} />
      )}
    </div>
  );
}

/**
 * Grid view: tall document cards with content preview, like Google Docs.
 */
function RecentGrid({ notes, onOpenNote, folderNames }: Omit<Props, "viewMode">) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {notes.map((note) => {
        const title = note.title || "Untitled";
        const hasContent = extractTextPreview(note.content, 1).length > 0;
        const date = formatRelativeDate(note.updated_at);
        const folder = note.course_id ? folderNames[note.course_id] : "General";

        return (
          <button
            key={note.id}
            onClick={() => onOpenNote(note)}
            className="rounded-xl border border-border bg-popover text-left transition-all overflow-hidden hover:shadow-md dark:hover:shadow-black/20 hover:border-border/80"
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
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] text-muted-foreground">{date}</span>
                {folder && (
                  <>
                    <span className="text-[9px] text-muted-foreground/40">·</span>
                    <span className="text-[9px] text-muted-foreground truncate">{folder}</span>
                  </>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/**
 * List view: compact rows with title, folder, and date.
 */
function RecentList({ notes, onOpenNote, folderNames }: Omit<Props, "viewMode">) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-popover">
      {notes.map((note, i) => {
        const title = note.title || "Untitled";
        const date = formatRelativeDate(note.updated_at);
        const folder = note.course_id ? folderNames[note.course_id] : "General";

        return (
          <button
            key={note.id}
            onClick={() => onOpenNote(note)}
            className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 hover:bg-accent/50 ${
              i < notes.length - 1 ? "border-b border-border" : ""
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
            {folder && (
              <span className="text-[11px] text-muted-foreground shrink-0">{folder}</span>
            )}
            <span className="text-[11px] text-muted-foreground shrink-0">{date}</span>
          </button>
        );
      })}
    </div>
  );
}
