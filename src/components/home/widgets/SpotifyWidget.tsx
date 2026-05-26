"use client";

/**
 * Spotify widget — renders Spotify's official embed iframe inside the
 * standard widget card. The widget background uses the default card
 * surface (var(--card)) so the player sits on the same tone as every
 * other widget; a small uniform padding lets that surface show around
 * the iframe edges since Spotify's compact embed has its own corners.
 *
 * Trade-off note: the Spotify iframe is rendered by Spotify on their
 * own origin, so its internal UI (green background, branding, controls)
 * can't be restyled from here. We only own the chrome around it.
 *
 * @module SpotifyWidget
 */

import { useEffect, useState } from "react";
import { Music, Pencil } from "lucide-react";
import SpotifyLinkModal from "./SpotifyLinkModal";
import { useTheme } from "@/contexts/ThemeContext";

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
 * Builds the Spotify embed iframe URL. Spotify only exposes one color
 * knob via the `theme` query param: 0 = dark variant (green/black),
 * 1 = light variant (white compact). Nothing else about the iframe's
 * interior can be themed from our side.
 *
 * @param type - Content type (track, album, playlist, episode, show)
 * @param id - Spotify content ID
 * @param dark - True to request the dark embed variant
 * @returns Full embed URL string
 */
function buildEmbedUrl(type: string, id: string, dark: boolean): string {
  const theme = dark ? 0 : 1;
  return `https://open.spotify.com/embed/${type}/${id}?theme=${theme}`;
}

export default function SpotifyWidget({ config, onUpdateConfig }: SpotifyWidgetProps) {
  const rawUrl = config.spotifyUrl || "";
  const parsed = parseSpotifyUrl(rawUrl);
  const [modalOpen, setModalOpen] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Reset the loading skeleton whenever the embed URL changes so each
  // new track gets its own load-in indicator.
  useEffect(() => {
    setIframeReady(false);
  }, [parsed?.type, parsed?.id, isDark]);

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

  const embedUrl = buildEmbedUrl(parsed.type, parsed.id, isDark);

  return (
    <>
      <div
        className="group relative h-full w-full overflow-hidden no-drag flex items-center justify-center p-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Spotify's compact track embed renders at exactly 152px tall;
            pinning the iframe to that height means the player content
            fills the iframe instead of leaving Spotify's body background
            visible below the player. Small p-2 on the wrapper above lets
            the widget's own card surface peek around the iframe edges. */}
        <iframe
          src={embedUrl}
          width="100%"
          height="152"
          allow="encrypted-media; autoplay; clipboard-write; picture-in-picture"
          loading="eager"
          title="Spotify Player"
          onLoad={() => setIframeReady(true)}
          style={{
            border: 0,
            display: "block",
            width: "100%",
            height: 152,
            opacity: iframeReady ? 1 : 0,
            transition: "opacity 200ms ease-out",
          }}
        />
        {/* Skeleton row mirrors the compact embed's layout (square art
            on the left, two text lines + a control row) so the widget
            isn't a blank box while Spotify's iframe hydrates. Fades out
            via onLoad above. */}
        {!iframeReady && (
          <div
            className="absolute inset-2 flex items-center gap-3 px-3 pointer-events-none"
            aria-hidden="true"
          >
            <div className="w-[88px] h-[88px] rounded-md bg-foreground/[0.06] animate-pulse shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-3 rounded-md bg-foreground/[0.08] animate-pulse w-2/3" />
              <div className="h-2.5 rounded-md bg-foreground/[0.06] animate-pulse w-1/3" />
              <div className="h-1 rounded-full bg-foreground/[0.05] animate-pulse w-full mt-2" />
            </div>
          </div>
        )}
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
