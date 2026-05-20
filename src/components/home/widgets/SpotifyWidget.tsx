"use client";

/**
 * Spotify embed widget — Jerrod-style "Now Playing" chrome around the
 * official Spotify embed iframe. A small "01 :: NOW PLAYING" label at
 * the top-left, the player below filling the rest of the card. Empty
 * state directs the user to paste a Spotify URL via settings.
 *
 * Audio playback continues to come from Spotify's iframe — we just
 * wrap it in matching typography so the widget visually slots into
 * the Jerrod-style dashboard.
 *
 * @module SpotifyWidget
 */

import { Music } from "lucide-react";
import { WidgetEmptyState } from "./WidgetPrimitives";

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

/**
 * Builds the Spotify embed iframe URL from a parsed type and ID. The
 * widget always renders the light-mode theme so the embed surfaces
 * sit on white like the rest of the dashboard.
 *
 * @param type - Content type (track, album, playlist, episode, show)
 * @param id - Spotify content ID
 * @returns Full embed URL string
 */
function buildEmbedUrl(type: string, id: string): string {
  return `https://open.spotify.com/embed/${type}/${id}?theme=1`;
}

export default function SpotifyWidget({ config }: SpotifyWidgetProps) {
  const parsed = parseSpotifyUrl(config.spotifyUrl || "");

  if (!parsed) {
    return (
      <div className="h-full w-full flex flex-col px-4 py-3 gap-2">
        <div className="text-sm font-semibold text-foreground">Now Playing</div>
        <div className="flex-1 min-h-0">
          <WidgetEmptyState
            icon={<Music size={20} />}
            message="Click to add a Spotify link"
          />
        </div>
      </div>
    );
  }

  const embedUrl = buildEmbedUrl(parsed.type, parsed.id);

  return (
    <div className="h-full w-full flex flex-col gap-2 px-4 pt-3 pb-2">
      <div className="text-sm font-semibold text-foreground">Now Playing</div>
      <div className="flex-1 min-h-0 overflow-hidden rounded-xl">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          allow="encrypted-media"
          loading="lazy"
          title="Spotify Player"
          style={{ border: 0 }}
        />
      </div>
    </div>
  );
}
