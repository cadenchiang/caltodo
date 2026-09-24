/**
 * Types and pure helpers shared by the profile components.
 *
 * @module profile/profile-utils
 */

/** Friend or request entry returned by the friends API. */
export interface FriendEntry {
  friendshipId: string;
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}

/** User search result from the autocomplete and suggestions APIs. */
export interface SearchUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

/** How the current user relates to another user. */
export type Relationship = "friend" | "pending_sent" | "pending_received" | null;

/** The three lists the friends API returns. */
export interface FriendLists {
  friends: FriendEntry[];
  pendingReceived: FriendEntry[];
  pendingSent: FriendEntry[];
}

/** localStorage key for the cached friend lists. */
export const FRIENDS_CACHE_KEY = "caltodo_friends_cache";

/** localStorage key for cached "People you may know". */
export const SUGGESTIONS_CACHE_KEY = "caltodo_suggestions_cache";

/** localStorage key the sidebar writes the signed-in profile to. */
export const PROFILE_CACHE_KEY = "caltodo_user_profile";

/**
 * Returns a high-resolution version of an avatar URL. Google avatar URLs
 * default to 96px (=s96-c); this requests 256px for crisp retina rendering.
 *
 * @param url - Original avatar URL
 * @returns URL with upgraded resolution, or the original if not Google
 */
export function getHiResAvatar(url: string): string {
  return url.includes("googleusercontent.com") ? url.replace(/=s\d+-c/, "=s256-c") : url;
}

/**
 * Generates 1-2 uppercase initials from a name, falling back to the email.
 *
 * @param fullName - Display name, or null
 * @param email - Account email, or null
 * @returns Initials, or "?" when neither is known
 */
export function getInitials(fullName: string | null, email: string | null): string {
  if (fullName) {
    const parts = fullName.split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    if (parts.length === 1) return parts[0][0].toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

/**
 * Resolves how the current user relates to another user.
 *
 * @param userId - The other user's id
 * @param lists - The current friend lists
 * @returns The relationship, or null when there is none
 */
export function getRelationship(userId: string, lists: FriendLists): Relationship {
  if (lists.friends.some((f) => f.userId === userId)) return "friend";
  if (lists.pendingSent.some((f) => f.userId === userId)) return "pending_sent";
  if (lists.pendingReceived.some((f) => f.userId === userId)) return "pending_received";
  return null;
}

/**
 * Converts a friend entry into the shape the viewer modal takes.
 *
 * @param friend - A friend or request row
 * @returns The same person as a SearchUser
 */
export function toSearchUser(friend: FriendEntry): SearchUser {
  return { id: friend.userId, email: friend.email, full_name: friend.fullName, avatar_url: friend.avatarUrl };
}

/** Reasons offered when reporting a user. Sent as the report's reason text. */
export const REPORT_REASONS: readonly string[] = [
  "Spam",
  "Harassment or bullying",
  "Impersonation",
  "Inappropriate content",
  "Something else",
];
