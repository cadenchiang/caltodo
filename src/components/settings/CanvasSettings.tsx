"use client";

import AvailableIntegrationCard from "./AvailableIntegrationCard";

/**
 * Canvas row in the Available group.
 * At Berkeley, Canvas is called bCourses; either connects here.
 *
 * A connected Canvas account renders ConnectedIntegrationCard instead, so
 * this card has no connected or disconnect state.
 */
export default function CanvasSettings() {
  return <AvailableIntegrationCard provider="canvas" description="Sync assignments from your Canvas account" />;
}
