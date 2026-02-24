/**
 * Area chart showing daily signup counts over the last 30 days.
 * Clicking a bar drills into hourly signup distribution for that day.
 * Back button returns to the daily view.
 */

"use client";

import { useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowLeft } from "lucide-react";
import { useChartColors } from "./useChartColors";

interface DailyData {
  date: string;
  count: number;
}

interface HourlyData {
  hour: number;
  count: number;
}

interface SignupsChartProps {
  /** Daily signup data (last 30 days) */
  daily: DailyData[];
  /** Total user count */
  total: number;
}

/**
 * Renders a daily signup area chart with click-to-drill-down into hourly view.
 *
 * @param props - SignupsChartProps with daily data and total count
 * @returns Recharts AreaChart with drill-down capability
 */
export default function SignupsChart({ daily, total }: SignupsChartProps) {
  const colors = useChartColors();
  const [drillDate, setDrillDate] = useState<string | null>(null);
  const [hourly, setHourly] = useState<HourlyData[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDayClick = useCallback(
    async (data: { date?: string }) => {
      if (!data.date || loading) return;

      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/signups?date=${encodeURIComponent(data.date)}`
        );
        if (!res.ok) return;
        const json = await res.json();
        setDrillDate(data.date);
        setHourly(json.hourly);
      } catch {
        // Silently fail — user can try again
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const handleBack = useCallback(() => {
    setDrillDate(null);
    setHourly(null);
  }, []);

  // Format helpers
  const formatDate = (date: unknown) => {
    const str = String(date);
    const d = new Date(str + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatHour = (hour: unknown) => {
    const h = Number(hour);
    if (h === 0) return "12am";
    if (h === 12) return "12pm";
    return h < 12 ? `${h}am` : `${h - 12}pm`;
  };

  // Hourly drill-down view
  if (drillDate && hourly) {
    return (
      <div className="glass rounded-2xl border border-border p-5">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleBack}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Back to daily view"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {formatDate(drillDate)} — Hourly Signups
            </h3>
            <p className="text-xs text-muted-foreground">
              {hourly.reduce((sum, h) => sum + h.count, 0)} signups
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={hourly}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis
              dataKey="hour"
              tickFormatter={formatHour}
              tick={{ fontSize: 11, fill: colors.text }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: colors.text }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: `1px solid ${colors.tooltipBorder}`,
                borderRadius: 12,
                fontSize: 12,
              }}
              labelFormatter={(hour) => formatHour(hour)}
              formatter={(value) => [String(value ?? 0), "Signups"]}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke={colors.primary}
              fill={colors.primary}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Daily view
  return (
    <div className="glass rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Daily Signups
          </h3>
          <p className="text-xs text-muted-foreground">
            Last 30 days — {total} total users
          </p>
        </div>
        {loading && (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={daily}
          margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          onClick={(e: Record<string, unknown>) => {
            const payload = e?.activePayload as Array<{ payload: { date?: string } }> | undefined;
            if (payload?.[0]?.payload) {
              handleDayClick(payload[0].payload);
            }
          }}
          style={{ cursor: "pointer" }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: colors.text }}
            axisLine={false}
            tickLine={false}
            interval={6}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: colors.text }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: colors.tooltipBg,
              border: `1px solid ${colors.tooltipBorder}`,
              borderRadius: 12,
              fontSize: 12,
            }}
            labelFormatter={formatDate}
            formatter={(value) => [String(value ?? 0), "Signups"]}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={colors.primary}
            fill={colors.primary}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="mt-2 text-[11px] text-muted-foreground text-center">
        Click a day to see hourly breakdown
      </p>
    </div>
  );
}
