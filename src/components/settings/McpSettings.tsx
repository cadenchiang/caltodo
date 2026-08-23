"use client";

/**
 * Settings card for connecting an AI assistant (Poke, Claude, any MCP client)
 * to caltodo.
 *
 * Shows the server URL to paste into the client, and lets the user generate
 * and revoke API keys. A new key's plaintext is displayed once, immediately
 * after creation, because only its hash is stored.
 */

import { useState, useSyncExternalStore } from "react";
import useSWR from "swr";
import { Copy, Check, Plus, Trash2, KeyRound } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import type { McpKeyRecord } from "@/lib/mcp/api-keys";

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

/**
 * Formats a timestamp for the key list.
 *
 * @param iso - ISO timestamp, or null when the key has never been used
 * @returns A short human date, or "never"
 */
function formatWhen(iso: string | null): string {
  if (!iso) return "never";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** A copy-to-clipboard button that confirms inline. */
function CopyButton({ value, label }: { value: string; label: string }) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      showToast(`${label} copied to clipboard.`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast(`Failed to copy ${label.toLowerCase()}.`);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 px-3 py-2 rounded-xl border border-input-border text-sm text-secondary-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
      title={`Copy ${label.toLowerCase()}`}
      aria-label={`Copy ${label.toLowerCase()}`}
    >
      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function McpSettings() {
  const { showToast } = useToast();
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  const origin = useOrigin();
  const serverUrl = origin ? `${origin}${MCP_PATH}` : MCP_PATH;

  const { data, error, isLoading, mutate } = useSWR<{ keys: McpKeyRecord[] }>(
    "/api/mcp-keys",
    fetchJson
  );
  const keys = data?.keys ?? [];

  /** Creates a key and reveals its plaintext once. */
  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/mcp-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: "Poke" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create API key");
      }
      const created = await res.json();
      setNewKey(created.key);
      mutate({ keys: [created.record, ...keys] }, { revalidate: false });
      showToast("API key created. Copy it now — it is not shown again.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create API key");
    } finally {
      setCreating(false);
    }
  }

  /** Revokes a key, requiring a second click to confirm. */
  async function handleRevoke(id: string) {
    if (confirmRevoke !== id) {
      setConfirmRevoke(id);
      setTimeout(() => setConfirmRevoke((cur) => (cur === id ? null : cur)), 3000);
      return;
    }
    setConfirmRevoke(null);
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

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-2 mb-1">
        <KeyRound size={18} className="text-foreground" />
        <h2 className="text-lg font-semibold text-foreground">AI assistants (MCP)</h2>
      </div>
      <p className="text-xs text-subtle-foreground mb-4">
        Connect Poke, Claude, or any Model Context Protocol client to caltodo. It can read your
        assignments, add and delete tasks, and recolor your Google Calendar events.
      </p>

      {/* Server URL — the same for every user. */}
      <label className="block text-xs font-medium text-secondary-foreground mb-1.5">
        Server URL
      </label>
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          readOnly
          value={serverUrl}
          className="flex-1 px-3 py-2 rounded-xl border border-input-border text-sm text-secondary-foreground bg-card focus:outline-none select-all"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <CopyButton value={serverUrl} label="Server URL" />
      </div>

      {/* A freshly created key, shown once. */}
      {newKey && (
        <div className="mb-4 p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/5">
          <p className="text-xs font-medium text-foreground mb-1.5">
            Your new API key — copy it now, it will not be shown again.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={newKey}
              className="flex-1 px-3 py-2 rounded-xl border border-input-border text-sm font-mono text-secondary-foreground bg-card focus:outline-none select-all"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <CopyButton value={newKey} label="API key" />
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="mt-2 text-xs text-subtle-foreground hover:text-foreground transition-colors"
          >
            Done
          </button>
        </div>
      )}

      {/* Existing keys. */}
      {isLoading ? (
        <p className="text-sm text-subtle-foreground py-2">Loading API keys...</p>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400 mb-3">
          {error instanceof Error ? error.message : "Failed to load API keys"}
        </p>
      ) : keys.length === 0 ? (
        <p className="text-sm text-subtle-foreground mb-3">
          No API keys yet. Generate one, then paste it into your assistant along with the server
          URL above.
        </p>
      ) : (
        <ul className="space-y-2 mb-3">
          {keys.map((key) => (
            <li
              key={key.id}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-border bg-card"
            >
              <div className="min-w-0">
                <p className="text-sm text-foreground truncate">
                  {key.label}{" "}
                  <span className="font-mono text-xs text-subtle-foreground">
                    {key.keyPrefix}…
                  </span>
                </p>
                <p className="text-xs text-subtle-foreground">
                  Created {formatWhen(key.createdAt)} · Last used {formatWhen(key.lastUsedAt)}
                </p>
              </div>
              <button
                onClick={() => handleRevoke(key.id)}
                className={`shrink-0 px-3 py-1.5 rounded-xl border text-xs transition-colors flex items-center gap-1.5 ${
                  confirmRevoke === key.id
                    ? "border-red-500 text-red-600 dark:text-red-400"
                    : "border-input-border text-secondary-foreground hover:bg-accent"
                }`}
                aria-label={`Revoke ${key.label} key`}
              >
                <Trash2 size={13} />
                {confirmRevoke === key.id ? "Confirm" : "Revoke"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={handleCreate}
        disabled={creating}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        <Plus size={15} />
        {creating ? "Generating..." : "Generate API key"}
      </button>
    </div>
  );
}
