/**
 * Flip clock face — retro flip-card style with each digit in a card.
 * Colon separator between hours and minutes. AM/PM label in 12-hour mode.
 *
 * @param now - Current Date
 * @param is24h - 24-hour mode
 * @param timezone - IANA timezone or undefined for local
 * @param fontWeight - CSS font-weight string
 */

import type { ClockFaceProps } from "./types";

/**
 * Formats time into individual digit strings for flip display.
 *
 * @param now - Current Date
 * @param is24h - Whether to use 24-hour format
 * @param timezone - IANA timezone or undefined
 * @returns Object with digits array and optional period string
 */
function getFlipDigits(
  now: Date,
  is24h: boolean,
  timezone?: string
): { digits: [string, string, string, string]; period: string } {
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

  return {
    digits: [hour[0], hour[1], minute[0], minute[1]],
    period,
  };
}

/**
 * Single flip digit card.
 *
 * @param digit - Single character to display
 * @param fontWeight - CSS font-weight number
 */
function FlipCard({ digit, fontWeight }: { digit: string; fontWeight: number }) {
  return (
    <div className="w-10 h-14 rounded-lg bg-muted border border-border flex items-center justify-center">
      <span
        className="text-2xl tabular-nums text-foreground"
        style={{ fontWeight }}
      >
        {digit}
      </span>
    </div>
  );
}

export default function FlipFace({ now, is24h, timezone, fontWeight }: ClockFaceProps) {
  const { digits, period } = getFlipDigits(now, is24h, timezone);
  const weight = Number(fontWeight);

  return (
    <div className="h-full w-full flex items-center justify-center gap-1.5 p-4">
      <FlipCard digit={digits[0]} fontWeight={weight} />
      <FlipCard digit={digits[1]} fontWeight={weight} />
      <span className="text-2xl text-foreground font-bold mx-0.5 -mt-1">:</span>
      <FlipCard digit={digits[2]} fontWeight={weight} />
      <FlipCard digit={digits[3]} fontWeight={weight} />
      {period && (
        <span className="text-xs text-muted-foreground ml-1 self-end mb-1">
          {period}
        </span>
      )}
    </div>
  );
}
