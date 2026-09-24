"use client";

/**
 * A connected integration, with its accounts behind a dropdown.
 *
 * Mirrors the AI assistants (MCP) card on the same page: the whole header is
 * the toggle, the status is a plain badge, and everything you can act on lives
 * in the panel underneath.
 *
 * That placement is the point. Disconnecting used to be the front-of-card
 * "Connected" badge turning red on hover, so the control that deletes every
 * synced task from a platform sat under the pointer on the way past. It now
 * takes a deliberate expand first. The "add another account" plus that briefly
 * lived in the header is gone for the same reason: account management is one
 * job and it belongs in one place.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, X } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useTaskContext } from "@/contexts/TaskContext";
import type { IntegrationCredentials } from "@/lib/types";
import { DISCLOSURE_META, type DisclosureProvider } from "@/lib/integration-disclosure";
import { addRouteForCatalogId, accountNounForCatalogId } from "@/lib/integration-catalog";
import { hasCourseSelection, type SelectableCourse } from "@/lib/course-selection";
import AccountClasses, { PILL_SHAPE } from "./AccountClasses";

/** One account listed in the dropdown, whichever store it came from. */
export interface DisclosureAccount {
  /** Stable key. */
  id: string;
  /** What identifies this account: a host, an email, or a user's own label. */
  label: string;
  /** True for the account held in the flat credential columns. */
  isPrimary: boolean;
  /** Whether this account's last sync failed authentication. */
  authFailed: boolean;
  /**
   * Classes selected for this account, or null when the provider offers no
   * choice. Brightspace and Blackboard sync a whole feed, so they have no
   * course endpoint and no column to save a selection into.
   */
  selectedCourses: SelectableCourse[] | null;
}

interface ConnectedIntegrationCardProps {
  provider: DisclosureProvider;
  /** Display name, e.g. "Canvas". */
  label: string;
  credentials: IntegrationCredentials;
  onUpdate: (updated: IntegrationCredentials) => void;
  /** Every account on this integration, primary first. */
  accounts: DisclosureAccount[];
  /** Removes one non-primary account. */
  onRemoveAccount?: (id: string) => Promise<void>;
  /** Persists a class selection for one account. */
  onSaveCourses?: (accountId: string, courses: SelectableCourse[]) => Promise<void>;
}

/**
 * Renders the collapsed row and, when expanded, this integration's accounts.
 *
 * @param provider - Which provider this card is for.
 * @param label - Display name shown in the header.
 * @param credentials - Current credentials, read for the subtitle and status.
 * @param onUpdate - Publishes credential changes after a disconnect.
 * @param accounts - Accounts to list, primary first.
 * @param onRemoveAccount - Removes an extra account; omitted when there are none.
 * @returns The card.
 */
export default function ConnectedIntegrationCard({
  provider,
  label,
  credentials,
  onUpdate,
  accounts,
  onRemoveAccount,
  onSaveCourses,
}: ConnectedIntegrationCardProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { tasks, deleteTasksBySource } = useTaskContext();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const meta = DISCLOSURE_META[provider];
  const addRoute = addRouteForCatalogId(provider);
  const noun = accountNounForCatalogId(provider);
  const needsAttention = meta.authFailed(credentials);
  const syncedCount = tasks.filter((t) => t.source === meta.taskSource).length;

  // How many classes this integration syncs, across all of its accounts. Shown
  // in the collapsed header because it is the thing worth knowing without
  // expanding: an integration that is connected but syncing nothing looks
  // identical to a healthy one otherwise.
  const classCount = accounts.reduce((n, a) => n + (a.selectedCourses?.length ?? 0), 0);
  const hasClasses = accounts.some((a) => a.selectedCourses !== null);
  const classSummary = hasClasses
    ? `${classCount} ${classCount === 1 ? "class" : "classes"}`
    : "";

  /**
   * Disconnects the primary account: clears its credentials, then removes the
   * tasks it synced. Extra accounts are removed through onRemoveAccount.
   */
  async function handleDisconnect() {
    setConfirming(false);
    setBusy("primary");
    try {
      const res = await fetch("/api/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meta.disconnectPayload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to disconnect");
      }
      const updated: IntegrationCredentials = await res.json();
      onUpdate(updated);
      await deleteTasksBySource(meta.taskSource);
      showToast(`${label} disconnected.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to disconnect");
    } finally {
      setBusy(null);
    }
  }

  /** Removes one extra account, leaving the primary alone. */
  async function handleRemove(id: string) {
    if (!onRemoveAccount) return;
    setBusy(id);
    try {
      await onRemoveAccount(id);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm dark:shadow-none overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-2.5 sm:gap-3.5 px-3 sm:px-4 py-3.5 text-left hover:bg-muted/40 transition-colors cursor-pointer"
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <img src={meta.logo} alt="" loading="eager" decoding="sync" className={meta.logoClassName} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground">{label}</p>
            {accounts.length > 1 && (
              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full leading-none shrink-0">
                {accounts.length}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {[meta.subtitle(credentials), classSummary].filter(Boolean).join(" · ")}
          </p>
        </div>

        {/* A badge, not a button: disconnecting is inside the panel. */}
        {needsAttention ? (
          <span className="hidden sm:inline text-xs font-medium px-3 py-1 rounded-lg border border-red-200 dark:border-red-500/30 text-red-500 shrink-0">
            Needs reconnecting
          </span>
        ) : (
          <span className="hidden sm:inline text-xs font-medium px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
            Connected
          </span>
        )}
        <ChevronDown
          size={16}
          className={`text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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
          <div className="px-3 sm:px-4 pb-3 pt-3 border-t border-border space-y-2">
            {/* One bordered block per account. A flat stack of rows gave the
                account, its classes, and the add control the same weight and
                the same left edge, so a second account was indistinguishable
                from a second section of the first. */}
            {accounts.map((account) => (
              <div key={account.id} className="rounded-xl border border-border bg-muted/30 overflow-hidden">
                <div className="group/row flex items-center gap-2 px-3 py-2">
                {/* A pill, like the classes under it: the account label is a
                    value on this card, not a heading over it. */}
                <span className="flex-1 min-w-0 flex">
                  <span className={`${PILL_SHAPE} font-semibold bg-card border border-border text-foreground`}>
                    {account.label}
                  </span>
                </span>
                {account.authFailed && (
                  <span className="text-[11px] font-medium text-red-500 shrink-0">
                    Needs reconnecting
                  </span>
                )}
                {account.isPrimary ? (
                  <button
                    onClick={() => setConfirming(true)}
                    disabled={busy !== null}
                    className="shrink-0 text-[11px] font-medium px-2 py-1 rounded-lg text-muted-foreground opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {busy === "primary" ? "..." : "Disconnect"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleRemove(account.id)}
                    disabled={busy !== null}
                    aria-label={`Remove ${account.label}`}
                    className="shrink-0 p-1 rounded-lg text-muted-foreground opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <X size={14} />
                  </button>
                )}
                </div>

                {/* This account's classes, which only exist per account
                    because the course endpoints are scoped by account_id. */}
                {account.selectedCourses !== null && onSaveCourses && hasCourseSelection(provider) && (
                  <div className="border-t border-border/60 px-3 py-2">
                    <AccountClasses
                      provider={provider}
                      accountId={account.id}
                      selected={account.selectedCourses}
                      onSave={(courses) => onSaveCourses(account.id, courses)}
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Outside the account blocks: this adds a new one rather than
                acting on any of them. */}
            {addRoute && noun && (
              <div className="pt-0.5">
                <button
                  onClick={() => router.push(`/app/onboarding?setup=${addRoute}`)}
                  aria-label={`Add another ${noun}`}
                  className={`${PILL_SHAPE} gap-1 cursor-pointer bg-[#0e89d6]/10 text-[#0e89d6] hover:bg-[#0e89d6]/20 transition-colors`}
                >
                  <Plus size={12} className="shrink-0" />
                  Add another {shortNoun(noun)}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirming && (
        <DisconnectConfirm
          label={label}
          syncedCount={syncedCount}
          onCancel={() => setConfirming(false)}
          onConfirm={handleDisconnect}
        />
      )}
    </div>
  );
}

/**
 * Drops the provider's name from an account noun.
 *
 * @param noun - The full noun, e.g. "Canvas school".
 * @returns Just the thing being added, e.g. "school".
 * @remarks The card's title is directly above this row and already says which
 *          provider it is, so "Add another Canvas school" under a card titled
 *          Canvas says it twice. The full noun stays on the accessible name,
 *          where there is no title nearby to supply it.
 */
function shortNoun(noun: string): string {
  const [first, ...rest] = noun.split(" ");
  return rest.length > 0 ? rest.join(" ") : first;
}

/**
 * Confirmation before a disconnect, which also deletes that platform's tasks.
 *
 * @param label - Provider name.
 * @param syncedCount - How many tasks will be removed.
 * @param onCancel - Dismisses without disconnecting.
 * @param onConfirm - Performs the disconnect.
 */
function DisconnectConfirm({
  label,
  syncedCount,
  onCancel,
  onConfirm,
}: {
  label: string;
  syncedCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-[calc(100%-2rem)] max-w-sm p-6 animate-modal-in">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">Disconnect {label}?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {syncedCount > 0
              ? `This will remove ${syncedCount === 1 ? "1 synced task" : `${syncedCount} synced tasks`} from ${label}. You can reconnect later to sync them again.`
              : "No synced tasks to remove. You can reconnect later to sync again."}
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={onConfirm}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all cursor-pointer"
            >
              Disconnect
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
