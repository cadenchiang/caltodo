"use client";

import { useEffect, useState } from "react";
import NumberFlow, { useCanAnimate } from "@number-flow/react";

/**
 * Locale pinned so the reserved-width sizer below formats identically to the
 * digits NumberFlow renders. Left to the browser default they can disagree
 * (e.g. "17.596" vs "17,596") and the reservation would be off by a character.
 */
const LOCALE = "en-US";

/**
 * When the roll begins, in ms after mount.
 *
 * The eyebrow that wraps this counter enters with `.animate-fade-up` at a
 * 1000ms delay, and that animation runs for 900ms (see `globals.css`). Rolling
 * before 1900ms means the digits spin while the line is still translating up
 * and un-blurring, and the two compounded motions are what read as glitchy.
 */
const ROLL_START_MS = 1900;

/** How long the digits take to travel, matched to the page's fade-up curve. */
const ROLL_TIMING = {
  duration: 1400,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

/**
 * Digit crossfades are deliberately much shorter than the travel. Stretching
 * opacity across the full 1400ms leaves several digits half-visible at once,
 * which smears rather than rolls.
 */
const FADE_TIMING = { duration: 300, easing: "ease-out" } as const;

interface SyncedCountProps {
  /** The final count to roll up to. Must be > 0; callers guard the zero case. */
  count: number;
}

/**
 * The hero eyebrow's rolling "N assignments synced" figure.
 *
 * Rolls from 0 up to `count` once, after the surrounding eyebrow has finished
 * its entrance. The final value's width is reserved up front by an invisible
 * sizer stacked in the same grid cell, so the centred line never reflows while
 * digits are being added. Without that reservation the text shifts left through
 * the whole animation as "0" grows into "17,596", which is the main source of
 * the jitter.
 *
 * @param count - Final assignment count. Values <= 0 render as a static "0";
 *                the caller is expected to show fallback copy in that case.
 * @returns The animated figure, or the plain formatted number when the viewer
 *          prefers reduced motion or the browser cannot animate it.
 */
export default function SyncedCount({ count }: SyncedCountProps) {
  const canAnimate = useCanAnimate();
  const [value, setValue] = useState(0);

  // When animation is unavailable the static branch below renders the real
  // figure directly, so there is nothing to schedule.
  useEffect(() => {
    if (count <= 0 || !canAnimate) return;
    const timer = setTimeout(() => setValue(count), ROLL_START_MS);
    return () => clearTimeout(timer);
  }, [count, canAnimate]);

  const formatted = count.toLocaleString(LOCALE);

  // Reduced motion or an unsupported browser: show the figure immediately
  // rather than holding a "0" on screen for two seconds for no visual payoff.
  if (!canAnimate) {
    return <span className="font-semibold tabular-nums">{formatted}</span>;
  }

  return (
    <span className="inline-grid align-baseline">
      {/* Sizer: occupies the final width from the first frame so the line
          holds still. Hidden from both painting and the accessibility tree. */}
      <span
        aria-hidden="true"
        className="col-start-1 row-start-1 invisible font-semibold tabular-nums"
      >
        {formatted}
      </span>
      <NumberFlow
        value={value}
        locales={LOCALE}
        willChange
        transformTiming={ROLL_TIMING}
        opacityTiming={FADE_TIMING}
        className="col-start-1 row-start-1 justify-self-end font-semibold tabular-nums"
      />
    </span>
  );
}
