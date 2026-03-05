/**
 * Digital clock face — time with thin divider and date below.
 * Extracted from the original ClockWidget layout.
 *
 * @param now - Current Date
 * @param is24h - 24-hour mode
 * @param timezone - IANA timezone or undefined for local
 * @param fontWeight - CSS font-weight string
 */

import type { ClockFaceProps } from "./types";

export default function DigitalFace({ now, is24h, timezone, fontWeight }: ClockFaceProps) {
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

  /** Split time into parts around the colon for blinking. */
  const colonIdx = timeStr.indexOf(":");
  const timeBefore = colonIdx >= 0 ? timeStr.slice(0, colonIdx) : timeStr;
  const timeAfter = colonIdx >= 0 ? timeStr.slice(colonIdx + 1) : "";

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4">
      <span
        className="text-4xl tracking-tight text-foreground tabular-nums"
        style={{ fontWeight: Number(fontWeight) }}
      >
        {timeBefore}
        <span style={{ animation: "colonBlink 1s ease-in-out infinite" }}>:</span>
        {timeAfter}
      </span>
      <div className="w-10 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent my-2" />
      <span className="text-[11px] tracking-[0.15em] text-foreground">
        {dateStr}
      </span>
    </div>
  );
}
