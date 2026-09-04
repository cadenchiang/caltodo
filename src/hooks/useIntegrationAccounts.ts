"use client";

/**
 * Fetches one integration's accounts and owns the writes that act on them.
 *
 * A provider's accounts live in up to three stores, so a remove or a class
 * save has to go back to whichever store the account came from: the flat
 * credential columns for the primary account, `additional_canvas_accounts` for
 * Canvas's extra schools, and the `integration_accounts` API for the feed
 * providers. Flattening them into one list is pure and lives in
 * `integration-account-list`; the fetching and the writes live here.
 */

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import { useTaskContext } from "@/contexts/TaskContext";
import type { IntegrationCredentials } from "@/lib/types";
import { isFeedProvider, PROVIDER_META } from "@/lib/integration-providers";
import type { DisclosureProvider } from "@/lib/integration-disclosure";
import {
  COURSE_SELECTION,
  hasCourseSelection,
  type SelectableCourse,
} from "@/lib/course-selection";
import { diffCourseSelection } from "@/lib/course-selection-diff";
import { applyCourseSelectionChange } from "@/lib/course-selection-effects";
import type { DisclosureAccount } from "@/components/settings/ConnectedIntegrationCard";
import {
  buildAccountList,
  primaryCourses,
  type AccountRow,
} from "@/lib/integration-account-list";

/** Which integration to resolve accounts for. */
export interface IntegrationAccountsInput {
  /** Which provider these accounts belong to. */
  provider: DisclosureProvider;
  /** Current credentials, which hold the primary account and Canvas's extras. */
  credentials: IntegrationCredentials;
  /** Publishes credential changes after a write. */
  onUpdate: (updated: IntegrationCredentials) => void;
}

/** What the card needs to list and act on one integration's accounts. */
export interface IntegrationAccounts {
  /** Every account on this integration, primary first. */
  accounts: DisclosureAccount[];
  /** Removes one non-primary account. */
  removeAccount: (id: string) => Promise<void>;
  /** Persists a class selection for one account, and applies it to tasks. */
  saveCourses: (accountId: string, courses: SelectableCourse[]) => Promise<void>;
}

/**
 * Loads this provider's accounts and the operations over them.
 *
 * @param input - The provider, its credentials, and the update publisher.
 * @returns Every account primary-first, plus its remove and class-save writes.
 * @remarks The feed-account fetch is skipped for providers that keep no rows
 *          in `integration_accounts`, and a late response is dropped when the
 *          provider has changed, which would otherwise list one provider's
 *          accounts under another.
 */
export function useIntegrationAccounts({
  provider,
  credentials,
  onUpdate,
}: IntegrationAccountsInput): IntegrationAccounts {
  const { showToast } = useToast();
  const {
    deleteTasksByExternalIdPrefix,
    dismissTasksByCourseNames,
    undismissTasksByCourseNames,
    triggerSync,
  } = useTaskContext();
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

  /**
   * The selection this account had before the save now being made.
   *
   * @param accountId - "primary", or an extra account's id.
   * @returns Its stored courses; an empty list when it has never been set.
   */
  const storedCoursesFor = useCallback(
    (accountId: string): SelectableCourse[] => {
      if (!hasCourseSelection(provider)) return [];
      if (accountId === "primary") return primaryCourses(provider, credentials) ?? [];
      if (provider === "canvas") {
        const account = (credentials.additional_canvas_accounts ?? []).find((a) => a.id === accountId);
        return (account?.selected_courses ?? []) as SelectableCourse[];
      }
      return feedAccounts.find((a) => a.id === accountId)?.selected_courses ?? [];
    },
    [provider, credentials, feedAccounts]
  );

  /**
   * Saves one account's class selection, then applies it to that account's
   * tasks.
   *
   * The primary account's selection is a credentials column; an extra
   * account's is a field on its own row, so the two are written differently
   * even though the picker above them is the same.
   *
   * The write is only half the job. A class the student unticked still has
   * every assignment it ever synced sitting in their inbox until those tasks
   * are hidden, which is why removing a class used to look like it did
   * nothing and editing classes could only ever add.
   */
  const saveCourses = useCallback(
    async (accountId: string, courses: SelectableCourse[]) => {
      if (!hasCourseSelection(provider)) return;
      const column = COURSE_SELECTION[provider].primaryColumn;
      // Read before the write: every branch below replaces what this reads.
      const diff = diffCourseSelection(storedCoursesFor(accountId), courses);

      if (accountId === "primary") {
        const res = await fetch("/api/credentials", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [column]: courses }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to save classes");
        }
        onUpdate(await res.json());
      } else if (provider === "canvas") {
        const next = (credentials.additional_canvas_accounts ?? []).map((a) =>
          a.id === accountId
            ? { ...a, selected_courses: courses as Array<{ id: number; name: string }> }
            : a
        );
        const res = await fetch("/api/credentials", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ additional_canvas_accounts: next }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to save classes");
        }
        onUpdate(await res.json());
      } else {
        const res = await fetch("/api/integration-accounts", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: accountId, selected_courses: courses }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to save classes");
        }
        setFeedAccounts((prev) =>
          prev.map((a) => (a.id === accountId ? { ...a, selected_courses: courses } : a))
        );
      }

      // Past this point the selection is saved. A failure here leaves tasks
      // out of step with it, which is worth saying plainly, but it must not
      // be reported as a failed save or rolled back: the picker's ticks are
      // now correct.
      try {
        const summary = await applyCourseSelectionChange(diff, {
          dismissTasksByCourseNames,
          undismissTasksByCourseNames,
          syncAddedClasses: () => triggerSync(undefined, undefined, { silent: true }),
        });
        showToast(summary || "Classes updated.");
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(
          JSON.stringify({
            level: "error",
            context: "saveCourses: class selection saved but tasks not updated",
            data: {
              provider,
              accountId,
              added: diff.addedNames.length,
              removed: diff.removedNames.length,
              error: message,
            },
          })
        );
        showToast("Classes saved, but their tasks did not update. Try syncing.");
      }
    },
    [
      provider,
      credentials,
      storedCoursesFor,
      onUpdate,
      showToast,
      dismissTasksByCourseNames,
      undismissTasksByCourseNames,
      triggerSync,
    ]
  );

  const accounts = buildAccountList(provider, credentials, feedAccounts);

  return { accounts, removeAccount: provider === "canvas" ? removeCanvasAccount : removeFeedAccount, saveCourses };
}
