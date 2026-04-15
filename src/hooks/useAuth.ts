"use client";

import { useRouter } from "next/navigation";
import { clearLayoutCache } from "@/lib/board-layout-cache";

/**
 * Hook providing auth-related actions.
 * Currently provides a signOut function that calls the signout route handler.
 *
 * @returns Object with signOut function
 */
export function useAuth() {
  const router = useRouter();

  async function signOut() {
    clearLayoutCache();
    await fetch("/auth/signout", { method: "POST" });
    router.push("/");
  }

  return { signOut };
}
