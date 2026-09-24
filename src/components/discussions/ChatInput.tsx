"use client";

import { useState, useRef, useCallback, useEffect, useId, type KeyboardEvent, type ChangeEvent } from "react";
import { EyeOff, Plus, Smile, SendHorizontal, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { classifyImage } from "@/lib/nsfw-check";
import { MAX_ATTACHMENTS, MAX_FILE_SIZE, ALLOWED_TYPES } from "@/lib/chat-upload";
import { MAX_MESSAGE_LENGTH } from "@/lib/chat-message-shape";
import ChatAttachmentPreview, { type PendingAttachment } from "./ChatAttachmentPreview";

// The picker statically pulls in the ~432KB @emoji-mart/data dataset, so it
// is loaded on demand (client-only) rather than in the first-load bundle.
const ChatEmojiPicker = dynamic(() => import("./ChatEmojiPicker"), { ssr: false });

/** Helper text shown while anonymous mode is on. Disclosed, not implied. */
export const ANONYMOUS_HELPER_TEXT =
  "Sending anonymously. You appear as #N, and #N is the same person within this chat.";

/** Show the character counter once the body is within this many of the limit. */
export const COUNTER_THRESHOLD = MAX_MESSAGE_LENGTH - 500;

/**
 * Chat composer: auto-resizing textarea, attachments, emoji picker,
 * anonymous toggle, and a send button.
 *
 * The anonymous flag is controlled by the parent (ChatView) so the reply
 * composer and the main composer share one setting. Enter sends only on
 * fine-pointer devices (Shift+Enter for a newline); on touch devices Enter
 * inserts a newline and the send button is the way to send. While a send
 * is in flight the send button is disabled and shows a spinner; the text
 * stays in the box, so nothing is ever dropped.
 *
 * @param onSend - Called with the text, optional files, and the anonymous flag
 * @param disabled - Disables sending (not typing) while a send is in flight
 * @param error - Message shown under the composer
 * @param anonymous - Whether the next message is sent without a name
 * @param onAnonymousChange - Toggle handler
 * @param onTyping - Called on each keystroke while NOT anonymous; anonymous
 *                   typing is never broadcast
 * @param autoFocus - Focus the textarea on mount (reply composer)
 */
interface ChatInputProps {
  onSend: (body: string, files?: File[], anonymous?: boolean) => void;
  disabled?: boolean;
  error?: string | null;
  anonymous: boolean;
  onAnonymousChange: (anonymous: boolean) => void;
  onTyping?: () => void;
  autoFocus?: boolean;
}

const ROUND_BTN =
  "w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer active:scale-95 motion-reduce:active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed";

export default function ChatInput({ onSend, disabled, error, anonymous, onAnonymousChange, onTyping, autoFocus }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const helpId = useId();
  const errorId = useId();

  // Enter-to-send only where a keyboard with a Shift key is the norm.
  useEffect(() => {
    const mql = window.matchMedia("(pointer: coarse)");
    setCoarsePointer(mql.matches);
    const onChange = () => setCoarsePointer(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  /** Auto-resizes the textarea to fit content up to 120px. */
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value.slice(0, MAX_MESSAGE_LENGTH));
      autoResize();
      // Never broadcast typing while anonymous (see ChatInputProps.onTyping).
      if (!anonymous) onTyping?.();
    },
    [autoResize, onTyping, anonymous],
  );

  const hasText = value.trim().length > 0;
  const canSend = (hasText || attachments.length > 0) && !disabled;

  /** Sends the message with any attachments. */
  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSend(value.trim(), attachments.length > 0 ? attachments.map((a) => a.file) : undefined, anonymous);
    setValue("");
    setAttachments([]);
    setFileError(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  }, [canSend, value, attachments, anonymous, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !coarsePointer && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend, coarsePointer],
  );

  /** Validates and queues selected files, classifying images in the background. */
  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setFileError(null);
    setAttachments((prev) => {
      const remaining = MAX_ATTACHMENTS - prev.length;
      const selected = Array.from(files);
      if (selected.length > remaining) setFileError(`You can attach up to ${MAX_ATTACHMENTS} files per message.`);
      const added: PendingAttachment[] = [];
      for (const file of selected.slice(0, Math.max(remaining, 0))) {
        if (file.size > MAX_FILE_SIZE) { setFileError(`${file.name} is larger than 10 MB.`); continue; }
        if (!ALLOWED_TYPES.includes(file.type)) { setFileError(`${file.name} is not a supported file type.`); continue; }
        const isImage = file.type.startsWith("image/");
        added.push({ file, previewUrl: isImage ? URL.createObjectURL(file) : "", isImage });
        if (isImage) {
          classifyImage(file)
            .then((r) => setAttachments((cur) => cur.map((a) => (a.file === file ? { ...a, isSensitive: r.isSensitive } : a))))
            .catch(() => setAttachments((cur) => cur.map((a) => (a.file === file ? { ...a, isSensitive: true } : a))));
        }
      }
      return [...prev, ...added];
    });
    e.target.value = "";
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => {
      if (prev[index]?.previewUrl) URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  /** Inserts the emoji at the cursor. */
  const handleEmojiSelect = useCallback((native: string) => {
    const el = textareaRef.current;
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      setValue((v) => v.slice(0, start) + native + v.slice(end));
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + native.length;
        el.focus();
      });
    } else {
      setValue((v) => v + native);
    }
    setShowEmojiPicker(false);
  }, []);

  // Close emoji picker on outside click or Escape
  useEffect(() => {
    if (!showEmojiPicker) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (emojiBtnRef.current?.contains(target)) return;
      if (emojiRef.current && !emojiRef.current.contains(target)) setShowEmojiPicker(false);
    }
    function handleKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") setShowEmojiPicker(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [showEmojiPicker]);

  // Revoke object URLs on unmount
  useEffect(() => () => attachments.forEach((a) => a.previewUrl && URL.revokeObjectURL(a.previewUrl)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

  const shownError = error || fileError;
  const showCounter = value.length >= COUNTER_THRESHOLD;

  return (
    <div className="px-3 md:px-5 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] relative">
      {showEmojiPicker && (
        <div ref={emojiRef} className="absolute bottom-16 right-4 z-30 bg-popover shadow-xl rounded-xl overflow-hidden">
          <ChatEmojiPicker onSelect={handleEmojiSelect} />
        </div>
      )}

      <ChatAttachmentPreview attachments={attachments} onRemove={removeAttachment} />

      {anonymous && (
        <div id={helpId} className="flex items-center gap-1.5 mb-2 px-1">
          <EyeOff size={12} className="text-muted-foreground shrink-0" aria-hidden="true" />
          <span className="text-[11px] text-muted-foreground">{ANONYMOUS_HELPER_TEXT}</span>
        </div>
      )}

      {shownError && (
        <div id={errorId} role="alert" className="text-xs text-red-500 mb-1.5 px-1">{shownError}</div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="flex items-end gap-2">
        <button type="button" onClick={() => fileInputRef.current?.click()} className={ROUND_BTN} aria-label="Add attachment">
          <Plus size={20} strokeWidth={2.5} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onAnonymousChange(!anonymous)}
          aria-pressed={anonymous}
          aria-describedby={anonymous ? helpId : undefined}
          aria-label={anonymous ? "Anonymous mode on. Switch to named messages" : "Send anonymously"}
          className={anonymous ? `${ROUND_BTN} bg-gray-900 text-white border-gray-900 hover:bg-gray-900 hover:text-white dark:bg-white dark:text-gray-900 dark:border-white dark:hover:bg-white dark:hover:text-gray-900` : ROUND_BTN}
        >
          <EyeOff size={18} aria-hidden="true" />
        </button>
        <div className="flex-1 min-w-0 bg-card rounded-[22px] border border-input-border px-4 py-2 flex items-center focus-within:ring-2 focus-within:ring-ring">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Message"
            aria-label="Message"
            aria-describedby={shownError ? errorId : undefined}
            aria-invalid={!!shownError || undefined}
            maxLength={MAX_MESSAGE_LENGTH}
            rows={1}
            className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground resize-none outline-none min-h-[24px] max-h-[120px] leading-[24px] py-0"
          />
          {showCounter && (
            <span
              className={`ml-2 text-[11px] tabular-nums shrink-0 ${value.length >= MAX_MESSAGE_LENGTH ? "text-red-500" : "text-muted-foreground"}`}
              aria-live="polite"
            >
              {value.length}/{MAX_MESSAGE_LENGTH}
            </span>
          )}
        </div>
        <button ref={emojiBtnRef} type="button" onClick={() => setShowEmojiPicker((v) => !v)} className={ROUND_BTN} aria-label="Add emoji" aria-expanded={showEmojiPicker}>
          <Smile size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label={disabled ? "Sending" : "Send message"}
          aria-busy={disabled}
          className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 hover:bg-blue-600 transition-colors cursor-pointer active:scale-95 motion-reduce:active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {disabled ? <Loader2 size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <SendHorizontal size={18} aria-hidden="true" />}
        </button>
      </div>
      {!coarsePointer && (
        <p className="sr-only">Press Enter to send, Shift and Enter for a new line.</p>
      )}
    </div>
  );
}
