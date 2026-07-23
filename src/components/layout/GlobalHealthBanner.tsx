"use client";

import { usePathname } from "next/navigation";
import { IntegrationProvider } from "@/components/settings/IntegrationSettings";
import IntegrationHealthBanner from "@/components/settings/IntegrationHealthBanner";

/**
 * App-wide integration health banner. The same warning previously showed only
 * inside Settings → Integrations, so a student who never opened Settings got no
 * signal when a connection broke or a token was about to expire. This mounts it
 * at the top of every app page (it renders nothing when everything is healthy).
 *
 * Hidden on Settings (the section already renders its own copy) and on
 * onboarding (that's where you fix things — a second banner would be noise).
 */
export default function GlobalHealthBanner() {
  const pathname = usePathname();
  if (
    !pathname ||
    pathname.startsWith("/app/settings") ||
    pathname.startsWith("/app/onboarding")
  ) {
    return null;
  }

  // Render the provider + banner directly with NO wrapper element. A previous
  // always-present `pt-3` div left a ~12px empty strip at the very top of every
  // page when everything was healthy (IntegrationHealthBanner returns null),
  // which showed as a white gap above the board cover (the board uses negative
  // margins to pull its banner flush to the top). IntegrationHealthBanner
  // supplies its own `mb-4` spacing when it actually renders.
  return (
    <IntegrationProvider>
      <IntegrationHealthBanner />
    </IntegrationProvider>
  );
}
