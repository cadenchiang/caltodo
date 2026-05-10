"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface LandingNavProps {
  /**
   * Optional override. Normally left undefined — the nav fetches the auth
   * state client-side so the parent layout can stay statically generated.
   */
  loggedIn?: boolean;
}

/**
 * Shared top navigation used across the landing pages (/, /about, /contact).
 * Logo on the left, page links centered, Get started + Login on the right.
 * Highlights the active route by bolding the matching nav link.
 *
 * Auth detection is client-side (`supabase.auth.getSession`) so the layout
 * remains static and edge-cached. The nav renders the public state on the
 * first paint and upgrades the Login/Get started buttons once the check
 * resolves — there is no flicker because we only swap the right-side CTAs.
 */
export default function LandingNav({ loggedIn: loggedInProp }: LandingNavProps = {}) {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState<boolean>(loggedInProp ?? false);

  useEffect(() => {
    if (loggedInProp !== undefined) return; // parent already decided
    let cancelled = false;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) setLoggedIn(!!session);
    });
    return () => {
      cancelled = true;
    };
  }, [loggedInProp]);

  const links: Array<{ label: string; href: string }> = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3 sm:py-4 grid grid-cols-3 items-center bg-white border-b border-black/5">
      {/* Left: logo */}
      <Link
        href={loggedIn ? "/app/home" : "/"}
        className="justify-self-start flex items-center hover:opacity-70 transition-opacity"
      >
        <img src="/logo.png" alt="caltodo" className="h-7 sm:h-9 w-auto" />
      </Link>

      {/* Center: nav links */}
      <div className="hidden sm:flex justify-self-center items-center gap-6 text-sm">
        {links.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={`transition-colors ${
                active
                  ? "font-bold text-black"
                  : "font-medium text-gray-400 hover:text-black"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Right: CTAs — public-state default, upgrades to "Open app" if signed in */}
      <div className="justify-self-end flex items-center gap-1 sm:gap-1.5">
        {loggedIn ? (
          <Link
            href="/app/home"
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#0071E3] text-white text-xs sm:text-sm font-medium hover:bg-[#3D8FE8] transition-colors duration-200 inline-flex items-center gap-1.5"
          >
            Open app
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        ) : (
          <>
            <Link
              href="/login?signup=true"
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#0071E3] text-white text-xs sm:text-sm font-medium hover:bg-[#3D8FE8] transition-colors duration-200 inline-flex items-center gap-1.5"
            >
              Get started
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
            <Link
              href="/login"
              className="px-4 py-1.5 text-xs sm:px-5 sm:py-2 sm:text-sm font-medium rounded-lg text-black hover:bg-black/10 transition-colors duration-200"
            >
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
