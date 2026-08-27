"use client";

/**
 * React binding for the week-start preference.
 *
 * @module hooks/useWeekStart
 */

import { useSyncExternalStore } from "react";
import {
  subscribeWeekStart,
  getWeekStartSnapshot,
  getWeekStartServerSnapshot,
  type WeekStart,
} from "@/lib/week-start";

/**
 * Returns the day the user's week starts on, re-rendering when it changes.
 *
 * @returns 0 for Sunday, 1 for Monday
 */
export function useWeekStart(): WeekStart {
  return useSyncExternalStore(
    subscribeWeekStart,
    getWeekStartSnapshot,
    getWeekStartServerSnapshot
  );
}
