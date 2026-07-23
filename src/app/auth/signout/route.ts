import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Sign-out route handler.
 * Signs the user out and redirects to /login.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = request.nextUrl.clone();
  url.pathname = "/";
  // 303 so the browser follows with GET — a default 307 preserves POST and
  // re-POSTs to "/" (a GET-only route → spurious 405).
  return NextResponse.redirect(url, 303);
}
