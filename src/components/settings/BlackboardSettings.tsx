"use client";

import AvailableIntegrationCard from "./AvailableIntegrationCard";

/**
 * Blackboard row in the Available group.
 *
 * A connected Blackboard account renders ConnectedIntegrationCard instead, so
 * this card has no connected or disconnect state.
 */
export default function BlackboardSettings() {
  return <AvailableIntegrationCard provider="blackboard" description="Assignments from your Blackboard calendar" />;
}
