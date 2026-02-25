"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

interface TagPickerProps {
  /** Currently selected tags on this task. */
  selectedTags: string[];
  /** All available tag names (derived from course names + existing tags). */
  availableTags: string[];
  /** Callback when the tag set changes. */
  onChange: (tags: string[]) => void;
}

/**
 * Compact tag picker for selecting course/label tags on a task.
 * Shows selected tags as chips with remove buttons, plus a dropdown
 * to add from available tags or type a custom tag.
 *
 * @param selectedTags - Tags currently on the task
 * @param availableTags - All known tags to suggest
 * @param onChange - Callback with the updated tag array
 */
export default function TagPicker({ selectedTags, availableTags, onChange }: TagPickerProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [customInput, setCustomInput] = useState("");

  /** Tags available to add (not already selected). */
  const unselectedTags = availableTags.filter((t) => !selectedTags.includes(t));

  /** Filtered suggestions based on custom input. */
  const filteredSuggestions = customInput.trim()
    ? unselectedTags.filter((t) => t.toLowerCase().includes(customInput.toLowerCase()))
    : unselectedTags;

  /**
   * Adds a tag to the selection.
   */
  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (!trimmed || selectedTags.includes(trimmed)) return;
    onChange([...selectedTags, trimmed]);
    setCustomInput("");
  }

  /**
   * Removes a tag from the selection.
   */
  function removeTag(tag: string) {
    onChange(selectedTags.filter((t) => t !== tag));
  }

  /**
   * Handles Enter key to add a custom tag.
   */
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (customInput.trim()) {
        addTag(customInput);
      }
    }
    if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }

  return (
    <div className="relative">
      {/* Selected tags as chips */}
      <div className="flex flex-wrap items-center gap-1">
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 text-sm font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X size={10} />
            </button>
          </span>
        ))}

        {/* Add button */}
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="inline-flex items-center gap-0.5 text-sm font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Plus size={10} />
          Tag
        </button>
      </div>

      {/* Dropdown for adding tags */}
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 w-48 bg-popover rounded-lg shadow-xl border border-border py-1 max-h-40 overflow-y-auto">
            {/* Search/custom input */}
            <div className="px-2 pb-1">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search or add tag..."
                className="w-full px-2 py-1 text-xs rounded border border-border bg-card text-foreground placeholder-subtle-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                autoFocus
              />
            </div>

            {/* Available tags */}
            {filteredSuggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  addTag(tag);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-accent transition-colors truncate"
              >
                {tag}
              </button>
            ))}

            {/* Add custom tag option */}
            {customInput.trim() && !availableTags.includes(customInput.trim()) && (
              <button
                type="button"
                onClick={() => {
                  addTag(customInput);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-blue-500 hover:bg-accent transition-colors"
              >
                Add &ldquo;{customInput.trim()}&rdquo;
              </button>
            )}

            {/* Empty state */}
            {filteredSuggestions.length === 0 && !customInput.trim() && (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No tags available. Type to create one.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
