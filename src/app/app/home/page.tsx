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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <HomeBoard />;
}
