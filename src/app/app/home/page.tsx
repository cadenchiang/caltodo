import { redirect } from "next/navigation";

/**
 * /app/home — the personalized board, currently withdrawn.
 *
 * The board is being reworked, so the route sends visitors to the inbox
 * rather than showing it. Nothing links here any more, but bookmarks,
 * browser history, and stale tabs still can.
 *
 * The board itself is untouched: HomeBoard and everything under
 * src/components/home still build and are still tested. Bringing it back is
 * restoring the render below and the NAV_ITEMS entry in src/lib/constants.ts.
 */
export default function HomePage() {
  redirect("/app/inbox");
}
