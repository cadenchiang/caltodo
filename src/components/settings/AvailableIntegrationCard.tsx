"use client";

/**
 * The row for an integration the user has not connected yet.
 *
 * Connected providers render ConnectedIntegrationCard, so the five provider
 * cards (Canvas, Gradescope, Pensive, Brightspace, Blackboard) only ever
 * reach the screen in this state. Their connected and disconnect branches
 * were unreachable and are gone; each card is now this row with its own
 * provider data.
 */

import { useRouter } from "next/navigation";
import type { DisclosureProvider } from "@/lib/integration-disclosure";
import { DISCLOSURE_META } from "@/lib/integration-disclosure";
import { PROVIDER_META } from "@/lib/integration-providers";
import Button from "@/components/ui/Button";

interface AvailableIntegrationCardProps {
  provider: DisclosureProvider;
  /** One line under the name, e.g. "Sync assignments from your Canvas account". */
  description: string;
}

/**
 * Renders an unconnected integration with its Connect action.
 *
 * @param provider - Which provider; supplies the label, logo and setup route
 * @param description - Subtitle under the provider name
 * @returns The row card
 */
export default function AvailableIntegrationCard({ provider, description }: AvailableIntegrationCardProps) {
  const router = useRouter();
  const meta = DISCLOSURE_META[provider];
  const { label, setupRoute } = PROVIDER_META[provider];

  return (
    <div className="rounded-2xl border border-border bg-card px-3 sm:px-4 py-3.5 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${meta.logoTileClassName} flex items-center justify-center shrink-0 overflow-hidden`}>
          <img src={meta.logo} alt="" loading="eager" decoding="sync" className={meta.logoClassName} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => router.push(`/app/onboarding?setup=${setupRoute}`)}
          aria-label={`Connect ${label}`}
          className="text-blue-500"
        >
          Connect
        </Button>
      </div>
    </div>
  );
}
