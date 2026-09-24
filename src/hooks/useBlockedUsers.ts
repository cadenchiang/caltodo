"use client";

import { useCallback, useEffect, useState } from "react";

/** Event fired when the block list changes, so every room refetches. */
export const BLOCKS_CHANGED_EVENT = "calchat-blocks-changed";

/**
 * The viewer's blocked users for a room.
 *
 * Messages carry author keys, not user ids, so the API returns the blocked
 * users' keys for this room; the room drops any message whose key is in
 * the set. User ids are kept too for the profile modal's Block / Unblock
 * button.
 *
 * @param courseId - The open room
 */
export function useBlockedUsers(courseId: string) {
  const [blockedKeys, setBlockedKeys] = useState<Set<string>>(new Set());
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/discussions/block?courseId=${encodeURIComponent(courseId)}`);
      if (!res.ok) return;
      const data: { blockedUserIds: string[]; blockedAuthorKeys: string[] } = await res.json();
      setBlockedKeys(new Set(data.blockedAuthorKeys));
      setBlockedUserIds(new Set(data.blockedUserIds));
    } catch {
      // Keep the previous list; a failed refresh never unblocks anyone.
    }
  }, [courseId]);

  useEffect(() => {
    refresh();
    window.addEventListener(BLOCKS_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(BLOCKS_CHANGED_EVENT, refresh);
  }, [refresh]);

  return { blockedKeys, blockedUserIds, refresh };
}

/**
 * Blocks or unblocks a user, then tells every room to refetch.
 *
 * @param userId - The target user
 * @param block - true to block, false to unblock
 * @returns true on success
 */
export async function setUserBlocked(userId: string, block: boolean): Promise<boolean> {
  try {
    const res = await fetch("/api/discussions/block", {
      method: block ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) return false;
    window.dispatchEvent(new CustomEvent(BLOCKS_CHANGED_EVENT));
    return true;
  } catch {
    return false;
  }
}
