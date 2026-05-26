/**
 * GET /api/spotify/oembed?url=<spotify-share-url>
 *
 * Proxies Spotify's public oEmbed endpoint so the SpotifyWidget can fetch
 * track metadata (title, thumbnail/cover art, iframe URL) without running
 * into CORS issues from the browser. Spotify's oEmbed response is small
 * and stable, so we forward it directly with a short cache header.
 *
 * @module api/spotify/oembed
 */

import { NextResponse, type NextRequest } from "next/server";

/** Allowed Spotify hostnames so we don't proxy arbitrary URLs. */
const SPOTIFY_HOSTS = new Set(["open.spotify.com", "spotify.com"]);

/** Upstream Spotify oEmbed endpoint. */
const OEMBED_BASE = "https://open.spotify.com/oembed";

/**
 * Forwards a Spotify share URL to the public oEmbed endpoint and returns
 * the resulting metadata JSON. Validates that the requested URL is a real
 * Spotify URL before issuing the upstream fetch so this route can't be
 * abused as a generic proxy.
 *
 * @param req - Next.js request with `url` query parameter
 * @returns JSON response with the oEmbed payload, or an error status
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const target = req.nextUrl.searchParams.get("url");
  if (!target) {
    return NextResponse.json({ error: "Missing 'url' query parameter." }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ error: "'url' is not a valid URL." }, { status: 400 });
  }

  if (!SPOTIFY_HOSTS.has(parsed.hostname)) {
    return NextResponse.json({ error: "Only Spotify URLs are supported." }, { status: 400 });
  }

  const upstream = `${OEMBED_BASE}?url=${encodeURIComponent(target)}`;
  try {
    const res = await fetch(upstream, {
      headers: { Accept: "application/json" },
      // 24h shared cache via Next's data cache; oEmbed metadata is stable
      next: { revalidate: 86_400 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Spotify oEmbed responded with ${res.status}.` },
        { status: 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        // Let the browser cache the response for an hour. Safe because
        // oEmbed payloads don't change for the same track URL.
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown fetch failure." },
      { status: 502 },
    );
  }
}
