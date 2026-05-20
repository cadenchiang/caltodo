/**
 * Split clock face — hours and minutes in separate rounded cards
 * that scale to fill the widget container. Matches the Notion-style
 * large card clock layout.
 *
 * @param now - Current Date
 * @param is24h - 24-hour mode
 * @param timezone - IANA timezone or undefined for local
 * @param fontWeight - CSS font-weight string
 */

import { useRef, useState, useEffect } from "react";
import type { ClockFaceProps } from "./types";

/**
 * Extracts formatted hours, minutes, period, and day from a Date.
 *
 * @param now - Current Date
 * @param is24h - Whether to use 24-hour format
 * @param timezone - IANA timezone or undefined
 * @returns Object with hour, minute, period, and day strings
 */
function getSplitParts(
  now: Date,
  is24h: boolean,
  timezone?: string
): { hour: string; minute: string; period: string; day: string } {
  const timeParts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: !is24h,
    ...(timezone ? { timeZone: timezone } : {}),
  }).formatToParts(now);

  const dayName = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    ...(timezone ? { timeZone: timezone } : {}),
  }).format(now);

  let hour = "";
  let minute = "";
  let period = "";

  for (const p of timeParts) {
    if (p.type === "hour") hour = p.value.padStart(2, "0");
    if (p.type === "minute") minute = p.value.padStart(2, "0");
    if (p.type === "dayPeriod") period = p.value;
  }

  return { hour, minute, period, day: dayName.toUpperCase() };
}

export default function SplitFace({ now, is24h, timezone, fontWeight }: ClockFaceProps) {
  const { hour, minute, period, day } = getSplitParts(now, is24h, timezone);
  const weight = Number(fontWeight);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  /** Observe container size to scale cards proportionally. */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Scale cards to fill nearly all available space
  // Reserve ~15% height for labels below the cards
  const cardAreaH = size.h * 0.82;
  const availW = size.w * 0.88;
  const gap = Math.max(availW * 0.03, 4);
  const cardW = (availW - gap) / 2;
  const cardH = Math.min(cardAreaH, cardW * 1.2);
  const fontSize = cardH * 0.58;
  const labelSize = Math.max(cardH * 0.13, 10);
  const borderRadius = cardH * 0.12;

  return (
    <div ref={containerRef} className="h-full w-full flex items-center justify-center">
      {size.w > 0 && (
        <div className="flex items-start justify-center" style={{ gap }}>
          {/* Hour card */}
          <div className="flex flex-col items-center">
            <div
              className="relative flex items-center justify-center overflow-hidden"
              style={{
                width: cardW,
                height: cardH,
                borderRadius,
                backgroundColor: "var(--split-card-bg, rgba(200, 190, 180, 0.25))",
              }}
            >
              <div
                className="absolute inset-x-0 top-1/2 -translate-y-px"
                style={{ height: 1, backgroundColor: "var(--split-divider, rgba(0,0,0,0.06))" }}
              />
              <span
                className="tabular-nums leading-none relative z-10"
                style={{
                  fontSize,
                  fontWeight: Math.max(weight, 700),
                  color: "var(--split-digit-color, white)",
                }}
              >
                {hour}
              </span>
            </div>
            {period && (
              <span
                className="text-foreground uppercase tracking-wider font-semibold"
                style={{ fontSize: labelSize, marginTop: labelSize * 0.4 }}
              >
                {period}
              </span>
            )}
          </div>

          {/* Minute card */}
          <div className="flex flex-col items-center">
            <div
              className="relative flex items-center justify-center overflow-hidden"
              style={{
                width: cardW,
                height: cardH,
                borderRadius,
                backgroundColor: "var(--split-card-bg, rgba(200, 190, 180, 0.25))",
              }}
            >
              <div
                className="absolute inset-x-0 top-1/2 -translate-y-px"
                style={{ height: 1, backgroundColor: "var(--split-divider, rgba(0,0,0,0.06))" }}
              />
              <span
                className="tabular-nums leading-none relative z-10"
                style={{
                  fontSize,
                  fontWeight: Math.max(weight, 700),
                  color: "var(--split-digit-color, white)",
                }}
              >
                {minute}
              </span>
            </div>
            <span
              className="text-foreground uppercase tracking-wider font-semibold"
              style={{ fontSize: labelSize, marginTop: labelSize * 0.4 }}
            >
              {day}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
