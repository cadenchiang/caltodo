"use client";

import { useEffect, useState } from "react";
import NumberFlow, { useCanAnimate } from "@number-flow/react";
import { ROLL_START_MS, ROLL_TIMING } from "./synced-count-timing";

/**
 * Locale pinned so the reserved-width sizer below formats identically to the
 * digits NumberFlow renders. Left to the browser default they can disagree
 * (e.g. "17.596" vs "17,596") and the reservation would be off by a character.
 */
const LOCALE = "en-US";

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
      Inline-grid with both children stacked in the one cell, aligned on their
      baselines. The earlier version laid the digits over the sizer with
      `absolute top-0`, which lines up the two *boxes* — and number-flow's box
      is not the text's box. It forces `line-height: 1` on itself and pads each
      digit by half the fade mask, so anchoring at the top parked the figure
      2.5px below the sentence it sits in. Letting grid do baseline alignment
      instead is font- and zoom-independent: the browser matches the digits'
      baseline to the sizer's, whatever the metrics work out to.

      `align-baseline` on the wrapper keeps the whole box sitting on the
      surrounding sentence's baseline rather than on its bottom edge.
    */
    <span className="inline-grid align-baseline font-semibold tabular-nums">
      {/* Sizer: ordinary inline text in cell 1/1, so it sets the column width
          and supplies the baseline the digits align to. Reserving the width up
          front is what stops the centred line reflowing as digits are added.
          Hidden from painting and from the accessibility tree; NumberFlow
          announces the value itself. */}
      <span
        aria-hidden="true"
        className="invisible [grid-area:1/1] self-baseline"
      >
        {formatted}
      </span>
      {/*
        Same cell, justified left rather than right. Right-aligning parked a
        lone "0" at the far end of a box sized for "17,630", leaving an
        unexplained gap mid-sentence for the whole entrance and then snapping
        across. Growing rightward is how a number counting up is expected to
        behave.
      */}
      <NumberFlow
        value={value}
        locales={LOCALE}
        willChange
        transformTiming={ROLL_TIMING}
        opacityTiming={FADE_TIMING}
        className="[grid-area:1/1] self-baseline justify-self-start"
      />
    </span>
  );
}
