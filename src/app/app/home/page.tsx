import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HomeBoard from "./HomeBoard";

/**
 * /app/home — the personalized board.
 *
 * The board is now free for every signed-in user. The entitlement gate
 * + BoardLockedScreen were removed; the only check left is authentication.
 */
export default async function HomePage() {
  // Middleware already authenticated this request with auth.getUser() (and
  // refreshed tokens); reading the cookie session here avoids a second
  // Supabase network round-trip on every fresh tab.
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  return <HomeBoard />;
}
