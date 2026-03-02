/**
 * Minimal clock face — time only, oversized, ultra-clean.
 * No date, no divider.
 *
 * @param now - Current Date
 * @param is24h - 24-hour mode
 * @param timezone - IANA timezone or undefined for local
 * @param fontWeight - CSS font-weight string
 */

import type { ClockFaceProps } from "./types";

export default function MinimalFace({ now, is24h, timezone, fontWeight }: ClockFaceProps) {
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: !is24h,
    ...(timezone ? { timeZone: timezone } : {}),
  };

  const timeStr = now.toLocaleTimeString([], timeOptions);

  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <span
        className="text-5xl tracking-tight text-foreground tabular-nums"
        style={{ fontWeight: Number(fontWeight) }}
      >
        {timeStr}
      </span>
    </div>
  );
}
