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

  // No horizontal padding here — the parent <main> already provides px-4/px-10,
  // and this renders inside it.
  return (
    <div className="pt-3">
      <IntegrationProvider>
        <IntegrationHealthBanner />
      </IntegrationProvider>
    </div>
  );
}
