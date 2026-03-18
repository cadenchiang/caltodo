import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

/**
 * Creates a Supabase client for use in server components, server actions, and route handlers.
 * Supports two auth methods:
 * 1. Cookie-based auth (web app, default)
 * 2. Bearer token auth via Authorization header (mobile app)
 *
 * When an Authorization: Bearer <token> header is present, the client is created
 * with that token injected as the Supabase auth cookie, allowing mobile clients
 * to call the same API routes without browser cookies.
 *
 * @returns Supabase server client instance
 */
export async function createClient() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const authHeader = headerStore.get("authorization");

  // If a Bearer token is provided (mobile), inject it as the Supabase auth cookie
  const bearerToken =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (bearerToken) {
            // Return the Bearer token as the Supabase auth cookie so
            // supabase.auth.getUser() resolves the mobile user's session.
            return [
              {
                name: "sb-access-token",
                value: bearerToken,
              },
            ];
          }
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Skip cookie writes for Bearer-token requests (mobile)
          if (bearerToken) return;
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method is called from a Server Component where
            // cookies cannot be set. This can be safely ignored if middleware
            // is refreshing user sessions.
          }
        },
      },
      ...(bearerToken
        ? {
            global: {
              headers: {
                Authorization: `Bearer ${bearerToken}`,
              },
            },
          }
        : {}),
    }
  );
}
