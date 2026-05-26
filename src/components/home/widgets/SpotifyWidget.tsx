"use client";

/**
 * Spotify widget — renders Spotify's official embed iframe inside the
 * standard widget card. The widget itself doesn't OWN the iframe: it
 * registers a host element with SpotifyPlayerProvider, which projects
 * its singleton iframe into that host. The iframe is never unmounted on
 * route change, so playback keeps going when the user navigates between
 * caltodo tabs or switches browser tabs.
 *
 * The embed is locked to the dark variant. Spotify's iframe can't be
 * re-themed without a full reload (the theme is a query param on the
 * src), so changing it on every theme toggle would tear playback down.
 * Dark is neutral enough to sit on either app theme.
 *
 * @module SpotifyWidget
 */

import { useEffect, useRef, useState } from "react";
import { Music, Pencil } from "lucide-react";
import SpotifyLinkModal from "./SpotifyLinkModal";
import { useSpotifyPlayer } from "@/contexts/SpotifyPlayerContext";

interface SpotifyWidgetProps {
  config: Record<string, string>;
  onUpdateConfig?: (config: Record<string, string>) => void;
}

/**
 * Parses a Spotify URL, URI, or full iframe embed snippet and extracts
 * the content type and ID.
 *
 * Supported formats:
 * - https://open.spotify.com/track/abc123
 * - https://open.spotify.com/track/abc123?si=xyz
 * - https://open.spotify.com/embed/track/abc123?utm_source=generator
 * - spotify:track:abc123
 * - Full <iframe ... src="https://open.spotify.com/embed/track/abc123" ...> snippet
 *
 * @param url - Raw Spotify URL, URI, or iframe HTML string
 * @returns Object with type and id, or null if invalid
 */
export function parseSpotifyUrl(
  url: string,
): { type: string; id: string } | null {
  if (!url) return null;

  let trimmed = url.trim();

  if (trimmed.startsWith("<")) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
    if (!srcMatch) return null;
    trimmed = srcMatch[1];
  }

  const uriMatch = trimmed.match(/^spotify:(\w+):([a-zA-Z0-9]+)/);
  if (uriMatch) {
    return { type: uriMatch[1], id: uriMatch[2] };
  }

  try {
    const parsed = new URL(trimmed);
    if (!parsed.hostname.includes("spotify.com")) return null;

    const segments = parsed.pathname.split("/").filter(Boolean);
    const start = segments[0] === "embed" ? 1 : 0;
    const type = segments[start];
    const id = segments[start + 1];

    if (type && id) {
      return { type, id: id.split("?")[0] };
    }
  } catch {
    /* not a valid URL */
  }

  return null;
}

/**
 * Builds the Spotify embed iframe URL using the dark variant. Locked to
 * dark because changing the theme query param reloads the iframe and
 * stops playback.
 *
 * @param type - Content type (track, album, playlist, episode, show)
 * @param id - Spotify content ID
 * @returns Full embed URL string
 */
function buildEmbedUrl(type: string, id: string): string {
  return `https://open.spotify.com/embed/${type}/${id}?theme=0`;
}

export default function SpotifyWidget({ config, onUpdateConfig }: SpotifyWidgetProps) {
  const rawUrl = config.spotifyUrl || "";
  const parsed = parseSpotifyUrl(rawUrl);
  const [modalOpen, setModalOpen] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const player = useSpotifyPlayer();

  // Push the current Spotify URL to the persistent player whenever it
  // changes. The provider no-ops on duplicate URLs so re-renders don't
  // tear the iframe down.
  useEffect(() => {
    if (!parsed || !player) return;
    player.setUrl(buildEmbedUrl(parsed.type, parsed.id));
  }, [parsed?.type, parsed?.id, player]);

  // Attach the singleton iframe to this widget's host on mount and
  // detach on unmount (which parks it in the hidden container, keeping
  // audio alive).
  useEffect(() => {
    if (!parsed || !player) return;
    const host = hostRef.current;
    if (!host) return;
    player.attach(host);
    return () => {
      player.detach(host);
    };
  }, [parsed?.type, parsed?.id, player]);

  // Empty state — centered prompt to add a Spotify link.
  if (!parsed) {
    return (
      <>
        <div
          className="h-full w-full flex flex-col items-center justify-center gap-2 text-foreground no-drag p-3"
          onClick={(e) => e.stopPropagation()}
        >
          <Music size={20} className="text-muted-foreground" />
          <p className="text-xs text-muted-foreground">No track yet</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setModalOpen(true);
            }}
            className="px-3 py-1 text-xs rounded-full font-semibold bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            Add link
          </button>
        </div>
        <SpotifyLinkModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={(url) => {
            onUpdateConfig?.({ spotifyUrl: url });
            setModalOpen(false);
          }}
        />
      </>
    );
  }

  return (
    <>
      <div
        className="group relative h-full w-full overflow-hidden no-drag flex items-center justify-center p-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Host slot — the SpotifyPlayerProvider projects its singleton
            iframe here. Sized like the old inline iframe so the surrounding
            widget chrome stays unchanged. */}
        <div
          ref={hostRef}
          className="w-full"
          style={{ height: 152 }}
        />
        {/* Edit affordance floats on top of the iframe corner so the user
            can swap the link without a visible header chrome. */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label="Change Spotify link"
          className="absolute top-2 left-2 w-7 h-7 rounded-md flex items-center justify-center bg-background/80 backdrop-blur-sm text-foreground/70 hover:text-foreground hover:bg-background opacity-0 group-hover:opacity-100 transition-all shadow-sm"
        >
          <Pencil size={12} />
        </button>
      </div>

      <SpotifyLinkModal
        open={modalOpen}
        initialUrl={rawUrl}
        onClose={() => setModalOpen(false)}
        onSubmit={(url) => {
          onUpdateConfig?.({ spotifyUrl: url });
          setModalOpen(false);
        }}
      />
    </>
  );
}
