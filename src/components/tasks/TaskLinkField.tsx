"use client";

/**
 * The editable link row on a task the user wrote themselves.
 *
 * Shows the link as something to click until it is clicked to edit, then a
 * plain input in the same place. Committing runs the text through
 * {@link normaliseTaskLink}, which is what decides whether it is a link at
 * all - so what reaches the `href` is always an http(s) URL or nothing.
 */

import { useEffect, useRef, useState } from "react";
import { normaliseTaskLink, displayTaskLink } from "@/lib/task-link";

interface TaskLinkFieldProps {
  /** The stored link, or null when the task has none. */
  value: string | null;
  /** Saves a new link, or null to clear it. */
  onCommit: (url: string | null) => void;
}

/**
 * Renders the link, or the editor for it.
 *
 * @param value - The stored link
 * @param onCommit - Receives the normalised link, or null when cleared
 * @remarks Enter commits, Escape abandons, and blur commits - losing a typed
 *          link because the user clicked away is the worse outcome, and
 *          Escape is always there to discard deliberately. Text that is not a
 *          link is kept in the field with the reason shown, rather than
 *          silently dropped: the user typed something, and being told why it
 *          was refused is the only way to fix it.
 */
export default function TaskLinkField({ value, onCommit }: TaskLinkFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [invalid, setInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  /** Set while Escape is being handled so the ensuing blur does not commit. */
  const discardingRef = useRef(false);

  // Adopt a link changed elsewhere, including switching to another task.
  const [lastValue, setLastValue] = useState(value);
  if (!editing && value !== lastValue) {
    setLastValue(value);
    setDraft(value ?? "");
    setInvalid(false);
  }

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  /**
   * Validates the draft and saves it, or keeps the field open on bad input.
   *
   * @remarks An emptied field clears the link, which is the only way to
   *          remove one and needs no separate control.
   */
  function commit() {
    if (discardingRef.current) {
      discardingRef.current = false;
      setDraft(value ?? "");
      setInvalid(false);
      setEditing(false);
      return;
    }

    const trimmed = draft.trim();
    if (!trimmed) {
      setInvalid(false);
      setEditing(false);
      if (value !== null) onCommit(null);
      return;
    }

    const url = normaliseTaskLink(trimmed);
    if (!url) {
      console.info("TaskLinkField: refused a value that is not a link", {
        length: trimmed.length,
      });
      setInvalid(true);
      return;
    }

    setInvalid(false);
    setEditing(false);
    if (url !== value) onCommit(url);
  }

  if (editing) {
    return (
      <div className="min-w-0">
        <input
          ref={inputRef}
          type="text"
          inputMode="url"
          autoComplete="off"
          value={draft}
          aria-label="Task link"
          aria-invalid={invalid || undefined}
          placeholder="example.com/assignment"
          onChange={(e) => {
            setDraft(e.target.value);
            if (invalid) setInvalid(false);
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
              return;
            }
            if (e.key === "Escape") {
              e.preventDefault();
              discardingRef.current = true;
              e.currentTarget.blur();
            }
          }}
          className={`w-full text-sm bg-transparent border-0 border-b p-0 pb-0.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-0 ${
            invalid ? "border-red-400" : "border-border"
          }`}
        />
        {invalid && (
          <p className="mt-1 text-[11px] text-red-400">
            That is not a web link. Try something like example.com/page.
          </p>
        )}
      </div>
    );
  }

  if (!value) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors"
      >
        Add a link
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2 min-w-0">
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        title={value}
        className="text-sm font-medium text-[#0e89d6] hover:underline truncate min-w-0"
      >
        {displayTaskLink(value)}
      </a>
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label="Edit link"
        className="shrink-0 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
      >
        Edit
      </button>
    </span>
  );
}
