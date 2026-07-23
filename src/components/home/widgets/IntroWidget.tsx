"use client";

/**
 * Intro / greeting widget — minimalist banner matching the landing
 * page. Bold black "Good evening, Caden." headline (regular sans, not
 * Playfair). Date line below in muted-foreground. Clock right-aligned
 * in the same bold sans, no fake :: labels or all-caps timezone.
 *
 * Pulls the user's name from the localStorage cache the Sidebar
 * writes on mount; falls back to Supabase auth metadata. Updates the
 * clock once per minute.
 */

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/supabase/current-user";

interface IntroWidgetProps {
  config?: Record<string, string>;
}

interface CachedProfile {
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}

function readCachedProfile(): CachedProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("caltodo_user_profile");
    if (!raw) return null;
    return JSON.parse(raw) as CachedProfile;
  } catch {
    return null;
  }
}

function timeOfDayWord(d: Date): string {
  const h = d.getHours();
  if (h < 5) return "evening";
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

export default function IntroWidget({ config }: IntroWidgetProps) {
  const [now, setNow] = useState<Date | null>(null);
  const [profile, setProfile] = useState<CachedProfile | null>(() => readCachedProfile());

  useEffect(() => {
    setNow(new Date());
    const ms = 60_000 - (Date.now() % 60_000);
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const timeoutId = setTimeout(() => {
      setNow(new Date());
      intervalId = setInterval(() => setNow(new Date()), 60_000);
    }, ms);
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (profile) return;
    let cancelled = false;
    (async () => {
      try {
        const user = await getCurrentUser();
        if (cancelled || !user) return;
        setProfile({
          email: user.email ?? null,
          fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
          avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
        });
      } catch {
        /* placeholder will render */
      }
    })();
    return () => { cancelled = true; };
  }, [profile]);

  if (!now) return null;

  const firstName = (profile?.fullName ?? "").trim().split(" ")[0] || "there";
  const tod = config?.timeOfDay || timeOfDayWord(now);
  const dateStr = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  // 12-hour clock with am/pm suffix. `getHours()` returns 0-23, so we
  // wrap into 1-12 and pick the right meridiem. 0 maps to 12am, 13 to
  // 1pm, etc. Lowercase suffix to match the rest of the widget's voice.
  const rawHour = now.getHours();
  const meridiem = rawHour >= 12 ? "pm" : "am";
  const hour12 = rawHour % 12 === 0 ? 12 : rawHour % 12;
  const hh = String(hour12).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");

  // Day-of-year — fills the card with one more piece of subtle context
  // without inflating any font sizes.
  const start = new Date(now.getFullYear(), 0, 0);
  const day = Math.floor((now.getTime() - start.getTime()) / 86_400_000);

  return (
    <div className="h-full w-full flex flex-col px-5 py-4 gap-2 text-foreground">
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold tracking-tight leading-tight truncate">
            Good {tod}, {firstName}.
          </div>
          <div className="text-xs font-medium mt-1 truncate">{dateStr}</div>
        </div>
        <div className="text-2xl font-bold tabular-nums shrink-0 leading-none">
          {Number(hh)}
          <span className="animate-clock-blink mx-0.5">:</span>
          {mm}
          <span className="text-sm font-semibold ml-1 align-baseline">{meridiem}</span>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-foreground/[0.08] flex items-center justify-between gap-4 text-xs font-medium">
        <span className="truncate">Day {day} of 365</span>
        <span className="truncate">Local time</span>
        <span className="shrink-0">
          {now.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      </div>
    </div>
  );
}

