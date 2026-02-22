"use client";

import GoogleCalendarSettings from "@/components/settings/GoogleCalendarSettings";
import IntegrationSettings from "@/components/settings/IntegrationSettings";

/**
 * Integrations settings section.
 * Renders Google Calendar, Canvas, Gradescope, and Pensieve cards.
 * Must be rendered inside an IntegrationProvider.
 */
export default function IntegrationsSection() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-1">Integrations</h2>
      <p className="text-xs text-subtle-foreground mb-4">
        Connect your accounts to sync assignments and events.
      </p>
      <div className="space-y-3">
        <GoogleCalendarSettings />
        <IntegrationSettings />
      </div>
    </section>
  );
}
