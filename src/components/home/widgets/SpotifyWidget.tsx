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

import { useState } from "react";
import { Music } from "lucide-react";

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

export default function SpotifyWidget({ config, onUpdateConfig }: SpotifyWidgetProps) {
  const parsed = parseSpotifyUrl(config.spotifyUrl || "");
  // Inline-edit state for the empty case so the user can paste a URL
  // straight into the widget without opening the settings modal.
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submitDraft() {
    const valid = parseSpotifyUrl(draft);
    if (!valid) {
      setError("Not a valid Spotify URL");
      return;
    }
    setError(null);
    onUpdateConfig?.({ spotifyUrl: draft.trim() });
  }

  if (!parsed) {
    return (
      <div className="h-full w-full flex flex-col px-5 py-4 gap-3">
        <div className="text-sm font-bold tracking-tight text-foreground">Now Playing</div>
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 text-foreground">
          <Music size={28} />
          <p className="text-sm font-semibold tracking-tight">Paste a Spotify link</p>
          <div className="w-full flex items-center gap-2 no-drag" onClick={(e) => e.stopPropagation()}>
            <input
              type="url"
              value={draft}
              onChange={(e) => { setDraft(e.target.value); setError(null); }}
              onKeyDown={(e) => { if (e.key === "Enter") submitDraft(); }}
              placeholder="https://open.spotify.com/track/..."
              className="flex-1 min-w-0 px-3 py-1.5 text-xs rounded-lg border border-input-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); submitDraft(); }}
              disabled={!draft.trim()}
              className="shrink-0 px-3 py-1.5 text-xs rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
          {error && <p className="text-[11px] text-red-500">{error}</p>}
        </div>
      </div>
    );
  }

  const embedUrl = buildEmbedUrl(parsed.type, parsed.id);

  return (
    <div className="h-full w-full flex flex-col gap-3 px-5 pt-4 pb-2">
      <div className="text-sm font-bold tracking-tight text-foreground">Now Playing</div>
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
