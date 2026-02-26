"use client";

import { useState, useRef, useCallback, useEffect, type KeyboardEvent, type ChangeEvent } from "react";
import { Plus, Smile, X } from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

/**
 * A single pending attachment with preview info.
 */
export interface PendingAttachment {
  file: File;
  previewUrl: string;
  isImage: boolean;
}

/**
 * iMessage-style chat input with auto-resizing textarea,
 * file attachments, and emoji picker.
 *
 * @param onSend - Callback fired with the message text and optional files
 * @param disabled - Whether sending is disabled
 * @param error - Error message to display below input
 */
interface ChatInputProps {
  onSend: (body: string, files?: File[]) => void;
  disabled?: boolean;
  error?: string | null;
}

/** Max file size: 10 MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];

export default function ChatInput({ onSend, disabled, error }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

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
    },
    [autoResize]
  );

  /**
   * Sends the message with any attachments.
   */
  const handleSend = useCallback(() => {
    const hasText = value.trim().length > 0;
    const hasFiles = attachments.length > 0;
    if ((!hasText && !hasFiles) || disabled) return;

    onSend(value.trim(), hasFiles ? attachments.map((a) => a.file) : undefined);
    setValue("");
    setAttachments([]);
    setFileError(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, attachments, disabled, onSend]);

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
    for (const file of Array.from(files)) {
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

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmojiPicker) return;
    function handleClick(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
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
    <div className="px-5 py-4 relative">
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
                <div className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-sm">
                  <img
                    src={att.previewUrl}
                    alt={att.file.name}
                    className="max-w-[200px] max-h-[160px] object-cover"
                  />
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

      {/* Input row: [+] [Message] [😊] */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 rounded-full bg-gray-200/80 dark:bg-white/20 backdrop-blur-sm border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0 text-gray-500 dark:text-gray-300 hover:bg-gray-300/80 dark:hover:bg-white/30 transition-colors cursor-pointer active:scale-95"
          aria-label="Add attachment"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
        <div className="flex-1 bg-white dark:bg-[#1C1C1E] rounded-[22px] border border-black/30 dark:border-white/20 px-4 py-2.5 flex items-center">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Message"
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-gray-400 dark:placeholder:text-zinc-500 resize-none outline-none min-h-[24px] max-h-[120px] leading-[24px] py-0"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="w-10 h-10 rounded-full bg-gray-200/80 dark:bg-white/20 backdrop-blur-sm border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0 text-gray-500 dark:text-gray-300 hover:bg-gray-300/80 dark:hover:bg-white/30 transition-colors cursor-pointer active:scale-95"
          aria-label="Emoji"
        >
          <Smile size={20} />
        </button>
      </div>
    </div>
  );
}
