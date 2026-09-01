"use client";

/**
 * Searchable option list shared by the detail panel's class and tag pickers.
 *
 * Both need the same things: filter as you type, pick from what exists,
 * create something new from the search text, and — for classes — clear the
 * field entirely.
 */

import { useState } from "react";
import { Check } from "lucide-react";

interface OptionListProps {
  /** Everything that can be picked. */
  options: string[];
  /** Currently chosen values. Single-select passes at most one. */
  selected: string[];
  /** Toggles a value. */
  onToggle: (value: string) => void;
  /** Creates a value from the search text. Omit to forbid new entries. */
  onCreate?: (value: string) => void;
  /** Clears the field. Omit for multi-select, where deselecting is enough. */
  onClear?: () => void;
  /** Search box placeholder. */
  placeholder: string;
  /** Label for the clear option, e.g. "None". */
  clearLabel?: string;
  /** Shown when there is nothing to pick and nothing typed. */
  emptyLabel: string;
  /** Keeps the list open after a pick, so several tags can be added at once. */
  multi?: boolean;
  /** Called after a pick when the list should close. */
  onDone: () => void;
}

/**
 * Renders the search box and the options beneath it.
 *
 * @param options - Everything pickable
 * @param selected - Currently chosen values
 * @param onToggle - Toggles one value
 * @param onCreate - Creates a value from the search text
 * @param onClear - Clears the field
 * @param placeholder - Search placeholder
 * @param clearLabel - Label for the clear row
 * @param emptyLabel - Shown when there is nothing to offer
 * @param multi - Whether picking keeps the list open
 * @param onDone - Closes the list
 * @remarks Matching is case-insensitive on both sides, so a tag is never
 *          offered for creation when it differs only in case from one that
 *          already exists. Only the options scroll: the search box is pinned
 *          above them, so typing to narrow a long list never scrolls the box
 *          you are typing into off the top.
 *
 *          The scroll container is the options list rather than the panel, so
 *          the pinned box needs no sticky positioning and cannot be scrolled
 *          under by the rows.
 */
export default function OptionList({
  options,
  selected,
  onToggle,
  onCreate,
  onClear,
  placeholder,
  clearLabel,
  emptyLabel,
  multi = false,
  onDone,
}: OptionListProps) {
  const [search, setSearch] = useState("");
  const query = search.trim();
  const selectedLower = selected.map((s) => s.toLowerCase());

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const canCreate =
    !!onCreate && !!query && !options.some((o) => o.toLowerCase() === query.toLowerCase());

  /** Picks a value, closing unless several may be chosen. */
  function pick(value: string) {
    onToggle(value);
    setSearch("");
    if (!multi) onDone();
  }

  return (
    <div className="w-64 bg-popover rounded-xl shadow-2xl border border-border py-1.5 flex flex-col max-h-64">
      <div className="shrink-0 px-2.5 pb-1.5">
        <input
          type="text"
          value={search}
          autoFocus
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query) {
              e.preventDefault();
              // Enter takes the single match if there is one, so typing most
              // of a class name and pressing Enter does the obvious thing.
              if (filtered.length === 1) pick(filtered[0]);
              else if (canCreate && onCreate) {
                onCreate(query);
                setSearch("");
                if (!multi) onDone();
              }
            }
          }}
          placeholder={placeholder}
          className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {onClear && !query && (
          <button
            type="button"
            onClick={() => {
              onClear();
              onDone();
            }}
            className={`w-full text-left px-4 py-1.5 text-sm transition-colors truncate hover:bg-accent ${
              selected.length === 0 ? "text-blue-500 font-medium" : "text-muted-foreground"
            }`}
          >
            {clearLabel}
          </button>
        )}

        {filtered.map((option) => {
          const isSelected = selectedLower.includes(option.toLowerCase());
          return (
            <button
              key={option}
              type="button"
              onClick={() => pick(option)}
              className={`w-full flex items-center gap-2 text-left px-4 py-1.5 text-sm transition-colors hover:bg-accent ${
                isSelected ? "text-blue-500 font-medium" : "text-foreground"
              }`}
            >
              <span className="flex-1 min-w-0 truncate">{option}</span>
              {isSelected && <Check size={14} className="shrink-0" />}
            </button>
          );
        })}

        {canCreate && onCreate && (
          <button
            type="button"
            onClick={() => {
              onCreate(query);
              setSearch("");
              if (!multi) onDone();
            }}
            className="w-full text-left px-4 py-1.5 text-sm text-blue-500 hover:bg-accent transition-colors truncate"
          >
            Add &ldquo;{query}&rdquo;
          </button>
        )}

        {filtered.length === 0 && !query && (
          <p className="px-4 py-2 text-sm text-muted-foreground">{emptyLabel}</p>
        )}
      </div>
    </div>
  );
}
