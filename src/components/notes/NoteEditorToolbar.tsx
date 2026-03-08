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
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

interface TitleStyle {
  fontFamily: string;
  fontSize: string;
}

interface Props {
  editor: Editor | null;
  onInsertImage?: () => void;
  titleFocused?: boolean;
  titleStyle?: TitleStyle;
  onTitleStyleChange?: (style: TitleStyle) => void;
}

/**
 * Formatting toolbar for the Tiptap editor.
 * Provides buttons for text formatting, headings, lists, and undo/redo.
 * Re-renders on every editor transaction so active states stay in sync.
 *
 * @param editor - Tiptap editor instance (null while loading)
 */
export default function NoteEditorToolbar({ editor, onInsertImage, titleFocused, titleStyle, onTitleStyleChange }: Props) {
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

  const fontFamilies = [
    { label: "Sans", value: "" },
    { label: "Serif", value: "Georgia, serif" },
    { label: "Mono", value: "monospace" },
  ];

  const fontSizes = ["10px", "12px", "13px", "14px", "16px", "18px", "24px", "30px", "36px"];

  const editorFamily = (editor.getAttributes("textStyle").fontFamily as string) || "";
  const explicitSize = (editor.getAttributes("textStyle").fontSize as string) || "";

  /** Derive effective font size from node type when no explicit fontSize mark is set. */
  const editorSize = explicitSize
    || (editor.isActive("heading", { level: 1 }) ? "30px"
    : editor.isActive("heading", { level: 2 }) ? "24px"
    : editor.isActive("heading", { level: 3 }) ? "18px"
    : "14px");
  const currentFamily = titleFocused ? (titleStyle?.fontFamily || "") : editorFamily;
  const currentSize = titleFocused ? (titleStyle?.fontSize || "24px") : editorSize;

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
  ];

  const alignButtons: Array<{
    icon: typeof AlignLeft;
    label: string;
    action: () => void;
    isActive: boolean;
  }> = [
    {
      icon: AlignLeft,
      label: "Align left",
      action: () => editor.chain().focus().setTextAlign("left").run(),
      isActive: editor.isActive({ textAlign: "left" }),
    },
    {
      icon: AlignCenter,
      label: "Align center",
      action: () => editor.chain().focus().setTextAlign("center").run(),
      isActive: editor.isActive({ textAlign: "center" }),
    },
    {
      icon: AlignRight,
      label: "Align right",
      action: () => editor.chain().focus().setTextAlign("right").run(),
      isActive: editor.isActive({ textAlign: "right" }),
    },
  ];

  const miscButtons: Array<{
    icon: typeof ImagePlus;
    label: string;
    action: () => void;
    isActive: boolean;
  }> = [
    {
      icon: ImagePlus,
      label: "Image (drag, paste, or click)",
      action: () => onInsertImage?.(),
      isActive: false,
    },
  ];

  return (
    <div className="flex items-center gap-0.5 py-1.5 overflow-x-auto">
      {/* Font family dropdown */}
      <select
        value={currentFamily}
        onChange={(e) => {
          const val = e.target.value;
          if (titleFocused && onTitleStyleChange && titleStyle) {
            onTitleStyleChange({ ...titleStyle, fontFamily: val });
          } else if (val) {
            editor.chain().focus().setFontFamily(val).run();
          } else {
            editor.chain().focus().unsetFontFamily().run();
          }
        }}
        title="Font family"
        className="h-7 px-1.5 text-xs rounded border border-border/50 bg-transparent text-foreground hover:bg-accent transition-colors cursor-pointer outline-none max-w-[80px]"
      >
        {fontFamilies.map((f) => (
          <option key={f.label} value={f.value}>{f.label}</option>
        ))}
      </select>

      {/* Font size dropdown */}
      <select
        value={currentSize}
        onChange={(e) => {
          const val = e.target.value;
          if (titleFocused && onTitleStyleChange && titleStyle) {
            onTitleStyleChange({ ...titleStyle, fontSize: val });
          } else if (val) {
            editor.chain().focus().setFontSize(val).run();
          } else {
            editor.chain().focus().unsetFontSize().run();
          }
        }}
        title="Font size"
        className="h-7 px-1.5 text-xs rounded border border-border/50 bg-transparent text-foreground hover:bg-accent transition-colors cursor-pointer outline-none w-[52px]"
      >
        {fontSizes.map((s) => (
          <option key={s} value={s}>{parseInt(s)}</option>
        ))}
      </select>

      <div className="w-px h-5 bg-border mx-1" />

      {buttons.map((btn) => {
        const Icon = btn.icon;
        return (
          <button
            key={btn.label}
            onClick={btn.action}
            title={btn.label}
            aria-label={btn.label}
            className={`p-2 rounded transition-colors active:scale-95 ${
              btn.isActive
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <Icon size={16} />
          </button>
        );
      })}

      <div className="w-px h-5 bg-border mx-1" />

      {alignButtons.map((btn) => {
        const Icon = btn.icon;
        return (
          <button
            key={btn.label}
            onClick={btn.action}
            title={btn.label}
            aria-label={btn.label}
            className={`p-2 rounded transition-colors active:scale-95 ${
              btn.isActive
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <Icon size={16} />
          </button>
        );
      })}

      <div className="w-px h-5 bg-border mx-1" />

      {miscButtons.map((btn) => {
        const Icon = btn.icon;
        return (
          <button
            key={btn.label}
            onClick={btn.action}
            title={btn.label}
            aria-label={btn.label}
            className={`p-2 rounded transition-colors active:scale-95 ${
              btn.isActive
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
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
        aria-label="Undo"
        className="p-2 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Undo2 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
        aria-label="Redo"
        className="p-2 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Redo2 size={16} />
      </button>
    </div>
  );
}
