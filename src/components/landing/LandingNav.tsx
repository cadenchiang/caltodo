"use client";

import { useEffect, useRef, useState } from "react";
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
  /** Tracks which on-page section is currently in view (home page only). */
  const [activeHash, setActiveHash] = useState<string>("");
  /** True once the user has scrolled past the top — used to toggle the divider. */
  const [scrolled, setScrolled] = useState(false);
  /**
   * Timestamp until which the IntersectionObserver should NOT touch activeHash.
   * Set when the user clicks a hash link from off-route so the pending target
   * stays highlighted while the home page mounts and scrolls, without the
   * observer's initial "not intersecting" callback briefly flipping it to Home.
   */
  const scrollLockUntilRef = useRef<number>(0);

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

  // Toggle the bottom divider based on scroll position so the nav reads
  // borderless when sitting at the top of the page.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * Observe the on-page #pricing section when we're on the home route so the
   * nav can highlight "Pricing" automatically as the user scrolls past it.
   *
   * If we just landed on home via an off-route hash-link click, sessionStorage
   * tells us where the user is scrolling to. We pre-set activeHash so Pricing
   * highlights immediately, and lock the observer for a short window so its
   * initial "not intersecting" callback doesn't flip the nav back to Home.
   */
  useEffect(() => {
    if (pathname !== "/") {
      setActiveHash("");
      return;
    }

    // Pre-highlight any pending scroll target so the nav doesn't flicker.
    try {
      const pending = sessionStorage.getItem("caltodo_pending_scroll");
      if (pending) {
        setActiveHash(`#${pending}`);
        scrollLockUntilRef.current = Date.now() + 1500;
      }
    } catch {
      /* sessionStorage may throw in private browsing */
    }

    const el = document.getElementById("pricing");
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (Date.now() < scrollLockUntilRef.current) return;
        if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
          setActiveHash("#pricing");
        } else if (!entry.isIntersecting) {
          setActiveHash("");
        }
      },
      { threshold: [0, 0.25, 0.6, 1] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pathname]);

  // Middleware redirects authenticated users from `/` straight to /app/home.
  // The `?landing=1` query opts out of that redirect, so logged-in users can
  // still browse the marketing site by clicking nav links here.
  const homeHref = loggedIn ? "/?landing=1" : "/";
  const pricingHref = loggedIn ? "/?landing=1#pricing" : "/#pricing";

  const links: Array<{ label: string; href: string }> = [
    { label: "Home", href: homeHref },
    { label: "Pricing", href: pricingHref },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  /**
   * Decide whether a given nav link should render as the active one.
   * Home is active only when no on-page section is currently highlighted.
   *
   * @param href - The href of the link being rendered. May include a
   *               `?landing=1` query and/or a `#section` hash.
   * @returns true if this link represents the current location/section.
   */
  function isActive(href: string): boolean {
    const hashIndex = href.indexOf("#");
    const targetHash = hashIndex >= 0 ? href.slice(hashIndex) : "";
    // Path part only — strip any "?landing=1" query so logged-in / logged-out
    // hrefs compare cleanly against pathname.
    const pathPart = (hashIndex >= 0 ? href.slice(0, hashIndex) : href).split("?")[0] || "/";

    if (pathname === "/") {
      if (targetHash === "#pricing") return activeHash === "#pricing";
      if (pathPart === "/" && !targetHash) return activeHash === "";
      return false;
    }
    if (pathPart === "/") return false;
    if (targetHash) return false; // hash links never active on other pages
    return pathname.startsWith(pathPart);
  }

  /**
   * Clicking a hash link needs special handling in two cases:
   *
   *   1. On the home route already: Next.js wouldn't trigger any navigation
   *      so the browser would skip the scroll entirely — we scroll smoothly
   *      via scrollIntoView and update the URL hash.
   *   2. On any other route: Next.js's App Router does NOT honor URL hash
   *      anchors during client-side navigations, so navigating to "/#pricing"
   *      would just dump the user at the top of home. We stash the target id
   *      in sessionStorage and let Hero's onMount effect handle the scroll
   *      once the home page renders.
   *
   * @param e - The click event from the anchor.
   * @param href - The full link href (e.g. "/#pricing").
   */
  function handleHashClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) return;
    const id = href.slice(hashIndex + 1);

    if (pathname === "/") {
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      // Lock the highlight on the target so the observer doesn't flicker
      // during the smooth scroll.
      setActiveHash(`#${id}`);
      scrollLockUntilRef.current = Date.now() + 1200;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", href.slice(hashIndex));
      return;
    }

    // Off-route: pre-highlight the target so the nav doesn't flicker to Home
    // while Next.js navigates, and tell Hero where to scroll once it mounts.
    setActiveHash(`#${id}`);
    scrollLockUntilRef.current = Date.now() + 2000;
    try {
      sessionStorage.setItem("caltodo_pending_scroll", id);
    } catch {
      /* sessionStorage can throw in private-browsing — fall through to default nav */
    }
    // Let the Link continue with its normal navigation to "/".
  }

  /**
   * Clicking Home while already on "/" should scroll back to the top instead
   * of being a no-op (the browser otherwise leaves you wherever you were).
   *
   * @param e - The click event from the Home anchor.
   */
  function handleHomeClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname !== "/") return; // off-route: let Link navigate to "/" normally
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Strip any hash so the URL reflects "top of home".
    window.history.replaceState(null, "", "/");
  }

  return (
    <nav
      className={`sticky top-0 z-40 w-full px-4 sm:px-8 py-3 sm:py-4 grid grid-cols-3 items-center bg-white border-b transition-colors duration-200 ${
        scrolled ? "border-black/5" : "border-transparent"
      }`}
    >
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
          const active = isActive(item.href);
          const isHashLink = item.href.includes("#");
          const isHomeLink = item.href === "/";
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onClick={
                isHashLink
                  ? (e) => handleHashClick(e, item.href)
                  : isHomeLink
                    ? handleHomeClick
                    : undefined
              }
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
