"use client";

import { useEffect, useRef, useState } from "react";
import DeletableOption from "../DeletableOption";
import { FIELD_INPUT } from "@/components/ui/field-recipe";

interface SearchListPickerProps {
  /** Existing options to choose from. */
  options: string[];
  /** Currently chosen value, for the selected mark (single-select lists). */
  selected?: string | null;
  /** Placeholder for the search box. */
  placeholder: string;
  /** Copy for the empty list. */
  emptyText: string;
  /** Tooltip on each row's delete control. */
  deleteHint: string;
  /** Shown as the first row when nothing is typed; picks null. */
  noneLabel?: string;
  /** Picks an option or a newly typed value. */
  onSelect: (value: string | null) => void;
  /** Deletes an option everywhere. */
  onDelete: (value: string) => void;
  /** Accessible name for the search box. */
  label: string;
}

/**
 * Search box over a list of options with an "Add <typed>" row for new
 * values. Shared by the tag and class pickers in the task editor.
 *
 * @param options - Existing values
 * @param onSelect - Receives the chosen value (null for "None")
 * @param onDelete - Removes a value everywhere (confirmed inside DeletableOption)
 */
export default function SearchListPicker({ options, selected, placeholder, emptyText, deleteHint, noneLabel, onSelect, onDelete, label }: SearchListPickerProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const trimmed = query.trim();
  const filtered = trimmed ? options.filter((o) => o.toLowerCase().includes(trimmed.toLowerCase())) : options;
  const isNew = trimmed !== "" && !options.some((o) => o.toLowerCase() === trimmed.toLowerCase());

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="w-56 py-1.5 max-h-64 overflow-y-auto">
      <div className="px-2.5 pb-1.5">
        <label htmlFor={`search-${label}`} className="sr-only">{label}</label>
        <input
          id={`search-${label}`}
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (trimmed) onSelect(trimmed);
            }
          }}
          placeholder={placeholder}
          className={`${FIELD_INPUT} py-1.5`}
        />
      </div>
      {noneLabel && !trimmed && (
        <button type="button" onClick={() => onSelect(null)} className={`w-full text-left px-4 py-1.5 text-sm transition-colors truncate ${!selected ? "text-blue-600 dark:text-blue-400 font-medium" : "text-muted-foreground hover:bg-accent"}`}>
          {noneLabel}
        </button>
      )}
      {filtered.map((o) => (
        <DeletableOption key={o} label={o} selected={selected === o} onSelect={() => onSelect(o)} onDelete={() => onDelete(o)} deleteHint={deleteHint} />
      ))}
      {isNew && (
        <button type="button" onClick={() => onSelect(trimmed)} className="w-full text-left px-4 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-accent transition-colors">
          Add &ldquo;{trimmed}&rdquo;
        </button>
      )}
      {filtered.length === 0 && !trimmed && <p className="px-4 py-2 text-sm text-muted-foreground">{emptyText}</p>}
    </div>
  );
}
