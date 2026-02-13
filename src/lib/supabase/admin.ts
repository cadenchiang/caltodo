/**
 * Creates a Supabase client with the service role key to bypass RLS.
 * Only used by the calendar feed endpoint where no user session is available.
 *
 * @returns Supabase admin client instance
 * @throws Error if SUPABASE_SERVICE_ROLE_KEY is not set
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable"
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
