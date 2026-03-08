"use client";

import { useState, useRef, useCallback, useEffect, type KeyboardEvent, type ChangeEvent } from "react";
import { EyeOff, Plus, Smile, X } from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { classifyImage } from "@/lib/nsfw-check";

/**
 * A single pending attachment with preview info.
 *
 * @property file - The raw File object
 * @property previewUrl - Blob URL for image preview (empty string for non-images)
 * @property isImage - Whether the file is an image type
 * @property isSensitive - Whether the image was flagged as NSFW by classification
 */
export interface PendingAttachment {
  file: File;
  previewUrl: string;
  isImage: boolean;
  isSensitive?: boolean;
}

/**
 * iMessage-style chat input with auto-resizing textarea,
 * file attachments, emoji picker, and anonymous toggle.
 *
 * @param onSend - Callback fired with the message text, optional files, and anonymous flag
 * @param disabled - Whether sending is disabled
 * @param error - Error message to display below input
 */
interface ChatInputProps {
  onSend: (body: string, files?: File[], anonymous?: boolean) => void;
  disabled?: boolean;
  error?: string | null;
  /** Called on each keystroke so the parent can signal typing presence. */
  onTyping?: () => void;
}

/** Max file size: 10 MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
/** Max number of attachments per message. */
const MAX_ATTACHMENTS = 10;

export default function ChatInput({ onSend, disabled, error, onTyping }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);

  /**
   * Auto-resizes the textarea to fit content up to 120px.
   */
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
      autoResize();
      onTyping?.();
    },
    [autoResize, onTyping]
  );

  /**
   * Sends the message with any attachments.
   */
  const handleSend = useCallback(() => {
    const hasText = value.trim().length > 0;
    const hasFiles = attachments.length > 0;
    if ((!hasText && !hasFiles) || disabled) return;

    onSend(value.trim(), hasFiles ? attachments.map((a) => a.file) : undefined, anonymous);
    setValue("");
    setAttachments([]);
    setFileError(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      // Keep cursor in the textarea so user can keep typing
      textareaRef.current.focus();
    }
  }, [value, attachments, disabled, anonymous, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  /**
   * Handles file selection from the file input.
   */
  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setFileError(null);

    const newAttachments: PendingAttachment[] = [];
    const remaining = MAX_ATTACHMENTS - attachments.length;
    const selectedFiles = Array.from(files).slice(0, remaining);
    if (Array.from(files).length > remaining) {
      setFileError(`Maximum ${MAX_ATTACHMENTS} attachments per message`);
    }
    for (const file of selectedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`${file.name} exceeds 10 MB limit`);
        continue;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        setFileError(`${file.name}: unsupported file type`);
        continue;
      }
      const isImage = file.type.startsWith("image/");
      const previewUrl = isImage ? URL.createObjectURL(file) : "";
      newAttachments.push({ file, previewUrl, isImage });

      // Run NSFW classification in background for image files
      if (isImage) {
        classifyImage(file).then((result) => {
          setAttachments((prev) =>
            prev.map((att) =>
              att.file === file ? { ...att, isSensitive: result.isSensitive } : att
            )
          );
        }).catch(() => {
          // Fail-closed: classification error marks image as sensitive
          setAttachments((prev) =>
            prev.map((att) =>
              att.file === file ? { ...att, isSensitive: true } : att
            )
          );
        });
      }
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    // Reset input so re-selecting the same file works
    e.target.value = "";
  }, []);

  /**
   * Removes a pending attachment by index.
   */
  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => {
      const removed = prev[index];
      if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  /**
   * Inserts selected emoji at cursor position in textarea.
   */
  const handleEmojiSelect = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (emoji: any) => {
      const native = emoji.native as string;
      const el = textareaRef.current;
      if (el) {
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const newValue = value.slice(0, start) + native + value.slice(end);
        setValue(newValue);
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = start + native.length;
          el.focus();
        });
      } else {
        setValue((prev) => prev + native);
      }
      setShowEmojiPicker(false);
    },
    [value]
  );

  // Close emoji picker on outside click (ignore clicks on the toggle button)
  useEffect(() => {
    if (!showEmojiPicker) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (emojiBtnRef.current?.contains(target)) return;
      if (emojiRef.current && !emojiRef.current.contains(target)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showEmojiPicker]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      attachments.forEach((a) => {
        if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="px-5 pt-2 pb-4 relative">
      {/* Emoji picker popover */}
      {showEmojiPicker && (
        <div ref={emojiRef} className="absolute bottom-16 right-4 z-30 shadow-xl rounded-xl overflow-hidden">
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            theme="auto"
            previewPosition="none"
            skinTonePosition="none"
            maxFrequentRows={2}
            perLine={8}
          />
        </div>
      )}

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex gap-3 mb-3 flex-wrap px-1">
          {attachments.map((att, i) => (
            <div key={i} className="relative">
              {att.isImage ? (
                <div className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-sm relative">
                  <img
                    src={att.previewUrl}
                    alt={att.file.name}
                    className={`max-w-[200px] max-h-[160px] object-cover ${att.isSensitive ? "blur-lg" : ""}`}
                  />
                  {att.isSensitive && (
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-red-500/80 text-white text-[9px] font-medium">
                      Sensitive
                    </div>
                  )}
                  <div className="px-2.5 py-1.5 bg-white dark:bg-zinc-800 text-[10px] text-muted-foreground truncate">
                    {att.file.name}
                  </div>
                </div>
              ) : (
                <div className="w-[140px] rounded-2xl border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-zinc-800 p-3 flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {att.file.name.split(".").pop()?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                    {att.file.name}
                  </span>
                </div>
              )}
              <button
                onClick={() => removeAttachment(i)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/70 dark:bg-white/80 text-white dark:text-black flex items-center justify-center shadow-sm cursor-pointer hover:bg-black/90 dark:hover:bg-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Anonymous mode indicator */}
      {anonymous && (
        <div className="flex items-center gap-1.5 mb-2 px-1">
          <EyeOff size={12} className="text-zinc-500" />
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Sending anonymously — your name won&apos;t be shown
          </span>
        </div>
      )}

      {(error || fileError) && (
        <div className="text-xs text-red-500 mb-1.5 px-1">{error || fileError}</div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Input row: [+] [🕵] [Message] [😊] */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 rounded-full bg-gray-200/80 dark:bg-black/50 dark:backdrop-blur-sm border border-black/5 dark:border-white/15 flex items-center justify-center shrink-0 text-gray-500 dark:text-gray-300 hover:bg-gray-300/80 dark:hover:bg-black/60 transition-colors cursor-pointer active:scale-95"
          aria-label="Add attachment"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={() => setAnonymous(!anonymous)}
          className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-colors cursor-pointer active:scale-95 ${
            anonymous
              ? "bg-zinc-800 dark:bg-white border-zinc-800 dark:border-white text-white dark:text-zinc-900"
              : "bg-gray-200/80 dark:bg-black/50 dark:backdrop-blur-sm border-black/5 dark:border-white/15 text-gray-500 dark:text-gray-300 hover:bg-gray-300/80 dark:hover:bg-black/60"
          }`}
          aria-label={anonymous ? "Switch to named message" : "Send anonymously"}
          title={anonymous ? "Anonymous mode on" : "Send anonymously"}
        >
          <EyeOff size={18} />
        </button>
        <div className="flex-1 bg-gray-200/80 dark:bg-black/50 dark:backdrop-blur-sm rounded-[22px] border border-black/5 dark:border-white/15 px-4 py-2.5 flex items-center">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Message"
            aria-label="Type a message"
            rows={1}
            className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-gray-400 dark:placeholder:text-zinc-500 resize-none outline-none min-h-[24px] max-h-[120px] leading-[24px] py-0"
          />
        </div>
        <button
          ref={emojiBtnRef}
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="w-10 h-10 rounded-full bg-gray-200/80 dark:bg-black/50 dark:backdrop-blur-sm border border-black/5 dark:border-white/15 flex items-center justify-center shrink-0 text-gray-500 dark:text-gray-300 hover:bg-gray-300/80 dark:hover:bg-black/60 transition-colors cursor-pointer active:scale-95"
          aria-label="Emoji"
        >
          <Smile size={20} />
        </button>
      </div>
    </div>
  );
}
