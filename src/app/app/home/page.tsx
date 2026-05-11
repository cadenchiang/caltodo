import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEntitlement } from "@/lib/entitlements";
import HomeBoard from "./HomeBoard";
import BoardLockedScreen from "@/components/home/BoardLockedScreen";

/**
 * /app/home — the personalized board.
 *
 * This is a SERVER component so we can read the user's entitlement before
 * sending any client HTML. Free users get BoardLockedScreen directly,
 * with no flash of the full board for half a second while the client
 * hook resolves.
 */
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const entitlement = await getEntitlement(user.id);
  const hasPro = entitlement.effectivePlan === "pro" || entitlement.effectivePlan === "trial";

  if (!hasPro) {
    return <BoardLockedScreen />;
  }

  return <HomeBoard />;
}
