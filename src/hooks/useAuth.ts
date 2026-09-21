"use client";

import { useRouter } from "next/navigation";
import { clearUserCaches } from "@/lib/user-caches";

/**
 * Hook providing auth-related actions.
 * Currently provides a signOut function that calls the signout route handler.
 *
 * @returns Object with signOut function
 */
export function useAuth() {
  const router = useRouter();

  /**
   * Signs the user out: drops every per-user cache first (tasks, profile,
   * board, chat state) so the next account on this device does not paint
   * the previous one's data, then clears the server session.
   */
  async function signOut() {
    clearUserCaches();
    await fetch("/auth/signout", { method: "POST" });
    router.push("/");
  }

  return { signOut };
}
