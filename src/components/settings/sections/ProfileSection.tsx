"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Camera, Check, Loader2, Search, UserMinus, UserPlus, Users, X } from "lucide-react";
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

  // Friends state — parse localStorage once for instant render
  const cachedFriends = (() => {
    try {
      const c = localStorage.getItem("caltodo_friends_cache");
      return c ? JSON.parse(c) : null;
    } catch { return null; }
  })();
  const [friends, setFriends] = useState<FriendEntry[]>(cachedFriends?.friends ?? []);
  const [pendingReceived, setPendingReceived] = useState<FriendEntry[]>(cachedFriends?.pendingReceived ?? []);
  const [pendingSent, setPendingSent] = useState<FriendEntry[]>(cachedFriends?.pendingSent ?? []);
  const [loadingFriends, setLoadingFriends] = useState(!cachedFriends);
  const [friendQuery, setFriendQuery] = useState("");
  const [friendSuggestions, setFriendSuggestions] = useState<SearchUser[]>([]);
  const [searchingFriends, setSearchingFriends] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<SearchUser | null>(null);
  const debouncedFriendQuery = useDebounce(friendQuery, 150);
  const friendSearchRef = useRef<HTMLDivElement>(null);

  // "People you may know" suggestions — initialise from localStorage for instant render
  // Cache format: { suggestions: SearchUser[], ts: number }
  const suggestionsCache = (() => {
    try {
      const c = localStorage.getItem("caltodo_suggestions_cache");
      return c ? JSON.parse(c) : null;
    } catch { return null; }
  })();
  const [peopleSuggestions, setPeopleSuggestions] = useState<SearchUser[]>(
    suggestionsCache?.suggestions ?? []
  );
  const [loadingSuggestions, setLoadingSuggestions] = useState(!suggestionsCache);
  // Track whether the cache is fresh enough to skip a refetch (5 min TTL)
  const suggestionsCacheFresh = suggestionsCache?.ts && Date.now() - suggestionsCache.ts < 5 * 60_000;

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
      const res = await fetch("/api/friends");
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends ?? []);
        setPendingReceived(data.pendingReceived ?? []);
        setPendingSent(data.pendingSent ?? []);
        try {
          localStorage.setItem("caltodo_friends_cache", JSON.stringify({
            friends: data.friends ?? [],
            pendingReceived: data.pendingReceived ?? [],
            pendingSent: data.pendingSent ?? [],
          }));
        } catch { /* quota exceeded — ignore */ }
      }
    } catch { /* non-critical */ }
    finally { setLoadingFriends(false); }
  }, []);

  useEffect(() => { fetchFriends(); }, [fetchFriends]);

  // Fetch friend suggestions ("People you may know")
  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await fetch("/api/friends/suggestions");
      if (res.ok) {
        const data = await res.json();
        const suggestions = data.suggestions ?? [];
        setPeopleSuggestions(suggestions);
        try {
          localStorage.setItem("caltodo_suggestions_cache", JSON.stringify({
            suggestions,
            ts: Date.now(),
          }));
        } catch { /* quota exceeded — ignore */ }
      }
    } catch { /* non-critical */ }
    finally { setLoadingSuggestions(false); }
  }, []);

  // Only fetch if cache is stale (>5 min) or empty
  useEffect(() => {
    if (!suggestionsCacheFresh) fetchSuggestions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchSuggestions]);

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
        fetchSuggestions();
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
    <section className="space-y-6">
      {/* Profile Hero Card */}
      <div className="rounded-xl border border-border p-6 flex flex-col items-center">
        {/* Large 80px avatar with camera overlay */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="relative w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shrink-0 group cursor-pointer disabled:cursor-wait"
          title="Change profile photo"
        >
          {userAvatarUrl && !imgError ? (
            <Image
              src={userAvatarUrl}
              alt="Profile"
              width={80}
              height={80}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-2xl font-medium">
              {getInitials()}
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            ) : (
              <Camera size={20} className="text-white" />
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

        {/* Name — centered, large, click to edit */}
        <div className="mt-3 text-center w-full max-w-[240px]">
          {editingName ? (
            <div className="flex items-center justify-center gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") setEditingName(false);
                }}
                className="text-xl font-bold text-foreground bg-transparent border border-input-border rounded-md px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0 flex-1 text-center"
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
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setNameInput(userFullName ?? ""); setEditingName(true); }}
              className="text-xl font-bold text-foreground hover:underline cursor-pointer block w-full truncate text-center"
              title="Click to edit name"
            >
              {userFullName || "Add your name"}
            </button>
          )}
        </div>

        {/* Email — centered muted */}
        {userEmail && (
          <p className="text-sm text-muted-foreground mt-1 truncate max-w-full">{userEmail}</p>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 rounded-xl border border-border divide-x divide-border">
        <div className="flex flex-col items-center py-3">
          <span className="text-lg font-bold text-foreground">{friends.length}</span>
          <span className="text-xs text-muted-foreground">Friends</span>
        </div>
        <div className="flex flex-col items-center py-3">
          <span className="text-lg font-bold text-foreground">{pendingReceived.length}</span>
          <span className="text-xs text-muted-foreground">Requests</span>
        </div>
        <div className="flex flex-col items-center py-3">
          <span className="text-lg font-bold text-foreground">{pendingSent.length}</span>
          <span className="text-xs text-muted-foreground">Sent</span>
        </div>
      </div>

      {/* Friend Requests — highlighted card with blue left border */}
      {pendingReceived.length > 0 && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-800/40 border-l-4 border-l-blue-500 p-4">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-foreground">Friend Requests</h3>
            <span className="text-[10px] font-bold bg-blue-500 text-white rounded-full px-1.5 py-0.5 leading-none">
              {pendingReceived.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {pendingReceived.map((req) => (
              <div
                key={req.friendshipId}
                className="flex items-center gap-3"
              >
                <UserAvatar
                  url={req.avatarUrl}
                  name={req.fullName}
                  email={req.email}
                  size={36}
                />
                <div className="flex-1 min-w-0">
                  {req.fullName && (
                    <p className="text-sm font-medium text-foreground truncate">{req.fullName}</p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">{req.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRespond(req.friendshipId, "accept")}
                    disabled={respondingId === req.friendshipId}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 transition-colors"
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
                    className="p-1 text-muted-foreground hover:text-red-500 disabled:opacity-40 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-950/20"
                    title="Decline"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends Section */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Friends {!loadingFriends && `(${friends.length})`}
        </h3>

        {/* Friend search — slightly more prominent */}
        <div ref={friendSearchRef} className="relative mb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-input-border bg-transparent text-sm">
            <Search size={16} className="text-muted-foreground flex-shrink-0" />
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

        {/* Friends grid — 2-column card layout */}
        {loadingFriends ? (
          <p className="text-xs text-muted-foreground py-2">Loading...</p>
        ) : friends.length === 0 && pendingSent.length === 0 ? (
          <div className="flex flex-col items-center py-6 gap-2">
            <Users size={36} className="text-muted-foreground/25" strokeWidth={1.5} />
            <p className="text-xs text-muted-foreground text-center">
              No friends yet. Search above to send a request.
            </p>
          </div>
        ) : (
          <>
            {friends.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {friends.map((friend) => (
                  <div
                    key={friend.friendshipId}
                    className="group flex items-center gap-2.5 p-3 rounded-xl border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setViewingUser({ id: friend.userId, email: friend.email, full_name: friend.fullName, avatar_url: friend.avatarUrl })}
                  >
                    <UserAvatar
                      url={friend.avatarUrl}
                      name={friend.fullName}
                      email={friend.email}
                      size={40}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {friend.fullName || friend.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{friend.email}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveFriend(friend.friendshipId); }}
                      disabled={removingId === friend.friendshipId}
                      className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-40 opacity-0 group-hover:opacity-100"
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
              </div>
            )}

            {/* Sent Requests — subtle list with badge */}
            {pendingSent.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Sent Requests</p>
                <div className="flex flex-col gap-1">
                  {pendingSent.map((req) => (
                    <div
                      key={req.friendshipId}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors"
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
                      <span className="text-[10px] font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full px-1.5 py-0.5 leading-none">
                        Pending
                      </span>
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
              </div>
            )}
          </>
        )}

        {/* People you may know — suggestions */}
        {loadingSuggestions && peopleSuggestions.length === 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-foreground mb-2">People you may know</h4>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl border border-border animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 h-3.5 bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
        )}
        {peopleSuggestions.length > 0 && (
          <div className="mt-6 animate-in fade-in duration-300">
            <h4 className="text-sm font-semibold text-foreground mb-2">
              People you may know
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {peopleSuggestions.map((person) => {
                const rel = getRelationship(person.id);
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => setViewingUser(person)}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-border hover:bg-accent/50 transition-colors text-left"
                  >
                    <UserAvatar
                      url={person.avatar_url}
                      name={person.full_name}
                      email={person.email}
                      size={36}
                    />
                    <p className="flex-1 min-w-0 text-sm font-medium text-foreground truncate">
                      {person.full_name || person.email}
                    </p>
                    {rel === "pending_sent" ? (
                      <span className="text-[10px] text-amber-500 font-medium shrink-0">Sent</span>
                    ) : (
                      <div
                        role="button"
                        onClick={(e) => { e.stopPropagation(); handleSendRequest(person.id); }}
                        className={`p-1.5 rounded-full text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors shrink-0 ${sendingRequest || !!rel ? "opacity-40 pointer-events-none" : ""}`}
                        title="Add friend"
                      >
                        <UserPlus size={16} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* User profile modal overlay */}
      {viewingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-in fade-in duration-150"
          onClick={() => setViewingUser(null)}
        >
          <div
            className="bg-card rounded-2xl border border-border shadow-2xl p-6 w-[320px] max-w-[90vw] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setViewingUser(null)}
              className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
            >
              <X size={16} />
            </button>

            {/* Avatar + name */}
            <div className="flex flex-col items-center">
              <UserAvatar
                url={viewingUser.avatar_url}
                name={viewingUser.full_name}
                email={viewingUser.email}
                size={72}
              />
              <h3 className="mt-3 text-lg font-bold text-foreground text-center truncate max-w-full">
                {viewingUser.full_name || "Unnamed"}
              </h3>
              <p className="text-sm text-muted-foreground truncate max-w-full">
                {viewingUser.email}
              </p>
            </div>

            {/* Action button */}
            <div className="mt-5">
              {(() => {
                const rel = getRelationship(viewingUser.id);
                if (rel === "friend") {
                  return (
                    <p className="text-center text-sm text-muted-foreground font-medium">
                      Already friends
                    </p>
                  );
                }
                if (rel === "pending_sent") {
                  return (
                    <p className="text-center text-sm text-amber-500 font-medium">
                      Request sent
                    </p>
                  );
                }
                if (rel === "pending_received") {
                  return (
                    <p className="text-center text-sm text-blue-500 font-medium">
                      Wants to connect
                    </p>
                  );
                }
                return (
                  <button
                    onClick={() => {
                      handleSendRequest(viewingUser.id);
                      setViewingUser(null);
                    }}
                    disabled={sendingRequest}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-40 transition-colors"
                  >
                    <UserPlus size={16} />
                    Add Friend
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
