/**
 * Bar chart showing integration platform adoption counts: how many users
 * have connected each platform, with every platform's full name.
 */

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { PROVIDER_LABELS } from "@/lib/copy";
import { useChartColors, type ChartColors } from "./useChartColors";

export interface PlatformAdoptionProps {
  /** Number of users with Canvas connected */
  canvas: number;
  /** Number of users with Gradescope connected */
  gradescope: number;
  /** Number of users with Google Calendar connected */
  googleCalendar: number;
  /** Number of users with Pensive connected */
  pensieve: number;
  /** Number of users with Brightspace connected */
  brightspace: number;
  /** Number of users with Blackboard connected */
  blackboard: number;
  /** Number of users with Google Classroom sync on */
  classroom: number;
  /** Number of users with at least one syllabus import */
  syllabus: number;
}

/** One bar of the chart. */
export interface PlatformRow {
  name: string;
  count: number;
}

/**
 * Builds the chart rows, one per platform, using the product labels.
 *
 * @param counts - Adoption counts from /api/admin/overview
 * @returns Rows in display order with full platform names
 */
export function buildPlatformRows(counts: PlatformAdoptionProps): PlatformRow[] {
  return [
    { name: PROVIDER_LABELS.canvas, count: counts.canvas },
    { name: PROVIDER_LABELS.gradescope, count: counts.gradescope },
    { name: PROVIDER_LABELS.gcal, count: counts.googleCalendar },
    { name: PROVIDER_LABELS.pensieve, count: counts.pensieve },
    { name: PROVIDER_LABELS.brightspace, count: counts.brightspace },
    { name: PROVIDER_LABELS.blackboard, count: counts.blackboard },
    { name: PROVIDER_LABELS.classroom, count: counts.classroom },
    { name: PROVIDER_LABELS.syllabus, count: counts.syllabus },
  ];
}

/**
 * Cycles the four series colors across the bars.
 *
 * @param colors - The resolved chart colors
 * @param index - Bar index
 * @returns A fill color
 */
export function barColor(colors: ChartColors, index: number): string {
  const series = [colors.primary, colors.secondary, colors.tertiary, colors.quaternary];
  return series[index % series.length];
}

/** Height per bar plus chart padding, so eight rows never crowd. */
const ROW_HEIGHT = 34;

/**
 * Renders a horizontal bar chart of platform adoption.
 *
 * @param props - Counts per platform
 * @returns Recharts BarChart component
 */
export default function PlatformAdoption(props: PlatformAdoptionProps) {
  const colors = useChartColors();
  const data = buildPlatformRows(props);

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Platform adoption</h3>
      <ResponsiveContainer width="100%" height={data.length * ROW_HEIGHT + 20}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: colors.text }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: colors.text }}
            axisLine={false}
            tickLine={false}
            width={120}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: colors.tooltipBg,
              border: `1px solid ${colors.tooltipBorder}`,
              borderRadius: 12,
              fontSize: 12,
            }}
            formatter={(value) => [String(value ?? 0), "Users"]}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={barColor(colors, idx)} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
