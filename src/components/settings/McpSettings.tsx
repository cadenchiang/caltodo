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
import { Copy, Check, Plus, Trash2, Sparkles, ChevronDown } from "lucide-react";
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
 * Formats a timestamp as a short relative age.
 *
 * @param iso - ISO timestamp, or null when the event never happened
 * @param fallback - Text to show when iso is null
 * @returns Something like "2h ago", "3d ago", or a date for older stamps
 */
function timeAgo(iso: string | null, fallback: string): string {
  if (!iso) return fallback;

  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** A copy button that swaps to a check for two seconds after copying. */
function CopyButton({
  value,
  label,
  compact = false,
}: {
  value: string;
  label: string;
  compact?: boolean;
}) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      showToast(`${label} copied.`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast(`Failed to copy ${label.toLowerCase()}.`);
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleCopy}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 cursor-pointer"
        title={`Copy ${label.toLowerCase()}`}
        aria-label={`Copy ${label.toLowerCase()}`}
      >
        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-secondary-foreground hover:bg-muted transition-colors cursor-pointer"
      aria-label={`Copy ${label.toLowerCase()}`}
    >
      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/** A labelled, read-only value with a copy affordance. */
function CopyableField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground mb-1.5">{label}</p>
      <div className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-lg border border-input-border bg-background">
        <input
          type="text"
          readOnly
          value={value}
          className="flex-1 min-w-0 bg-transparent text-xs font-mono text-secondary-foreground focus:outline-none select-all"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <CopyButton value={value} label={label} compact />
      </div>
    </div>
  );
}

export default function McpSettings() {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
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
  const connected = keys.length > 0;

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
          <p className="text-xs text-muted-foreground">
            Paste the server URL and a key into Poke, Claude, or any Model Context Protocol
            client. It can then read your assignments, add and delete tasks, and recolor your
            Google Calendar events.
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

          {/* Existing keys. */}
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
                No keys yet. Generate one to connect an assistant.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {keys.map((key, i) => (
                  <li
                    key={key.id}
                    style={{ animationDelay: `${i * 45}ms` }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-background hover:border-input-border transition-colors animate-row-fade-in"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-foreground truncate">
                        {key.keyPrefix}
                        <span className="text-muted-foreground">••••••••</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {key.label} · added {timeAgo(key.createdAt, "just now")} · used{" "}
                        {timeAgo(key.lastUsedAt, "never")}
                      </p>
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
            )}
          </div>

          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          >
            <Plus size={15} className={creating ? "animate-spin" : ""} />
            {creating ? "Generating…" : "Generate key"}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
