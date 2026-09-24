/**
 * Reusable stat card component for the admin dashboard.
 * Displays a metric label, value, and optional subtext with glass styling.
 */

"use client";

interface StatCardProps {
  /** Label displayed above the value (e.g. "Daily Active Users") */
  label: string;
  /** The primary metric value to display */
  value: string | number;
  /** Optional subtext displayed below the value (e.g. "+12% from last week") */
  subtext?: string;
}

/**
 * Renders a glass-styled metric card.
 *
 * @param props - StatCardProps with label, value, and optional subtext
 * @returns A styled stat card element
 */
export default function StatCard({ label, value, subtext }: StatCardProps) {
  return (
    <div className="glass rounded-2xl border border-border p-5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      {subtext && (
        <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
      )}
    </div>
  );
}
