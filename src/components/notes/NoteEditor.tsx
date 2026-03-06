"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import UnderlineExt from "@tiptap/extension-underline";
import { ChevronLeft, Pin, PinOff, Printer, Trash2, Smile } from "lucide-react";
import NoteEditorToolbar from "./NoteEditorToolbar";
import ImageBubbleMenu from "./ImageBubbleMenu";
import ResizableImage from "./ResizableImageExtension";
import EmojiPicker from "@/components/home/EmojiPicker";
import { uploadNoteImage } from "@/lib/upload-note-image";
import { extractFirstLine } from "@/lib/notes-utils";
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
 * Full-screen Notion-style note editor.
 * Centered layout with large title, divider, toolbar, and Tiptap editor.
 * Saves content and title after 500ms of inactivity.
 *
 * @param note - The note being edited
 * @param onUpdate - Callback to persist note changes
 * @param onDelete - Callback to delete the note
 * @param onBack - Navigate back to notes list
 */
export default function NoteEditor({ note, onUpdate, onDelete, onBack }: Props) {
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const noteIdRef = useRef(note.id);
  const [showIconPicker, setShowIconPicker] = useState(false);

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
      ResizableImage.configure({ inline: false, allowBase64: false }),
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
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px]",
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        for (const file of files) {
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
    },
    immediatelyRender: true,
  });

  // Reset editor content when switching notes
  useEffect(() => {
    if (editor && note.id !== noteIdRef.current) {
      noteIdRef.current = note.id;
      editor.commands.setContent(note.content as Record<string, unknown>);
      if (titleRef.current) {
        titleRef.current.value = note.title;
        autoResizeTitle();
      }
    }
  }, [note.id, note.content, note.title, editor]);

  // Set initial title value
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.value = note.title;
      autoResizeTitle();
    }
  }, [note.title]);

  // Cleanup save timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  /**
   * Uploads an image file and inserts it into the editor at the current cursor position.
   *
   * @param file - The image File to upload.
   */
  async function handleImageUpload(file: File) {
    if (!editor) return;
    const src = await uploadNoteImage(file, noteIdRef.current);
    if (src) {
      editor.chain().focus().setImage({ src }).run();
    }
  }

  /**
   * Opens a file picker for image insertion via the toolbar button.
   */
  function handleInsertImageClick() {
    fileInputRef.current?.click();
  }

  /**
   * Handles file input change from the hidden image picker.
   */
  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = "";
  }

  /**
   * Auto-resizes the title textarea to fit its content.
   */
  function autoResizeTitle() {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  /**
   * Handles title input changes with debounced save.
   */
  function handleTitleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    autoResizeTitle();
    scheduleSave({ title: e.target.value });
  }

  /**
   * Moves focus from title to editor on Enter key.
   */
  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      editor?.commands.focus("start");
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      {/* Slim top bar with back / pin / delete */}
      <div className="note-top-bar flex items-center justify-between shrink-0 mb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to notes"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdate(note.id, { is_pinned: !note.is_pinned })}
            title={note.is_pinned ? "Unpin" : "Pin"}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {note.is_pinned ? <PinOff size={16} /> : <Pin size={16} />}
          </button>
          <button
            onClick={() => window.print()}
            title="Print"
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Printer size={16} />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            title="Delete note"
            className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable content area — centered like Notion */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 pt-8 pb-20">
          {/* Icon + Title */}
          <div className="group/title">
            {note.icon && !note.icon.startsWith("lucide:") ? (
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setShowIconPicker(true)}
                  className="note-icon-print text-4xl hover:opacity-80 transition-opacity cursor-pointer"
                  title="Change icon"
                >
                  {note.icon}
                </button>
                <button
                  onClick={() => onUpdate(noteIdRef.current, { icon: null })}
                  className="note-icon-add text-xs text-muted-foreground/50 hover:text-muted-foreground opacity-0 group-hover/title:opacity-100 transition-opacity"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowIconPicker(true)}
                className="note-icon-add flex items-center gap-1.5 text-sm text-muted-foreground/50 hover:text-muted-foreground mb-2 opacity-0 group-hover/title:opacity-100 transition-opacity cursor-pointer"
              >
                <Smile size={16} />
                <span>Add icon</span>
              </button>
            )}
            <textarea
              ref={titleRef}
              defaultValue={note.title}
              onChange={handleTitleChange}
              onKeyDown={handleTitleKeyDown}
              placeholder="Untitled"
              rows={1}
              className="note-title-print w-full text-3xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 resize-none overflow-hidden leading-tight"
            />
          </div>
          <EmojiPicker
            open={showIconPicker}
            onSelect={(icon) => {
              // Only accept actual emojis, not Lucide icon references
              if (icon.startsWith("lucide:")) return;
              onUpdate(noteIdRef.current, { icon });
            }}
            onClose={() => setShowIconPicker(false)}
          />

          {/* Divider */}
          <div className="note-divider border-t border-border mt-3 mb-4" />

          {/* Toolbar */}
          <div className="note-toolbar">
            <NoteEditorToolbar editor={editor} onInsertImage={handleInsertImageClick} />
          </div>

          {/* Editor content */}
          <div className="mt-2">
            <EditorContent editor={editor} />
            {editor && <ImageBubbleMenu editor={editor} />}
          </div>
        </div>
      </div>
    </div>
  );
}

