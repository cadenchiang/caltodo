"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

interface SearchableSelectProps {
  /** All selectable options. */
  options: string[];
  /** Currently selected value, or empty string for none. */
  value: string;
  /** Called with the new selection when it changes. */
  onChange: (value: string) => void;
  /** Placeholder shown when nothing is selected. */
  placeholder?: string;
  /** When true, shows a free-text "Other" entry below the filtered options. */
  allowOther?: boolean;
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
}: SearchableSelectProps) {
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
  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(query.toLowerCase()),
  );
  // Offer a "use my own" row whenever the user has typed something that isn't
  // already an exact option — even when there ARE partial matches — so they can
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
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1c1c1e] border border-black/10 dark:border-white/10 rounded-xl text-sm text-left hover:border-black/20 dark:hover:border-white/20 transition-colors"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-[#1c1c1e] border border-black/10 dark:border-white/10 rounded-xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.2)] overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-black/5 dark:border-white/5">
            <Search size={14} className="text-muted-foreground shrink-0" />
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
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.map((opt, i) => (
              <button
                key={opt}
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => commit(opt)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
                  i === highlight
                    ? "bg-black/5 dark:bg-white/5"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <span className="text-foreground">{opt}</span>
                {value === opt && <Check size={14} className="text-[#0e89d6]" />}
              </button>
            ))}

            {/* Create-your-own row — always available once the user types
                something that isn't already an option. */}
            {showOther && (
              <button
                type="button"
                onMouseEnter={() => setHighlight(createIndex)}
                onClick={() => commit(trimmed)}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors ${
                  highlight === createIndex
                    ? "bg-black/5 dark:bg-white/5"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
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
            <div className="px-4 py-2 border-t border-black/5 dark:border-white/5 text-xs text-muted-foreground">
              Don&rsquo;t see yours? Just type it and press Enter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
