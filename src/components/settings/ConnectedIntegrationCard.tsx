"use client";

/**
 * A connected integration, with its accounts behind a dropdown.
 *
 * Mirrors the AI assistants (MCP) card on the same page: the whole header is
 * the toggle, the status is a badge, and everything you can act on lives in
 * the panel underneath. Disconnecting and removing an extra account both go
 * through ConfirmDialog, and the controls are always visible at reduced
 * emphasis rather than revealed on hover, which touch screens cannot do.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useTaskContext } from "@/contexts/TaskContext";
import type { IntegrationCredentials } from "@/lib/types";
import { DISCLOSURE_META, type DisclosureProvider } from "@/lib/integration-disclosure";
import { PROVIDER_META } from "@/lib/integration-providers";
import { addRouteForCatalogId, accountNounForCatalogId } from "@/lib/integration-catalog";
import { hasCourseSelection, type SelectableCourse } from "@/lib/course-selection";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Badge from "@/components/ui/Badge";
import AccountClasses, { PILL_SHAPE } from "./AccountClasses";
import { NEEDS_RECONNECT_LABEL, StatusBadge } from "./integration-status";

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

/** Which confirmation is open: the primary disconnect, or one extra account. */
type Pending = { kind: "disconnect" } | { kind: "remove"; account: DisclosureAccount } | null;

/**
 * Wording for how many tasks a removal takes with it.
 *
 * @param count - Tasks that will be removed
 * @returns "1 synced task" or "N synced tasks"
 */
export function syncedTaskPhrase(count: number): string {
  return count === 1 ? "1 synced task" : `${count} synced tasks`;
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
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const meta = DISCLOSURE_META[provider];
  const addRoute = addRouteForCatalogId(provider);
  const noun = accountNounForCatalogId(provider);
  const needsAttention = accounts.some((a) => a.authFailed);
  const syncedCount = tasks.filter((t) => t.source === meta.taskSource).length;

  const classCount = accounts.reduce((n, a) => n + (a.selectedCourses?.length ?? 0), 0);
  const hasClasses = accounts.some((a) => a.selectedCourses !== null);
  const classSummary = hasClasses ? `${classCount} ${classCount === 1 ? "class" : "classes"}` : "";

  /**
   * How many tasks one extra account would take with it. Only extra Canvas
   * accounts namespace their tasks (external_id "<account id>:..."), so only
   * they can be counted; feed accounts merge into the provider's tasks.
   */
  function extraAccountTaskCount(account: DisclosureAccount): number | null {
    if (provider !== "canvas") return null;
    const prefix = `${account.id}:`;
    return tasks.filter((t) => t.source === "canvas" && (t.external_id ?? "").startsWith(prefix)).length;
  }

  /**
   * Disconnects the primary account: clears its credentials, then removes the
   * tasks it synced. Extra accounts are removed through onRemoveAccount.
   */
  async function handleDisconnect() {
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
      console.error("ConnectedIntegrationCard: disconnect failed", {
        provider,
        error: err instanceof Error ? err.message : String(err),
        impact: "credentials and tasks were left in place",
      });
      showToast(err instanceof Error ? err.message : "Failed to disconnect", { variant: "error" });
    } finally {
      setBusy(null);
      setPending(null);
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
      setPending(null);
    }
  }

  /** Sends the user to this provider's setup step to re-enter its connection. */
  function reconnect() {
    router.push(`/app/onboarding?setup=${PROVIDER_META[provider].setupRoute}`);
  }

  const removing = pending?.kind === "remove" ? pending.account : null;
  const removingCount = removing ? extraAccountTaskCount(removing) : null;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm dark:shadow-none overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-2.5 sm:gap-3.5 px-3 sm:px-4 py-3.5 text-left hover:bg-muted/40 transition-colors cursor-pointer"
      >
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${meta.logoTileClassName} flex items-center justify-center shrink-0 overflow-hidden`}>
          <img src={meta.logo} alt="" loading="eager" decoding="sync" className={meta.logoClassName} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground">{label}</p>
            {accounts.length > 1 && <Badge variant="neutral">{accounts.length}</Badge>}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {[meta.subtitle(credentials), classSummary].filter(Boolean).join(" · ")}
          </p>
        </div>

        <StatusBadge needsReconnect={needsAttention} />
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
            {accounts.map((account) => (
              <div key={account.id} className="rounded-xl border border-border bg-muted/30 overflow-hidden">
                <div className="flex flex-wrap items-center gap-2 px-3 py-2">
                  <span className="flex-1 min-w-0 flex">
                    <span className={`${PILL_SHAPE} font-semibold bg-card border border-border text-foreground`}>
                      {account.label}
                    </span>
                  </span>
                  {account.authFailed && (
                    <>
                      <span className="text-2xs font-medium text-red-500 shrink-0">{NEEDS_RECONNECT_LABEL}</span>
                      <Button size="sm" variant="secondary" onClick={reconnect} disabled={busy !== null}>
                        Reconnect
                      </Button>
                    </>
                  )}
                  {account.isPrimary ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setPending({ kind: "disconnect" })}
                      disabled={busy !== null}
                      loading={busy === "primary"}
                      className="text-muted-foreground"
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setPending({ kind: "remove", account })}
                      disabled={busy !== null}
                      loading={busy === account.id}
                      aria-label={`Remove ${account.label}`}
                      className="text-muted-foreground"
                    >
                      Remove
                    </Button>
                  )}
                </div>

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

            {addRoute && noun && (
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => router.push(`/app/onboarding?setup=${addRoute}`)}
                  aria-label={`Add another ${noun}`}
                  className={`${PILL_SHAPE} gap-1 cursor-pointer bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors`}
                >
                  <Plus size={12} className="shrink-0" />
                  Add another {shortNoun(noun)}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={pending?.kind === "disconnect"}
        title={`Disconnect ${label}?`}
        body={
          syncedCount > 0
            ? `This removes ${syncedTaskPhrase(syncedCount)} from ${label}. You can reconnect later to sync them again.`
            : "No synced tasks to remove. You can reconnect later to sync again."
        }
        confirmLabel="Disconnect"
        destructive
        loading={busy === "primary"}
        onConfirm={handleDisconnect}
        onCancel={() => setPending(null)}
      />

      <ConfirmDialog
        open={removing !== null}
        title={`Remove ${removing?.label ?? "this account"}?`}
        body={
          removingCount === null
            ? "Its assignments stop syncing. Tasks already synced stay until the next sync."
            : removingCount > 0
              ? `This removes ${syncedTaskPhrase(removingCount)} from ${removing?.label}. You can add it again later.`
              : "No synced tasks to remove. You can add it again later."
        }
        confirmLabel="Remove"
        destructive
        loading={removing !== null && busy === removing.id}
        onConfirm={() => removing && handleRemove(removing.id)}
        onCancel={() => setPending(null)}
      />
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
 *          Canvas says it twice. The full noun stays on the accessible name.
 */
function shortNoun(noun: string): string {
  const [first, ...rest] = noun.split(" ");
  return rest.length > 0 ? rest.join(" ") : first;
}
