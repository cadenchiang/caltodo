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

  const secondsOptions: Intl.DateTimeFormatOptions = {
    second: "2-digit",
    ...(timezone ? { timeZone: timezone } : {}),
  };

  const timeStr = now.toLocaleTimeString([], timeOptions);
  const seconds = now.toLocaleTimeString([], secondsOptions).replace(/[^0-9]/g, "").slice(-2).padStart(2, "0");

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-3">
      <span
        className="text-5xl font-extralight tracking-tighter text-foreground tabular-nums"
      >
        {timeStr}
      </span>
      <span className="text-sm text-foreground/20 tabular-nums mt-1">
        {seconds}
      </span>
    </div>
  );
}
