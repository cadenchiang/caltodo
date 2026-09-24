"use client";

/**
 * Settings card for connecting an AI assistant (Poke, Claude, any MCP client)
 * to caltodo.
 *
 * Shows the server URL to paste into the client, and lets the user generate
 * and revoke API keys. A new key's plaintext is displayed once, immediately
 * after creation, because only its hash is stored.
 *
 * Laid out to match the other integration cards on this page: a header row
 * with an icon tile, name and status, over an expandable body.
 */

import { useState, useSyncExternalStore } from "react";
import useSWR from "swr";
import { Plus, Sparkles, ChevronDown } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import type { McpKeyRecord } from "@/lib/mcp/api-keys";
import type { McpScope } from "@/lib/mcp/scopes";
import { timeAgo } from "@/lib/mcp/key-format";
import McpKeyDialog from "@/components/settings/McpKeyDialog";
import McpKeyList from "@/components/settings/McpKeyList";
import { CopyButton, CopyableField } from "@/components/settings/CopyField";

/** Path the MCP endpoint is served from. */
const MCP_PATH = "/api/mcp";

/** No-op subscribe: window.location.origin never changes for a mounted page. */
const subscribeToNothing = () => () => {};

/**
 * Reads the page origin without an effect, so the server render (empty) and the
 * client render stay consistent instead of tripping a hydration mismatch.
 *
 * @returns The origin on the client, an empty string during server rendering
 */
function useOrigin(): string {
  return useSyncExternalStore(
    subscribeToNothing,
    () => window.location.origin,
    () => ""
  );
}

/**
 * Fetches JSON, surfacing the API's error message.
 *
 * @param url - Endpoint to read
 * @returns Parsed JSON body
 * @throws Error carrying the API's message when the response is not ok
 */
async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to load API keys");
  }
  return res.json();
}

export default function McpSettings() {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const origin = useOrigin();
  const serverUrl = origin ? `${origin}${MCP_PATH}` : MCP_PATH;

  const { data, error, isLoading, mutate } = useSWR<{ keys: McpKeyRecord[] }>(
    "/api/mcp-keys",
    fetchJson
  );
  const keys = data?.keys ?? [];
  const connected = keys.length > 0;

  /**
   * Creates a key and reveals its plaintext once.
   *
   * @param label - Name the user gave the key
   * @param expiresInDays - Lifetime in days, or null for no expiry
   * @param scope - What the key is allowed to do
   */
  async function handleCreate(
    label: string,
    expiresInDays: number | null,
    scope: McpScope
  ) {
    setCreating(true);
    try {
      const res = await fetch("/api/mcp-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, expiresInDays, scope }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create API key");
      }
      const created = await res.json();
      setNewKey(created.key);
      mutate({ keys: [created.record, ...keys] }, { revalidate: false });
      setDialogOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create API key");
    } finally {
      setCreating(false);
    }
  }

  /**
   * Saves a renamed key.
   *
   * @param id - Key being renamed
   * @param rawLabel - Name the user typed
   */
  async function handleRename(id: string, rawLabel: string) {
    const label = rawLabel.trim();
    if (!label || label === keys.find((k) => k.id === id)?.label) return;

    try {
      const res = await fetch("/api/mcp-keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, label }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to rename key");
      }
      const { record } = await res.json();
      mutate({ keys: keys.map((k) => (k.id === id ? record : k)) }, { revalidate: false });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to rename key");
    }
  }

  /** Revokes a key. The list owns the confirm step. */
  async function handleRevoke(id: string) {
    try {
      const res = await fetch(`/api/mcp-keys?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to revoke API key");
      }
      mutate({ keys: keys.filter((k) => k.id !== id) }, { revalidate: false });
      showToast("API key revoked.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to revoke API key");
    }
  }

  /** Summary line under the card title. */
  const subtitle = isLoading
    ? "Loading…"
    : error
      ? "Couldn't load your keys"
      : connected
        ? `${keys.length} key${keys.length === 1 ? "" : "s"} · last used ${timeAgo(
            keys.map((k) => k.lastUsedAt).filter(Boolean).sort().reverse()[0] ?? null,
            "never"
          )}`
        : "Let Poke or Claude read and update your tasks";

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm dark:shadow-none overflow-hidden">
      {/* Header row — mirrors the other integration cards on this page. */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-2.5 sm:gap-3.5 px-3 sm:px-4 py-3.5 text-left hover:bg-muted/40 transition-colors cursor-pointer"
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <Sparkles size={18} className="text-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground whitespace-nowrap">
              AI assistants
            </p>
            <span className="text-[9px] font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap">
              MCP
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>

        {connected ? (
          <span className="hidden sm:inline text-xs font-medium px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
            Connected
          </span>
        ) : (
          !isLoading && (
            <span className="hidden sm:inline text-xs font-semibold px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-500/30 text-blue-500 shrink-0">
              Set up
            </span>
          )
        )}
        <ChevronDown
          size={16}
          className={`text-muted-foreground shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="overflow-hidden">
          <div className="px-3 sm:px-4 pb-4 space-y-4 border-t border-border pt-4">
          {/* One line, not a capability list: the client discovers what it can
              do from tools/list, and the access choice is made per key below. */}
          <p className="text-xs text-muted-foreground">
            Connect Poke, Claude, or any MCP client to your assignments and calendar.
          </p>

          <CopyableField label="Server URL" value={serverUrl} />

          {/* A freshly created key, shown once and never again. */}
          {newKey && (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-3 animate-row-fade-in">
              <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300 mb-2">
                Copy this key now — it will not be shown again.
              </p>
              <div className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-card">
                <input
                  type="text"
                  readOnly
                  value={newKey}
                  className="flex-1 min-w-0 bg-transparent text-xs font-mono text-foreground focus:outline-none select-all"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <CopyButton value={newKey} label="API key" compact />
              </div>
              <button
                onClick={() => setNewKey(null)}
                className="mt-2 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/30 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
              >
                Saved it
              </button>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-foreground mb-1.5">API keys</p>

            {isLoading ? (
              <p className="text-xs text-muted-foreground py-2">Loading…</p>
            ) : error ? (
              <p className="text-xs text-red-500 py-2">
                {error instanceof Error ? error.message : "Failed to load API keys"}
              </p>
            ) : keys.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">
                No keys yet.
              </p>
            ) : (
              <McpKeyList keys={keys} onRename={handleRename} onRevoke={handleRevoke} />
            )}
          </div>

          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.97] transition-all duration-200 cursor-pointer"
          >
            <Plus size={15} />
            New key
          </button>

          <McpKeyDialog
            open={dialogOpen}
            creating={creating}
            onCancel={() => setDialogOpen(false)}
            onCreate={handleCreate}
          />
          </div>
        </div>
      </div>
    </div>
  );
}
