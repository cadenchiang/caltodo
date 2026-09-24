"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, Loader2, Pencil } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import EditProfileModal from "@/components/ui/EditProfileModal";
import ImageCropModal from "@/components/ui/ImageCropModal";
import { classifyImage } from "@/lib/nsfw-check";
import { getHiResAvatar, getInitials, PROFILE_CACHE_KEY } from "./profile-utils";

/** Largest avatar upload accepted, in bytes. */
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

interface ProfileHeaderProps {
  /** Number of friends, shown in the stats row. */
  friendCount: number;
}

/**
 * The signed-in user's avatar (click to change), editable display name,
 * friend count, and the Edit profile button. Profile fields hydrate from the
 * sidebar's localStorage cache after mount.
 *
 * @param friendCount - Shown as "N friends"
 */
export default function ProfileHeader({ friendCount }: ProfileHeaderProps) {
  const { showToast } = useToast();
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(PROFILE_CACHE_KEY);
      if (cached) {
        const p = JSON.parse(cached);
        if (p?.email) setEmail(p.email);
        if (p?.fullName) setFullName(p.fullName);
        if (p?.avatarUrl) setAvatarUrl(p.avatarUrl);
      }
    } catch (err) {
      console.warn("ProfileHeader: corrupt profile cache ignored", { error: err instanceof Error ? err.message : String(err) });
    }
  }, []);

  /** Writes one field back into the sidebar's profile cache and notifies it. */
  function publishProfile(patch: { fullName?: string; avatarUrl?: string }) {
    try {
      const cached = localStorage.getItem(PROFILE_CACHE_KEY);
      if (cached) localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ ...JSON.parse(cached), ...patch }));
    } catch { /* quota exceeded; the sidebar still gets the event */ }
    window.dispatchEvent(new CustomEvent("profile-updated", { detail: patch }));
  }

  /** Opens the crop modal after a file is picked. */
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;
    if (file.size > MAX_AVATAR_BYTES) {
      showToast("File too large. Max 5 MB.", { variant: "error" });
      return;
    }
    setCropSrc(URL.createObjectURL(file));
  }

  /** Screens and uploads the cropped avatar. */
  async function handleCropped(blob: Blob) {
    setCropSrc(null);
    const file = new File([blob], "avatar.jpg", { type: blob.type });
    const nsfw = await classifyImage(file);
    if (nsfw.isSensitive) {
      showToast("This image cannot be used as a profile photo.", { variant: "error" });
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/account/avatar", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Upload failed: ${res.status}`);
      }
      const { avatar_url } = await res.json();
      setAvatarUrl(avatar_url);
      setImgError(false);
      publishProfile({ avatarUrl: avatar_url });
      showToast("Profile photo updated.");
    } catch (err) {
      console.error("ProfileHeader: avatar upload failed", {
        error: err instanceof Error ? err.message : String(err),
        impact: "the previous photo is unchanged",
      });
      showToast(err instanceof Error ? err.message : "Failed to upload photo.", { variant: "error" });
    } finally {
      setUploading(false);
    }
  }

  /** Saves the edited display name via PUT /api/account/name. */
  async function handleSaveName() {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === fullName) {
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
        throw new Error(data.error || `Save failed: ${res.status}`);
      }
      setFullName(trimmed);
      setEditingName(false);
      publishProfile({ fullName: trimmed });
      showToast("Name updated.");
    } catch (err) {
      console.error("ProfileHeader: name save failed", {
        error: err instanceof Error ? err.message : String(err),
        impact: "the previous name is unchanged",
      });
      showToast(err instanceof Error ? err.message : "Failed to update name.", { variant: "error" });
    } finally {
      setSavingName(false);
    }
  }

  return (
    <div className="flex items-center gap-6 sm:gap-8 px-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        aria-label="Change profile photo"
        className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shrink-0 group cursor-pointer disabled:cursor-wait focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="absolute inset-0 bg-muted" />
        {avatarUrl && !imgError ? (
          <img
            src={getHiResAvatar(avatarUrl)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-blue-500 flex items-center justify-center text-white text-3xl font-medium">
            {getInitials(fullName, email)}
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
          {uploading ? (
            <Loader2 size={20} className="animate-spin text-white" aria-hidden="true" />
          ) : (
            <Camera size={20} className="text-white" aria-hidden="true" />
          )}
        </div>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
      <ImageCropModal
        open={!!cropSrc}
        imageSrc={cropSrc || ""}
        aspect={1}
        cropShape="round"
        onCrop={handleCropped}
        onClose={() => {
          if (cropSrc) URL.revokeObjectURL(cropSrc);
          setCropSrc(null);
        }}
      />

      <div className="flex-1 min-w-0">
        {editingName ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nameInput}
              aria-label="Display name"
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSaveName();
                if (e.key === "Escape") setEditingName(false);
              }}
              className="text-xl font-semibold text-foreground bg-transparent border border-input-border rounded-md px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-ring min-w-0 flex-1"
              maxLength={100}
              autoFocus
            />
            <IconButton aria-label="Save name" onClick={handleSaveName} disabled={savingName}>
              {savingName ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            </IconButton>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setNameInput(fullName ?? "");
              setEditingName(true);
            }}
            aria-label="Edit name"
            className="text-xl font-semibold text-foreground hover:underline cursor-pointer truncate block max-w-full text-left"
          >
            {fullName || "Add your name"}
          </button>
        )}

        <p className="text-sm text-foreground mt-2.5">
          <span className="font-semibold">{friendCount}</span> {friendCount === 1 ? "friend" : "friends"}
        </p>

        <Button
          size="sm"
          variant="secondary"
          leadingIcon={<Pencil size={12} />}
          onClick={() => setShowEdit(true)}
          className="mt-3"
        >
          Edit profile
        </Button>
      </div>

      <EditProfileModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        avatarUrl={avatarUrl}
        fullName={fullName}
        email={email}
      />
    </div>
  );
}
