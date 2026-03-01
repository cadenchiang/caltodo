"use client";

/**
 * Live clock widget showing current time and date.
 * Supports configurable format, timezone, font weight, and color.
 * Updates every second via setInterval.
 *
 * @param config - Widget configuration (clockFormat, clockTimezone, clockFontWeight, textColor)
 */

import { useState, useEffect } from "react";

interface ClockWidgetProps {
  config?: Record<string, string>;
}

export default function ClockWidget({ config }: ClockWidgetProps) {
  const [now, setNow] = useState<Date | null>(null);
  const is24h = config?.clockFormat === "24";
  const timezone = config?.clockTimezone || undefined;
  const fontWeight = config?.clockFontWeight || "300";

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) return null;

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: !is24h,
    ...(timezone ? { timeZone: timezone } : {}),
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "short",
    day: "numeric",
    ...(timezone ? { timeZone: timezone } : {}),
  };

  const timeStr = now.toLocaleTimeString([], timeOptions);
  const dateStr = now.toLocaleDateString([], dateOptions);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4">
      <span
        className="text-4xl tracking-tight text-foreground tabular-nums"
        style={{ fontWeight: Number(fontWeight) }}
      >
        {timeStr}
      </span>
      <div className="w-8 h-px bg-border my-2" />
      <span className="text-xs uppercase tracking-widest text-muted-foreground">
        {dateStr}
      </span>
    </div>
  );
}
