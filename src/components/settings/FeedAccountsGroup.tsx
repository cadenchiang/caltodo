"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import {
  PROVIDER_META,
  accountDisplayName,
  type FeedProvider,
} from "@/lib/integration-providers";

/** One additional account as returned by /api/integration-accounts. */
interface AccountRow {
  id: string;
  provider: string;
  label: string;
  connection: Record<string, unknown>;
  auth_failed: boolean;
}

interface FeedAccountsGroupProps {
  /** Which feed provider's extra accounts to show. */
  provider: FeedProvider;
  /**
   * Whether the primary account is connected. The add row is hidden until it
   * is: "add another" reads as nonsense before there is a first one, and the
   * provider's own Connect button is the right entry point.
   */
  primaryConnected: boolean;
}

/**
 * Additional accounts for one iCal-feed provider, plus the row that adds more.
 *
 * The primary account lives in the flat integration_credentials columns and is
 * rendered by that provider's own settings card; this sits underneath it and
 * covers everything beyond the first. Only feed providers get this treatment,
 * because their whole connection is a URL and so a second account needs no
 * secret storage. See integration-providers.ts for why Gradescope and
 * Classroom are excluded.
 *
 * @param provider - Feed provider to list accounts for.
 * @param primaryConnected - Whether the first account is set up.
 */
export default function FeedAccountsGroup({ provider, primaryConnected }: FeedAccountsGroupProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [removing, setRemoving] = useState<string | null>(null);
  const meta = PROVIDER_META[provider];

  // Load this provider's additional accounts on mount. The cancelled flag
  // stops a slow response from committing after the component has moved on,
  // which would otherwise show one provider's accounts under another.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/integration-accounts");
        if (!res.ok || cancelled) return;
        const data: { accounts?: AccountRow[] } = await res.json();
        if (cancelled) return;
        setAccounts((data.accounts ?? []).filter((a) => a.provider === provider));
      } catch {
        // Non-critical: the primary account's card still renders on its own.
      }
    })();
    return () => { cancelled = true; };
  }, [provider]);

  /**
   * Removes one additional account and refreshes the list.
   *
   * Tasks already synced from it are left alone; the next sync reconciles
   * them, which matches how disconnecting a primary feed behaves.
   *
   * @param id - The account row to delete.
   */
  async function handleRemove(id: string) {
    setRemoving(id);
    try {
      const res = await fetch(`/api/integration-accounts?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to remove account");
      }
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      showToast(`Removed the extra ${meta.label} calendar.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to remove account");
    } finally {
      setRemoving(null);
    }
  }

  if (!primaryConnected) return null;

  return (
    <div className="ml-4 sm:ml-6 mt-2 space-y-2">
      {accounts.map((account) => (
        <div
          key={account.id}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card"
        >
          <span className="flex-1 min-w-0 text-xs font-medium text-foreground truncate">
            {accountDisplayName(provider, account.label, account.connection)}
          </span>
          {account.auth_failed && (
            <span className="text-[11px] font-medium text-red-500 shrink-0">Needs reconnecting</span>
          )}
          <button
            onClick={() => handleRemove(account.id)}
            disabled={removing === account.id}
            aria-label={`Remove this ${meta.label} calendar`}
            className="shrink-0 p-1 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      <button
        onClick={() => router.push(`/app/onboarding?setup=${meta.addRoute}`)}
        aria-label={`Add another ${meta.accountNoun}`}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-input-border hover:bg-muted/40 transition-colors cursor-pointer"
      >
        <Plus size={14} />
        Add another {meta.accountNoun}
      </button>
    </div>
  );
}
