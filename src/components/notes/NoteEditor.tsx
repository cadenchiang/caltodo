"use client";

import { useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import UnderlineExt from "@tiptap/extension-underline";
import { ChevronLeft, Pin, PinOff, Trash2 } from "lucide-react";
import NoteEditorToolbar from "./NoteEditorToolbar";
import type { Note, NoteUpdate } from "@/lib/types";

interface Props {
  note: Note;
  onUpdate: (id: string, updates: NoteUpdate) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

/** Auto-save debounce delay in ms. */
const SAVE_DELAY = 500;

/**
 * Full-screen Tiptap rich text editor with title input and auto-save.
 * Saves content and title after 500ms of inactivity.
 *
 * @param note - The note being edited
 * @param onUpdate - Callback to persist note changes
 * @param onDelete - Callback to delete the note
 * @param onBack - Navigate back to notes list
 */
export default function NoteEditor({ note, onUpdate, onDelete, onBack }: Props) {
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const noteIdRef = useRef(note.id);

  /**
   * Schedules a debounced save for content and title.
   */
  const scheduleSave = useCallback(
    (updates: NoteUpdate) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        onUpdate(noteIdRef.current, updates);
      }, SAVE_DELAY);
    },
    [onUpdate]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      TaskList,
      TaskItem.configure({ nested: true }),
      UnderlineExt,
    ],
    content: note.content as Record<string, unknown>,
    onUpdate: ({ editor: ed }) => {
      const content = ed.getJSON() as Record<string, unknown>;
      const updates: NoteUpdate = { content };

      // Auto-title from first text line if title is empty
      if (titleRef.current && !titleRef.current.value.trim()) {
        const firstText = extractFirstLine(content);
        if (firstText) {
          updates.title = firstText;
        }
      }

      scheduleSave(updates);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3",
      },
    },
    immediatelyRender: false,
  });

  // Reset editor content when switching notes
  useEffect(() => {
    if (editor && note.id !== noteIdRef.current) {
      noteIdRef.current = note.id;
      editor.commands.setContent(note.content as Record<string, unknown>);
      if (titleRef.current) {
        titleRef.current.value = note.title;
      }
    }
  }, [note.id, note.content, note.title, editor]);

  // Set initial title value
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.value = note.title;
    }
  }, [note.title]);

  // Cleanup save timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  /**
   * Handles title input changes with debounced save.
   */
  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    scheduleSave({ title: e.target.value });
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to notes"
        >
          <ChevronLeft size={20} />
        </button>
        <input
          ref={titleRef}
          defaultValue={note.title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          className="flex-1 text-xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
        />
        <button
          onClick={() => onUpdate(note.id, { is_pinned: !note.is_pinned })}
          title={note.is_pinned ? "Unpin" : "Pin"}
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          {note.is_pinned ? <PinOff size={16} /> : <Pin size={16} />}
        </button>
        <button
          onClick={() => onDelete(note.id)}
          title="Delete note"
          className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Editor card */}
      <div className="flex-1 overflow-hidden rounded-xl border border-border bg-popover flex flex-col">
        <NoteEditorToolbar editor={editor} />
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

/**
 * Extracts the first non-empty text line from Tiptap JSON content.
 *
 * @param content - Tiptap document JSON
 * @returns First text string found, or empty string
 */
function extractFirstLine(content: Record<string, unknown>): string {
  if (!Array.isArray(content.content)) return "";
  for (const node of content.content) {
    const n = node as Record<string, unknown>;
    if (Array.isArray(n.content)) {
      for (const child of n.content) {
        const c = child as Record<string, unknown>;
        if (c.type === "text" && typeof c.text === "string" && c.text.trim()) {
          return c.text.trim().slice(0, 100);
        }
      }
    }
  }
  return "";
}
