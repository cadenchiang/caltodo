"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FolderAppearance } from "@/components/notes/FolderAppearanceModal";

/** Settings stored per folder ID. */
export interface FolderSetting {
  icon?: string;
  description?: string;
  appearance?: FolderAppearance;
}

/** A previously uploaded custom image saved for reuse. */
export interface CustomImage {
  url: string;
  uploadedAt: string;
}

/** Full settings map keyed by folder ID. */
type SettingsMap = Record<string, FolderSetting>;

/** Max number of custom colors a user can save. */
const MAX_CUSTOM_COLORS = 20;
/** Max number of custom images a user can save. */
const MAX_CUSTOM_IMAGES = 30;

/**
 * Hook for reading/writing per-folder settings (icon, description, appearance).
 * Also manages user-level custom colors and custom images for reuse.
 * Persists to Supabase `notes_folder_settings` table.
 * Debounces saves by 500ms. Falls back to localStorage for instant hydration.
 *
 * @returns Settings map, custom colors/images, and update functions
 */
export function useFolderSettings() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [customImages, setCustomImages] = useState<CustomImage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const supabase = createClient();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<SettingsMap | null>(null);
  /** Suppresses Realtime echoes from our own writes. */
  const localWritePendingRef = useRef(false);

  // Hydrate from localStorage instantly, then fetch from Supabase + subscribe to Realtime
  useEffect(() => {
    try {
      const cached = localStorage.getItem("notes_folder_settings_cache");
      if (cached) setSettings(JSON.parse(cached));
    } catch { /* ignore */ }

    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function fetchAndSubscribe() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoaded(true); return; }

      const { data } = await supabase
        .from("notes_folder_settings")
        .select("settings, custom_colors, custom_images")
        .eq("user_id", user.id)
        .single();

      if (data?.settings) {
        const serverSettings = data.settings as SettingsMap;
        setSettings(serverSettings);
        try {
          localStorage.setItem("notes_folder_settings_cache", JSON.stringify(serverSettings));
        } catch { /* ignore */ }
      }
      if (data?.custom_colors) {
        setCustomColors(data.custom_colors as string[]);
      }
      if (data?.custom_images) {
        setCustomImages(data.custom_images as CustomImage[]);
      }
      setLoaded(true);

      // Realtime sync for cross-device updates
      channel = supabase
        .channel("notes_folder_settings")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notes_folder_settings",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (localWritePendingRef.current) return;
            const incoming = payload.new as {
              settings: SettingsMap;
              custom_colors?: string[];
              custom_images?: CustomImage[];
            };
            if (incoming?.settings) {
              setSettings(incoming.settings);
              try {
                localStorage.setItem("notes_folder_settings_cache", JSON.stringify(incoming.settings));
              } catch { /* ignore */ }
            }
            if (incoming?.custom_colors) setCustomColors(incoming.custom_colors);
            if (incoming?.custom_images) setCustomImages(incoming.custom_images);
          }
        )
        .subscribe();
    }

    fetchAndSubscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  /**
   * Persists settings to Supabase with 500ms debounce.
   *
   * @param updated - The full settings map to save
   */
  const debouncedSave = useCallback((updated: SettingsMap) => {
    pendingRef.current = updated;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      const toSave = pendingRef.current;
      if (!toSave) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("notes_folder_settings")
        .upsert({ user_id: user.id, settings: toSave }, { onConflict: "user_id" });

      if (error) {
        console.error("Failed to save folder settings:", error.message);
      }
      // Clear after a short delay to let the Realtime echo pass
      setTimeout(() => { localWritePendingRef.current = false; }, 2000);
    }, 500);
  }, [supabase]);

  /**
   * Updates a single field for a folder and persists.
   *
   * @param folderId - The folder ID
   * @param field - The field to update (icon, description, appearance)
   * @param value - The new value
   */
  const updateSetting = useCallback(
    <K extends keyof FolderSetting>(folderId: string, field: K, value: FolderSetting[K]) => {
      localWritePendingRef.current = true;
      setSettings((prev) => {
        const updated = {
          ...prev,
          [folderId]: { ...prev[folderId], [field]: value },
        };
        try {
          localStorage.setItem("notes_folder_settings_cache", JSON.stringify(updated));
        } catch { /* ignore */ }
        debouncedSave(updated);
        return updated;
      });
    },
    [debouncedSave]
  );

  /**
   * Gets a folder's settings with defaults.
   *
   * @param folderId - The folder ID
   * @returns The folder settings or empty defaults
   */
  const getFolderSetting = useCallback(
    (folderId: string): FolderSetting => settings[folderId] ?? {},
    [settings]
  );

  /**
   * Adds a custom color hex to the user's saved list.
   * Deduplicates and caps at MAX_CUSTOM_COLORS.
   *
   * @param hex - The hex color string (e.g. "#ff0000")
   */
  const addCustomColor = useCallback(async (hex: string) => {
    setCustomColors((prev) => {
      const deduped = prev.filter((c) => c !== hex);
      return [hex, ...deduped].slice(0, MAX_CUSTOM_COLORS);
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Read current to deduplicate server-side
    const { data } = await supabase
      .from("notes_folder_settings")
      .select("custom_colors")
      .eq("user_id", user.id)
      .single();

    const existing = (data?.custom_colors as string[]) ?? [];
    const updated = [hex, ...existing.filter((c: string) => c !== hex)].slice(0, MAX_CUSTOM_COLORS);

    await supabase
      .from("notes_folder_settings")
      .upsert({ user_id: user.id, custom_colors: updated }, { onConflict: "user_id" });
  }, [supabase]);

  /**
   * Adds a custom image URL to the user's saved list.
   * Deduplicates by URL and caps at MAX_CUSTOM_IMAGES.
   *
   * @param url - The public URL of the uploaded image
   */
  const addCustomImage = useCallback(async (url: string) => {
    const newEntry: CustomImage = { url, uploadedAt: new Date().toISOString() };
    setCustomImages((prev) => {
      const deduped = prev.filter((img) => img.url !== url);
      return [newEntry, ...deduped].slice(0, MAX_CUSTOM_IMAGES);
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("notes_folder_settings")
      .select("custom_images")
      .eq("user_id", user.id)
      .single();

    const existing = (data?.custom_images as CustomImage[]) ?? [];
    const updated = [newEntry, ...existing.filter((img: CustomImage) => img.url !== url)].slice(0, MAX_CUSTOM_IMAGES);

    await supabase
      .from("notes_folder_settings")
      .upsert({ user_id: user.id, custom_images: updated }, { onConflict: "user_id" });
  }, [supabase]);

  return {
    settings,
    loaded,
    getFolderSetting,
    updateSetting,
    customColors,
    addCustomColor,
    customImages,
    addCustomImage,
  };
}
