"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Upload, Check } from "lucide-react";
import { SOLID_COVERS, GRADIENT_COVERS, PHOTO_COVER_CATEGORIES } from "@/lib/board-cover-presets";
import { createClient } from "@/lib/supabase/client";

/** Stored appearance: solid color, gradient CSS, or image URL. */
export interface FolderAppearance {
  type: "color" | "gradient" | "image";
  value: string;
}

interface Props {
  open: boolean;
  folderLabel: string;
  currentAppearance: FolderAppearance;
  onApply: (appearance: FolderAppearance) => void;
  onClose: () => void;
}

type Tab = "colors" | "gradients" | "photos";

/**
 * Modal for customizing a folder's header appearance.
 * Options: solid colors, gradients, preset photos, or custom image upload.
 *
 * @param open - Whether the modal is visible
 * @param folderLabel - Folder name shown in the header
 * @param currentAppearance - Current folder appearance
 * @param onApply - Callback with the selected appearance
 * @param onClose - Callback to dismiss
 */
export default function FolderAppearanceModal({
  open,
  folderLabel,
  currentAppearance,
  onApply,
  onClose,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("colors");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  if (!open || typeof document === "undefined") return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "colors", label: "Colors" },
    { id: "gradients", label: "Gradients" },
    { id: "photos", label: "Photos" },
  ];

  /**
   * Handles file selection for custom image upload.
   * Uploads to Supabase storage and applies as folder background.
   */
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/folder-${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, file, { cacheControl: "3600", upsert: true });

      if (error) {
        console.error("Upload failed:", error.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      onApply({ type: "image", value: publicUrl });
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  /**
   * Checks if a given appearance matches the currently selected one.
   */
  function isSelected(type: FolderAppearance["type"], value: string): boolean {
    return currentAppearance.type === type && currentAppearance.value === value;
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-announce-backdrop-in"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-md mx-4 animate-announce-card-in overflow-hidden max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold text-foreground">
            Appearance — {folderLabel}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-border shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Colors tab */}
          {activeTab === "colors" && (
            <div className="grid grid-cols-5 gap-2">
              {SOLID_COVERS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onApply({ type: "color", value: s.color })}
                  title={s.label}
                  className="relative aspect-square rounded-lg border border-border hover:scale-105 transition-transform"
                  style={{ backgroundColor: s.color }}
                >
                  {isSelected("color", s.color) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check size={16} className={s.color === "#ffffff" || s.color === "#e7e5e4" ? "text-gray-800" : "text-white"} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Gradients tab */}
          {activeTab === "gradients" && (
            <div className="grid grid-cols-3 gap-2">
              {GRADIENT_COVERS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => onApply({ type: "gradient", value: g.style })}
                  title={g.label}
                  className="relative aspect-[3/2] rounded-lg border border-border hover:scale-105 transition-transform overflow-hidden"
                  style={{ background: g.style }}
                >
                  <span className="absolute bottom-1 left-1.5 text-[10px] text-white/80 font-medium drop-shadow-sm">
                    {g.label}
                  </span>
                  {isSelected("gradient", g.style) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check size={16} className="text-white drop-shadow" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Photos tab */}
          {activeTab === "photos" && (
            <div className="space-y-4">
              {/* Upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
              >
                <Upload size={16} />
                {uploading ? "Uploading…" : "Upload custom image"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Photo categories */}
              {PHOTO_COVER_CATEGORIES.map((cat) => (
                <div key={cat.label}>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    {cat.label}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {cat.photos.map((photo) => (
                      <button
                        key={photo.id}
                        onClick={() => onApply({ type: "image", value: photo.url })}
                        title={photo.label}
                        className="relative aspect-[3/2] rounded-lg border border-border hover:scale-105 transition-transform overflow-hidden"
                      >
                        <img
                          src={photo.url.replace("w=3200&h=700", "w=400&h=200")}
                          alt={photo.label}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {isSelected("image", photo.url) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Check size={16} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
