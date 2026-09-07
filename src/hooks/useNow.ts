"use client";

/**
 * The current time, as React state.
 *
 * Reading `Date.now()` during render is impure: two renders of the same
 * props can disagree, which is the class of bug the React Compiler's purity
 * rule exists to catch, and it makes server and client markup disagree at
 * hydration. Holding the time in state makes it an input like any other,
 * refreshed on a timer rather than on every render.
 *
 * @module useNow
 */

import { useEffect, useState } from "react";

/**
 * Returns the current time, refreshed on an interval.
 *
 * @param intervalMs - How often to refresh; defaults to once a minute, which
 *                     is as fine as "is this past" and "how long ago" need
 * @returns The time as of the last tick
 * @remarks Starts with the time at mount and ticks from there; a component
 *          that unmounts stops its timer. An interval of 0 disables the
 *          timer for callers that only want a stable "now" per mount.
 */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (intervalMs <= 0) return;
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
