"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, LogOut, Bell, BellOff } from "lucide-react";
import MemberList from "@/components/discussions/MemberList";
import UserProfileModal from "@/components/discussions/UserProfileModal";

const NAME_KEY_PREFIX = "calchat_name_";
const MUTE_KEY_PREFIX = "calchat_muted_";
const MSG_CACHE_PREFIX = "chat_messages_cache_";
const MEM_CACHE_PREFIX = "chat_members_cache_";

/**
 * Props for the ChatDetailsSidebar component.
 *
 * @param courseId - The active course UUID
 * @param courseName - The default course display name
 * @param onlineUserIds - Set of currently online user IDs
 * @param onClose - Callback to close the sidebar
 * @param onNameOverride - Callback when user saves a custom group name (null to clear)
 * @param onMuteChange - Callback when mute toggle changes
 */
interface ChatDetailsSidebarProps {
  courseId: string;
  courseName: string;
  onlineUserIds: Set<string>;
  onClose: () => void;
  onNameOverride: (name: string | null) => void;
  onMuteChange: (muted: boolean) => void;
  /** When true, hides group name editing and leave chat sections. */
  isSystemCourse?: boolean;
}

/**
 * Right sidebar panel showing chat details (iMessage Details style).
 * Includes group name editing, mute toggle, enlarged member list, and leave chat.
 */
export default function ChatDetailsSidebar({
  courseId,
  courseName,
  onlineUserIds,
  onClose,
  onNameOverride,
  onMuteChange,
  isSystemCourse,
}: ChatDetailsSidebarProps) {
  const router = useRouter();

  // Group name editing
  const [nameInput, setNameInput] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);

  // Mute state
  const [isMuted, setIsMuted] = useState(false);

  // Leave confirmation
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Profile modal
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  // Load persisted name override and mute state from localStorage
  useEffect(() => {
    try {
      const savedName = localStorage.getItem(NAME_KEY_PREFIX + courseId);
      setNameInput(savedName ?? "");
      const savedMute = localStorage.getItem(MUTE_KEY_PREFIX + courseId);
      setIsMuted(savedMute === "true");
    } catch {
      // localStorage unavailable
    }
  }, [courseId]);

  /**
   * Saves the custom group name to localStorage and notifies parent.
   * An empty value clears the override.
   */
  const handleSaveName = useCallback(() => {
    const trimmed = nameInput.trim();
    try {
      if (trimmed) {
        localStorage.setItem(NAME_KEY_PREFIX + courseId, trimmed);
      } else {
        localStorage.removeItem(NAME_KEY_PREFIX + courseId);
      }
    } catch {
      // localStorage unavailable
    }
    onNameOverride(trimmed || null);
    setIsEditingName(false);
    // Notify chat about the name change
    if (trimmed && trimmed !== courseName) {
      window.dispatchEvent(new CustomEvent("calchat-name-changed", {
        detail: { courseId, newName: trimmed },
      }));
    }
  }, [courseId, courseName, nameInput, onNameOverride]);

  /**
   * Toggles the mute state, persists to localStorage, and notifies parent.
   */
  const handleToggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    try {
      localStorage.setItem(MUTE_KEY_PREFIX + courseId, String(newMuted));
    } catch {
      // localStorage unavailable
    }
    // Notify sidebar about mute change (same-tab)
    window.dispatchEvent(new CustomEvent("calchat-mute-changed", {
      detail: { courseId, muted: newMuted },
    }));
    onMuteChange(newMuted);
  }, [courseId, isMuted, onMuteChange]);

  /**
   * Calls the leave API, clears caches, and navigates to discussions list.
   */
  const handleLeave = useCallback(async () => {
    setLeaving(true);
    try {
      const res = await fetch("/api/discussions/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Failed to leave chat:", data.error ?? res.statusText);
        setLeaving(false);
        return;
      }

      // Clear sessionStorage caches for this course
      try {
        sessionStorage.removeItem(MSG_CACHE_PREFIX + courseId);
        sessionStorage.removeItem(MEM_CACHE_PREFIX + courseId);
      } catch {
        // sessionStorage unavailable
      }

      // Clear localStorage overrides
      try {
        localStorage.removeItem(NAME_KEY_PREFIX + courseId);
        localStorage.removeItem(MUTE_KEY_PREFIX + courseId);
      } catch {
        // localStorage unavailable
      }

      router.push("/app/discussions");
    } catch (err) {
      console.error("Leave chat error:", err);
      setLeaving(false);
    }
  }, [courseId, router]);

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border shrink-0">
        <h2 className="text-base font-semibold text-foreground">Details</h2>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
          aria-label="Close details"
        >
          <X size={14} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {/* Change group name — hidden for system courses */}
        {!isSystemCourse && (
          <>
            <div>
              <label className="text-[12px] font-medium text-muted-foreground">
                Group Name
              </label>
              <input
                type="text"
                value={isEditingName ? nameInput : (nameInput || courseName)}
                onChange={(e) => setNameInput(e.target.value)}
                onFocus={() => {
                  if (!isEditingName) {
                    setIsEditingName(true);
                    // Pre-fill with current display name if empty
                    if (!nameInput) setNameInput(courseName);
                  }
                }}
                onBlur={() => {
                  handleSaveName();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  if (e.key === "Escape") {
                    setIsEditingName(false);
                    // Reset to saved value
                    try {
                      const saved = localStorage.getItem(NAME_KEY_PREFIX + courseId);
                      setNameInput(saved ?? "");
                    } catch { /* ignore */ }
                  }
                }}
                placeholder={courseName}
                maxLength={60}
                className="mt-1.5 w-full px-3 py-1.5 text-sm rounded-lg border border-transparent bg-transparent text-foreground placeholder:text-muted-foreground/50 hover:border-border focus:border-border focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors cursor-text"
              />
            </div>

            <hr className="border-border -mx-5" />
          </>
        )}

        {/* Mute messages */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isMuted ? (
              <BellOff size={16} className="text-muted-foreground" />
            ) : (
              <Bell size={16} className="text-muted-foreground" />
            )}
            <span className="text-sm text-foreground">Mute Messages</span>
          </div>
          <button
            onClick={handleToggleMute}
            className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${
              isMuted ? "bg-blue-500" : "bg-muted-foreground/30"
            }`}
            role="switch"
            aria-checked={isMuted}
            aria-label="Mute messages"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                isMuted ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <hr className="border-border -mx-5" />

        {/* Members section */}
        <div>
          <MemberList
            courseId={courseId}
            onlineUserIds={onlineUserIds}
            avatarSize="lg"
            onMemberClick={setProfileUserId}
          />
        </div>

        {/* Leave chat — hidden for system courses */}
        {!isSystemCourse && (
          <>
            <hr className="border-border -mx-5" />

            <div>
              {showLeaveConfirm ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    You will be removed from this chat and lose access to its messages. This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleLeave}
                      disabled={leaving}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                    >
                      {leaving ? "Leaving..." : "Confirm Leave"}
                    </button>
                    <button
                      onClick={() => setShowLeaveConfirm(false)}
                      disabled={leaving}
                      className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowLeaveConfirm(true)}
                  className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Leave Chat</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* User profile modal */}
      {profileUserId && (
        <UserProfileModal
          userId={profileUserId}
          onClose={() => setProfileUserId(null)}
        />
      )}
    </div>
  );
}
