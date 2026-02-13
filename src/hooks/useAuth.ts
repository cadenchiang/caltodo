"use client";

import { useRouter } from "next/navigation";

/**
 * Hook providing auth-related actions.
 * Currently provides a signOut function that calls the signout route handler.
 *
 * @returns Object with signOut function
 */
export function useAuth() {
  const router = useRouter();

  async function signOut() {
    await fetch("/auth/signout", { method: "POST" });
    router.push("/login");
  }

  return { signOut };
}
