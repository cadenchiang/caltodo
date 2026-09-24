"use client";

import AvailableIntegrationCard from "./AvailableIntegrationCard";

/**
 * Pensive row in the Available group.
 *
 * A connected Pensive account renders ConnectedIntegrationCard instead, so
 * this card has no connected or disconnect state.
 */
export default function PensieveSettings() {
  return <AvailableIntegrationCard provider="pensieve" description="Assignments from your Pensive calendar" />;
}
