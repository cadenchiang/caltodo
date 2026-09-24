"use client";

import AvailableIntegrationCard from "./AvailableIntegrationCard";

/**
 * Brightspace row in the Available group.
 *
 * A connected Brightspace account renders ConnectedIntegrationCard instead, so
 * this card has no connected or disconnect state.
 */
export default function BrightspaceSettings() {
  return <AvailableIntegrationCard provider="brightspace" description="Assignments from your D2L calendar" />;
}
