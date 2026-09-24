"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { useIsLoggedIn } from "@/hooks/useIsLoggedIn";
import { useDialog } from "@/components/ui/useDialog";
import { AUTH } from "@/lib/copy";
import { cn } from "@/lib/utils";

/** Primary CTA recipe on the landing pages (accent, force-light). */
const NAV_CTA =
  "px-3.5 sm:px-4 py-2.5 sm:py-2 min-h-11 sm:min-h-0 rounded-xl bg-blue-500 text-white text-xs sm:text-sm font-medium hover:bg-blue-600 transition-colors duration-200 inline-flex items-center gap-1.5";

interface LandingNavProps {
  /**
   * Optional override. Normally left undefined, the nav fetches the auth
   * state client-side so the parent layout can stay statically generated.
   */
  loggedIn?: boolean;
}

/**
 * Shared top navigation used across the landing pages (/, /about, /guides,
 * /contact). Page links centered, Get started + Sign in on the right.
 * Highlights the active route by bolding the matching nav link.
 *
 * Auth detection is client-side, via the shared useIsLoggedIn hook, so the
 * layout remains static and edge-cached. The nav renders the public state on
 * the first paint and upgrades the Login/Get started buttons once the check
 * resolves; there is no flicker because we only swap the right-side CTAs.
 */
export default function LandingNav({ loggedIn: loggedInProp }: LandingNavProps = {}) {
  const pathname = usePathname();
  const loggedIn = useIsLoggedIn(loggedInProp);
  /** Tracks which on-page section is currently in view (home page only). */
  const [activeHash, setActiveHash] = useState<string>("");
  /** True once the user has scrolled past the top, used to toggle the divider. */
  const [scrolled, setScrolled] = useState(false);
  /**
   * Timestamp until which the IntersectionObserver should NOT touch activeHash.
   * Set when the user clicks a hash link from off-route so the pending target
   * stays highlighted while the home page mounts and scrolls, without the
   * observer's initial "not intersecting" callback briefly flipping it to Home.
   */
  const scrollLockUntilRef = useRef<number>(0);
  /** Whether the mobile menu overlay is open. */
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close the mobile menu on route change so it doesn't linger after navigation.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // The mobile menu is a dialog: useDialog locks body scroll, traps Tab,
  // closes on Escape and restores focus to the hamburger on close. The page
  // behind it is hidden from assistive tech while it is open.
  const closeMenu = useCallback(() => setMobileMenuOpen(false), []);
  const { containerRef: menuRef, handleBackdropClick } = useDialog({ open: mobileMenuOpen, onClose: closeMenu });
  useEffect(() => {
    if (!mobileMenuOpen) return;
    // Hide the page behind the menu from assistive tech: main and the footer.
    const behind = Array.from(document.querySelectorAll("main, footer"));
    if (behind.length === 0) return;
    for (const el of behind) el.setAttribute("aria-hidden", "true");
    return () => { for (const el of behind) el.removeAttribute("aria-hidden"); };
  }, [mobileMenuOpen]);

  // Clear any section highlight when leaving the home route.
  useEffect(() => {
    if (pathname !== "/") setActiveHash("");
  }, [pathname]);

  // Middleware redirects authenticated users from `/` straight to /app/home.
  // The `?landing=1` query opts out of that redirect, so logged-in users can
  // still browse the marketing site by clicking nav links here.
  const homeHref = loggedIn ? "/?landing=1" : "/";

  const links: Array<{ label: string; href: string }> = [
    { label: "Home", href: homeHref },
    { label: "About", href: "/about" },
    { label: "Guides", href: "/guides" },
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
    // Path part only: strip any "?landing=1" query so logged-in / logged-out
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
   *      so the browser would skip the scroll entirely, so we scroll smoothly
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
      // eslint-disable-next-line react-hooks/purity -- runs in the click handler, not during render
      scrollLockUntilRef.current = Date.now() + 1200;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", href.slice(hashIndex));
      return;
    }

    // Off-route: pre-highlight the target so the nav doesn't flicker to Home
    // while Next.js navigates, and tell Hero where to scroll once it mounts.
    setActiveHash(`#${id}`);
    // eslint-disable-next-line react-hooks/purity -- runs in the click handler, not during render
    scrollLockUntilRef.current = Date.now() + 2000;
    try {
      sessionStorage.setItem("caltodo_pending_scroll", id);
    } catch {
      /* sessionStorage can throw in private-browsing; fall through to default nav */
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
    <>
      {/* iOS-style progressive (variable) blur at the very top edge, the
          SwiftUI "scroll edge effect" / iOS 26 Liquid Glass look. Instead of a
          hard divider or a flat frosted rectangle, several backdrop-blur layers
          at increasing radii are each masked to a band anchored at the top, so
          the blur is strongest right at the top edge and ramps to zero just
          below, with a soft white tint. Fades in on scroll (nothing to blur at
          the very top of the page). pointer-events-none so it never eats clicks. */}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-x-0 top-0 z-30 h-28 sm:h-32 transition-opacity duration-300 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Painted lightest-first so the HEAVIEST blur is on top and dominates
            the very top edge; each layer is masked to a band anchored at the
            top and every band fades to transparent by ~82% of the height, so
            the blur ramps down and fully vanishes; nothing below it is blurred
            (the bottom ~18% is a guaranteed-sharp zone).

            Two variants: a rich 5-layer stack on desktop (hidden sm:block), and
            a cheap 2-layer stack on mobile (sm:hidden). Five stacked
            backdrop-filters recomposite every scroll frame and cause visible
            jank on phone GPUs, so mobile gets a lighter version that still reads
            as a soft top fade. */}
        <div className="hidden sm:block absolute inset-0">
          {([
            [3, 84],
            [8, 68],
            [18, 52],
            [34, 38],
            [56, 26],
          ] as const).map(([blurPx, fadeEnd]) => (
            <div
              key={blurPx}
              className="absolute inset-0"
              style={{
                backdropFilter: `blur(${blurPx}px)`,
                WebkitBackdropFilter: `blur(${blurPx}px)`,
                maskImage: `linear-gradient(to bottom, black 0%, black ${Math.round(fadeEnd * 0.5)}%, transparent ${fadeEnd}%)`,
                WebkitMaskImage: `linear-gradient(to bottom, black 0%, black ${Math.round(fadeEnd * 0.5)}%, transparent ${fadeEnd}%)`,
              }}
            />
          ))}
        </div>
        <div className="sm:hidden absolute inset-0">
          {([
            [6, 70],
            [20, 34],
          ] as const).map(([blurPx, fadeEnd]) => (
            <div
              key={blurPx}
              className="absolute inset-0"
              style={{
                backdropFilter: `blur(${blurPx}px)`,
                WebkitBackdropFilter: `blur(${blurPx}px)`,
                maskImage: `linear-gradient(to bottom, black 0%, black ${Math.round(fadeEnd * 0.5)}%, transparent ${fadeEnd}%)`,
                WebkitMaskImage: `linear-gradient(to bottom, black 0%, black ${Math.round(fadeEnd * 0.5)}%, transparent ${fadeEnd}%)`,
              }}
            />
          ))}
        </div>
        {/* Soft light tint, strongest at the top, fading out with the blur. */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/25 to-transparent" />
      </div>

      <nav
        className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between sm:grid sm:grid-cols-3 bg-transparent"
      >
        {/* Left: hamburger on mobile only. No logo: the hero owns the brand. */}
        <div className="justify-self-start flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="landing-mobile-menu"
            className="sm:hidden -ml-1 inline-flex items-center justify-center w-11 h-11 rounded-lg text-foreground active:bg-muted transition-colors"
          >
            {mobileMenuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
        </div>

        {/* Center: nav links, desktop only */}
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
                className={cn(
                  "transition-colors rounded px-1 py-2 -my-2",
                  active ? "font-bold text-foreground" : "font-medium text-gray-600 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right: CTAs, public-state default, upgrades to "Open app" if signed in.
            On mobile, "Sign in" is hidden to save space; it lives inside the menu. */}
        <div className="justify-self-end flex items-center gap-1 sm:gap-1.5">
          {loggedIn ? (
            <Link href="/app/inbox" className={NAV_CTA}>
              Open app
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          ) : (
            <>
              <Link href="/login?signup=true" className={NAV_CTA}>
                Get started
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
              <Link
                href="/login"
                className="hidden sm:inline-flex px-4 py-1.5 text-xs sm:px-5 sm:py-2 sm:text-sm font-medium rounded-lg text-foreground hover:bg-muted transition-colors duration-200"
              >
                {AUTH.signIn}
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu, rendered only while open so it is a real dialog: the
          backdrop closes it, Escape closes it, Tab stays inside it. */}
      {mobileMenuOpen && (
        <div
          className="sm:hidden fixed inset-0 top-16 z-30 bg-backdrop backdrop-blur-[2px] animate-announce-backdrop-in"
          onClick={handleBackdropClick}
        >
          <div
            ref={menuRef}
            id="landing-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            tabIndex={-1}
            className="bg-white border-b border-border animate-announce-card-in focus:outline-none"
          >
            <ul className="flex flex-col py-2">
              {links.map((item) => {
                const active = isActive(item.href);
                const isHashLink = item.href.includes("#");
                const isHomeLink = item.href === "/";
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={(e) => {
                        if (isHashLink) handleHashClick(e, item.href);
                        else if (isHomeLink) handleHomeClick(e);
                        closeMenu();
                      }}
                      className={cn(
                        "block px-5 py-3 min-h-11 text-base transition-colors",
                        active ? "font-bold text-foreground" : "font-medium text-gray-600 hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              {!loggedIn && (
                <li className="border-t border-border mt-1 pt-1">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="block px-5 py-3 min-h-11 text-base font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    {AUTH.signIn}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
