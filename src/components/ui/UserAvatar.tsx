"use client";

import { useState } from "react";

interface UserAvatarProps {
  /** URL of the user's avatar image. */
  url: string | null;
  /** User's full name for initials fallback. */
  name: string | null;
  /** User's email for single-letter fallback if name is unavailable. */
  email: string;
  /** Diameter in pixels. Defaults to 28. */
  size?: number;
}

/**
 * Displays a user avatar image with initials fallback.
 * Uses plain <img> with referrerPolicy="no-referrer" to avoid
 * next/image domain restrictions for Google avatars.
 *
 * @param url - Avatar image URL (null triggers initials fallback)
 * @param name - Full name for generating initials
 * @param email - Email for single-letter fallback
 * @param size - Circle diameter in pixels (default 28)
 *
 * @edge_cases
 * - Broken image URL: falls back to initials via onError
 * - No name and no email: shows "?"
 */
export default function UserAvatar({ url, name, email, size = 28 }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  function getInitials(): string {
    if (name) {
      const parts = name.split(" ").filter(Boolean);
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      if (parts.length === 1) return parts[0][0].toUpperCase();
    }
    if (email) return email[0].toUpperCase();
    return "?";
  }

  if (url && !imgError) {
    return (
      <img
        src={url}
        alt={name || email}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-blue-500 flex items-center justify-center text-white font-medium shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {getInitials()}
    </div>
  );
}
