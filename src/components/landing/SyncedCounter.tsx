"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";

/**
 * Fallback shown while /api/stats loads (and if it fails), so the hero never
 * renders an empty or zero counter. Kept just under the real value.
 */
const FALLBACK = 13000;

/**
 * Animated hero stat: a big rolling number of total assignments synced across
 * all users, with a smaller "assignments synced" label beneath it. The number
 * scrolls up from 0 on mount (via @number-flow/react) for a lively count-up,
 * then settles on the live value from /api/stats (cached, public).
 */
export default function SyncedCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;

    // Kick the roll-up animation immediately toward the fallback so the number
    // is scrolling within the first frames, even before the fetch resolves.
    const kick = setTimeout(() => {
      if (active) setCount((c) => (c === 0 ? FALLBACK : c));
    }, 250);

    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active) return;
        const n =
          typeof data?.tasksSynced === "number" && data.tasksSynced > 0
            ? data.tasksSynced
            : FALLBACK;
        setCount(n);
      })
      .catch(() => {
        if (active) setCount(FALLBACK);
      });

    return () => {
      active = false;
      clearTimeout(kick);
    };
  }, []);

  return (
    <span className="flex flex-col items-center leading-none">
      <NumberFlow
        value={count}
        format={{ useGrouping: true }}
        className="font-bold tabular-nums"
        aria-label={`${count} assignments synced`}
      />
      <span className="mt-2 sm:mt-3 text-[15px] sm:text-2xl font-medium tracking-tight text-black/45">
        assignments synced
      </span>
    </span>
  );
}
