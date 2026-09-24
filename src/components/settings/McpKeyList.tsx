"use client";

/**
 * The list of a user's MCP API keys, one row each.
 *
 * A row shows what the key can do, what it is called, when it was last used and
 * when it lapses. The name is editable in place; revoking takes a second click
 * to confirm.
 *
 * Split out of McpSettings so that card stays under the file-length limit.
 */

import { useState } from "react";
import { Trash2, Pencil } from "lucide-react";
import type { McpKeyRecord } from "@/lib/mcp/api-keys";
import { SCOPE_LABELS } from "@/lib/mcp/scopes";
import { keyUsageLine } from "@/lib/mcp/key-format";

/** How long the revoke button stays armed before reverting, in ms. */
const CONFIRM_WINDOW_MS = 3000;

/**
 * Colours the access badge by how much the key can do.
 *
 * Read-only is the quieter of the two: a key that cannot change anything is
 * the unremarkable case, and full access is the one worth noticing in a list.
 *
 * @param scope - The key's access level
 * @returns Tailwind classes for the badge
 */
function badgeClasses(scope: McpKeyRecord["scope"]): string {
  return scope === "read"
    ? "border-border text-muted-foreground"
    : "border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10";
}

/**
 * Renders one user's keys.
 *
 * @param keys - Key metadata, newest first
 * @param onRename - Saves a new name for a key
 * @param onRevoke - Deletes a key
 * @returns The list, or nothing when there are no keys (the caller shows the
 *          empty state, since it also owns the loading and error states)
 */
export default function McpKeyList({
  keys,
  onRename,
  onRevoke,
}: {
  keys: McpKeyRecord[];
  onRename: (id: string, label: string) => void | Promise<void>;
  onRevoke: (id: string) => void | Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  /** Revokes a key, requiring a second click within the confirm window. */
  function handleRevoke(id: string) {
    if (confirmRevoke !== id) {
      setConfirmRevoke(id);
      setTimeout(
        () => setConfirmRevoke((cur) => (cur === id ? null : cur)),
        CONFIRM_WINDOW_MS
      );
      return;
    }
    setConfirmRevoke(null);
    void onRevoke(id);
  }

  /** Commits an in-place rename and leaves edit mode. */
  function commitRename(id: string) {
    setEditingId(null);
    void onRename(id, draftLabel);
  }

  return (
    <ul className="space-y-1.5">
      {keys.map((key, i) => (
        <li
          key={key.id}
          style={{ animationDelay: `${i * 45}ms` }}
          className="group/key flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-background hover:border-input-border transition-colors animate-row-fade-in"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-mono text-foreground truncate">
                {key.keyPrefix}
                <span className="text-muted-foreground">••••••••</span>
              </p>
              <span
                className={`shrink-0 px-1.5 py-0.5 rounded-md border text-[10px] font-medium ${badgeClasses(
                  key.scope
                )}`}
              >
                {SCOPE_LABELS[key.scope]}
              </span>
            </div>

            {editingId === key.id ? (
              <input
                type="text"
                value={draftLabel}
                maxLength={60}
                autoFocus
                onChange={(e) => setDraftLabel(e.target.value)}
                onBlur={() => commitRename(key.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename(key.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="mt-0.5 w-full max-w-[14rem] px-1.5 py-0.5 rounded border border-input-border bg-card text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            ) : (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(key.id);
                    setDraftLabel(key.label);
                  }}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                  aria-label={`Rename ${key.label}`}
                >
                  {key.label}
                  <Pencil size={9} className="opacity-0 group-hover/key:opacity-60" />
                </button>
                <span>· {keyUsageLine(key.lastUsedAt, key.expiresAt)}</span>
              </p>
            )}
          </div>

          <button
            onClick={() => handleRevoke(key.id)}
            className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              confirmRevoke === key.id
                ? "text-red-600 dark:text-red-400 bg-red-500/10"
                : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
            }`}
            aria-label={`Revoke key ${key.keyPrefix}`}
          >
            <Trash2 size={12} />
            {confirmRevoke === key.id ? "Confirm" : "Revoke"}
          </button>
        </li>
      ))}
    </ul>
  );
}
