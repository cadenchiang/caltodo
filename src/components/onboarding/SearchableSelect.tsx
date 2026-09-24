"use client";

import { useState, useRef, useEffect, useCallback, useMemo, useId } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchableSelectProps {
  /** All selectable options. */
  options: string[];
  /** Currently selected value, or empty string for none. */
  value: string;
  /** Called with the new selection when it changes. */
  onChange: (value: string) => void;
  /** Placeholder shown when nothing is selected. */
  placeholder?: string;
  /**
   * Optional matcher replacing the default substring filter.
   *
   * @param query - What the user typed
   * @param options - The full option list
   * @returns Matching options, best first
   */
  search?: (query: string, options: string[]) => string[];
  /** When true, shows a free-text "Other" entry below the filtered options. */
  allowOther?: boolean;
  /** Accessible name for the control (rendered as a visible label). */
  label: string;
}

/**
 * Searchable dropdown for onboarding questions.
 *
 * Behavior:
 *   - Click the field to open the dropdown.
 *   - Type to filter the visible options.
 *   - Click an option or press Enter on the highlighted row to select.
 *   - When `allowOther` is true and the typed query doesn't match anything,
 *     pressing Enter selects the typed text as a free-form value.
 *
 * @param options - List of option labels to display.
 * @param value - The currently selected value (controlled).
 * @param onChange - Receives the new selected value.
 * @param placeholder - Optional placeholder text shown when value is empty.
 * @param allowOther - When true, permits selecting a custom typed value.
 */
export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search...",
  allowOther = true,
  search,
  label,
}: SearchableSelectProps) {
  const labelId = useId();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /** Close the dropdown when clicking outside. */
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    if (open) {
      document.addEventListener("mousedown", onDocClick);
      return () => document.removeEventListener("mousedown", onDocClick);
    }
  }, [open]);

  /** Focus the search input when the dropdown opens. */
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const trimmed = query.trim();
  // A caller can supply smarter matching (see school-search); the default stays
  // a plain substring filter for short, literal option lists.
  const filtered = useMemo(
    () =>
      search
        ? search(query, options)
        : options.filter((opt) => opt.toLowerCase().includes(query.toLowerCase())),
    [search, query, options],
  );
  // Offer a "use my own" row whenever the user has typed something that isn't
  // already an exact option, even when there are partial matches, so they can
  // always create their own school instead of being forced to pick a match.
  const showOther =
    allowOther &&
    trimmed.length > 0 &&
    !options.some((o) => o.toLowerCase() === trimmed.toLowerCase());
  /** Index of the create row in the navigable list (after the filtered items). */
  const createIndex = filtered.length;

  const commit = useCallback(
    (next: string) => {
      onChange(next);
      setOpen(false);
      setQuery("");
      setHighlight(0);
    },
    [onChange],
  );

  /**
   * Handles keyboard navigation: ArrowUp/Down to move, Enter to commit, Escape to close.
   * Falls back to committing the raw query when no option matches and `allowOther` is on.
   *
   * @param e - The keyboard event from the search input.
   */
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const lastIndex = filtered.length - 1 + (showOther ? 1 : 0);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, Math.max(lastIndex, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      // Enter on the create row (or when there are no matches) commits the typed text.
      if (showOther && highlight === createIndex) {
        commit(trimmed);
      } else if (filtered.length > 0) {
        commit(filtered[Math.min(highlight, filtered.length - 1)] ?? filtered[0]);
      } else if (showOther) {
        commit(trimmed);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div ref={containerRef} className="relative w-full text-left">
      <span id={labelId} className="block text-xs font-medium text-foreground mb-1">
        {label}
      </span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={labelId}
        className="w-full flex items-center justify-between px-4 py-3 bg-card border border-input-border rounded-lg text-sm text-left hover:border-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn("text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute z-dropdown mt-1 w-full bg-popover border border-border rounded-xl shadow-lg dark:shadow-none overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search size={14} className="text-muted-foreground shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlight(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Type to search..."
              aria-label={`Search ${label.toLowerCase()}`}
              aria-controls={listId}
              aria-activedescendant={filtered.length > 0 || showOther ? `${listId}-${highlight}` : undefined}
              role="combobox"
              aria-expanded={open}
              aria-autocomplete="list"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              inputMode="search"
              data-1p-ignore="true"
              data-lpignore="true"
              data-bwignore="true"
              data-form-type="other"
              name="searchable-select"
              className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div id={listId} role="listbox" aria-labelledby={labelId} className="max-h-64 overflow-y-auto py-1">
            {filtered.map((opt, i) => (
              <button
                key={opt}
                id={`${listId}-${i}`}
                type="button"
                role="option"
                aria-selected={value === opt}
                tabIndex={-1}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => commit(opt)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors hover:bg-muted",
                  i === highlight && "bg-muted"
                )}
              >
                <span className="text-foreground">{opt}</span>
                {value === opt && <Check size={14} className="text-blue-500" aria-hidden="true" />}
              </button>
            ))}

            {/* Create-your-own row, always available once the user types
                something that is not already an option. */}
            {showOther && (
              <button
                id={`${listId}-${createIndex}`}
                type="button"
                role="option"
                aria-selected={false}
                tabIndex={-1}
                onMouseEnter={() => setHighlight(createIndex)}
                onClick={() => commit(trimmed)}
                className={cn(
                  "w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-muted",
                  highlight === createIndex && "bg-muted"
                )}
              >
                <span className="text-muted-foreground">Use</span>
                <span className="font-semibold text-foreground">&ldquo;{trimmed}&rdquo;</span>
              </button>
            )}

            {filtered.length === 0 && !showOther && (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                {allowOther ? "Start typing to add your own" : "No matches"}
              </div>
            )}
          </div>

          {allowOther && (
            <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">
              Don&rsquo;t see yours? Just type it and press Enter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
