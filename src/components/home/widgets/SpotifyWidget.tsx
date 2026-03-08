"use client";

/**
 * Spotify embed widget — renders a playable Spotify player via iframe.
 * Users paste a Spotify URL (track, album, playlist, podcast) in the
 * settings panel. Supports custom header text, colors, and dark/light theme.
 *
 * @module SpotifyWidget
 */

import { Music } from "lucide-react";
import { WidgetShell, WidgetHeader, WidgetEmptyState } from "./WidgetPrimitives";

interface SpotifyWidgetProps {
  config: Record<string, string>;
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

/** Content type labels for the header. */
const TYPE_LABELS: Record<string, string> = {
  track: "Track",
  album: "Album",
  playlist: "Playlist",
  episode: "Episode",
  show: "Podcast",
};

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

export default function SpotifyWidget({ config }: SpotifyWidgetProps) {
  const parsed = parseSpotifyUrl(config.spotifyUrl || "");

  // Empty state — direct to settings
  if (!parsed) {
    return (
      <WidgetEmptyState
        icon={<Music size={24} />}
        message="Click to add a Spotify link in settings"
      />
    );
  }

  // Render embedded player with optional header
  const useDarkTheme = config.spotifyTheme !== "light";
  const embedUrl = buildEmbedUrl(parsed.type, parsed.id, useDarkTheme);
  const headerText = config.spotifyLabel || TYPE_LABELS[parsed.type] || "Spotify";
  const showHeader = config.spotifyShowHeader !== "false";

  return (
    <WidgetShell className={showHeader ? "" : "p-0"}>
      {showHeader && (
        <WidgetHeader title={headerText} />
      )}
      <div className={`flex-1 min-h-0 overflow-hidden ${showHeader ? "-mx-3 -mb-3" : ""}`}>
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          allow="encrypted-media"
          loading="lazy"
          className={showHeader ? "" : "rounded-sm"}
          title="Spotify Player"
        />
      </div>
    </WidgetShell>
  );
}
