"use client";

/**
 * Dialog for creating an MCP API key: what to call it, what it may do, and how
 * long it lasts.
 *
 * Split out of McpSettings so that card stays under the file-length limit, and
 * so the access choice has room to explain itself in a line each rather than in
 * a paragraph above the list.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { McpScope } from "@/lib/mcp/scopes";

/** Key lifetime choices. `null` means the key never expires. */
const EXPIRY_CHOICES: Array<{ label: string; days: number | null }> = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "1 year", days: 365 },
  { label: "Never", days: null },
];

/**
 * The two access levels, with the one line each that explains them.
 *
 * Worded as what the assistant can do, not as which tools it may call: the
 * person picking has no reason to know the tool list.
 */
const SCOPE_CHOICES: Array<{ scope: McpScope; title: string; detail: string }> = [
  { scope: "full", title: "Full access", detail: "Read, add, edit and delete" },
  { scope: "read", title: "Read only", detail: "Look, but never change anything" },
];

/** Lifetime the dialog opens on: long enough to be useful, short enough to lapse. */
const DEFAULT_DAYS = 90;

/**
 * Modal for creating a key.
 *
 * @param open - Whether the dialog is shown
 * @param creating - True while the request is in flight, disabling the button
 * @param onCancel - Dismisses without creating
 * @param onCreate - Creates the key with the chosen name, lifetime and access
 * @returns The dialog in a portal, or null when closed
 * @remarks State is local and deliberately not reset on close: reopening after
 *          an accidental dismissal keeps what was typed.
 */
export default function McpKeyDialog({
  open,
  creating,
  onCancel,
  onCreate,
}: {
  open: boolean;
  creating: boolean;
  onCancel: () => void;
  onCreate: (label: string, days: number | null, scope: McpScope) => void;
}) {
  // Starts empty rather than pre-filled: "Poke" was the only client when this
  // was written, and a name typed over a default is more likely to be the real
  // one. Left blank, the server falls back to "Poke", which the placeholder
  // shows.
  const [label, setLabel] = useState("");
  const [days, setDays] = useState<number | null>(DEFAULT_DAYS);
  const [scope, setScope] = useState<McpScope>("full");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-backdrop-in"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-popover border border-border shadow-xl animate-dialog-in overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">New API key</h3>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          <div>
            <label
              htmlFor="mcp-key-name"
              className="block text-xs font-medium text-foreground mb-1.5"
            >
              Name
            </label>
            <input
              id="mcp-key-name"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={60}
              placeholder="Poke"
              autoFocus
              className="w-full px-3 py-2 rounded-lg border border-input-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <p className="block text-xs font-medium text-foreground mb-1.5">Access</p>
            {/* Stacked rather than chips: each option carries a line of its own,
                which is what makes the difference obvious without a paragraph. */}
            <div
              role="radiogroup"
              aria-label="Access level"
              className="space-y-1.5"
            >
              {SCOPE_CHOICES.map((choice) => {
                const active = scope === choice.scope;
                return (
                  <button
                    key={choice.scope}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setScope(choice.scope)}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                      active
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <span
                      className={`block text-xs font-medium ${
                        active ? "text-blue-600 dark:text-blue-400" : "text-foreground"
                      }`}
                    >
                      {choice.title}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {choice.detail}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="block text-xs font-medium text-foreground mb-1.5">Expires</p>
            <div className="flex flex-wrap gap-1.5">
              {EXPIRY_CHOICES.map((choice) => {
                const active = days === choice.days;
                return (
                  <button
                    key={choice.label}
                    type="button"
                    onClick={() => setDays(choice.days)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                      active
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {choice.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onCreate(label, days, scope)}
            disabled={creating}
            className="px-4 py-1.5 text-sm rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {creating ? "Creating…" : "Create key"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
