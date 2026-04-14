"use client";

import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import UnderlineExt from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import FontSize from "./FontSizeExtension";
import { Check, ChevronLeft, Folder, Printer, Trash2, Smile, Upload } from "lucide-react";
import NoteEditorToolbar from "./NoteEditorToolbar";
import ImageBubbleMenu from "./ImageBubbleMenu";
import ResizableImage from "./ResizableImageExtension";
const EmojiPicker = lazy(() => import("@/components/home/EmojiPicker"));
import { LUCIDE_ICON_MAP, isFilledIcon } from "@/components/home/emoji-picker-data";
import { uploadNoteImage } from "@/lib/upload-note-image";
import { extractFirstLine } from "@/lib/notes-utils";
import DeleteNoteConfirmModal from "./DeleteNoteConfirmModal";
import { useToast } from "@/contexts/ToastContext";

const SubmitToCanvasModal = lazy(() => import("./SubmitToCanvasModal"));
import { createPortal } from "react-dom";
import type { Note, NoteUpdate } from "@/lib/types";

/** Skeleton shown while the SubmitToCanvasModal chunk loads. */
function CanvasModalSkeleton({ onClose }: { onClose: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in" onClick={onClose} />
      <div className="relative bg-popover border border-border rounded-2xl w-full max-w-2xl mx-4 animate-announce-card-in overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="h-5 w-48 bg-muted rounded animate-pulse" />
          <div className="h-5 w-5 bg-muted rounded animate-pulse" />
        </div>
        <div className="p-6 space-y-4">
          <div className="h-9 w-full bg-muted rounded-xl animate-pulse" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-14 w-full bg-muted rounded-xl animate-pulse" />
            <div className="h-14 w-full bg-muted rounded-xl animate-pulse" />
            <div className="h-14 w-full bg-muted rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

interface FolderOption {
  id: string;
  label: string;
}

interface Props {
  note: Note;
  folderLabel: string;
  folders: FolderOption[];
  currentFolderId: string;
  onMoveToFolder: (folderId: string) => void;
  onUpdate: (id: string, updates: NoteUpdate) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  /** External error signal (e.g. from useNotes) to show save error state. */
  saveError?: string | null;
}

/** Auto-save debounce delay in ms. */
const SAVE_DELAY = 500;

/**
 * Full-screen note editor with Google Docs layout.
 * Gray background with a centered white page card.
 * Toolbar and breadcrumb are always visible (Google Docs standard).
 *
 * @param note - The note being edited
 * @param onUpdate - Callback to persist note changes
 * @param onDelete - Callback to delete the note
 * @param onBack - Navigate back to notes list
 */
export default function NoteEditor({ note, folderLabel, folders, currentFolderId, onMoveToFolder, onUpdate, onDelete, onBack, saveError }: Props) {
  const { showToast } = useToast();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdatesRef = useRef<NoteUpdate | null>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const noteIdRef = useRef(note.id);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCanvasSubmit, setShowCanvasSubmit] = useState(false);
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [titleStyle, setTitleStyle] = useState({ fontFamily: "", fontSize: "" });
  const [extraPages, setExtraPages] = useState(0);
  const [showHeading, setShowHeading] = useState(
    () => !!(note.content as Record<string, unknown>)?.pageHeading
  );
  const [headingText, setHeadingText] = useState(
    () => ((note.content as Record<string, unknown>)?.pageHeading as string) || ""
  );
  const [editingHeading, setEditingHeading] = useState(false);
  /** Save indicator: "idle" = no indicator, "saving" = fade out, "saved" = show checkmark, "error" = save failed. */
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headingRef = useRef<HTMLInputElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const folderMenuRef = useRef<HTMLDivElement>(null);

  /** Ref to track latest heading for merging into content saves. */
  const headingTextRef = useRef(headingText);
  headingTextRef.current = headingText;

  /**
   * Schedules a debounced save for content and title.
   * Merges pageHeading into the content JSON so it persists.
   */
  const scheduleSave = useCallback(
    (updates: NoteUpdate) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      setSaveState("saving");
      // Merge heading into content if content is being saved
      if (updates.content) {
        const content = updates.content as Record<string, unknown>;
        if (headingTextRef.current) {
          content.pageHeading = headingTextRef.current;
        } else {
          delete content.pageHeading;
        }
      }
      pendingUpdatesRef.current = updates;
      saveTimerRef.current = setTimeout(() => {
        onUpdate(noteIdRef.current, updates);
        pendingUpdatesRef.current = null;
        setSaveState("saved");
        savedTimerRef.current = setTimeout(() => setSaveState("idle"), 2000);
      }, SAVE_DELAY);
    },
    [onUpdate]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      TaskList,
      TaskItem.configure({ nested: true }),
      UnderlineExt,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      FontFamily,
      FontSize,
      ResizableImage.configure({ inline: false, allowBase64: false }),
    ],
    content: note.content as Record<string, unknown>,
    onUpdate: ({ editor: ed }) => {
      const content = ed.getJSON() as Record<string, unknown>;
      const updates: NoteUpdate = { content };
      if (titleRef.current && !titleRef.current.value.trim()) {
        const firstText = extractFirstLine(content);
        if (firstText) updates.title = firstText;
      }
      scheduleSave(updates);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[40vh]",
        style: "font-size: 14px;",
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

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.value = note.title;
      autoResizeTitle();
    }
  }, [note.title]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      if (pendingUpdatesRef.current) {
        onUpdate(noteIdRef.current, pendingUpdatesRef.current);
        pendingUpdatesRef.current = null;
      }
    };
  }, [onUpdate]);

  // Watch external save error signal to flip indicator to error state
  useEffect(() => {
    if (saveError) setSaveState("error");
  }, [saveError]);

  /** Intercept Cmd/Ctrl+P to use custom print instead of browser default. */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        handlePrint();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editor]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Recalculate extra pages when content overflows the first page. */
  useEffect(() => {
    if (!editor || !pageRef.current) return;
    const PAGE_HEIGHT = 1056;
    function recalc() {
      if (!pageRef.current) return;
      const scrollH = pageRef.current.scrollHeight;
      const needed = Math.max(0, Math.ceil(scrollH / PAGE_HEIGHT) - 1);
      setExtraPages((prev) => (prev !== needed ? needed : prev));
    }
    recalc();
    editor.on("update", recalc);
    const observer = new ResizeObserver(recalc);
    observer.observe(pageRef.current);
    return () => {
      editor.off("update", recalc);
      observer.disconnect();
    };
  }, [editor]);

  useEffect(() => {
    if (!showFolderMenu) return;
    function handleClick(e: MouseEvent) {
      if (folderMenuRef.current && !folderMenuRef.current.contains(e.target as Node)) {
        setShowFolderMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showFolderMenu]);

  async function handleImageUpload(file: File) {
    if (!editor) return;
    const src = await uploadNoteImage(file, noteIdRef.current);
    if (src) {
      editor.chain().focus().setImage({ src }).run();
    } else {
      showToast("Image upload failed");
    }
  }

  function handleInsertImageClick() {
    fileInputRef.current?.click();
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = "";
  }

  /** Save heading change by triggering a content save with the heading merged in. */
  function handleHeadingChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setHeadingText(val);
    headingTextRef.current = val;
    if (editor) {
      const content = editor.getJSON() as Record<string, unknown>;
      if (val) {
        content.pageHeading = val;
      } else {
        delete content.pageHeading;
      }
      scheduleSave({ content });
    }
  }

  /** Exit editing mode on blur. Remove heading if empty. */
  function handleHeadingBlur() {
    setEditingHeading(false);
    if (!headingText.trim()) {
      setShowHeading(false);
      setHeadingText("");
      headingTextRef.current = "";
      if (editor) {
        const content = editor.getJSON() as Record<string, unknown>;
        delete content.pageHeading;
        scheduleSave({ content });
      }
    }
  }

  function autoResizeTitle() {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    autoResizeTitle();
    scheduleSave({ title: e.target.value });
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      editor?.commands.focus("start");
    }
  }

  /** Click on empty page area focuses the editor at the end. */
  function handlePageClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest(".ProseMirror") || target.closest("textarea") || target.closest("button") || target.closest("[data-heading]") || target.closest("input")) return;
    editor?.commands.focus("end");
  }

  /**
   * Prints note by injecting content at the body root and using window.print().
   * Content inside position:fixed containers doesn't print in browsers,
   * so we temporarily inject a plain div at <body> root level that the
   * browser can see, hide everything else via @media print, then clean up.
   */
  function handlePrint() {
    if (!editor) return;
    const title = titleRef.current?.value || note.title || "Untitled";
    const editorHtml = editor.getHTML();
    const escapedTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Clean up any previous print artifacts
    document.getElementById("note-print-container")?.remove();
    document.getElementById("note-print-style")?.remove();

    // 1. Inject print-only content at body root (outside all fixed containers)
    const container = document.createElement("div");
    container.id = "note-print-container";
    const escapedHeading = headingTextRef.current
      ? headingTextRef.current.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      : "";
    container.innerHTML = `
      ${escapedHeading ? `<div style="font-size:10px;color:#888;margin:0 0 12px 0;padding-bottom:8px;border-bottom:1px dashed #ddd;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${escapedHeading}</div>` : ""}
      <h1 style="font-size:24px;font-weight:700;margin:0 0 16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;">${escapedTitle}</h1>
      <div style="font-size:14px;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;">${editorHtml}</div>
    `;
    // Hidden on screen, visible only in print
    container.style.cssText = "display:none;";
    document.body.appendChild(container);

    // 2. Inject print styles that hide everything except our container
    const style = document.createElement("style");
    style.id = "note-print-style";
    style.textContent = `
      @media print {
        @page { margin: 0; }
        body > *:not(#note-print-container) { display: none !important; }
        #note-print-container {
          display: block !important;
          position: static !important;
          width: 100% !important;
          overflow: visible !important;
          padding: 0.75in;
        }
        #note-print-container h1, #note-print-container h2, #note-print-container h3,
        #note-print-container p, #note-print-container ul, #note-print-container ol,
        #note-print-container blockquote, #note-print-container pre,
        #note-print-container div, #note-print-container img, #note-print-container hr,
        #note-print-container li, #note-print-container span, #note-print-container a,
        #note-print-container code, #note-print-container label, #note-print-container input {
          visibility: visible !important;
          color: inherit;
        }
        #note-print-container ul:not([data-type="taskList"]) { list-style: disc; padding-left: 1.5em; }
        #note-print-container ol { list-style: decimal; padding-left: 1.5em; }
        #note-print-container ul[data-type="taskList"] { list-style: none; padding-left: 0; }
        #note-print-container blockquote { border-left: 3px solid #333; padding-left: 1em; margin-left: 0; }
        #note-print-container pre { background: #f5f5f5; border: 1px solid #ddd; border-radius: 6px; padding: 12px; }
        #note-print-container code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-size: 0.875em; }
        #note-print-container pre code { background: none; padding: 0; }
        #note-print-container img { max-width: 100%; page-break-inside: avoid; }
        #note-print-container hr { border: none; border-top: 1px solid #ccc; margin: 1.5em 0; }
      }
    `;
    document.head.appendChild(style);

    // 3. Print, then clean up
    window.print();

    // Cleanup after print dialog closes
    container.remove();
    style.remove();
  }

  return (
    <div className="note-editor-root fixed top-0 right-0 bottom-0 left-0 md:left-52 z-[35] flex flex-col overflow-hidden bg-muted/50 dark:bg-neutral-900/50">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Menu bar — always visible, white background like Google Docs */}
      <div className="note-top-bar shrink-0 bg-background border-b border-border/40">
        {/* Breadcrumb + actions row */}
        <div className="flex items-center justify-between px-4 md:px-6 py-1.5">
          <div className="flex items-center gap-1 text-sm text-foreground">
            <button
              onClick={onBack}
              className="flex items-center gap-1 hover:text-foreground/70 transition-colors"
              aria-label="Back to notes"
            >
              <ChevronLeft size={18} />
              <span className="hidden sm:inline font-medium">Back</span>
            </button>
            <span className="text-foreground/30 mx-1">/</span>
            <div className="relative" ref={folderMenuRef}>
              <button
                onClick={() => setShowFolderMenu((v) => !v)}
                className="flex items-center gap-1.5 text-foreground hover:text-foreground/70 transition-colors max-w-[200px] cursor-pointer"
                aria-label="Move to folder"
                title="Move to folder"
              >
                <Folder size={14} fill="currentColor" className="shrink-0 text-foreground" />
                <span className="truncate font-medium" title={folderLabel}>{folderLabel}</span>
              </button>
              {showFolderMenu && (
                <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-popover border border-border rounded-xl shadow-lg z-50 py-1">
                  {folders.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        if (f.id !== currentFolderId) onMoveToFolder(f.id);
                        setShowFolderMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
                    >
                      <Folder size={14} fill="currentColor" className="shrink-0 text-muted-foreground" />
                      <span className="truncate flex-1">{f.label}</span>
                      {f.id === currentFolderId && (
                        <Check size={14} className="shrink-0 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {/* Save indicator — subtle checkmark that appears after save, fades on typing */}
            {saveState === "error" ? (
              <span className="text-[11px] text-red-500 flex items-center gap-1 mr-1">
                Not saved
              </span>
            ) : (
              <span
                className={`text-[11px] text-muted-foreground/60 flex items-center gap-1 mr-1 transition-opacity duration-300 ${
                  saveState === "saved" ? "opacity-100" : "opacity-0"
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            )}
            <button
              onClick={() => setShowCanvasSubmit(true)}
              title="Submit to Canvas"
              aria-label="Submit to Canvas"
              className="p-1.5 text-foreground hover:text-foreground/70 transition-colors"
            >
              <Upload size={16} />
            </button>
            <button
              onClick={handlePrint}
              title="Print"
              aria-label="Print note"
              className="p-1.5 text-foreground hover:text-foreground/70 transition-colors"
            >
              <Printer size={16} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete note"
              aria-label="Delete note"
              className="p-1.5 text-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Formatting toolbar row */}
        <div className="note-toolbar px-4 md:px-6 border-t border-border/20">
          <NoteEditorToolbar
            editor={editor}
            onInsertImage={handleInsertImageClick}
            titleFocused={titleFocused}
            titleStyle={titleStyle}
            onTitleStyleChange={setTitleStyle}
          />
        </div>
      </div>

      {/* Scrollable content — gray bg with white page cards */}
      <div className="note-editor-scroll flex-1 overflow-y-auto px-4 md:px-8">
        <div className="max-w-3xl my-6 mx-auto md:-translate-x-[104px]">
          {/* White page card — content flows naturally, min 1 page tall */}
          <div
            ref={pageRef}
            className="note-page bg-background rounded-sm shadow-sm border border-border/30 px-8 md:px-14 py-12 min-h-[1056px] cursor-text"
            onClick={handlePageClick}
          >
            {/* Page heading — fixed-height zone at top of page, never shifts layout */}
            <div data-heading className="-mt-8 h-6 flex items-center">
              {showHeading ? (
                editingHeading ? (
                  <input
                    ref={headingRef}
                    type="text"
                    value={headingText}
                    onChange={handleHeadingChange}
                    onBlur={handleHeadingBlur}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleHeadingBlur(); } }}
                    placeholder="Heading"
                    autoFocus
                    className="w-full text-xs text-muted-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/40 h-6 leading-6"
                  />
                ) : (
                  <p
                    onDoubleClick={() => {
                      setEditingHeading(true);
                      setTimeout(() => headingRef.current?.focus(), 0);
                    }}
                    className="text-xs text-muted-foreground cursor-default select-none h-6 leading-6"
                    title="Double-click to edit"
                  >
                    {headingText}
                  </p>
                )
              ) : (
                <button
                  data-print-hide
                  type="button"
                  className="w-full flex items-center justify-center h-6 group/header cursor-pointer bg-transparent border-none outline-none"
                  onClick={() => {
                    setShowHeading(true);
                    setEditingHeading(true);
                    setTimeout(() => headingRef.current?.focus(), 0);
                  }}
                >
                  <span className="text-[11px] text-transparent group-hover/header:text-muted-foreground/50 transition-colors pointer-events-none select-none">
                    + Heading
                  </span>
                </button>
              )}
            </div>

            {/* Icon + Title */}
            <div className={`group/title ${note.icon && showHeading ? "mt-6" : ""}`}>
              {note.icon ? (
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => setShowIconPicker(true)}
                    className="note-icon-print text-5xl hover:opacity-80 transition-opacity cursor-pointer"
                    title="Change icon"
                  >
                    {note.icon.startsWith("lucide:") ? (() => {
                      const name = note.icon!.slice(7);
                      const IconComp = LUCIDE_ICON_MAP[name];
                      if (!IconComp) return note.icon;
                      const filled = isFilledIcon(name);
                      return <IconComp size={48} fill={filled ? "currentColor" : "none"} />;
                    })() : note.icon}
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
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
                placeholder="Untitled"
                rows={1}
                className="note-title-print w-full text-2xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40 resize-none overflow-hidden leading-tight"
                style={{
                  fontFamily: titleStyle.fontFamily || undefined,
                  fontSize: titleStyle.fontSize || undefined,
                }}
              />
            </div>
            {/* Editor content */}
            <div className="mt-4">
              <EditorContent editor={editor} />
              {editor && <ImageBubbleMenu editor={editor} />}
            </div>
          </div>

          {/* Dynamic overflow pages with dividers — hidden in print */}
          {Array.from({ length: extraPages }).map((_, i) => (
            <div key={i} data-print-hide>
              <div className="flex items-center my-1">
                <div className="flex-1 border-t border-dashed border-border/50" />
              </div>
              <div
                className="note-page bg-background rounded-sm shadow-sm border border-border/30 px-8 md:px-14 py-12 min-h-[1056px] cursor-text"
                onClick={handlePageClick}
              />
            </div>
          ))}
        </div>
      </div>

      <DeleteNoteConfirmModal
        open={showDeleteConfirm}
        noteCount={1}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDelete(note.id);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {showIconPicker && (
        <Suspense fallback={null}>
          <EmojiPicker
            open={showIconPicker}
            onSelect={(icon) => {
              onUpdate(noteIdRef.current, { icon });
              setShowIconPicker(false);
            }}
            onClose={() => setShowIconPicker(false)}
          />
        </Suspense>
      )}

      <Suspense fallback={showCanvasSubmit ? <CanvasModalSkeleton onClose={() => setShowCanvasSubmit(false)} /> : null}>
        <SubmitToCanvasModal
          open={showCanvasSubmit}
          onClose={() => setShowCanvasSubmit(false)}
          noteTitle={titleRef.current?.value || note.title || "Untitled"}
          editorHtml={editor?.getHTML() || ""}
        />
      </Suspense>
    </div>
  );
}
