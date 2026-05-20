"use client";

/**
 * Profile widget — minimalist card matching the landing-page voice.
 * Avatar on the left, name in bold black sans (text-foreground,
 * font-semibold) on the right, role / email below in muted-foreground.
 * No pseudo-labels, no uppercase decorations, no Playfair Display.
 *
 * Pulls the user's name, email, and avatar from the localStorage
 * cache the Sidebar writes on mount; falls back to the Supabase auth
 * user when the cache is cold.
 *
 * @param config - Optional config: `role` (default "Student")
 */

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ProfileWidgetProps {
  config?: Record<string, string>;
}

interface CachedProfile {
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}

/** Reads the cached profile written by the Sidebar on mount. */
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

export default function ProfileWidget({ config }: ProfileWidgetProps) {
  const [profile, setProfile] = useState<CachedProfile | null>(() => readCachedProfile());

  useEffect(() => {
    if (profile) return;
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
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

  const fullName = (profile?.fullName ?? "").trim();
  const initial = (fullName || profile?.email || "?").slice(0, 1).toUpperCase();
  const role = config?.role || "Student";

  return (
    <div className="h-full w-full flex flex-col p-4 gap-3 text-foreground">
      <div className="flex items-center gap-3">
        {profile?.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt=""
            referrerPolicy="no-referrer"
            width={48}
            height={48}
            className="w-12 h-12 rounded-xl object-cover shrink-0 ring-1 ring-black/5"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-foreground/[0.06] shrink-0 flex items-center justify-center text-sm font-bold text-foreground">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold leading-tight truncate">
            {fullName || "Welcome"}
          </div>
          <div className="text-xs font-medium truncate text-foreground">{role}</div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Online
        </span>
      </div>

      <div className="mt-auto pt-3 border-t border-foreground/[0.08] flex items-center justify-between gap-3 text-xs font-medium">
        <span className="truncate text-foreground">{profile?.email ?? ""}</span>
        <span className="font-semibold shrink-0">
          {new Date().toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}
        </span>
      </div>
    </div>
  );
}
