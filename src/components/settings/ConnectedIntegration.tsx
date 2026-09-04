"use client";

/**
 * Renders one connected integration's card.
 *
 * Resolving the accounts is a job of its own: they come from three stores
 * (the flat credential columns, Canvas's `additional_canvas_accounts`, and the
 * `integration_accounts` API), and the writes that act on them have to go back
 * to whichever store each came from. That lives in `useIntegrationAccounts`,
 * leaving this to wire the result to the card.
 */

import type { IntegrationCredentials } from "@/lib/types";
import type { DisclosureProvider } from "@/lib/integration-disclosure";
import { hasCourseSelection } from "@/lib/course-selection";
import { useIntegrationAccounts } from "@/hooks/useIntegrationAccounts";
import ConnectedIntegrationCard from "./ConnectedIntegrationCard";

interface ConnectedIntegrationProps {
  provider: DisclosureProvider;
  label: string;
  credentials: IntegrationCredentials;
  onUpdate: (updated: IntegrationCredentials) => void;
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
  const { accounts, removeAccount, saveCourses } = useIntegrationAccounts({
    provider,
    credentials,
    onUpdate,
  });

  return (
    <ConnectedIntegrationCard
      provider={provider}
      label={label}
      credentials={credentials}
      onUpdate={onUpdate}
      accounts={accounts}
      onRemoveAccount={removeAccount}
      onSaveCourses={hasCourseSelection(provider) ? saveCourses : undefined}
    />
  );
}
