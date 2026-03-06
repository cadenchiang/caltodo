"use client";

/**
 * Spotify embed widget — renders a playable Spotify player via iframe.
 * Users paste a Spotify URL (track, album, playlist, podcast) and it
 * constructs the embed URL automatically. No API key or OAuth required.
 *
 * @module SpotifyWidget
 */

import { useState, useCallback } from "react";
import { Music } from "lucide-react";
import { WidgetShell, WidgetEmptyState } from "./WidgetPrimitives";

interface SpotifyWidgetProps {
  config: Record<string, string>;
  onUpdateConfig?: (config: Record<string, string>) => void;
}

/**
 * Parses a Spotify URL or URI and extracts the content type and ID.
 *
 * Supported formats:
 * - https://open.spotify.com/track/abc123
 * - https://open.spotify.com/track/abc123?si=xyz
 * - spotify:track:abc123
 *
 * @param url - Raw Spotify URL or URI string
 * @returns Object with type and id, or null if invalid
 */
export function parseSpotifyUrl(
  url: string
): { type: string; id: string } | null {
  if (!url) return null;

  const trimmed = url.trim();

  // Handle spotify: URI format (spotify:track:abc123)
  const uriMatch = trimmed.match(/^spotify:(\w+):([a-zA-Z0-9]+)/);
  if (uriMatch) {
    return { type: uriMatch[1], id: uriMatch[2] };
  }

  // Handle open.spotify.com URL format
  try {
    const parsed = new URL(trimmed);
    if (!parsed.hostname.includes("spotify.com")) return null;

    // Path format: /track/abc123 or /embed/track/abc123
    const segments = parsed.pathname.split("/").filter(Boolean);

    // Skip "embed" prefix if present
    const start = segments[0] === "embed" ? 1 : 0;
    const type = segments[start];
    const id = segments[start + 1];

    if (type && id) {
      // Strip query params from id
      return { type, id: id.split("?")[0] };
    }
  } catch {
    // Not a valid URL
  }

  return null;
}

/**
 * Builds the Spotify embed iframe URL from a parsed type and ID.
 *
 * @param type - Content type (track, album, playlist, episode, show)
 * @param id - Spotify content ID
 * @param darkMode - Whether to use dark theme (theme=0)
 * @returns Full embed URL string
 */
function buildEmbedUrl(type: string, id: string, darkMode = true): string {
  return `https://open.spotify.com/embed/${type}/${id}?theme=${darkMode ? "0" : "1"}`;
}

export default function SpotifyWidget({
  config,
  onUpdateConfig,
}: SpotifyWidgetProps) {
  const [inputValue, setInputValue] = useState("");

  const parsed = parseSpotifyUrl(config.spotifyUrl || "");

  const handleSubmit = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || !onUpdateConfig) return;

    const result = parseSpotifyUrl(trimmed);
    if (result) {
      onUpdateConfig({ ...config, spotifyUrl: trimmed });
      setInputValue("");
    }
  }, [inputValue, config, onUpdateConfig]);

  // Empty state — show input prompt
  if (!parsed) {
    return (
      <WidgetEmptyState
        icon={<Music size={24} />}
        message="Add a Spotify link"
        action={
          onUpdateConfig ? (
            <div className="flex items-center gap-1.5 mt-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                placeholder="Paste Spotify URL..."
                className="px-2.5 py-1.5 text-xs rounded-lg border border-input-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-44"
              />
              <button
                onClick={handleSubmit}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors font-medium"
              >
                Add
              </button>
            </div>
          ) : undefined
        }
      />
    );
  }

  // Render embedded player
  const embedUrl = buildEmbedUrl(parsed.type, parsed.id);
  return (
    <WidgetShell className="p-0">
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        allow="encrypted-media"
        loading="lazy"
        className="rounded-xl"
        title="Spotify Player"
      />
    </WidgetShell>
  );
}
