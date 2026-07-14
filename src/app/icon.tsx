import { ImageResponse } from "next/og";

/**
 * Programmatic favicon: a clean, centered calendar-check mark on a brand-blue
 * rounded square. Replaces the old edge-to-edge black glyph (which looked
 * off-center / harsh in Google results and search chips, and had an identical
 * "dark" variant so dark mode was broken). Rendered at build time to PNG.
 */
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e89d6",
          borderRadius: 14,
        }}
      >
        <svg
          width="42"
          height="42"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth={2.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M3 10h18" />
          <path d="m9 16 2 2 4-4" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
