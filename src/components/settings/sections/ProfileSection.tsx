"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Camera, Check, Loader2, Search, UserMinus, UserPlus, X } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useDebounce } from "@/hooks/useDebounce";
import UserAvatar from "@/components/ui/UserAvatar";

/**
 * Friend/request entry returned by the friends API.
 */
interface FriendEntry {
  friendshipId: string;
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}

/**
 * User search result from the autocomplete API.
 */
interface SearchUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

/**
 * Profile settings section.
 * Displays user profile (avatar, name editing, email) and a Friends sub-section
 * with LinkedIn-style connection requests (send request, accept/decline).
 */
export default function ProfileSection() {
  const { showToast } = useToast();

  // Profile state
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Friends state
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [pendingReceived, setPendingReceived] = useState<FriendEntry[]>([]);
  const [pendingSent, setPendingSent] = useState<FriendEntry[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [friendQuery, setFriendQuery] = useState("");
  const [friendSuggestions, setFriendSuggestions] = useState<SearchUser[]>([]);
  const [searchingFriends, setSearchingFriends] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const debouncedFriendQuery = useDebounce(friendQuery, 300);
  const friendSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("caltodo_user_profile");
      if (cached) {
        const { email, fullName, avatarUrl } = JSON.parse(cached);
        setUserEmail(email);
        setUserFullName(fullName);
        setUserAvatarUrl(avatarUrl);
      }
    } catch { /* ignore */ }
  }, []);

  /**
   * Generates initials from the user's full name or email.
   * @returns 1-2 character uppercase initials string
   */
  function getInitials(): string {
    if (userFullName) {
      const parts = userFullName.split(" ").filter(Boolean);
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      if (parts.length === 1) return parts[0][0].toUpperCase();
    }
    if (userEmail) return userEmail[0].toUpperCase();
    return "?";
  }

  /**
   * Handles avatar file selection. Uploads to /api/account/avatar,
   * updates local state and localStorage cache on success.
   */
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("File too large. Max 2 MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/account/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Failed to upload photo.");
        return;
      }

      const { avatar_url } = await res.json();
      setUserAvatarUrl(avatar_url);
      setImgError(false);

      try {
        const cached = localStorage.getItem("caltodo_user_profile");
        if (cached) {
          const profile = JSON.parse(cached);
          profile.avatarUrl = avatar_url;
          localStorage.setItem("caltodo_user_profile", JSON.stringify(profile));
        }
      } catch { /* ignore */ }

      showToast("Profile photo updated.");
    } catch {
      showToast("Failed to upload photo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  /**
   * Saves the edited display name via PUT /api/account/name.
   * Updates local state and localStorage cache on success.
   */
  async function handleSaveName() {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === userFullName) {
      setEditingName(false);
      return;
    }

    setSavingName(true);
    try {
      const res = await fetch("/api/account/name", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Failed to update name.");
        return;
      }

      setUserFullName(trimmed);
      setEditingName(false);

      try {
        const cached = localStorage.getItem("caltodo_user_profile");
        if (cached) {
          const profile = JSON.parse(cached);
          profile.fullName = trimmed;
          localStorage.setItem("caltodo_user_profile", JSON.stringify(profile));
        }
      } catch { /* ignore */ }

      showToast("Name updated.");
    } catch {
      showToast("Failed to update name.");
    } finally {
      setSavingName(false);
    }
  }

  // ── Friends ──

  const fetchFriends = useCallback(async () => {
    try {
      setLoadingFriends(true);
      const res = await fetch("/api/friends");
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends ?? []);
        setPendingReceived(data.pendingReceived ?? []);
        setPendingSent(data.pendingSent ?? []);
      }
    } catch { /* non-critical */ }
    finally { setLoadingFriends(false); }
  }, []);

  useEffect(() => { fetchFriends(); }, [fetchFriends]);

  // Search users for friends
  useEffect(() => {
    if (debouncedFriendQuery.length < 2) {
      setFriendSuggestions([]);
      return;
    }

    let cancelled = false;

    async function search() {
      setSearchingFriends(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(debouncedFriendQuery)}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setFriendSuggestions(data.users ?? []);
        }
      } catch { /* non-critical */ }
      finally { if (!cancelled) setSearchingFriends(false); }
    }

    search();
    return () => { cancelled = true; };
  }, [debouncedFriendQuery]);

  // Close friend search on outside click
  useEffect(() => {
    if (!friendQuery) return;

    function handleClickOutside(e: MouseEvent) {
      if (friendSearchRef.current && !friendSearchRef.current.contains(e.target as Node)) {
        setFriendQuery("");
        setFriendSuggestions([]);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [friendQuery]);

  /**
   * Sends a friend request via POST /api/friends.
   * @param userId - The user ID to send request to
   */
  async function handleSendRequest(userId: string) {
    setSendingRequest(true);
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        await fetchFriends();
        setFriendQuery("");
        setFriendSuggestions([]);
        showToast("Friend request sent!");
      } else if (res.status === 409) {
        showToast("Request already sent.");
      } else {
        showToast("Failed to send request.");
      }
    } catch {
      showToast("Failed to send request.");
    } finally {
      setSendingRequest(false);
    }
  }

  /**
   * Responds to a friend request (accept or decline).
   * @param friendshipId - The friendship row ID
   * @param action - "accept" or "decline"
   */
  async function handleRespond(friendshipId: string, action: "accept" | "decline") {
    setRespondingId(friendshipId);
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        await fetchFriends();
        showToast(action === "accept" ? "Friend request accepted!" : "Request declined.");
      } else {
        showToast(`Failed to ${action} request.`);
      }
    } catch {
      showToast(`Failed to ${action} request.`);
    } finally {
      setRespondingId(null);
    }
  }

  /**
   * Removes a friend or cancels a sent request via DELETE.
   * @param friendshipId - The friendship row ID to delete
   */
  async function handleRemoveFriend(friendshipId: string) {
    setRemovingId(friendshipId);
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchFriends();
        showToast("Removed.");
      } else {
        showToast("Failed to remove.");
      }
    } catch {
      showToast("Failed to remove.");
    } finally {
      setRemovingId(null);
    }
  }

  /** Gets the relationship status for a user in search results. */
  function getRelationship(userId: string): "friend" | "pending_sent" | "pending_received" | null {
    if (friends.some((f) => f.userId === userId)) return "friend";
    if (pendingSent.some((f) => f.userId === userId)) return "pending_sent";
    if (pendingReceived.some((f) => f.userId === userId)) return "pending_received";
    return null;
  }

  return (
    <section className="space-y-8">
      {/* Profile Info */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Profile</h2>
        <p className="text-xs text-subtle-foreground mb-4">
          Your profile information.
        </p>
        <div className="flex items-center gap-3.5 p-3 -mx-3">
          {/* Clickable avatar with camera overlay */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 group cursor-pointer disabled:cursor-wait"
            title="Change profile photo"
          >
            {userAvatarUrl && !imgError ? (
              <Image
                src={userAvatarUrl}
                alt="Profile"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                {getInitials()}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera size={14} className="text-white" />
              )}
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          <div className="min-w-0 flex-1 text-left">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                  className="text-sm font-medium text-foreground bg-transparent border border-input-border rounded-md px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0 flex-1"
                  maxLength={100}
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="text-blue-500 hover:text-blue-600 disabled:opacity-40"
                  title="Save name"
                >
                  {savingName ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setNameInput(userFullName ?? ""); setEditingName(true); }}
                className="text-sm font-medium text-foreground truncate hover:underline cursor-pointer block text-left"
                title="Click to edit name"
              >
                {userFullName || "Add your name"}
              </button>
            )}
            {userEmail && (
              <p className="text-xs text-subtle-foreground truncate">{userEmail}</p>
            )}
          </div>
        </div>
      </div>

      {/* Friends Section */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-0.5">
          Friends {!loadingFriends && `(${friends.length})`}
        </h3>
        <p className="text-xs text-subtle-foreground mb-3">
          Send a friend request — they&apos;ll need to accept before you&apos;re connected.
        </p>

        {/* Friend search */}
        <div ref={friendSearchRef} className="relative mb-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-input-border bg-transparent text-sm">
            <Search size={14} className="text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              value={friendQuery}
              onChange={(e) => setFriendQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="flex-1 min-w-0 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-sm"
            />
            {searchingFriends && (
              <Loader2 size={14} className="animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Search results dropdown */}
          {friendSuggestions.length > 0 && friendQuery.length >= 2 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-lg border border-border bg-popover shadow-xl overflow-hidden max-h-[200px] overflow-y-auto">
              {friendSuggestions.map((user) => {
                const rel = getRelationship(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => !rel && handleSendRequest(user.id)}
                    disabled={sendingRequest || !!rel}
                    className="flex items-center gap-3 w-full text-left px-3 py-2 hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    <UserAvatar
                      url={user.avatar_url}
                      name={user.full_name}
                      email={user.email}
                      size={28}
                    />
                    <div className="flex-1 min-w-0">
                      {user.full_name && (
                        <p className="text-sm font-medium text-foreground truncate">{user.full_name}</p>
                      )}
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {rel === "friend" ? (
                      <span className="text-[10px] text-muted-foreground font-medium">Friends</span>
                    ) : rel === "pending_sent" ? (
                      <span className="text-[10px] text-amber-500 font-medium">Request sent</span>
                    ) : rel === "pending_received" ? (
                      <span className="text-[10px] text-blue-500 font-medium">Wants to connect</span>
                    ) : (
                      <UserPlus size={14} className="text-muted-foreground" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending requests received */}
        {pendingReceived.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Friend Requests ({pendingReceived.length})
            </p>
            <div className="flex flex-col gap-1">
              {pendingReceived.map((req) => (
                <div
                  key={req.friendshipId}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30"
                >
                  <UserAvatar
                    url={req.avatarUrl}
                    name={req.fullName}
                    email={req.email}
                    size={28}
                  />
                  <div className="flex-1 min-w-0">
                    {req.fullName && (
                      <p className="text-sm font-medium text-foreground truncate">{req.fullName}</p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">{req.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleRespond(req.friendshipId, "accept")}
                      disabled={respondingId === req.friendshipId}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 transition-colors"
                    >
                      {respondingId === req.friendshipId ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        "Accept"
                      )}
                    </button>
                    <button
                      onClick={() => handleRespond(req.friendshipId, "decline")}
                      disabled={respondingId === req.friendshipId}
                      className="p-1 text-muted-foreground hover:text-red-500 disabled:opacity-40 transition-colors"
                      title="Decline"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends list */}
        {loadingFriends ? (
          <p className="text-xs text-muted-foreground py-2">Loading...</p>
        ) : friends.length === 0 && pendingSent.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No friends yet. Search above to send a request.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {/* Accepted friends */}
            {friends.map((friend) => (
              <div
                key={friend.friendshipId}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <UserAvatar
                  url={friend.avatarUrl}
                  name={friend.fullName}
                  email={friend.email}
                  size={28}
                />
                <div className="flex-1 min-w-0">
                  {friend.fullName && (
                    <p className="text-sm font-medium text-foreground truncate">{friend.fullName}</p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">{friend.email}</p>
                </div>
                <button
                  onClick={() => handleRemoveFriend(friend.friendshipId)}
                  disabled={removingId === friend.friendshipId}
                  className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-40"
                  title="Remove friend"
                >
                  {removingId === friend.friendshipId ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <UserMinus size={14} />
                  )}
                </button>
              </div>
            ))}
            {/* Sent requests (pending) */}
            {pendingSent.map((req) => (
              <div
                key={req.friendshipId}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors opacity-60"
              >
                <UserAvatar
                  url={req.avatarUrl}
                  name={req.fullName}
                  email={req.email}
                  size={28}
                />
                <div className="flex-1 min-w-0">
                  {req.fullName && (
                    <p className="text-sm font-medium text-foreground truncate">{req.fullName}</p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">{req.email}</p>
                </div>
                <span className="text-[10px] text-amber-500 font-medium mr-1">Pending</span>
                <button
                  onClick={() => handleRemoveFriend(req.friendshipId)}
                  disabled={removingId === req.friendshipId}
                  className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-40"
                  title="Cancel request"
                >
                  {removingId === req.friendshipId ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <X size={14} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
