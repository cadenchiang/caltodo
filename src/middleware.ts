import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { pickLandingPath } from "@/lib/landing-path";

/**
 * Middleware for route protection and Supabase auth token refresh.
 * Redirects unauthenticated users from /app/* routes to /login.
 * Redirects authenticated users from /login to their first non-hidden
 * nav item (Board by default, Inbox if Board is hidden, etc).
 *
 * @param request - The incoming Next.js request
 * @returns NextResponse with updated auth cookies
 */
export async function middleware(request: NextRequest) {
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

  // getUser() authenticates via the Supabase Auth server and refreshes tokens.
  // It's sufficient on its own — getSession() here was a redundant extra round-trip.
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    // /app/home is Pro-gated; sending a free user there on login lands them
    // on the lock screen, which reads as broken. Look up their effective
    // plan via the already-authenticated anon client (RLS allows self-read
    // on user_entitlement) so the landing pick can skip /app/home for free
    // users. Only fires on / and /login per the matcher below, so this DB
    // hit is not on every navigation.
    const { data: ent } = await supabase
      .from("user_entitlement")
      .select("effective_plan")
      .eq("user_id", user.id)
      .maybeSingle();
    const isPro = ent?.effective_plan === "pro" || ent?.effective_plan === "trial";

    const url = request.nextUrl.clone();
    url.pathname = pickLandingPath(user.user_metadata, isPro);
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  // Only run middleware on the auth-transition routes where a redirect is
  // needed. /app/** routes are protected by the server layout's session
  // check, so we skip the Supabase getUser() network call on every tab
  // switch inside the app — that was ~100ms per nav.
  matcher: ["/", "/login"],
};
