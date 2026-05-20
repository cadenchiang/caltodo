"use client";

/**
 * Editable board description displayed between the title and divider.
 * Shows italic text in view mode; click-to-edit modal in edit mode.
 * Hidden when empty and not in edit mode.
 *
 * @param description - Current description text
 * @param editMode - Whether the dashboard is in edit mode
 * @param onDescriptionChange - Callback with updated description string
 */

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/** Maximum character length for board descriptions. */
const MAX_LENGTH = 200;

interface BoardDescriptionProps {
  description: string;
  editMode: boolean;
  onDescriptionChange: (description: string) => void;
}

export default function BoardDescription({
  description,
  editMode,
  onDescriptionChange,
}: BoardDescriptionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState(description);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /** Sync draft when description changes externally. */
  useEffect(() => {
    setDraft(description);
  }, [description]);

  /** Auto-focus textarea when modal opens. */
  useEffect(() => {
    if (modalOpen && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(draft.length, draft.length);
    }
  }, [modalOpen, draft.length]);

  /** Saves the draft and closes the modal. */
  function handleSave() {
    onDescriptionChange(draft.trim());
    setModalOpen(false);
  }

  // Hidden when empty and not editing
  if (!description && !editMode) return null;

  return (
    <>
      {/* Description text / placeholder */}
      <div className="px-6 md:px-10 mb-4">
        <button
          onClick={() => {
            if (editMode) setModalOpen(true);
          }}
          className={`text-left w-full text-sm italic text-foreground ${
            editMode
              ? "cursor-pointer hover:text-foreground transition-colors animate-edit-hint"
              : "cursor-default"
          }`}
        >
          {description || (editMode ? "Add a description..." : "")}
        </button>
      </div>

      {/* Edit modal — portaled to body */}
      {modalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40 animate-announce-backdrop-in"
              onClick={handleSave}
            />
            <div className="relative bg-popover rounded-2xl shadow-xl border border-border w-full w-[calc(100%-2rem)] max-w-sm animate-announce-card-in overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 pb-2">
                <h2 className="text-base font-semibold text-foreground">
                  Board Description
                </h2>
                <button
                  onClick={handleSave}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Textarea */}
              <div className="px-4 pb-2">
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(e) =>
                    setDraft(e.target.value.slice(0, MAX_LENGTH))
                  }
                  rows={3}
                  maxLength={MAX_LENGTH}
                  placeholder="Describe your board..."
                  className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <p className="text-[10px] text-foreground text-right mt-1">
                  {draft.length}/{MAX_LENGTH}
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 p-4 pt-2">
                <button
                  onClick={() => {
                    setDraft(description);
                    setModalOpen(false);
                  }}
                  className="px-3 py-1.5 text-sm rounded-lg text-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
