/**
 * Displays DAU, WAU, MAU stat cards and a stickiness ratio indicator.
 * Used in the Retention tab of the admin dashboard.
 */

"use client";

import StatCard from "./StatCard";

interface RetentionMetricsProps {
  /** Daily active users (last 24h) */
  dau: number;
  /** Weekly active users (last 7d) */
  wau: number;
  /** Monthly active users (last 30d) */
  mau: number;
  /** DAU/MAU stickiness percentage (0-100) */
  stickiness: number;
}

/**
 * Renders a grid of retention metric cards.
 *
 * @param props - DAU, WAU, MAU, and stickiness values
 * @returns Grid of StatCard components
 */
export default function RetentionMetrics({
  dau,
  wau,
  mau,
  stickiness,
}: RetentionMetricsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="DAU" value={dau} subtext="Last 24 hours" />
      <StatCard label="WAU" value={wau} subtext="Last 7 days" />
      <StatCard label="MAU" value={mau} subtext="Last 30 days" />
      <StatCard
        label="Stickiness"
        value={`${stickiness}%`}
        subtext="DAU / MAU"
      />
    </div>
  );
}
