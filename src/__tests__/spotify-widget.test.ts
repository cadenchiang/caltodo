/**
 * Unit tests for the Spotify URL parser used by SpotifyWidget.
 *
 * @module spotify-widget.test
 */

import { describe, it, expect } from "vitest";
import { parseSpotifyUrl } from "@/components/home/widgets/SpotifyWidget";

describe("parseSpotifyUrl", () => {
  it("parses a standard track URL", () => {
    const result = parseSpotifyUrl("https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6");
    expect(result).toEqual({ type: "track", id: "6rqhFgbbKwnb9MLmUQDhG6" });
  });

  it("parses a track URL with query params", () => {
    const result = parseSpotifyUrl("https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6?si=abc123");
    expect(result).toEqual({ type: "track", id: "6rqhFgbbKwnb9MLmUQDhG6" });
  });

  it("parses an album URL", () => {
    const result = parseSpotifyUrl("https://open.spotify.com/album/1DFixLWuPkv3KT3TnV35m3");
    expect(result).toEqual({ type: "album", id: "1DFixLWuPkv3KT3TnV35m3" });
  });

  it("parses a playlist URL", () => {
    const result = parseSpotifyUrl("https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M");
    expect(result).toEqual({ type: "playlist", id: "37i9dQZF1DXcBWIGoYBM5M" });
  });

  it("parses a podcast episode URL", () => {
    const result = parseSpotifyUrl("https://open.spotify.com/episode/512ojhOuo1ktJprKbVcKyQ");
    expect(result).toEqual({ type: "episode", id: "512ojhOuo1ktJprKbVcKyQ" });
  });

  it("parses a show (podcast) URL", () => {
    const result = parseSpotifyUrl("https://open.spotify.com/show/2mTUnDkuKUkhiueKcVWoP0");
    expect(result).toEqual({ type: "show", id: "2mTUnDkuKUkhiueKcVWoP0" });
  });

  it("parses a spotify: URI", () => {
    const result = parseSpotifyUrl("spotify:track:6rqhFgbbKwnb9MLmUQDhG6");
    expect(result).toEqual({ type: "track", id: "6rqhFgbbKwnb9MLmUQDhG6" });
  });

  it("parses an embed URL (already embedded format)", () => {
    const result = parseSpotifyUrl("https://open.spotify.com/embed/track/6rqhFgbbKwnb9MLmUQDhG6");
    expect(result).toEqual({ type: "track", id: "6rqhFgbbKwnb9MLmUQDhG6" });
  });

  it("handles URLs with leading/trailing whitespace", () => {
    const result = parseSpotifyUrl("  https://open.spotify.com/track/abc123  ");
    expect(result).toEqual({ type: "track", id: "abc123" });
  });

  it("returns null for empty string", () => {
    expect(parseSpotifyUrl("")).toBeNull();
  });

  it("returns null for non-Spotify URL", () => {
    expect(parseSpotifyUrl("https://youtube.com/watch?v=abc")).toBeNull();
  });

  it("returns null for invalid URL", () => {
    expect(parseSpotifyUrl("not a url at all")).toBeNull();
  });

  it("returns null for Spotify URL with no type/id", () => {
    expect(parseSpotifyUrl("https://open.spotify.com/")).toBeNull();
  });
});
