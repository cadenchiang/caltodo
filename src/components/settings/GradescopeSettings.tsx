"use client";

import AvailableIntegrationCard from "./AvailableIntegrationCard";

/**
 * Gradescope row in the Available group.
 *
 * A connected Gradescope account renders ConnectedIntegrationCard instead, so
 * this card has no connected or disconnect state.
 */
export default function GradescopeSettings() {
  return <AvailableIntegrationCard provider="gradescope" description="Sync assignments from Gradescope" />;
}
