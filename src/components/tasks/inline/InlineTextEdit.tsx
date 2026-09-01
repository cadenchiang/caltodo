"use client";

/**
 * Click-to-edit text for the task detail panel.
 *
 * Shows the current value until clicked, then swaps a textarea into the same
 * place with the same typography, so the text does not jump or reflow when
 * editing starts. The textarea is chromeless (no background, border, or
 * padding), so editing reads like typing into a notepad rather than filling
 * in a form field. Used for the title and the description.
 */

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import InlineField from "./InlineField";

interface InlineTextEditProps {
  /** Current stored value. */
  value: string;
  /** Called with the trimmed new value when the edit is committed. */
  onCommit: (next: string) => void;
  /** Shown when the value is empty. */
  placeholder: string;
  /** Typography classes shared by the display and the editor. */
  textClassName: string;
  /**
   * When true, Enter commits instead of inserting a newline. Titles are
   * single-line; descriptions are not.
   */
  singleLine?: boolean;
  /** Accessible name for both the display and the editor. */
  label: string;
  /**
   * Rich rendering of the value for the read-only state, e.g. a description
   * with its links made clickable. Falls back to the plain value.
   */
  children?: ReactNode;
}

/**
 * Renders text that becomes an editor in place when clicked.
 *
 * @param value - Current stored value
 * @param onCommit - Receives the trimmed value; not called when unchanged
 * @param placeholder - Shown when there is no value
 * @param textClassName - Typography shared by both states
 * @param singleLine - Enter commits rather than inserting a newline
 * @param label - Accessible name
 * @param children - Optional rich read-only rendering
 * @remarks Commits on blur as well as Enter. Losing an edit because the user
 *          clicked elsewhere is the worst outcome here, and Escape is always
 *          available to discard deliberately.
 */
export default function InlineTextEdit({
  value,
  onCommit,
  placeholder,
  textClassName,
  singleLine = false,
  label,
  children,
}: InlineTextEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  /** Set while Escape is being handled so the ensuing blur does not commit. */
  const discardingRef = useRef(false);

  // Adopt an externally changed value, including switching to another task.
  // Adjusted during render rather than in an effect, so the new text paints
  // in the same pass instead of one frame late.
  const [lastValue, setLastValue] = useState(value);
  if (!editing && value !== lastValue) {
    setLastValue(value);
    setDraft(value);
  }

  // Size the textarea to its content, and put the caret at the end.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!editing || !el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [editing, draft]);

  /** Commits the draft unless it is unchanged or the edit was discarded. */
  function commit() {
    setEditing(false);
    if (discardingRef.current) {
      discardingRef.current = false;
      setDraft(value);
      return;
    }
    const next = draft.trim();
    if (next !== value.trim()) onCommit(next);
  }

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        value={draft}
        autoFocus
        aria-label={label}
        rows={1}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={(e) => {
          const end = e.currentTarget.value.length;
          e.currentTarget.setSelectionRange(end, end);
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            discardingRef.current = true;
            e.currentTarget.blur();
            return;
          }
          if (e.key === "Enter" && (singleLine || e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        className={`${textClassName} m-0 p-0 w-full block border-0 bg-transparent resize-none overflow-hidden focus:outline-none focus:ring-0`}
      />
    );
  }

  return (
    <InlineField label={label} onActivate={() => setEditing(true)} className="block w-full">
      {value ? (
        <span className={`${textClassName} block break-words`}>{children ?? value}</span>
      ) : (
        <span className={`${textClassName} block text-muted-foreground/70`}>{placeholder}</span>
      )}
    </InlineField>
  );
}
