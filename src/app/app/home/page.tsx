import HomeBoard from "./HomeBoard";

/**
 * /app/home — the personalized board.
 *
 * The board is free for every signed-in user. Authentication is enforced once
 * by the parent app layout (src/app/app/layout.tsx), which does the
 * getSession() + redirect("/login") guard before this page renders — so we
 * don't repeat that server round-trip here. The board itself is client-side.
 */
export default function HomePage() {
  return <HomeBoard />;
}
