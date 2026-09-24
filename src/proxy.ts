import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { pickLandingPath, isMobileRequest, resolveGuardedRoute } from "@/lib/landing-path";
import { GET_CLAIMS_OPTIONS } from "@/lib/supabase/jwks";

/**
 * Middleware for route protection and Supabase auth token refresh.
 * Redirects unauthenticated users from /app/* routes to /login.
 * Redirects authenticated users from /login to their first non-hidden
 * nav item (Board by default, Inbox if Board is hidden, etc).
 *
 * @param request - The incoming Next.js request
 * @returns NextResponse with updated auth cookies
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getClaims() verifies the session JWT against the project's public keys
  // (cached process-wide, and hinted inline so a cold instance skips even
  // that fetch) instead of round-tripping to the Auth server on every visit
  // to "/" or "/login" - the entry path of every first load. An expired
  // token is still refreshed through the session first.
  const { data: claimsData } = await supabase.auth.getClaims(undefined, GET_CLAIMS_OPTIONS);
  const claims = claimsData?.claims;
  const user = claims?.sub
    ? { id: claims.sub, user_metadata: (claims.user_metadata as Record<string, unknown> | undefined) ?? {} }
    : null;

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users away from protected routes
  if (!user && pathname.startsWith("/app")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirectResponse = NextResponse.redirect(url);
    // Preserve refreshed auth cookies so token refresh isn't lost
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // Redirect authenticated users away from landing/login to their first
  // non-hidden nav item. Skip if ?landing=1 is present (sidebar logo click).
  if (user && (pathname === "/" || pathname === "/login") && !request.nextUrl.searchParams.has("landing")) {
    const url = request.nextUrl.clone();
    url.pathname = pickLandingPath(user.user_metadata, {
      isMobile: isMobileRequest(request.headers),
    });
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // Hidden nav routes and desktop-only routes on a phone redirect here,
  // before the page paints, instead of in a client effect after it did.
  // hidden_nav_items rides in the JWT's user_metadata, so no extra fetch.
  if (user && pathname.startsWith("/app")) {
    const target = resolveGuardedRoute(pathname, user.user_metadata, isMobileRequest(request.headers));
    if (target) {
      const url = request.nextUrl.clone();
      url.pathname = target;
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    }
  }

  return supabaseResponse;
}

export const config = {
  // The auth-transition routes plus the four guarded nav routes. getClaims
  // verifies the JWT locally against cached keys, so this is not the
  // ~100ms getUser() round trip that used to keep the proxy off /app.
  matcher: [
    "/",
    "/login",
    "/app/home/:path*",
    "/app/inbox/:path*",
    "/app/calendar/:path*",
    "/app/discussions/:path*",
  ],
};
