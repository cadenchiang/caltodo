/**
 * Bar chart showing integration platform adoption counts.
 * Displays how many users have connected Canvas, Gradescope,
 * Google Calendar, and Pensieve.
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
import { useChartColors } from "./useChartColors";

interface PlatformAdoptionProps {
  /** Number of users with Canvas connected */
  canvas: number;
  /** Number of users with Gradescope connected */
  gradescope: number;
  /** Number of users with Google Calendar connected */
  googleCalendar: number;
  /** Number of users with Pensieve connected */
  pensieve: number;
}

/**
 * Renders a horizontal bar chart of platform adoption.
 *
 * @param props - PlatformAdoptionProps with counts per platform
 * @returns Recharts BarChart component
 */
export default function PlatformAdoption({
  canvas,
  gradescope,
  googleCalendar,
  pensieve,
}: PlatformAdoptionProps) {
  const colors = useChartColors();

  const data = [
    { name: "Canvas", count: canvas },
    { name: "Gradescope", count: gradescope },
    { name: "Google Cal", count: googleCalendar },
    { name: "Pensive", count: pensieve },
  ];

  const barColors = [
    colors.primary,
    colors.secondary,
    colors.tertiary,
    colors.quaternary,
  ];

  return (
    <div className="glass rounded-2xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Platform Adoption
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={colors.grid}
            horizontal={false}
          />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: colors.text }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: colors.text }}
            axisLine={false}
            tickLine={false}
            width={90}
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
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={barColors[idx]} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
