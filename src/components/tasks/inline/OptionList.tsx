"use client";

/**
 * Searchable option list shared by the detail panel's class and tag pickers.
 *
 * Both need the same things: filter as you type, pick from what exists,
 * create something new from the search text, retire one that is no longer
 * wanted, and — for classes — clear the field entirely.
 *
 * Picks are staged rather than applied. The panel edits a real assignment, so
 * a stray click used to change one the moment it landed; now the list holds a
 * draft and nothing reaches the task until Save.
 */

import { useState } from "react";
import { Check, Trash2 } from "lucide-react";

interface OptionListProps {
  /** Everything that can be picked. */
  options: string[];
  /** The values currently on the task. Seeds the draft. */
  selected: string[];
  /** Applies the staged selection. Runs on Save only. */
  onCommit: (values: string[]) => void;
  /** Allows new values to be created from the search text. */
  allowCreate?: boolean;
  /** Offers a row that empties the selection, e.g. "None" for a class. */
  clearLabel?: string;
  /** Search box placeholder. */
  placeholder: string;
  /** Shown when there is nothing to pick and nothing typed. */
  emptyLabel: string;
  /** Allows several values to be staged at once, as tags need. */
  multi?: boolean;
  /** Closes the list. */
  onDone: () => void;
  /**
   * Retires a value everywhere it is used. Omit to render rows that cannot
   * be deleted. Unlike a pick, this is not staged: it edits every task
   * carrying the value, which is not this task's draft to hold.
   */
  onDelete?: (value: string) => void;
  /** Tooltip for a row's delete control before it is armed. */
  deleteHint?: string;
  /** Swatch colour for a value. Omit to render rows without a dot. */
  colorFor?: (value: string) => string;
}

/** True when two selections hold the same values, ignoring order and case. */
function sameSelection(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const lower = new Set(a.map((v) => v.toLowerCase()));
  return b.every((v) => lower.has(v.toLowerCase()));
}

/**
 * Renders the search box, the options beneath it, and the Save footer.
 *
 * @param options - Everything pickable
 * @param selected - Values on the task, used to seed the draft
 * @param onCommit - Receives the staged selection when Save is pressed
 * @param allowCreate - Whether the search text can become a new value
 * @param clearLabel - Label for the row that empties the selection
 * @param placeholder - Search placeholder
 * @param emptyLabel - Shown when there is nothing to offer
 * @param multi - Whether several values may be staged
 * @param onDone - Closes the list
 * @param onDelete - Retires a value everywhere, after a confirming click
 * @param deleteHint - Tooltip before the delete control is armed
 * @param colorFor - Swatch colour for a value
 * @remarks Matching is case-insensitive on both sides, so a value is never
 *          offered for creation when it differs only in case from one that
 *          already exists. Only the options scroll: the search box is pinned
 *          above them and the footer below them, so typing to narrow a long
 *          list never scrolls either off screen.
 */
export default function OptionList({
  options,
  selected,
  onCommit,
  allowCreate = false,
  clearLabel,
  placeholder,
  emptyLabel,
  multi = false,
  onDone,
  onDelete,
  deleteHint = "Delete",
  colorFor,
}: OptionListProps) {
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<string[]>(selected);
  // Values typed in this session. They have no task carrying them yet, so
  // they are not in `options` and would otherwise vanish from the list the
  // moment the search box was cleared.
  const [created, setCreated] = useState<string[]>([]);
  // Which row's delete is one click from running. Held here rather than per
  // row so arming a second row disarms the first: two rows both offering to
  // delete on the next click is how the wrong one goes.
  const [armed, setArmed] = useState<string | null>(null);

  const query = search.trim();
  const draftLower = draft.map((s) => s.toLowerCase());
  const all = [...options, ...created.filter((c) => !options.some((o) => o.toLowerCase() === c.toLowerCase()))];

  const filtered = query
    ? all.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : all;

  const canCreate =
    allowCreate && !!query && !all.some((o) => o.toLowerCase() === query.toLowerCase());
  const dirty = !sameSelection(draft, selected);

  /** Stages a value, replacing the selection unless several are allowed. */
  function toggle(value: string) {
    setSearch("");
    setDraft((prev) => {
      const has = prev.some((v) => v.toLowerCase() === value.toLowerCase());
      if (!multi) return has ? [] : [value];
      return has ? prev.filter((v) => v.toLowerCase() !== value.toLowerCase()) : [...prev, value];
    });
  }

  /** Stages a value typed into the search box, and keeps it in the list. */
  function create(value: string) {
    setCreated((prev) => (prev.some((v) => v.toLowerCase() === value.toLowerCase()) ? prev : [...prev, value]));
    toggle(value);
  }

  /** Applies the staged selection and closes. */
  function commit() {
    onCommit(draft);
    onDone();
  }

  /**
   * Arms a row's delete, or runs it when that row is already armed.
   *
   * @param value - The option the control belongs to
   * @param e - The click, stopped so the row underneath is not also staged
   * @remarks Two clicks rather than one: deleting a tag rewrites every task
   *          carrying it, which is far too wide a change to hang off a stray
   *          click on a control that sits inside a row you meant to select.
   */
  function handleDelete(value: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!onDelete) return;
    if (armed === value) {
      setArmed(null);
      setDraft((prev) => prev.filter((v) => v.toLowerCase() !== value.toLowerCase()));
      onDelete(value);
      return;
    }
    setArmed(value);
  }

  return (
    <div className="w-64 bg-popover rounded-xl shadow-2xl border border-border py-1.5 flex flex-col max-h-72">
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
              if (filtered.length === 1) toggle(filtered[0]);
              else if (canCreate) create(query);
            }
          }}
          placeholder={placeholder}
          className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {clearLabel && !query && (
          <button
            type="button"
            onClick={() => setDraft([])}
            className={`w-full text-left px-4 py-1.5 text-sm transition-colors truncate hover:bg-accent ${
              draft.length === 0 ? "text-blue-500 font-medium" : "text-muted-foreground"
            }`}
          >
            {clearLabel}
          </button>
        )}

        {filtered.map((option) => {
          const isSelected = draftLower.includes(option.toLowerCase());
          const isArmed = armed === option;
          return (
            // The row is a div holding two buttons rather than one button, so
            // the delete control is not nested inside the control that picks.
            <div
              key={option}
              className="group/opt flex items-center w-full hover:bg-accent transition-colors"
            >
              <button
                type="button"
                onClick={() => toggle(option)}
                className={`flex-1 min-w-0 flex items-center gap-2 text-left pl-3 pr-2 py-1.5 text-sm transition-colors ${
                  isSelected ? "text-blue-500 font-medium" : "text-foreground"
                }`}
              >
                {colorFor && (
                  <span
                    aria-hidden
                    className="shrink-0 w-2 h-2 rounded-full"
                    style={{ backgroundColor: colorFor(option) }}
                  />
                )}
                <span className="flex-1 min-w-0 truncate">{option}</span>
                {isSelected && <Check size={14} className="shrink-0" />}
              </button>

              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => handleDelete(option, e)}
                  title={isArmed ? "Click again to delete" : deleteHint}
                  aria-label={isArmed ? `Confirm delete ${option}` : `Delete ${option}`}
                  className={`shrink-0 mr-2 px-1.5 py-1 rounded-md transition-all ${
                    isArmed
                      ? "text-white bg-red-500 hover:bg-red-600 text-[11px] font-semibold"
                      : // Revealed on hover where there is a pointer, always
                        // shown on touch, where there is no hover to reveal it.
                        "text-muted-foreground hover:text-red-500 opacity-0 group-hover/opt:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
                  }`}
                >
                  {isArmed ? "Delete?" : <Trash2 size={13} />}
                </button>
              )}
            </div>
          );
        })}

        {canCreate && (
          <button
            type="button"
            onClick={() => create(query)}
            className="w-full text-left px-4 py-1.5 text-sm text-blue-500 hover:bg-accent transition-colors truncate"
          >
            Add &ldquo;{query}&rdquo;
          </button>
        )}

        {filtered.length === 0 && !query && (
          <p className="px-4 py-2 text-sm text-muted-foreground">{emptyLabel}</p>
        )}
      </div>

      {/* Save footer — nothing above this line has touched the assignment. */}
      <div className="shrink-0 flex items-center justify-end gap-1.5 border-t border-border px-2.5 pt-1.5 mt-1.5">
        <button
          type="button"
          onClick={onDone}
          className="px-2.5 py-1 text-xs font-medium rounded-lg text-muted-foreground hover:bg-accent transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={commit}
          disabled={!dirty}
          className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-blue-500 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
}
