"use client";

import { useState, useEffect, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code,
  ImagePlus,
  Undo2,
  Redo2,
} from "lucide-react";

interface Props {
  editor: Editor | null;
  onInsertImage?: () => void;
}

/**
 * Formatting toolbar for the Tiptap editor.
 * Provides buttons for text formatting, headings, lists, and undo/redo.
 * Re-renders on every editor transaction so active states stay in sync.
 *
 * @param editor - Tiptap editor instance (null while loading)
 */
export default function NoteEditorToolbar({ editor, onInsertImage }: Props) {
  // Force re-render on every editor transaction so isActive() stays accurate
  const [, setTick] = useState(0);
  const bump = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!editor) return;
    editor.on("transaction", bump);
    return () => { editor.off("transaction", bump); };
  }, [editor, bump]);

  if (!editor) return null;

  const mod = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent) ? "\u2318" : "Ctrl+";

  const buttons: Array<{
    icon: typeof Bold;
    label: string;
    action: () => void;
    isActive: boolean;
  }> = [
    {
      icon: Bold,
      label: `Bold (${mod}B)`,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
    },
    {
      icon: Italic,
      label: `Italic (${mod}I)`,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
    },
    {
      icon: Underline,
      label: `Underline (${mod}U)`,
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive("underline"),
    },
    {
      icon: Strikethrough,
      label: `Strikethrough (${mod}Shift+X)`,
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive("strike"),
    },
    {
      icon: Heading1,
      label: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive("heading", { level: 1 }),
    },
    {
      icon: Heading2,
      label: "Heading 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: List,
      label: "Bullet list",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      label: "Ordered list",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
    {
      icon: ListChecks,
      label: "Checklist",
      action: () => editor.chain().focus().toggleTaskList().run(),
      isActive: editor.isActive("taskList"),
    },
    {
      icon: Quote,
      label: "Blockquote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
    },
    {
      icon: Code,
      label: "Code block",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive("codeBlock"),
    },
    {
      icon: ImagePlus,
      label: "Image (drag, paste, or click)",
      action: () => onInsertImage?.(),
      isActive: false,
    },
  ];

  return (
    <div className="flex items-center gap-0.5 py-1.5 overflow-x-auto -ml-1.5">
      {buttons.map((btn) => {
        const Icon = btn.icon;
        return (
          <button
            key={btn.label}
            onClick={btn.action}
            title={btn.label}
            className={`p-2 rounded transition-colors active:scale-95 ${
              btn.isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            <Icon size={16} />
          </button>
        );
      })}

      <div className="w-px h-5 bg-border mx-1" />

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
        className="p-2 rounded text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Undo2 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
        className="p-2 rounded text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Redo2 size={16} />
      </button>
    </div>
  );
}
