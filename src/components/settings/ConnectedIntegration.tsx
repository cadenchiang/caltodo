"use client";

/**
 * Assembles one connected integration's accounts and hands them to the card.
 *
 * The accounts come from two stores and neither is the card's business: the
 * primary account lives in the flat credential columns, Canvas keeps its extra
 * schools in `additional_canvas_accounts`, and the feed providers keep theirs
 * in `integration_accounts` behind an API. This resolves all three into one
 * list so the card can render any provider the same way.
 */

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import { useTaskContext } from "@/contexts/TaskContext";
import type { IntegrationCredentials } from "@/lib/types";
import {
  accountDisplayName,
  isFeedProvider,
  PROVIDER_META,
} from "@/lib/integration-providers";
import type { DisclosureProvider } from "@/lib/integration-disclosure";
import ConnectedIntegrationCard, {
  type DisclosureAccount,
} from "./ConnectedIntegrationCard";

/** One extra account as returned by /api/integration-accounts. */
interface AccountRow {
  id: string;
  provider: string;
  label: string;
  connection: Record<string, unknown>;
  auth_failed: boolean;
}

interface ConnectedIntegrationProps {
  provider: DisclosureProvider;
  label: string;
  credentials: IntegrationCredentials;
  onUpdate: (updated: IntegrationCredentials) => void;
}

/**
 * Names the primary account in a way that identifies it.
 *
 * @param provider - Which provider the account belongs to.
 * @param credentials - Current credentials.
 * @returns The account's email, its Canvas host, or the provider's own name.
 * @remarks A feed URL is mostly opaque token, so only its host is worth
 *          showing; an email identifies itself.
 */
function primaryLabel(provider: DisclosureProvider, credentials: IntegrationCredentials): string {
  if (provider === "gradescope") return credentials.gradescope_email ?? "Primary account";
  const url =
    provider === "canvas"
      ? credentials.canvas_base_url || credentials.canvas_ical_url
      : provider === "pensieve"
        ? credentials.pensieve_calendar_url
        : provider === "brightspace"
          ? credentials.brightspace_calendar_url
          : credentials.blackboard_calendar_url;
  if (!url) return "Primary account";
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/**
 * Loads this provider's accounts and renders its card.
 *
 * @param provider - Which provider to render.
 * @param label - Display name.
 * @param credentials - Current credentials.
 * @param onUpdate - Publishes credential changes.
 * @returns The connected card, with every account behind its dropdown.
 */
export default function ConnectedIntegration({
  provider,
  label,
  credentials,
  onUpdate,
}: ConnectedIntegrationProps) {
  const { showToast } = useToast();
  const { deleteTasksByExternalIdPrefix } = useTaskContext();
  const [feedAccounts, setFeedAccounts] = useState<AccountRow[]>([]);

  // Only the feed providers keep accounts in the accounts table. The cancelled
  // flag stops a slow response from landing after this card has moved on,
  // which would otherwise show one provider's accounts under another.
  useEffect(() => {
    if (!isFeedProvider(provider)) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/integration-accounts");
        if (!res.ok || cancelled) return;
        const data: { accounts?: AccountRow[] } = await res.json();
        if (cancelled) return;
        setFeedAccounts((data.accounts ?? []).filter((a) => a.provider === provider));
      } catch {
        // Non-critical: the primary account still lists on its own.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [provider]);

  const removeFeedAccount = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/integration-accounts?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to remove account");
        }
        setFeedAccounts((prev) => prev.filter((a) => a.id !== id));
        showToast(`Removed the extra ${PROVIDER_META[provider].label} calendar.`);
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to remove account");
      }
    },
    [provider, showToast]
  );

  const removeCanvasAccount = useCallback(
    async (id: string) => {
      const remaining = (credentials.additional_canvas_accounts ?? []).filter((a) => a.id !== id);
      try {
        const res = await fetch("/api/credentials", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ additional_canvas_accounts: remaining }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to remove account");
        }
        onUpdate(await res.json());
        // Tasks from an extra Canvas account carry that account's id as an
        // external_id prefix. Without this they survive the account's removal
        // and there is nothing left in settings that could ever clear them.
        await deleteTasksByExternalIdPrefix(`${id}:`);
        showToast("Removed the extra Canvas school.");
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to remove account");
      }
    },
    [credentials.additional_canvas_accounts, onUpdate, showToast, deleteTasksByExternalIdPrefix]
  );

  const accounts: DisclosureAccount[] = [
    {
      id: "primary",
      label: primaryLabel(provider, credentials),
      isPrimary: true,
      authFailed: false,
    },
    ...(provider === "canvas"
      ? (credentials.additional_canvas_accounts ?? []).map((a) => ({
          id: a.id,
          label: a.label || (() => {
            try {
              return new URL(a.base_url || a.ical_url || "").hostname;
            } catch {
              return "Canvas school";
            }
          })(),
          isPrimary: false,
          authFailed: !!a.auth_failed,
        }))
      : []),
    ...(isFeedProvider(provider)
      ? feedAccounts.map((a) => ({
          id: a.id,
          label: accountDisplayName(provider, a.label, a.connection),
          isPrimary: false,
          authFailed: a.auth_failed,
        }))
      : []),
  ];

  return (
    <ConnectedIntegrationCard
      provider={provider}
      label={label}
      credentials={credentials}
      onUpdate={onUpdate}
      accounts={accounts}
      onRemoveAccount={provider === "canvas" ? removeCanvasAccount : removeFeedAccount}
    />
  );
}
