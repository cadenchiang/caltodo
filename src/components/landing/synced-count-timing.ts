/**
 * Timing for the hero eyebrow's rolling count, shared with anything that has
 * to arrive after it.
 *
 * Kept out of the "use client" component so a server component (the hero)
 * can read the numbers as plain values.
 *
 * @module synced-count-timing
 */

/**
 * When the roll begins, in ms after mount.
 *
 * The eyebrow enters with `.animate-fade-up` at a 1000ms delay (see
 * `globals.css`). The roll starts with it, so the line arrives and the digits
 * settle as one gesture. Waiting for the entrance to finish instead left the
 * number still spinning a second and a half after everything else had come to
 * rest, which is what made it read as a separate, tacked-on animation.
 */
export const ROLL_START_MS = 1000;

/**
 * How long the digits take to travel.
 *
 * Shorter than the 900ms entrance so the number lands first and the line
 * settles onto a figure that has stopped moving. Same curve as `.animate-fade-up`.
 */
export const ROLL_TIMING = {
  duration: 800,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

/**
 * When the count has come to rest, in ms after mount. The live dot appears
 * here: it marks a figure that has finished arriving, not one still moving.
 */
export const COUNT_SETTLED_MS = ROLL_START_MS + ROLL_TIMING.duration;
