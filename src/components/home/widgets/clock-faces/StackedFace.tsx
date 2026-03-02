/**
 * Stacked clock face — hours large on top, minutes below, thin divider between.
 *
 * @param now - Current Date
 * @param is24h - 24-hour mode
 * @param timezone - IANA timezone or undefined for local
 * @param fontWeight - CSS font-weight string
 */

import type { ClockFaceProps } from "./types";

/**
 * Extracts formatted hour and minute strings.
 *
 * @param now - Current Date
 * @param is24h - 24-hour mode
 * @param timezone - IANA timezone or undefined
 * @returns Object with hour, minute, and optional period strings
 */
function getStackedParts(
  now: Date,
  is24h: boolean,
  timezone?: string
): { hour: string; minute: string; period: string } {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: !is24h,
    ...(timezone ? { timeZone: timezone } : {}),
  }).formatToParts(now);

  let hour = "";
  let minute = "";
  let period = "";

  for (const p of parts) {
    if (p.type === "hour") hour = p.value.padStart(2, "0");
    if (p.type === "minute") minute = p.value.padStart(2, "0");
    if (p.type === "dayPeriod") period = p.value;
  }

  return { hour, minute, period };
}

export default function StackedFace({ now, is24h, timezone, fontWeight }: ClockFaceProps) {
  const { hour, minute, period } = getStackedParts(now, is24h, timezone);
  const weight = Number(fontWeight);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4">
      <span
        className="text-5xl tracking-tight text-foreground tabular-nums leading-none"
        style={{ fontWeight: weight }}
      >
        {hour}
      </span>
      <div className="w-6 h-px bg-border my-1.5" />
      <span
        className="text-3xl tracking-tight text-foreground tabular-nums leading-none"
        style={{ fontWeight: weight }}
      >
        {minute}
      </span>
      {period && (
        <span className="text-xs text-muted-foreground mt-1">{period}</span>
      )}
    </div>
  );
}
