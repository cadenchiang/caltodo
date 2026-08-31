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
 * The eyebrow enters with `.animate-fade-up` at a 1000ms delay (see
 * `globals.css`). The roll starts with it, so the line arrives and the digits
 * settle as one gesture. Waiting for the entrance to finish instead left the
 * number still spinning a second and a half after everything else had come to
 * rest, which is what made it read as a separate, tacked-on animation.
 */
const ROLL_START_MS = 1000;

/**
 * How long the digits take to travel.
 *
 * Shorter than the 900ms entrance so the number lands first and the line
 * settles onto a figure that has stopped moving. Same curve as `.animate-fade-up`.
 */
const ROLL_TIMING = {
  duration: 800,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

/**
 * Digit crossfades are deliberately much shorter than the travel. Stretching
 * opacity across the full 1400ms leaves several digits half-visible at once,
 * which smears rather than rolls.
 */
const FADE_TIMING = { duration: 200, easing: "ease-out" } as const;

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
    /*
      A plain inline box, deliberately not inline-grid or inline-block. Those
      take their height from the line box (28px here) while surrounding text
      takes its from the font's content area (21px), so the number's box stood
      3px proud above the sentence and 4px below it — visible the moment the
      line was selected. Staying inline keeps it on exactly the same footing
      as the words around it.

      `relative` makes this inline box the containing block for the absolutely
      positioned digits, so the visible number contributes no layout at all.
    */
    <span className="relative font-semibold tabular-nums">
      {/* Sizer: ordinary inline text, so it sets both the box height and the
          final width. Reserving the width up front is what stops the centred
          line reflowing as digits are added. Hidden from painting and from
          the accessibility tree; NumberFlow announces the value itself. */}
      <span aria-hidden="true" className="invisible">
        {formatted}
      </span>
      {/*
        Anchored to the left edge, not the right. Right-aligning parked a lone
        "0" at the far end of a box sized for "17,630", leaving an unexplained
        gap mid-sentence for the whole entrance and then snapping across.
        Growing rightward is how a number counting up is expected to behave.
      */}
      <NumberFlow
        value={value}
        locales={LOCALE}
        willChange
        transformTiming={ROLL_TIMING}
        opacityTiming={FADE_TIMING}
        className="absolute left-0 top-0"
      />
    </span>
  );
}
