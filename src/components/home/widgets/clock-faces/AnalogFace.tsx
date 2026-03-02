/**
 * Analog clock face — SVG circle with hour, minute, and second hands.
 * 12 tick marks around the rim. Responsive via viewBox.
 *
 * @param now - Current Date
 * @param is24h - Unused (analog is always 12-hour visual)
 * @param timezone - IANA timezone or undefined for local
 * @param fontWeight - Unused for SVG hands
 */

import type { ClockFaceProps } from "./types";

/**
 * Extracts hours, minutes, seconds for a given timezone.
 *
 * @param now - Current Date
 * @param timezone - IANA timezone string or undefined
 * @returns Object with h (0-23), m (0-59), s (0-59)
 */
function getTimeParts(now: Date, timezone?: string): { h: number; m: number; s: number } {
  if (!timezone) {
    return { h: now.getHours(), m: now.getMinutes(), s: now.getSeconds() };
  }
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
    timeZone: timezone,
  }).formatToParts(now);

  let h = 0, m = 0, s = 0;
  for (const p of parts) {
    if (p.type === "hour") h = parseInt(p.value);
    if (p.type === "minute") m = parseInt(p.value);
    if (p.type === "second") s = parseInt(p.value);
  }
  return { h, m, s };
}

export default function AnalogFace({ now, timezone }: ClockFaceProps) {
  const { h, m, s } = getTimeParts(now, timezone);
  const cx = 100;
  const cy = 100;

  const hourAngle = (h % 12) * 30 + m * 0.5;
  const minuteAngle = m * 6;
  const secondAngle = s * 6;

  const ticks = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <svg viewBox="0 0 200 200" className="max-w-[160px] aspect-square">
        {/* Outer circle */}
        <circle
          cx={cx} cy={cy} r={92}
          fill="none"
          className="stroke-border"
          strokeWidth={2}
        />

        {/* Tick marks */}
        {ticks.map((angle) => {
          const isMajor = angle % 90 === 0;
          const outerR = 88;
          const innerR = isMajor ? 78 : 82;
          const rad = (angle - 90) * (Math.PI / 180);
          return (
            <line
              key={angle}
              x1={cx + innerR * Math.cos(rad)}
              y1={cy + innerR * Math.sin(rad)}
              x2={cx + outerR * Math.cos(rad)}
              y2={cy + outerR * Math.sin(rad)}
              className="stroke-foreground"
              strokeWidth={isMajor ? 2.5 : 1.5}
              strokeLinecap="round"
            />
          );
        })}

        {/* Hour hand */}
        <line
          x1={cx} y1={cy}
          x2={cx} y2={cy - 48}
          className="stroke-foreground"
          strokeWidth={3.5}
          strokeLinecap="round"
          transform={`rotate(${hourAngle} ${cx} ${cy})`}
        />

        {/* Minute hand */}
        <line
          x1={cx} y1={cy}
          x2={cx} y2={cy - 66}
          className="stroke-foreground"
          strokeWidth={2.5}
          strokeLinecap="round"
          transform={`rotate(${minuteAngle} ${cx} ${cy})`}
        />

        {/* Second hand */}
        <line
          x1={cx} y1={cy}
          x2={cx} y2={cy - 70}
          className="stroke-red-500"
          strokeWidth={1}
          strokeLinecap="round"
          transform={`rotate(${secondAngle} ${cx} ${cy})`}
        />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={3} className="fill-foreground" />
      </svg>
    </div>
  );
}
