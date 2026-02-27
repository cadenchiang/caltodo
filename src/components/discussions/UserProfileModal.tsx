"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Flag, X } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Shared course entry returned by the profile API.
 */
interface SharedCourse {
  id: string;
  name: string;
  source: string;
}

/**
 * Props for the UserProfileModal component.
 *
 * @param userId - The target user's UUID
 * @param onClose - Callback to close the modal
 */
interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
}

/**
 * Returns a human-readable badge label for a course source.
 *
 * @param source - The course source ("canvas", "gradescope", "pensieve")
 * @returns Display label string
 */
function getSourceLabel(source: string): string {
  switch (source) {
    case "canvas": return "bCourses";
    case "gradescope": return "Gradescope";
    case "pensieve": return "Pensieve";
    default: return source;
  }
}

/**
 * Portal modal showing a user's profile (avatar, name) and shared courses.
 * Each shared course is clickable and navigates to its discussion chat.
 */
export default function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [sharedCourses, setSharedCourses] = useState<SharedCourse[]>([]);
  const [friendCount, setFriendCount] = useState<number>(0);
  const [karma, setKarma] = useState<number>(0);
  const [closing, setClosing] = useState(false);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      try {
        const res = await fetch(`/api/discussions/profile?userId=${encodeURIComponent(userId)}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setUserName(data.userName);
          setUserAvatar(data.userAvatar);
          setSharedCourses(data.sharedCourses ?? []);
        }
      } catch {
        /* non-critical */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function fetchFriendCount() {
      try {
        const res = await fetch(`/api/friends/count?userId=${encodeURIComponent(userId)}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setFriendCount(data.count ?? 0);
        }
      } catch {
        /* non-critical */
      }
    }

    async function fetchKarma() {
      try {
        const res = await fetch(`/api/users/karma?userId=${encodeURIComponent(userId)}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setKarma(data.karma ?? 0);
        }
      } catch {
        /* non-critical */
      }
    }

    fetchProfile();
    fetchFriendCount();
    fetchKarma();
    return () => { cancelled = true; };
  }, [userId]);

  /**
   * Animates the modal closed then calls onClose.
   */
  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => onClose(), 150);
  }, [onClose]);

  /**
   * Reports the user via POST /api/users/report and shows a confirmation alert.
   */
  async function handleReport() {
    if (reporting) return;
    setReporting(true);
    try {
      const res = await fetch("/api/users/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        alert("Report submitted. Thank you.");
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to submit report.");
      }
    } catch {
      alert("Failed to submit report.");
    } finally {
      setReporting(false);
    }
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-150 ${
        closing ? "opacity-0" : "animate-in fade-in duration-150"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative bg-card rounded-2xl border border-border shadow-2xl w-[380px] max-w-[90vw] overflow-hidden transition-all duration-150 ${
          closing ? "scale-95 opacity-0" : "animate-in zoom-in-95 fade-in duration-200"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Report + Close buttons */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
          <button
            onClick={handleReport}
            disabled={reporting}
            className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-accent transition-colors cursor-pointer disabled:opacity-40"
            aria-label="Report user"
            title="Report user"
          >
            <Flag size={14} />
          </button>
          <button
            onClick={handleClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors cursor-pointer"
            aria-label="Close profile"
          >
            <X size={16} />
          </button>
        </div>

        {loading ? (
          /* Loading skeleton */
          <div className="p-6 space-y-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-muted rounded w-32" />
                <div className="h-3 bg-muted rounded w-20" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-24" />
              <div className="h-8 bg-muted rounded" />
              <div className="h-8 bg-muted rounded" />
            </div>
          </div>
        ) : (
          <>
            {/* Profile header */}
            <div className="flex items-center gap-5 p-5 pb-4">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt=""
                  className="w-20 h-20 rounded-full shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-2xl font-medium text-muted-foreground shrink-0">
                  {(userName ?? "?")[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-foreground truncate">
                  {userName || "Unknown"}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-xs text-muted-foreground">
                    {friendCount} {friendCount === 1 ? "Friend" : "Friends"}
                  </p>
                  <p className="text-xs text-muted-foreground group relative cursor-default">
                    {karma} Karma
                    <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1 rounded-lg bg-popover border border-border text-xs text-muted-foreground px-2.5 py-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      Total messages sent in CalChat
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Shared courses */}
            {sharedCourses.length > 0 && (
              <div className="px-5 pb-5">
                <p className="text-[11px] font-medium text-foreground mb-2">
                  Shared Courses
                </p>
                <div className="space-y-1">
                  {sharedCourses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => {
                        router.push(`/app/discussions/${course.id}`);
                        handleClose();
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                    >
                      <span className="text-sm text-foreground truncate flex-1">
                        {course.name}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                        {getSourceLabel(course.source)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sharedCourses.length === 0 && (
              <div className="px-5 pb-5">
                <p className="text-xs text-muted-foreground">No shared courses.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
